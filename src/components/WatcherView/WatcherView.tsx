import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ConnectionStateToast, LiveKitRoom, RoomAudioRenderer } from '@livekit/components-react'
import '@livekit/components-styles'
import { Typography } from 'decentraland-ui2'
import { WatcherViewContent } from './WatcherViewContent'
import { useTranslation } from '../../modules/translation'
import { LiveKitCredentials } from '../../types'
import { getWatcherToken } from '../../utils/api'
import { createLiveKitIdentity } from '../../utils/identity'
import { ChatPanel } from '../ChatPanel/ChatPanel'
import {
  ControlsArea,
  ErrorContainer,
  MainContent,
  Sidebar,
  VideoArea,
  VideoContainer,
  ViewContainer as WatcherContainer,
  ViewLayout as WatcherLayout
} from '../CommonView/CommonView.styled'
import { LoadingScreen } from '../LoadingScreen/LoadingScreen'
import { PeopleSidebar } from '../PeopleSidebar/PeopleSidebar'
import { StreamingControls } from '../StreamingControls/StreamingControls'
import { WatcherOnboarding } from '../WatcherOnboarding/WatcherOnboarding'
import { BackLink } from './WatcherView.styled'

export function WatcherView() {
  const { t } = useTranslation()
  const { roomId } = useParams<{ roomId: string }>()

  const [credentials, setCredentials] = useState<LiveKitCredentials | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [peopleOpen, setPeopleOpen] = useState(false)
  const [onboardingComplete, setOnboardingComplete] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [isLoadingCredentials, setIsLoadingCredentials] = useState(true)

  // Fetch credentials on mount to get room name
  useEffect(() => {
    if (!roomId) {
      setError('Room ID is required')
      setIsLoadingCredentials(false)
      return
    }

    const fetchCredentials = async () => {
      try {
        setIsLoadingCredentials(true)
        setError(null)

        // Generate anonymous identity
        const identity = createLiveKitIdentity(`watcher-${roomId}-${Date.now()}`)
        const liveKitCredentials = await getWatcherToken(roomId, identity)
        setCredentials(liveKitCredentials)
      } catch (error) {
        setError(error instanceof Error ? error.message : t('watcher.error_connection'))
      } finally {
        setIsLoadingCredentials(false)
      }
    }

    fetchCredentials()
  }, [roomId, t])

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

  const handleToggleChat = useCallback(() => {
    if (peopleOpen) setPeopleOpen(false)
    setChatOpen(!chatOpen)
  }, [peopleOpen, chatOpen])

  const handleTogglePeople = useCallback(() => {
    if (chatOpen) setChatOpen(false)
    setPeopleOpen(!peopleOpen)
  }, [chatOpen, peopleOpen])

  // Loading credentials
  if (isLoadingCredentials) {
    return <LoadingScreen message={t('watcher.connecting')} />
  }

  // Show error screen
  if (error) {
    return (
      <WatcherContainer>
        <ErrorContainer>
          <Typography variant="h6">{t('watcher.error_connection')}</Typography>
          <Typography variant="body1">{error}</Typography>
          <Typography variant="body2">
            <BackLink href="/cast">← Back to Cast</BackLink>
          </Typography>
        </ErrorContainer>
      </WatcherContainer>
    )
  }

  // No credentials (shouldn't happen but handle gracefully)
  if (!credentials) {
    return (
      <WatcherContainer>
        <ErrorContainer>
          <Typography variant="h6">{t('watcher.error_connection')}</Typography>
        </ErrorContainer>
      </WatcherContainer>
    )
  }

  // Extract room name from credentials or use roomId
  const streamName = credentials.roomName || roomId || 'Stream'

  // Show onboarding before connecting
  if (!onboardingComplete) {
    return <WatcherOnboarding streamName={streamName} onJoin={handleJoinRoom} isJoining={isJoining} />
  }

  const sidebarOpen = chatOpen || peopleOpen

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
        <WatcherLayout>
          <MainContent>
            <VideoContainer $sidebarOpen={sidebarOpen}>
              <VideoArea $sidebarOpen={sidebarOpen}>
                <WatcherViewContent />
              </VideoArea>

              {sidebarOpen && (
                <Sidebar $isOpen={sidebarOpen}>
                  {chatOpen && <ChatPanel onClose={handleToggleChat} />}
                  {peopleOpen && <PeopleSidebar onClose={handleTogglePeople} />}
                </Sidebar>
              )}
            </VideoContainer>

            <ControlsArea>
              <StreamingControls
                onToggleChat={handleToggleChat}
                onTogglePeople={handleTogglePeople}
                isStreamer={false}
                onLeave={handleLeaveRoom}
              />
            </ControlsArea>
          </MainContent>
        </WatcherLayout>

        <RoomAudioRenderer />
        <ConnectionStateToast />
      </LiveKitRoom>
    </WatcherContainer>
  )
}
