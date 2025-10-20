import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ConnectionStateToast, LiveKitRoom, RoomAudioRenderer } from '@livekit/components-react'
import '@livekit/components-styles'
import { StreamerViewWithChat } from './StreamerViewWithChat'
import { useLiveKitCredentials } from '../../context/LiveKitContext'
import { useTranslation } from '../../modules/translation'
import { getStreamInfo, getStreamerToken } from '../../utils/api'
import { generateRandomName } from '../../utils/identity'
import { clearStreamerToken, getStreamerToken as getStoredToken, saveStreamerToken } from '../../utils/localStorage'
import { ChatProvider } from '../ChatProvider/ChatProvider'
import { ViewContainer as StreamerContainer } from '../CommonView/CommonView.styled'
import { ErrorModal } from '../ErrorModal'
import { LoadingScreen } from '../LoadingScreen/LoadingScreen'
import { StreamerOnboarding } from '../StreamerOnboarding/StreamerOnboarding'
import { OnboardingConfig } from '../StreamerOnboarding/StreamerOnboarding.types'

export function StreamerView() {
  const { t } = useTranslation()
  const { token: tokenFromUrl } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { credentials, setCredentials, setStreamMetadata } = useLiveKitCredentials()
  const [error, setError] = useState<string | null>(null)
  const [onboardingComplete, setOnboardingComplete] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [userConfig, setUserConfig] = useState<OnboardingConfig | null>(null)
  const [activeToken, setActiveToken] = useState<string | null>(null)
  const [placeName, setPlaceName] = useState<string | null>(null)
  const [loadingPlaceInfo, setLoadingPlaceInfo] = useState(false)

  // Determine which token to use and handle URL cleanup
  const determineToken = useCallback(() => {
    // Priority 1: Token from URL (initial access)
    if (tokenFromUrl && tokenFromUrl !== 'streaming') {
      setActiveToken(tokenFromUrl)
      saveStreamerToken(tokenFromUrl)
      // Replace URL to hide the token
      navigate('/cast/s/streaming', { replace: true })
      return
    }

    // Priority 2: Token from localStorage (refresh or direct access to /cast/s/streaming)
    const storedToken = getStoredToken()
    if (storedToken) {
      setActiveToken(storedToken)
      return
    }

    // No token found
    console.warn('[StreamerView] No token available')
    setError(t('streamer.error_no_token'))
  }, [tokenFromUrl, navigate, t])

  // On mount, determine token
  useEffect(() => {
    determineToken()
  }, [determineToken])

  // Load place info when token is available
  useEffect(() => {
    async function loadPlaceInfo() {
      if (!activeToken || placeName) return

      setLoadingPlaceInfo(true)
      try {
        const streamInfo = await getStreamInfo(activeToken)
        setPlaceName(streamInfo.placeName)
        // Set stream metadata for use in ChatPanel
        setStreamMetadata({
          placeName: streamInfo.placeName,
          location: streamInfo.location,
          isWorld: streamInfo.isWorld
        })
      } catch (err) {
        console.error('[StreamerView] Failed to load place info:', err)
        // If we can't load place info, fallback to "Stream"
        setPlaceName('Stream')
      } finally {
        setLoadingPlaceInfo(false)
      }
    }

    loadPlaceInfo()
  }, [activeToken, placeName, setStreamMetadata])

  const handleJoinRoom = useCallback(
    async (config: OnboardingConfig) => {
      if (!activeToken) {
        setError(t('streamer.error_no_token'))
        return
      }

      setIsJoining(true)
      setUserConfig(config)

      try {
        // Always send an identity: use the user's input or generate a random one
        const identity = config.displayName.trim() || generateRandomName()
        const creds = await getStreamerToken(activeToken, identity)
        setCredentials(creds)
        setError(null)
        setOnboardingComplete(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : t('streamer.error_initialize_streaming'))
        setIsJoining(false)
        // Clear invalid token
        clearStreamerToken()
        setActiveToken(null)
      }
    },
    [activeToken, t, setCredentials]
  )

  const handleRoomConnect = useCallback(() => {
    setIsJoining(false)
  }, [])

  const handleLeaveRoom = useCallback(() => {
    setOnboardingComplete(false)
    setCredentials(null)
    setUserConfig(null)
    clearStreamerToken()
    setActiveToken(null)
  }, [setCredentials])

  if (error) {
    return <ErrorModal title={t('error_modal.title')} message={t('error_modal.message')} showExitButton={false} />
  }

  if (loadingPlaceInfo) {
    return <LoadingScreen />
  }

  if (!onboardingComplete) {
    return <StreamerOnboarding streamName={placeName || 'Stream'} onJoin={handleJoinRoom} isJoining={isJoining} />
  }

  if (!credentials) {
    return <ErrorModal title={t('error_modal.title')} message={t('error_modal.message')} showExitButton={false} />
  }

  return (
    <StreamerContainer>
      <LiveKitRoom
        token={credentials.token}
        serverUrl={credentials.url}
        connect={true}
        onConnected={handleRoomConnect}
        audio={
          userConfig?.audioInputId
            ? {
                deviceId: { exact: userConfig.audioInputId }
              }
            : false
        }
        video={
          userConfig?.videoDeviceId
            ? {
                deviceId: { exact: userConfig.videoDeviceId }
              }
            : false
        }
        screen={false}
      >
        <ChatProvider>
          <StreamerViewWithChat onLeave={handleLeaveRoom} />
        </ChatProvider>

        <RoomAudioRenderer />
        <ConnectionStateToast />
      </LiveKitRoom>
    </StreamerContainer>
  )
}
