import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useRemoteParticipants, useRoomContext } from '@livekit/components-react'
import { RemoteParticipant, RoomEvent } from 'livekit-client'
import { useNotifications } from './NotificationContext'
import { useTranslation } from '../modules/translation'
import { PresentationInfo, SlideVideoInfo, getPresentationBotToken, uploadPresentation, uploadPresentationFromUrl } from '../utils/api'
import { decodeCommsPacket, encodeCommsPacket } from '../utils/commsProtocol'
import { getStreamerToken as getStoredToken } from '../utils/localStorage'
import { isPresentationBot, parseParticipantMetadata } from '../utils/participant'
import { isRetryableVideoErrorCode } from '../utils/videoErrorCodes'

interface PresentationState {
  id: string | null
  slideCount: number
  currentSlide: number
  fileType: 'pdf' | 'pptx' | null
  // 'starting' covers the window between upload completion and the bot joining
  // the room — without it, the bot-absence cleanup effect below would briefly
  // snap state back to 'idle' on the render right after upload resolves.
  status: 'idle' | 'uploading' | 'starting' | 'active' | 'error'
  error: string | null
  slideVideos: SlideVideoInfo[]
  videoState: 'idle' | 'loading' | 'playing' | 'paused'
}

interface PresentationContextValue {
  state: PresentationState
  startPresentation: (file: File) => Promise<void>
  startPresentationFromUrl: (url: string) => Promise<void>
  navigateSlide: (action: 'next' | 'prev') => Promise<void>
  goToSlide: (index: number) => Promise<void>
  playVideo: (videoIndex: number) => Promise<void>
  pauseVideo: () => Promise<void>
  stopVideo: () => Promise<void>
  stopPresentation: () => Promise<void>
  dismissError: () => void
  isPresentationActive: boolean
  presentationParticipantIdentity: string | null
}

const PRESENTATION_TOPIC = 'presentation'

interface PresentationBotMetadata {
  role: 'presentation'
  id?: string
  slideCount?: number
  currentSlide?: number
  fileType?: 'pdf' | 'pptx'
  videoState?: PresentationState['videoState']
  slideVideos?: SlideVideoInfo[]
}

const initialState: PresentationState = {
  id: null,
  slideCount: 0,
  currentSlide: 0,
  fileType: null,
  status: 'idle',
  error: null,
  slideVideos: [],
  videoState: 'idle'
}

// Runtime type guards for data-channel payloads. `decodeCommsPacket` correctly
// returns `data: unknown`, so narrow with these before feeding into setState —
// a spoofed or malformed packet would otherwise write garbage into React state.
function isPresentationStateMessage(data: unknown): data is {
  type: 'presentation:state'
  id: string
  slideCount: number
  currentSlide: number
  fileType: 'pdf' | 'pptx'
  slideVideos?: SlideVideoInfo[]
  videoState?: PresentationState['videoState']
} {
  if (typeof data !== 'object' || data === null) return false
  const d = data as Record<string, unknown>
  return (
    d.type === 'presentation:state' &&
    typeof d.id === 'string' &&
    typeof d.slideCount === 'number' &&
    typeof d.currentSlide === 'number' &&
    (d.fileType === 'pdf' || d.fileType === 'pptx')
  )
}

function isPresentationStoppedMessage(data: unknown): data is { type: 'presentation:stopped' } {
  return typeof data === 'object' && data !== null && (data as Record<string, unknown>).type === 'presentation:stopped'
}

// Per backend contract: `code` is a free-form string (don't validate against the
// VideoErrorCode union — unknown codes must fall through to displaying `message`).
// `message` is the source of truth for display text.
function isPresentationErrorMessage(data: unknown): data is {
  type: 'presentation:error'
  code: string
  message: string
  videoIndex?: number
  videoUrl?: string
} {
  if (typeof data !== 'object' || data === null) return false
  const d = data as Record<string, unknown>
  if (d.type !== 'presentation:error') return false
  if (typeof d.code !== 'string') return false
  if (typeof d.message !== 'string') return false
  if (d.videoIndex !== undefined && typeof d.videoIndex !== 'number') return false
  if (d.videoUrl !== undefined && typeof d.videoUrl !== 'string') return false
  return true
}

// Validates participant metadata so we don't let a malformed/spoofed field
// (e.g. `slideCount: "ten"`) flow into React state via the metadata sync path.
function isPresentationBotMetadata(data: unknown): data is PresentationBotMetadata {
  if (typeof data !== 'object' || data === null) return false
  const d = data as Record<string, unknown>
  if (d.role !== 'presentation') return false
  if (d.id !== undefined && typeof d.id !== 'string') return false
  if (d.slideCount !== undefined && typeof d.slideCount !== 'number') return false
  if (d.currentSlide !== undefined && typeof d.currentSlide !== 'number') return false
  if (d.fileType !== undefined && d.fileType !== 'pdf' && d.fileType !== 'pptx') return false
  if (
    d.videoState !== undefined &&
    d.videoState !== 'idle' &&
    d.videoState !== 'loading' &&
    d.videoState !== 'playing' &&
    d.videoState !== 'paused'
  )
    return false
  if (d.slideVideos !== undefined && !Array.isArray(d.slideVideos)) return false
  return true
}

const PresentationContext = createContext<PresentationContextValue | undefined>(undefined)

function PresentationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PresentationState>(initialState)
  const remoteParticipants = useRemoteParticipants()
  const room = useRoomContext()
  const notifications = useNotifications()
  const { t } = useTranslation()

  // Keep the active presentation id in a ref so command callbacks stay referentially
  // stable across state changes — state replaces on every slide nav, which would
  // otherwise re-create every callback and re-render every consumer.
  const idRef = useRef<string | null>(null)
  idRef.current = state.id

  // Mutex for runPresentationUpload. Using a ref (not state) because the
  // useCallback below has `[]` deps and would see stale state otherwise.
  const uploadingRef = useRef(false)

  const sendCommand = useCallback(
    async (command: Record<string, unknown>) => {
      if (!room?.localParticipant) return
      const packet = encodeCommsPacket(PRESENTATION_TOPIC, command)
      try {
        await room.localParticipant.publishData(packet, { reliable: true })
      } catch (err) {
        // Swallow transport errors so fire-and-forget call sites (navigateSlide,
        // playVideo, …) don't produce unhandled promise rejections on disconnect.
        console.warn('[presentation] publishData failed', err)
      }
    },
    [room]
  )

  // Find the presentation bot among remote participants and read its metadata.
  // Runtime-validate with `isPresentationBotMetadata` so a malformed field
  // (e.g. `slideCount: "ten"`) can't leak into state via the metadata sync path.
  const { presentationParticipantIdentity, botMetadata } = useMemo<{
    presentationParticipantIdentity: string | null
    botMetadata: PresentationBotMetadata | null
  }>(() => {
    for (const p of remoteParticipants) {
      const parsed = parseParticipantMetadata(p)
      if (isPresentationBotMetadata(parsed)) {
        return { presentationParticipantIdentity: p.identity, botMetadata: parsed }
      }
    }
    return { presentationParticipantIdentity: null, botMetadata: null }
  }, [remoteParticipants])

  // Extract primitive fields for stable effect dependencies (rerender-dependencies)
  const botId = botMetadata?.id ?? null
  const botSlideCount = botMetadata?.slideCount ?? 0
  const botCurrentSlide = botMetadata?.currentSlide ?? 0
  const botFileType = botMetadata?.fileType ?? null
  const botVideoState = botMetadata?.videoState ?? 'idle'
  // JSON.parse re-allocates slideVideos every time metadata updates, so we stringify
  // to get reference-stable equality for the effect deps and skip-guard below.
  const botSlideVideosJson = useMemo(() => JSON.stringify(botMetadata?.slideVideos ?? []), [botMetadata])

  // Whether the bot is present in the room at all — stable across metadata
  // object identity changes, so it can live in the effect dep array without
  // re-firing the sync when only the object reference turned over.
  const hasBotMetadata = botMetadata !== null

  // When bot is discovered (e.g. late joiner) or its metadata changes, sync state
  useEffect(() => {
    if (!hasBotMetadata) return

    if (botId) {
      setState(prev => {
        // Skip update if nothing meaningful changed
        if (
          prev.status === 'active' &&
          prev.id === botId &&
          prev.currentSlide === botCurrentSlide &&
          prev.slideCount === botSlideCount &&
          prev.fileType === botFileType &&
          prev.videoState === botVideoState &&
          JSON.stringify(prev.slideVideos) === botSlideVideosJson
        ) {
          return prev
        }
        return {
          id: botId,
          slideCount: botSlideCount,
          currentSlide: botCurrentSlide,
          fileType: botFileType,
          status: 'active',
          error: null,
          slideVideos: JSON.parse(botSlideVideosJson),
          videoState: botVideoState
        }
      })
      return
    }

    // Bot exists but metadata lacks id — request state via data channel
    sendCommand({ type: 'presentation:get-state' })
  }, [hasBotMetadata, botId, botSlideCount, botCurrentSlide, botFileType, botVideoState, botSlideVideosJson, sendCommand])

  // Refs let the data-channel handler call into the latest notification/i18n/command
  // closures without forcing a re-attach of the LiveKit listener on every render.
  const showNotificationRef = useRef(notifications.show)
  showNotificationRef.current = notifications.show
  const tRef = useRef(t)
  tRef.current = t
  const sendCommandRef = useRef(sendCommand)
  sendCommandRef.current = sendCommand

  // Listen for state broadcasts from the bot via data channel
  useEffect(() => {
    if (!room) return
    const handleData = (payload: Uint8Array, participant?: RemoteParticipant) => {
      // Only accept presentation messages from the bot — reject any other sender to prevent spoofing.
      if (!participant || !isPresentationBot(participant)) return

      const decoded = decodeCommsPacket(payload)
      if (!decoded || decoded.topic !== PRESENTATION_TOPIC) return

      if (isPresentationStateMessage(decoded.data)) {
        setState({
          id: decoded.data.id,
          slideCount: decoded.data.slideCount,
          currentSlide: decoded.data.currentSlide,
          fileType: decoded.data.fileType,
          status: 'active',
          error: null,
          slideVideos: decoded.data.slideVideos ?? [],
          videoState: decoded.data.videoState ?? 'idle'
        })
      } else if (isPresentationStoppedMessage(decoded.data)) {
        setState(initialState)
      } else if (isPresentationErrorMessage(decoded.data)) {
        // Transient per-attempt event — fire a fresh toast every time, even if the
        // persistent `videoState: 'error'` flag in presentation:state is unchanged.
        const { code, message, videoIndex } = decoded.data
        const action =
          isRetryableVideoErrorCode(code) && typeof videoIndex === 'number'
            ? {
                label: tRef.current('notifications.retry'),
                onClick: () => {
                  sendCommandRef.current({ type: 'presentation:video:play', videoIndex })
                }
              }
            : undefined
        showNotificationRef.current('VideoPlaybackFailed', { message, code, action })
      }
    }
    room.on(RoomEvent.DataReceived, handleData)
    return () => {
      room.off(RoomEvent.DataReceived, handleData)
    }
  }, [room])

  const runPresentationUpload = useCallback(
    async (upload: (livekitToken: string, livekitUrl: string) => Promise<PresentationInfo>, errorLabel: string) => {
      // Drop concurrent invocations (e.g. double-click): racing two uploads can
      // orphan a bot when the second-resolving call overwrites the first's state.
      if (uploadingRef.current) return
      uploadingRef.current = true
      setState(prev => ({ ...prev, status: 'uploading', error: null }))

      try {
        const streamingKey = getStoredToken()
        if (!streamingKey) {
          throw new Error('No streaming key available')
        }

        const botToken = await getPresentationBotToken(streamingKey)
        const info = await upload(botToken.token, botToken.url)

        // 'starting' until the bot actually joins the room. The metadata sync
        // effect will transition to 'active' once `presentationParticipantIdentity`
        // is populated — this avoids racing with the bot-absence cleanup effect.
        setState({
          id: info.id,
          slideCount: info.slideCount,
          currentSlide: 0,
          fileType: info.fileType,
          status: 'starting',
          error: null,
          slideVideos: [],
          videoState: 'idle'
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : errorLabel
        setState(prev => ({
          ...prev,
          status: 'error',
          error: message
        }))
        // Toast surfaces the failure even if the SharePresentationModal already
        // closed — the persistent ErrorOverlay alone isn't always in the user's
        // visual path during the share flow.
        showNotificationRef.current('PresentationDownloadFailed', { message })
      } finally {
        uploadingRef.current = false
      }
    },
    []
  )

  const startPresentation = useCallback(
    (file: File) => runPresentationUpload((token, url) => uploadPresentation(file, token, url), 'Failed to start presentation'),
    [runPresentationUpload]
  )

  const startPresentationFromUrl = useCallback(
    (url: string) =>
      runPresentationUpload((token, botUrl) => uploadPresentationFromUrl(url, token, botUrl), 'Failed to start presentation from URL'),
    [runPresentationUpload]
  )

  const navigateSlide = useCallback(
    async (action: 'next' | 'prev') => {
      if (!idRef.current) return
      await sendCommand({ type: 'presentation:navigate', action })
    },
    [sendCommand]
  )

  const goToSlide = useCallback(
    async (index: number) => {
      if (!idRef.current) return
      await sendCommand({ type: 'presentation:navigate', action: 'goto', slideIndex: index })
    },
    [sendCommand]
  )

  const playVideo = useCallback(
    async (videoIndex: number) => {
      if (!idRef.current) return
      await sendCommand({ type: 'presentation:video:play', videoIndex })
    },
    [sendCommand]
  )

  const pauseVideo = useCallback(async () => {
    if (!idRef.current) return
    await sendCommand({ type: 'presentation:video:pause' })
  }, [sendCommand])

  const stopVideo = useCallback(async () => {
    if (!idRef.current) return
    await sendCommand({ type: 'presentation:video:stop' })
  }, [sendCommand])

  const stopPresentationHandler = useCallback(async () => {
    if (!idRef.current) return
    // Don't reset state optimistically: the bot's `presentation:stopped`
    // broadcast (handled above) is the single source of truth. Resetting here
    // would strand the UI in `idle` if the command failed, and — because
    // idRef would already be null — retries would no-op.
    await sendCommand({ type: 'presentation:stop' })
  }, [sendCommand])

  // Dismiss the error overlay and return the state machine to `idle` so the
  // user can try starting a presentation again.
  const dismissError = useCallback(() => {
    setState(prev => (prev.status === 'error' ? initialState : prev))
  }, [])

  // Clean up when bot participant disappears (presentation was stopped externally)
  useEffect(() => {
    if (state.status === 'active' && !presentationParticipantIdentity) {
      // Bot left the room — presentation ended
      setState(initialState)
    }
  }, [presentationParticipantIdentity, state.status])

  const value = useMemo<PresentationContextValue>(
    () => ({
      state,
      startPresentation,
      startPresentationFromUrl,
      navigateSlide,
      goToSlide,
      playVideo,
      pauseVideo,
      stopVideo,
      stopPresentation: stopPresentationHandler,
      dismissError,
      // Treat 'starting' as active so the UI (share-menu label, icon choice)
      // doesn't flicker back to "not presenting" during the bot-join window.
      isPresentationActive: state.status === 'active' || state.status === 'starting',
      presentationParticipantIdentity
    }),
    [
      state,
      startPresentation,
      startPresentationFromUrl,
      navigateSlide,
      goToSlide,
      playVideo,
      pauseVideo,
      stopVideo,
      stopPresentationHandler,
      dismissError,
      presentationParticipantIdentity
    ]
  )

  return <PresentationContext.Provider value={value}>{children}</PresentationContext.Provider>
}

function usePresentation() {
  const context = useContext(PresentationContext)
  if (!context) {
    throw new Error('usePresentation must be used within PresentationProvider')
  }
  return context
}

function usePresentationOptional() {
  return useContext(PresentationContext) ?? null
}

export { PresentationProvider, usePresentation, usePresentationOptional }
export type { PresentationState, PresentationContextValue }
