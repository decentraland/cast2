import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ConnectionStateToast, LiveKitRoom, RoomAudioRenderer } from '@livekit/components-react'
import '@livekit/components-styles'
import { WatcherViewWithChat } from './WatcherViewWithChat'
import { useLiveKitCredentials } from '../../context/LiveKitContext'
import { useTranslation } from '../../modules/translation'
import { LiveKitCredentials } from '../../types'
import { getWatcherToken } from '../../utils/api'
import { generateRandomName } from '../../utils/identity'
import { ChatProvider } from '../ChatProvider/ChatProvider'
import { ViewContainer as WatcherContainer } from '../CommonView/CommonView.styled'
import { ErrorModal } from '../ErrorModal'
import { LoadingScreen } from '../LoadingScreen/LoadingScreen'
import { WatcherOnboarding } from '../WatcherOnboarding/WatcherOnboarding'

export function WatcherView() {
  const { t } = useTranslation()
  const { location } = useParams<{ location: string }>()
  const { setStreamMetadata } = useLiveKitCredentials()

  const [credentials, setCredentials] = useState<LiveKitCredentials | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [onboardingComplete, setOnboardingComplete] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [isLoadingCredentials, setIsLoadingCredentials] = useState(true)

  // Fetch credentials on mount to get room name
  useEffect(() => {
    if (!location) {
      setError('Location is required')
      setIsLoadingCredentials(false)
      return
    }

    const fetchCredentials = async () => {
      try {
        setIsLoadingCredentials(true)
        setError(null)

        // Generate friendly random identity for watchers
        const identity = generateRandomName()
        console.log('[WatcherView] Using identity:', identity)
        const liveKitCredentials = await getWatcherToken(location, identity)
        setCredentials(liveKitCredentials)

        // Set stream metadata for use in ChatPanel
        const isWorld = location.includes('.dcl.eth')
        setStreamMetadata({
          placeName: liveKitCredentials.placeName || location,
          location,
          isWorld
        })
      } catch (error) {
        setError(error instanceof Error ? error.message : t('watcher.error_connection'))
      } finally {
        setIsLoadingCredentials(false)
      }
    }

    fetchCredentials()
  }, [location, t])

  const handleJoinRoom = useCallback(() => {
    setIsJoining(true)
    // Small delay for the spinner animation
    setTimeout(() => {
      setOnboardingComplete(true)
      setIsJoining(false)
    }, 500)
  }, [])

  const handleRoomConnect = useCallback(() => {
    // Watcher connected to LiveKit room
  }, [])

  const handleLeaveRoom = useCallback(() => {
    console.log('[WatcherView] Leaving room, returning to onboarding...')
    setOnboardingComplete(false)
  }, [])

  // Loading credentials
  if (isLoadingCredentials) {
    return <LoadingScreen message={t('watcher.connecting')} />
  }

  // Show error screen
  if (error) {
    return (
      <ErrorModal
        title={t('watcher_error_modal.title')}
        message={t('watcher_error_modal.message')}
        onExit={() => {
          window.location.href = 'https://decentraland.org'
        }}
      />
    )
  }

  // No credentials (shouldn't happen but handle gracefully)
  if (!credentials) {
    return (
      <ErrorModal
        title={t('watcher_error_modal.title')}
        message={t('watcher_error_modal.message')}
        onExit={() => {
          window.location.href = 'https://decentraland.org'
        }}
      />
    )
  }

  // Extract place name from credentials or use location
  const streamName = credentials.placeName || credentials.roomName || location || 'Stream'

  // Show onboarding before connecting
  if (!onboardingComplete) {
    return <WatcherOnboarding streamName={streamName} onJoin={handleJoinRoom} isJoining={isJoining} />
  }

  return (
    <WatcherContainer>
      <LiveKitRoom
        token={credentials.token}
        serverUrl={credentials.url}
        connect={true}
        audio={false}
        video={false}
        screen={false}
        onConnected={handleRoomConnect}
      >
        <ChatProvider>
          <WatcherViewWithChat onLeave={handleLeaveRoom} />
        </ChatProvider>

        <RoomAudioRenderer />
        <ConnectionStateToast />
      </LiveKitRoom>
    </WatcherContainer>
  )
}
