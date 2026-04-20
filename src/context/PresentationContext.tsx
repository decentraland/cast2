import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useRemoteParticipants, useRoomContext } from '@livekit/components-react'
import { RemoteParticipant, RoomEvent } from 'livekit-client'
import { PresentationInfo, SlideVideoInfo, getPresentationBotToken, uploadPresentation, uploadPresentationFromUrl } from '../utils/api'
import { decodeCommsPacket, encodeCommsPacket } from '../utils/commsProtocol'
import { getStreamerToken as getStoredToken } from '../utils/localStorage'
import { isPresentationBot, parseParticipantMetadata } from '../utils/participant'

interface PresentationState {
  id: string | null
  slideCount: number
  currentSlide: number
  fileType: 'pdf' | 'pptx' | null
  status: 'idle' | 'uploading' | 'active' | 'error'
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

const PresentationContext = createContext<PresentationContextValue | undefined>(undefined)

function PresentationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PresentationState>(initialState)
  const remoteParticipants = useRemoteParticipants()
  const room = useRoomContext()

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

  // Find the presentation bot among remote participants and read its metadata
  const { presentationParticipantIdentity, botMetadata } = useMemo<{
    presentationParticipantIdentity: string | null
    botMetadata: PresentationBotMetadata | null
  }>(() => {
    for (const p of remoteParticipants) {
      const metadata = parseParticipantMetadata<PresentationBotMetadata>(p)
      if (metadata?.role === 'presentation') {
        return { presentationParticipantIdentity: p.identity, botMetadata: metadata }
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

        setState({
          id: info.id,
          slideCount: info.slideCount,
          currentSlide: 0,
          fileType: info.fileType,
          status: 'active',
          error: null,
          slideVideos: [],
          videoState: 'idle'
        })
      } catch (err) {
        setState(prev => ({
          ...prev,
          status: 'error',
          error: err instanceof Error ? err.message : errorLabel
        }))
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
      isPresentationActive: state.status === 'active',
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
