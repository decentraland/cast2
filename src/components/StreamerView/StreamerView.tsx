import { useCallback, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ConnectionStateToast, LiveKitRoom, RoomAudioRenderer } from '@livekit/components-react'
import '@livekit/components-styles'
import { Navbar, NavbarPages, Typography } from 'decentraland-ui2'
import { StreamerViewContent } from './StreamerViewContent'
import { useLiveKitCredentials } from '../../context/LiveKitContext'
import { useTranslation } from '../../modules/translation'
import { getStreamerToken } from '../../utils/api'
import { ChatPanel } from '../ChatPanel/ChatPanel'
import {
  ControlsArea,
  ErrorContainer,
  MainContent,
  Sidebar,
  ViewContainer as StreamerContainer,
  ViewLayout as StreamerLayout,
  VideoArea,
  VideoContainer
} from '../CommonView/CommonView.styled'
import { PeopleSidebar } from '../PeopleSidebar/PeopleSidebar'
import { StreamerOnboarding } from '../StreamerOnboarding/StreamerOnboarding'
import { OnboardingConfig } from '../StreamerOnboarding/StreamerOnboarding.types'
import { StreamingControls } from '../StreamingControls/StreamingControls'

export function StreamerView() {
  const { t } = useTranslation()
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { credentials, setCredentials } = useLiveKitCredentials()
  const [error, setError] = useState<string | null>(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [peopleOpen, setPeopleOpen] = useState(false)
  const [onboardingComplete, setOnboardingComplete] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [userConfig, setUserConfig] = useState<OnboardingConfig | null>(null)

  const handleJoinRoom = useCallback(
    async (config: OnboardingConfig) => {
      if (!token) {
        setError('No token provided')
        return
      }

      setIsJoining(true)
      setUserConfig(config)

      try {
        const creds = await getStreamerToken(token)
        setCredentials(creds)
        setError(null)
        setOnboardingComplete(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : t('streamer.error_initialize_streaming'))
        setIsJoining(false)
      }
    },
    [token, t, setCredentials]
  )

  const handleRoomConnect = useCallback(() => {
    setIsJoining(false)
  }, [])

  const handleLeaveRoom = useCallback(() => {
    setOnboardingComplete(false)
    setCredentials(null)
    setUserConfig(null)
  }, [])

  const handleToggleChat = useCallback(() => {
    if (peopleOpen) setPeopleOpen(false)
    setChatOpen(!chatOpen)
  }, [peopleOpen, chatOpen])

  const handleTogglePeople = useCallback(() => {
    if (chatOpen) setChatOpen(false)
    setPeopleOpen(!peopleOpen)
  }, [chatOpen, peopleOpen])

  if (!onboardingComplete) {
    return <StreamerOnboarding streamName="Stream" onJoin={handleJoinRoom} isJoining={isJoining} />
  }

  if (error) {
    return (
      <StreamerContainer>
        <Navbar activePage={NavbarPages.EXTRA} />
        <ErrorContainer>
          <Typography variant="h5" color="error">
            {t('streamer.error_connection')}
          </Typography>
          <Typography variant="body1">{t('streamer.error_invalid_token')}</Typography>
          <button onClick={() => navigate('/')}>{t('not_found.go_home')}</button>
        </ErrorContainer>
      </StreamerContainer>
    )
  }

  if (!credentials) {
    return (
      <StreamerContainer>
        <Navbar activePage={NavbarPages.EXTRA} />
        <ErrorContainer>
          <Typography variant="h5" color="error">
            {t('streamer.error_no_credentials')}
          </Typography>
        </ErrorContainer>
      </StreamerContainer>
    )
  }

  const sidebarOpen = chatOpen || peopleOpen

  return (
    <StreamerContainer>
      <Navbar activePage={NavbarPages.EXTRA} />
      <LiveKitRoom
        token={credentials.token}
        serverUrl={credentials.url}
        connect={true}
        onConnected={handleRoomConnect}
        audio={
          userConfig?.audioInputId
            ? {
                deviceId: userConfig.audioInputId
              }
            : false
        }
        video={
          userConfig?.videoDeviceId
            ? {
                deviceId: userConfig.videoDeviceId
              }
            : false
        }
        screen={false}
      >
        <StreamerLayout>
          <MainContent>
            <VideoContainer $sidebarOpen={sidebarOpen}>
              <VideoArea $sidebarOpen={sidebarOpen}>
                <StreamerViewContent />
              </VideoArea>

              {sidebarOpen && (
                <Sidebar $isOpen={sidebarOpen}>
                  {chatOpen && <ChatPanel onClose={handleToggleChat} />}
                  {peopleOpen && <PeopleSidebar onClose={handleTogglePeople} />}
                </Sidebar>
              )}
            </VideoContainer>

            <ControlsArea>
              <StreamingControls onToggleChat={handleToggleChat} onTogglePeople={handleTogglePeople} isStreamer onLeave={handleLeaveRoom} />
            </ControlsArea>
          </MainContent>
        </StreamerLayout>

        <RoomAudioRenderer />
        <ConnectionStateToast />
      </LiveKitRoom>
    </StreamerContainer>
  )
}
