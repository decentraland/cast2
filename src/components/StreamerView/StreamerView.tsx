import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ConnectionStateToast, LiveKitRoom, RoomAudioRenderer } from '@livekit/components-react'
import '@livekit/components-styles'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import { Navbar, NavbarPages, Typography } from 'decentraland-ui2'
import { useAuth } from '../../context/AuthContext'
import { LiveKitCredentials } from '../../types'
import { getStreamerToken } from '../../utils/api'
import { ChatPanel } from '../ChatPanel/ChatPanel'
import { StreamerStatusOverlay } from '../LiveKitEnhancements/StreamerStatusOverlay'
import { LoadingScreen } from '../LoadingScreen/LoadingScreen'
import { RoomStats } from '../RoomStats/RoomStats'
import { StreamingControls } from '../StreamingControls/StreamingControls'
import { WalletButton } from '../WalletButton/WalletButton'
import { StreamerViewContent } from './StreamerViewContent'
import {
  AuthPrompt,
  ErrorContainer,
  LiveStreamingTitle,
  MainContent,
  PulseIcon,
  Sidebar,
  StatsSpacer,
  StreamTitle,
  StreamerContainer,
  StreamerLayout,
  StreamingHeader,
  VideoArea
} from './StreamerView.styled'

export function StreamerView() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { isConnected, address, disconnectWallet } = useAuth()
  const [credentials, setCredentials] = useState<LiveKitCredentials | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        setError(err instanceof Error ? err.message : 'Failed to initialize streaming')
      } finally {
        setLoading(false)
      }
    }

    initializeStreamer()
  }, [token])

  const handleRoomConnect = () => {
    // Streamer connected to LiveKit room
  }

  if (loading) {
    return <LoadingScreen message="Connecting to stream..." />
  }

  if (error) {
    return (
      <StreamerContainer>
        <Navbar activePage={NavbarPages.EXTRA} isSignedIn={isConnected} address={address || undefined} onClickSignOut={disconnectWallet} />
        <ErrorContainer>
          <Typography variant="h5" color="error">
            Error: {error}
          </Typography>
          <Typography variant="body1">Please ensure your streaming link is valid and active.</Typography>
          <button onClick={() => navigate('/')}>Go to Home</button>
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
            Error: No streaming credentials available.
          </Typography>
        </ErrorContainer>
      </StreamerContainer>
    )
  }

  return (
    <StreamerContainer>
      <Navbar activePage={NavbarPages.EXTRA} isSignedIn={isConnected} address={address || undefined} onClickSignOut={disconnectWallet} />
      <LiveKitRoom
        token={credentials.token}
        serverUrl={credentials.url}
        connect={true}
        onConnected={handleRoomConnect}
        audio={false} // Don't auto-start audio
        video={false} // Don't auto-start video
        screen={false} // Don't auto-prompt for screen share
      >
        <StreamerLayout>
          <MainContent>
            <StreamingHeader>
              <StreamTitle>
                <LiveStreamingTitle>
                  <PulseIcon>
                    <FiberManualRecordIcon />
                  </PulseIcon>
                  <Typography variant="h4" component="span">
                    Live Streaming
                  </Typography>
                </LiveStreamingTitle>
              </StreamTitle>
            </StreamingHeader>

            <VideoArea>
              <StreamerViewContent />
              <StreamerStatusOverlay />
            </VideoArea>

            <StreamingControls />
          </MainContent>

          <Sidebar>
            <RoomStats isStreamer={true} />
            <StatsSpacer />
            <ChatPanel
              canSendMessages={isConnected}
              authPrompt={
                !isConnected ? (
                  <AuthPrompt>
                    <WalletButton />
                  </AuthPrompt>
                ) : undefined
              }
            />
          </Sidebar>
        </StreamerLayout>

        <RoomAudioRenderer />
        <ConnectionStateToast />
      </LiveKitRoom>
    </StreamerContainer>
  )
}
