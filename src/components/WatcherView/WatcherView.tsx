import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ConnectionStateToast, LiveKitRoom, RoomAudioRenderer } from '@livekit/components-react'
import '@livekit/components-styles'
import { Navbar, NavbarPages, Typography } from 'decentraland-ui2'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from '../../modules/translation'
import { LiveKitCredentials } from '../../types'
import { getWatcherToken } from '../../utils/api'
import { createLiveKitIdentity } from '../../utils/identity'
import { ChatPanel } from '../ChatPanel/ChatPanel'
import {
  AuthPrompt as AuthPromptStyled,
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
import { WalletButton } from '../WalletButton/WalletButton'
import { WatcherViewContent } from './WatcherViewContent'
import { BackLink } from './WatcherView.styled'

export function WatcherView() {
  const { t } = useTranslation()
  const { roomId } = useParams<{ roomId: string }>()
  const { isConnected, address, disconnectWallet } = useAuth()

  const [credentials, setCredentials] = useState<LiveKitCredentials | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [peopleOpen, setPeopleOpen] = useState(false)

  useEffect(() => {
    if (!roomId) {
      setError('Room ID is required')
      setLoading(false)
      return
    }

    const initializeWatcher = async () => {
      try {
        setLoading(true)
        setError(null)

        // Generate anonymous identity
        const identity = createLiveKitIdentity(`watcher-${roomId}-${Date.now()}`)

        const liveKitCredentials = await getWatcherToken(roomId, identity)

        setCredentials(liveKitCredentials)
      } catch (error) {
        setError(error instanceof Error ? error.message : t('watcher.error_connection'))
      } finally {
        setLoading(false)
      }
    }

    initializeWatcher()
  }, [roomId, t])

  const handleRoomConnect = () => {
    // Watcher connected to LiveKit room
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
    return <LoadingScreen message={t('watcher.connecting')} />
  }

  if (error) {
    return (
      <WatcherContainer>
        <Navbar activePage={NavbarPages.EXTRA} isSignedIn={isConnected} address={address || undefined} onClickSignOut={disconnectWallet} />
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

  if (!credentials) {
    return <LoadingScreen message={t('watcher.connecting')} />
  }

  const sidebarOpen = chatOpen || peopleOpen

  return (
    <WatcherContainer>
      <Navbar activePage={NavbarPages.EXTRA} isSignedIn={isConnected} address={address || undefined} onClickSignOut={disconnectWallet} />

      <LiveKitRoom
        token={credentials.token}
        serverUrl={credentials.url}
        connect={true}
        audio={false} // Watchers don't publish audio by default
        video={false} // Watchers don't publish video by default
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
                  {chatOpen && (
                    <ChatPanel
                      canSendMessages={isConnected}
                      onClose={handleToggleChat}
                      authPrompt={
                        !isConnected ? (
                          <AuthPromptStyled>
                            <div className="auth-message">{t('watcher.connect_wallet_prompt')}</div>
                            <WalletButton />
                          </AuthPromptStyled>
                        ) : undefined
                      }
                    />
                  )}
                  {peopleOpen && <PeopleSidebar onClose={handleTogglePeople} />}
                </Sidebar>
              )}
            </VideoContainer>

            <ControlsArea>
              <StreamingControls onToggleChat={handleToggleChat} onTogglePeople={handleTogglePeople} isStreamer={false} />
            </ControlsArea>
          </MainContent>
        </WatcherLayout>

        <RoomAudioRenderer />
        <ConnectionStateToast />
      </LiveKitRoom>
    </WatcherContainer>
  )
}
