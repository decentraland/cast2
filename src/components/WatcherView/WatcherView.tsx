import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ConnectionStateToast, LiveKitRoom, RoomAudioRenderer } from '@livekit/components-react'
import '@livekit/components-styles'
import GroupIcon from '@mui/icons-material/GroupOutlined'
import { Navbar, NavbarPages, Typography } from 'decentraland-ui2'
import { useAuth } from '../../context/AuthContext'
import { LiveKitCredentials } from '../../types'
import { getWatcherToken } from '../../utils/api'
import { createLiveKitIdentity } from '../../utils/identity'
import { ChatPanel } from '../ChatPanel/ChatPanel'
import { LoadingScreen } from '../LoadingScreen/LoadingScreen'
import { RoomStats } from '../RoomStats/RoomStats'
import { WalletButton } from '../WalletButton/WalletButton'
import { WatcherViewContent } from './WatcherViewContent'
import {
  AuthPromptStyled,
  BackLink,
  ErrorContainer,
  LiveWatchingTitle,
  MainContent,
  Sidebar,
  StatsSpacer,
  StreamTitle,
  StreamingHeader,
  VideoArea,
  WatcherContainer,
  WatcherLayout
} from './WatcherView.styled'

export function WatcherView() {
  const { roomId } = useParams<{ roomId: string }>()
  const { isConnected, address, disconnectWallet } = useAuth()

  const [credentials, setCredentials] = useState<LiveKitCredentials | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        setError(error instanceof Error ? error.message : 'Failed to connect to stream. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    initializeWatcher()
  }, [roomId])

  const handleRoomConnect = () => {
    // Watcher connected to LiveKit room
  }

  // Participant count will be managed by LiveKit hooks if needed

  const handleUpgradePermissions = async () => {
    // Placeholder for upgrading anonymous user to authenticated user
  }

  if (loading) {
    return <LoadingScreen message="Connecting to stream..." />
  }

  if (error) {
    return (
      <WatcherContainer>
        <Navbar activePage={NavbarPages.EXTRA} isSignedIn={isConnected} address={address || undefined} onClickSignOut={disconnectWallet} />
        <ErrorContainer>
          <Typography variant="h6">Connection Error</Typography>
          <Typography variant="body1">{error}</Typography>
          <Typography variant="body2">
            <BackLink href="/cast">← Back to Cast</BackLink>
          </Typography>
        </ErrorContainer>
      </WatcherContainer>
    )
  }

  if (!credentials) {
    return <LoadingScreen message="Preparing stream..." />
  }

  return (
    <WatcherContainer className="with-navbar">
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
            <StreamingHeader>
              <StreamTitle>
                <LiveWatchingTitle>
                  <GroupIcon />
                  <Typography variant="h4" component="span">
                    Watching Live Stream
                  </Typography>
                </LiveWatchingTitle>
              </StreamTitle>
            </StreamingHeader>

            <VideoArea>
              <WatcherViewContent />
            </VideoArea>
          </MainContent>

          <Sidebar>
            <RoomStats isStreamer={false} />
            <StatsSpacer />
            <ChatPanel
              canSendMessages={isConnected}
              authPrompt={
                !isConnected ? (
                  <AuthPromptStyled>
                    <div className="auth-message">Connect your Decentraland wallet to send messages</div>
                    <WalletButton />
                    {isConnected && <button onClick={handleUpgradePermissions}>Enable Chat</button>}
                  </AuthPromptStyled>
                ) : undefined
              }
            />
          </Sidebar>
        </WatcherLayout>

        <RoomAudioRenderer />
        <ConnectionStateToast />
      </LiveKitRoom>
    </WatcherContainer>
  )
}
