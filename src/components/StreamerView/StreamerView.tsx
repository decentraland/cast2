import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ConnectionStateToast, LiveKitRoom, RoomAudioRenderer } from '@livekit/components-react'
import '@livekit/components-styles'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import { Navbar, NavbarPages, Typography } from 'decentraland-ui2'
import { useAuth } from '../../context/AuthContext'
import { useLiveKitCredentials } from '../../context/LiveKitContext'
import { useTranslation } from '../../modules/translation'
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
  const { t } = useTranslation()
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { isConnected, address, disconnectWallet } = useAuth()
  const { credentials, setCredentials } = useLiveKitCredentials()
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
        audio={{
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000 // High quality audio (48kHz)
        }}
        video={false}
        screen={false}
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
                    {t('streamer.title')}
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
                    <Typography variant="body2" style={{ marginBottom: '8px' }}>
                      {t('streamer.connect_wallet_prompt')}
                    </Typography>
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
