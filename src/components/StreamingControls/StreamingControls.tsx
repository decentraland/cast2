import { useCallback, useEffect, useState } from 'react'
import { useConnectionState, useLocalParticipant, useRemoteParticipants, useRoomContext, useTrackToggle } from '@livekit/components-react'
import CallEndIcon from '@mui/icons-material/CallEnd'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import PeopleIcon from '@mui/icons-material/People'
import ScreenShareIcon from '@mui/icons-material/ScreenShare'
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import VideocamIcon from '@mui/icons-material/Videocam'
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import { ConnectionState, LocalAudioTrack, LocalVideoTrack, Track } from 'livekit-client'
import { useLiveKitCredentials } from '../../context/LiveKitContext'
import { useTranslation } from '../../modules/translation'
import { StreamingControlsProps } from './StreamingControls.types'
import {
  ButtonWithMenu,
  ChevronButton,
  CircleButton,
  CircleEndButton,
  ControlsCenter,
  ControlsContainer,
  ControlsLeft,
  ControlsRight,
  DeviceMenu,
  DeviceMenuItem,
  EndStreamButton,
  IconButton,
  MobileIconButton,
  NotificationBadge
} from './StreamingControls.styled'

export function StreamingControls({ onToggleChat, onTogglePeople, isStreamer = false, onLeave }: StreamingControlsProps) {
  const { t } = useTranslation()
  const room = useRoomContext()
  const { localParticipant } = useLocalParticipant()
  const remoteParticipants = useRemoteParticipants()
  const connectionState = useConnectionState()
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [showAudioMenu, setShowAudioMenu] = useState(false)
  const [showVideoMenu, setShowVideoMenu] = useState(false)
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([])
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('')
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>('')

  const { enabled: isMicEnabled } = useTrackToggle({
    source: Track.Source.Microphone
  })

  const { enabled: isCameraEnabled } = useTrackToggle({
    source: Track.Source.Camera
  })

  const getDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      console.log('[StreamingControls] Found devices:', devices)
      // Keep ALL devices including "default" - let the user choose their system default
      const audioInputs = devices.filter(d => d.kind === 'audioinput')
      const videoInputs = devices.filter(d => d.kind === 'videoinput')

      console.log(
        '[StreamingControls] Found audio devices:',
        audioInputs.length,
        audioInputs.map(d => d.label)
      )
      console.log(
        '[StreamingControls] Found video devices:',
        videoInputs.length,
        videoInputs.map(d => d.label)
      )

      setAudioDevices(audioInputs)
      setVideoDevices(videoInputs)

      // Auto-select "default" device or first available if none selected
      if (!selectedAudioDevice && audioInputs.length > 0) {
        const defaultDevice = audioInputs.find(d => d.deviceId === 'default') || audioInputs[0]
        console.log('[StreamingControls] Auto-selecting audio device:', defaultDevice.deviceId, defaultDevice.label)
        setSelectedAudioDevice(defaultDevice.deviceId)
      }
      if (!selectedVideoDevice && videoInputs.length > 0) {
        const defaultDevice = videoInputs.find(d => d.deviceId === 'default') || videoInputs[0]
        console.log('[StreamingControls] Auto-selecting video device:', defaultDevice.deviceId, defaultDevice.label)
        setSelectedVideoDevice(defaultDevice.deviceId)
      }
    } catch (error) {
      console.error('[StreamingControls] Failed to enumerate devices:', error)
    }
  }, [selectedAudioDevice, selectedVideoDevice])

  useEffect(() => {
    getDevices()
    navigator.mediaDevices.addEventListener('devicechange', getDevices)
    return () => navigator.mediaDevices.removeEventListener('devicechange', getDevices)
  }, [getDevices])

  useEffect(() => {
    const screenShareTrack = Array.from(localParticipant?.videoTrackPublications.values() || []).find(
      pub => pub.source === Track.Source.ScreenShare
    )
    setIsScreenSharing(!!screenShareTrack)
  }, [localParticipant])

  const handleToggleMic = async () => {
    if (!localParticipant) return

    try {
      if (isMicEnabled) {
        console.log('[StreamingControls] Disabling microphone')
        await localParticipant.setMicrophoneEnabled(false)
      } else {
        console.log('[StreamingControls] Enabling microphone with device:', selectedAudioDevice)
        // Use "exact" constraint to force the specific device
        await localParticipant.setMicrophoneEnabled(true, selectedAudioDevice ? { deviceId: { exact: selectedAudioDevice } } : undefined)
      }
    } catch (error) {
      console.error('[StreamingControls] Failed to toggle microphone:', error)
    }
  }

  const handleToggleCamera = async () => {
    if (!localParticipant) return

    try {
      if (isCameraEnabled) {
        console.log('[StreamingControls] Disabling camera')
        await localParticipant.setCameraEnabled(false)
      } else {
        console.log('[StreamingControls] Enabling camera with device:', selectedVideoDevice)
        // Use "exact" constraint to force the specific device
        await localParticipant.setCameraEnabled(true, selectedVideoDevice ? { deviceId: { exact: selectedVideoDevice } } : undefined)
      }
    } catch (error) {
      console.error('[StreamingControls] Failed to toggle camera:', error)
    }
  }

  const handleScreenShare = async () => {
    if (!localParticipant) return

    if (isScreenSharing) {
      const screenShareTrack = Array.from(localParticipant.videoTrackPublications.values()).find(
        pub => pub.source === Track.Source.ScreenShare
      )
      if (screenShareTrack) {
        await localParticipant.unpublishTrack(screenShareTrack.track!)
        setIsScreenSharing(false)
      }
    } else {
      try {
        await localParticipant.setScreenShareEnabled(true)
        setIsScreenSharing(true)
      } catch (error) {
        setIsScreenSharing(false)
      }
    }
  }

  const handleAudioDeviceSelect = async (deviceId: string) => {
    console.log('[StreamingControls] Selecting audio device:', deviceId)
    setSelectedAudioDevice(deviceId)
    setShowAudioMenu(false)

    // Only switch if mic is currently enabled
    if (!localParticipant || !isMicEnabled) {
      console.log('[StreamingControls] Device selected. Will use when mic is enabled.')
      return
    }

    try {
      // Get current audio track
      const audioPublication = localParticipant.getTrackPublication(Track.Source.Microphone)
      const audioTrack = audioPublication?.track as LocalAudioTrack | undefined

      if (audioTrack && 'restartTrack' in audioTrack) {
        // Use restartTrack with "exact" constraint (no renegotiation, seamless switch)
        console.log('[StreamingControls] Restarting track with device:', deviceId)
        await audioTrack.restartTrack({ deviceId: { exact: deviceId } })
        console.log('[StreamingControls] Audio device switched')
      } else {
        // Fallback: disable then re-enable with exact constraint
        console.log('[StreamingControls] No track found, using toggle method')
        await localParticipant.setMicrophoneEnabled(false)
        await localParticipant.setMicrophoneEnabled(true, { deviceId: { exact: deviceId } })
      }
    } catch (error) {
      console.error('[StreamingControls] Failed to switch audio device:', error)
    }
  }

  const handleVideoDeviceSelect = async (deviceId: string) => {
    console.log('[StreamingControls] Selecting video device:', deviceId)
    setSelectedVideoDevice(deviceId)
    setShowVideoMenu(false)

    // Only switch if camera is currently enabled
    if (!localParticipant || !isCameraEnabled) {
      console.log('[StreamingControls] Device selected. Will use when camera is enabled.')
      return
    }

    try {
      // Get current video track
      const videoPublication = localParticipant.getTrackPublication(Track.Source.Camera)
      const videoTrack = videoPublication?.track as LocalVideoTrack | undefined

      if (videoTrack && 'restartTrack' in videoTrack) {
        // Use restartTrack with "exact" constraint (no renegotiation, seamless switch)
        console.log('[StreamingControls] Restarting track with device:', deviceId)
        await videoTrack.restartTrack({ deviceId: { exact: deviceId } })
        console.log('[StreamingControls] Video device switched')
      } else {
        // Fallback: disable then re-enable with exact constraint
        console.log('[StreamingControls] No track found, using toggle method')
        await localParticipant.setCameraEnabled(false)
        await localParticipant.setCameraEnabled(true, { deviceId: { exact: deviceId } })
      }
    } catch (error) {
      console.error('[StreamingControls] Failed to switch video device:', error)
    }
  }

  const isDisconnected = connectionState === ConnectionState.Disconnected
  const { credentials } = useLiveKitCredentials()

  const handleReconnect = async () => {
    if (!room || !credentials) {
      window.location.reload()
      return
    }

    try {
      await room.connect(credentials.url, credentials.token)
    } catch (error) {
      window.location.reload()
    }
  }

  const totalParticipants = remoteParticipants.length + 1 // Include local

  const handleLeave = () => {
    room?.disconnect()
    onLeave?.()
  }

  return (
    <ControlsContainer $hasRightControls={isStreamer}>
      {/* Mobile Left Controls: Chat + People (visible only on mobile) */}
      <ControlsLeft>
        {onToggleChat && (
          <MobileIconButton onClick={onToggleChat}>
            <ChatBubbleOutlineIcon />
          </MobileIconButton>
        )}
        {onTogglePeople && (
          <MobileIconButton onClick={onTogglePeople}>
            <PeopleIcon />
            <NotificationBadge>{totalParticipants}</NotificationBadge>
          </MobileIconButton>
        )}
      </ControlsLeft>

      {/* Center Controls: Media controls only */}
      <ControlsCenter>
        {/* Mic Control - Only for streamer */}
        {isStreamer && (
          <ButtonWithMenu>
            <CircleButton onClick={handleToggleMic}>{isMicEnabled ? <MicIcon /> : <MicOffIcon />}</CircleButton>
            {audioDevices.length > 1 && (
              <ChevronButton onClick={() => setShowAudioMenu(!showAudioMenu)}>
                <ExpandMoreIcon />
              </ChevronButton>
            )}
            {showAudioMenu && (
              <DeviceMenu>
                {audioDevices.map(device => (
                  <DeviceMenuItem
                    key={device.deviceId}
                    $active={device.deviceId === selectedAudioDevice}
                    onClick={() => handleAudioDeviceSelect(device.deviceId)}
                  >
                    {device.label || `Microphone ${device.deviceId.slice(0, 5)}`}
                  </DeviceMenuItem>
                ))}
              </DeviceMenu>
            )}
          </ButtonWithMenu>
        )}

        {/* Camera Control - Only for streamer */}
        {isStreamer && (
          <ButtonWithMenu>
            <CircleButton onClick={handleToggleCamera}>{isCameraEnabled ? <VideocamIcon /> : <VideocamOffIcon />}</CircleButton>
            {videoDevices.length > 1 && (
              <ChevronButton onClick={() => setShowVideoMenu(!showVideoMenu)}>
                <ExpandMoreIcon />
              </ChevronButton>
            )}
            {showVideoMenu && (
              <DeviceMenu>
                {videoDevices.map(device => (
                  <DeviceMenuItem
                    key={device.deviceId}
                    $active={device.deviceId === selectedVideoDevice}
                    onClick={() => handleVideoDeviceSelect(device.deviceId)}
                  >
                    {device.label || `Camera ${device.deviceId.slice(0, 5)}`}
                  </DeviceMenuItem>
                ))}
              </DeviceMenu>
            )}
          </ButtonWithMenu>
        )}

        {/* Screen Share - Only for streamer */}
        {isStreamer && (
          <CircleButton onClick={handleScreenShare}>{isScreenSharing ? <StopScreenShareIcon /> : <ScreenShareIcon />}</CircleButton>
        )}
      </ControlsCenter>

      {/* Right Controls: Chat + People (desktop) + End/Leave button (both) */}
      <ControlsRight>
        {/* Chat (desktop only) */}
        {onToggleChat && (
          <IconButton onClick={onToggleChat}>
            <ChatBubbleOutlineIcon />
          </IconButton>
        )}

        {/* People (desktop only) */}
        {onTogglePeople && (
          <IconButton onClick={onTogglePeople}>
            <PeopleIcon />
            <NotificationBadge>{totalParticipants}</NotificationBadge>
          </IconButton>
        )}

        {/* End Stream / Leave / Reconnect */}
        {isDisconnected ? (
          <EndStreamButton onClick={handleReconnect}>{t('streaming_controls.reconnect')}</EndStreamButton>
        ) : (
          <>
            {/* Desktop button with text */}
            <EndStreamButton onClick={handleLeave} startIcon={<CallEndIcon />}>
              {isStreamer ? t('streaming_controls.leave_stream') : t('streaming_controls.leave')}
            </EndStreamButton>
            {/* Mobile button - icon only */}
            <CircleEndButton onClick={handleLeave}>
              <CallEndIcon />
            </CircleEndButton>
          </>
        )}
      </ControlsRight>
    </ControlsContainer>
  )
}
