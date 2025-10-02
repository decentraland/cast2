import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ConnectionStateToast, LiveKitRoom, RoomAudioRenderer } from '@livekit/components-react'
import '@livekit/components-styles'
import { Navbar, NavbarPages, Typography } from 'decentraland-ui2'
import { useAuth } from '../../context/AuthContext'
import { useLiveKitCredentials } from '../../context/LiveKitContext'
import { useTranslation } from '../../modules/translation'
import { getStreamerToken } from '../../utils/api'
import { ChatPanel } from '../ChatPanel/ChatPanel'
import {
  AuthPrompt,
  ControlsArea,
  ErrorContainer,
  MainContent,
  Sidebar,
  ViewContainer as StreamerContainer,
  ViewLayout as StreamerLayout,
  VideoArea,
  VideoContainer
} from '../CommonView/CommonView.styled'
import { LoadingScreen } from '../LoadingScreen/LoadingScreen'
import { PeopleSidebar } from '../PeopleSidebar/PeopleSidebar'
import { StreamingControls } from '../StreamingControls/StreamingControls'
import { WalletButton } from '../WalletButton/WalletButton'
import { StreamerViewContent } from './StreamerViewContent'

export function StreamerView() {
  const { t } = useTranslation()
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { isConnected, address, disconnectWallet } = useAuth()
  const { credentials, setCredentials } = useLiveKitCredentials()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [peopleOpen, setPeopleOpen] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('No token provided')
      setLoading(false)
      return
    }

    const initializeStreamer = async () => {
      try {
        const creds = await getStreamerToken(token)
        setCredentials(creds)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : t('streamer.error_initialize_streaming'))
      } finally {
        setLoading(false)
      }
    }

    initializeStreamer()
  }, [token, t, setCredentials])

  const handleRoomConnect = () => {
    // Streamer connected to LiveKit room
  }

  const handleToggleChat = () => {
    if (peopleOpen) setPeopleOpen(false)
    setChatOpen(!chatOpen)
  }

  const handleTogglePeople = () => {
    if (chatOpen) setChatOpen(false)
    setPeopleOpen(!peopleOpen)
  }

  if (loading) {
    return <LoadingScreen message={t('streamer.connecting')} />
  }

  if (error) {
    return (
      <StreamerContainer>
        <Navbar activePage={NavbarPages.EXTRA} isSignedIn={isConnected} address={address || undefined} onClickSignOut={disconnectWallet} />
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
        <Navbar activePage={NavbarPages.EXTRA} isSignedIn={isConnected} address={address || undefined} onClickSignOut={disconnectWallet} />
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
      <Navbar activePage={NavbarPages.EXTRA} isSignedIn={isConnected} address={address || undefined} onClickSignOut={disconnectWallet} />
      <LiveKitRoom
        token={credentials.token}
        serverUrl={credentials.url}
        connect={true}
        onConnected={handleRoomConnect}
        audio={false} // Start with audio disabled - user must enable manually
        video={false}
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
                  {chatOpen && (
                    <ChatPanel
                      canSendMessages={isConnected}
                      onClose={handleToggleChat}
                      authPrompt={
                        !isConnected ? (
                          <AuthPrompt>
                            <Typography variant="body2" style={{ marginBottom: '8px' }}>
                              {t('streamer.connect_wallet_prompt')}
                            </Typography>
                            <WalletButton />
                          </AuthPrompt>
                        ) : undefined
                      }
                    />
                  )}
                  {peopleOpen && <PeopleSidebar onClose={handleTogglePeople} />}
                </Sidebar>
              )}
            </VideoContainer>

            <ControlsArea>
              <StreamingControls onToggleChat={handleToggleChat} onTogglePeople={handleTogglePeople} isStreamer={true} />
            </ControlsArea>
          </MainContent>
        </StreamerLayout>

        <RoomAudioRenderer />
        <ConnectionStateToast />
      </LiveKitRoom>
    </StreamerContainer>
  )
}
