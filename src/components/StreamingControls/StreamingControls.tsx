import { useEffect, useState } from 'react'
import { useConnectionState, useLocalParticipant, useRoomContext, useTrackToggle } from '@livekit/components-react'
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare'
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import VideocamIcon from '@mui/icons-material/Videocam'
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import { ConnectionState, Track } from 'livekit-client'
import { Button } from 'decentraland-ui2'
import { useLiveKitCredentials } from '../../context/LiveKitContext'
import { useTranslation } from '../../modules/translation'
import { AudioDeviceSelector } from '../AudioDeviceSelector/AudioDeviceSelector'
import { VideoDeviceSelector } from '../VideoDeviceSelector/VideoDeviceSelector'
import { ControlGroup, ControlsContainer, ControlsRow, DeviceSelectorWrapper } from './StreamingControls.styled'

export function StreamingControls() {
  const { t } = useTranslation()
  const room = useRoomContext()
  const { localParticipant } = useLocalParticipant()
  const connectionState = useConnectionState()
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('')
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>('')

  const { enabled: isMicEnabled, toggle: toggleMic } = useTrackToggle({
    source: Track.Source.Microphone
  })

  // Debug audio issues
  useEffect(() => {
    if (isMicEnabled && localParticipant) {
      const audioTrack = Array.from(localParticipant.audioTrackPublications.values())[0]
      if (audioTrack) {
        console.log('[StreamingControls] Audio track state:', {
          enabled: isMicEnabled,
          isMuted: audioTrack.isMuted,
          isSubscribed: audioTrack.isSubscribed,
          track: audioTrack.track
        })
      }
    }
  }, [isMicEnabled, localParticipant])

  const { enabled: isCameraEnabled, toggle: toggleCamera } = useTrackToggle({
    source: Track.Source.Camera
  })

  useEffect(() => {
    // Check if screen share is active when component mounts or localParticipant changes
    const screenShareTrack = Array.from(localParticipant?.videoTrackPublications.values() || []).find(
      pub => pub.source === Track.Source.ScreenShare
    )
    setIsScreenSharing(!!screenShareTrack)
  }, [localParticipant])

  const handleScreenShare = async () => {
    if (!localParticipant) return

    if (isScreenSharing) {
      // Stop screen share
      const screenShareTrack = Array.from(localParticipant.videoTrackPublications.values()).find(
        pub => pub.source === Track.Source.ScreenShare
      )
      if (screenShareTrack) {
        await localParticipant.unpublishTrack(screenShareTrack.track!)
        setIsScreenSharing(false)
      }
    } else {
      // Start screen share
      try {
        await localParticipant.setScreenShareEnabled(true)
        setIsScreenSharing(true)
      } catch (error) {
        // User cancelled or error occurred
        setIsScreenSharing(false)
      }
    }
  }

  const handleAudioDeviceSelect = async (deviceId: string) => {
    setSelectedAudioDevice(deviceId)

    // Switch audio device by disabling and re-enabling with new device
    if (localParticipant) {
      try {
        const wasEnabled = localParticipant.isMicrophoneEnabled
        if (wasEnabled) {
          await localParticipant.setMicrophoneEnabled(false)
          await localParticipant.setMicrophoneEnabled(true, { deviceId })
          console.log('[StreamingControls] Audio device switched to:', deviceId)
        }
      } catch (error) {
        console.error('[StreamingControls] Failed to switch audio device:', error)
      }
    }
  }

  const handleVideoDeviceSelect = async (deviceId: string) => {
    setSelectedVideoDevice(deviceId)

    // Switch video device by disabling and re-enabling with new device
    if (localParticipant) {
      try {
        const wasEnabled = localParticipant.isCameraEnabled
        if (wasEnabled) {
          await localParticipant.setCameraEnabled(false)
          await localParticipant.setCameraEnabled(true, { deviceId })
          console.log('[StreamingControls] Video device switched to:', deviceId)
        }
      } catch (error) {
        console.error('[StreamingControls] Failed to switch video device:', error)
      }
    }
  }

  const isDisconnected = connectionState === ConnectionState.Disconnected

  const { credentials } = useLiveKitCredentials()

  const handleReconnect = async () => {
    if (!room || !credentials) {
      console.error('[StreamingControls] Cannot reconnect: missing room or credentials')
      window.location.reload()
      return
    }

    try {
      console.log('[StreamingControls] Reconnecting to room...', credentials.url)
      await room.connect(credentials.url, credentials.token)
      console.log('[StreamingControls] Reconnected successfully')
    } catch (error) {
      console.error('[StreamingControls] Reconnect failed:', error)
      // Fallback to reload if reconnect fails
      window.location.reload()
    }
  }

  return (
    <ControlsContainer>
      <ControlsRow>
        <ControlGroup>
          <Button onClick={() => toggleMic()} variant="contained" startIcon={isMicEnabled ? <MicIcon /> : <MicOffIcon />}>
            {isMicEnabled ? t('streaming_controls.mute_mic') : t('streaming_controls.unmute_mic')}
          </Button>
          <DeviceSelectorWrapper>
            <AudioDeviceSelector selectedDeviceId={selectedAudioDevice} onDeviceSelect={handleAudioDeviceSelect} />
          </DeviceSelectorWrapper>
        </ControlGroup>

        <ControlGroup>
          <Button onClick={() => toggleCamera()} variant="contained" startIcon={isCameraEnabled ? <VideocamIcon /> : <VideocamOffIcon />}>
            {isCameraEnabled ? t('streaming_controls.stop_cam') : t('streaming_controls.start_cam')}
          </Button>
          <DeviceSelectorWrapper>
            <VideoDeviceSelector selectedDeviceId={selectedVideoDevice} onDeviceSelect={handleVideoDeviceSelect} />
          </DeviceSelectorWrapper>
          <Button
            onClick={handleScreenShare}
            variant="contained"
            startIcon={isScreenSharing ? <StopScreenShareIcon /> : <ScreenShareIcon />}
          >
            {isScreenSharing ? t('streaming_controls.stop_share') : t('streaming_controls.share_screen')}
          </Button>
        </ControlGroup>

        {isDisconnected ? (
          <Button onClick={handleReconnect} variant="contained">
            {t('streaming_controls.reconnect')}
          </Button>
        ) : (
          <Button onClick={() => room?.disconnect()} variant="contained" startIcon={<CallEndIcon />}>
            {t('streaming_controls.end_stream')}
          </Button>
        )}
      </ControlsRow>
    </ControlsContainer>
  )
}
