import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useRemoteParticipants, useRoomContext } from '@livekit/components-react'
import { RoomEvent } from 'livekit-client'
import {
  getPresentationBotToken,
  uploadPresentation,
  uploadPresentationFromUrl,
  SlideVideoInfo
} from '../utils/api'
import { getStreamerToken as getStoredToken } from '../utils/localStorage'

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
  stopPresentation: () => Promise<void>
  isPresentationActive: boolean
  presentationParticipantIdentity: string | null
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

const PresentationContext = createContext<PresentationContextValue | undefined>(undefined)

function PresentationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PresentationState>(initialState)
  const remoteParticipants = useRemoteParticipants()
  const room = useRoomContext()

  const sendCommand = useCallback(async (command: Record<string, unknown>) => {
    if (!room?.localParticipant) return
    const data = new TextEncoder().encode(JSON.stringify(command))
    await room.localParticipant.publishData(data, { reliable: true, topic: 'presentation' })
  }, [room])

  // Find the presentation bot among remote participants and read its metadata
  const { presentationParticipantIdentity, botMetadata } = useMemo(() => {
    for (const p of remoteParticipants) {
      try {
        const metadata = p.metadata ? JSON.parse(p.metadata) : null
        if (metadata?.role === 'presentation') {
          return { presentationParticipantIdentity: p.identity, botMetadata: metadata }
        }
      } catch {
        // ignore parse errors
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
  const botSlideVideos = botMetadata?.slideVideos

  // When bot is discovered (e.g. late joiner) or its metadata changes, sync state
  useEffect(() => {
    if (!botMetadata) return

    if (botId) {
      setState(prev => {
        // Skip update if nothing meaningful changed
        if (prev.status === 'active' &&
            prev.id === botId &&
            prev.currentSlide === botCurrentSlide &&
            prev.slideCount === botSlideCount &&
            prev.videoState === botVideoState) {
          return prev
        }
        return {
          id: botId,
          slideCount: botSlideCount,
          currentSlide: botCurrentSlide,
          fileType: botFileType,
          status: 'active',
          error: null,
          slideVideos: botSlideVideos ?? [],
          videoState: botVideoState
        }
      })
      return
    }

    // Bot exists but metadata lacks id — request state via data channel
    sendCommand({ type: 'presentation:get-state' })
  }, [botMetadata, botId, botSlideCount, botCurrentSlide, botFileType, botVideoState, botSlideVideos, sendCommand])

  // Listen for state broadcasts from the bot via data channel
  useEffect(() => {
    if (!room) return
    const handleData = (payload: Uint8Array, _participant?: any, _kind?: any, topic?: string) => {
      if (topic !== 'presentation') return
      try {
        const message = JSON.parse(new TextDecoder().decode(payload))
        if (message.type === 'presentation:state') {
          setState({
            id: message.id,
            slideCount: message.slideCount,
            currentSlide: message.currentSlide,
            fileType: message.fileType,
            status: 'active',
            error: null,
            slideVideos: message.slideVideos || [],
            videoState: message.videoState || 'idle'
          })
        } else if (message.type === 'presentation:stopped') {
          setState(initialState)
        }
      } catch { /* ignore malformed messages */ }
    }
    room.on(RoomEvent.DataReceived, handleData)
    return () => { room.off(RoomEvent.DataReceived, handleData) }
  }, [room])

  const startPresentation = useCallback(async (file: File) => {
    setState(prev => ({ ...prev, status: 'uploading', error: null }))

    try {
      const streamingKey = getStoredToken()
      if (!streamingKey) {
        throw new Error('No streaming key available')
      }

      // Step 1: Get bot token from Gatekeeper
      const botToken = await getPresentationBotToken(streamingKey)

      // Step 2: Upload file to presenter server with the bot token
      const info = await uploadPresentation(file, botToken.token, botToken.url)

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
        error: err instanceof Error ? err.message : 'Failed to start presentation'
      }))
    }
  }, [])

  const startPresentationFromUrl = useCallback(async (url: string) => {
    setState(prev => ({ ...prev, status: 'uploading', error: null }))

    try {
      const streamingKey = getStoredToken()
      if (!streamingKey) {
        throw new Error('No streaming key available')
      }

      const botToken = await getPresentationBotToken(streamingKey)
      const info = await uploadPresentationFromUrl(url, botToken.token, botToken.url)

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
        error: err instanceof Error ? err.message : 'Failed to start presentation from URL'
      }))
    }
  }, [])

  const navigateSlide = useCallback(async (action: 'next' | 'prev') => {
    if (!state.id) return
    await sendCommand({ type: 'presentation:navigate', action })
  }, [state.id, sendCommand])

  const goToSlide = useCallback(async (index: number) => {
    if (!state.id) return
    await sendCommand({ type: 'presentation:navigate', action: 'goto', slideIndex: index })
  }, [state.id, sendCommand])

  const playVideo = useCallback(async (videoIndex: number) => {
    if (!state.id) return
    await sendCommand({ type: 'presentation:video:play', videoIndex })
  }, [state.id, sendCommand])

  const pauseVideo = useCallback(async () => {
    if (!state.id) return
    await sendCommand({ type: 'presentation:video:pause' })
  }, [state.id, sendCommand])

  const stopPresentationHandler = useCallback(async () => {
    if (!state.id) return
    await sendCommand({ type: 'presentation:stop' })
    setState(initialState)
  }, [state.id, sendCommand])

  // Clean up when bot participant disappears (presentation was stopped externally)
  useEffect(() => {
    if (state.status === 'active' && !presentationParticipantIdentity) {
      // Bot left the room — presentation ended
      setState(initialState)
    }
  }, [presentationParticipantIdentity, state.status])

  return (
    <PresentationContext.Provider
      value={{
        state,
        startPresentation,
        startPresentationFromUrl,
        navigateSlide,
        goToSlide,
        playVideo,
        pauseVideo,
        stopPresentation: stopPresentationHandler,
        isPresentationActive: state.status === 'active',
        presentationParticipantIdentity
      }}
    >
      {children}
    </PresentationContext.Provider>
  )
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
