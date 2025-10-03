import { useEffect, useState } from 'react'
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
import { ConnectionState, Track } from 'livekit-client'
import { useLiveKitCredentials } from '../../context/LiveKitContext'
import { useTranslation } from '../../modules/translation'
import { StreamingControlsProps } from './StreamingControls.types'
import {
  ButtonWithMenu,
  ChevronButton,
  CircleButton,
  ControlsCenter,
  ControlsContainer,
  ControlsRight,
  DeviceMenu,
  DeviceMenuItem,
  EndStreamButton,
  IconButton,
  NotificationBadge
} from './StreamingControls.styled'

export function StreamingControls({ onToggleChat, onTogglePeople, isStreamer = false }: StreamingControlsProps) {
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

  const { enabled: isMicEnabled, toggle: toggleMic } = useTrackToggle({
    source: Track.Source.Microphone
  })

  const { enabled: isCameraEnabled, toggle: toggleCamera } = useTrackToggle({
    source: Track.Source.Camera
  })

  useEffect(() => {
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        setAudioDevices(devices.filter(d => d.kind === 'audioinput'))
        setVideoDevices(devices.filter(d => d.kind === 'videoinput'))
      } catch (error) {
        console.error('[StreamingControls] Failed to enumerate devices:', error)
      }
    }

    getDevices()
    navigator.mediaDevices.addEventListener('devicechange', getDevices)
    return () => navigator.mediaDevices.removeEventListener('devicechange', getDevices)
  }, [])

  useEffect(() => {
    const screenShareTrack = Array.from(localParticipant?.videoTrackPublications.values() || []).find(
      pub => pub.source === Track.Source.ScreenShare
    )
    setIsScreenSharing(!!screenShareTrack)
  }, [localParticipant])

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
    setSelectedAudioDevice(deviceId)
    setShowAudioMenu(false)

    if (localParticipant) {
      try {
        const wasEnabled = localParticipant.isMicrophoneEnabled
        if (wasEnabled) {
          await localParticipant.setMicrophoneEnabled(false)
          await localParticipant.setMicrophoneEnabled(true, { deviceId })
        }
      } catch (error) {
        console.error('[StreamingControls] Failed to switch audio device:', error)
      }
    }
  }

  const handleVideoDeviceSelect = async (deviceId: string) => {
    setSelectedVideoDevice(deviceId)
    setShowVideoMenu(false)

    if (localParticipant) {
      try {
        const wasEnabled = localParticipant.isCameraEnabled
        if (wasEnabled) {
          await localParticipant.setCameraEnabled(false)
          await localParticipant.setCameraEnabled(true, { deviceId })
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

  return (
    <ControlsContainer $hasRightControls={isStreamer}>
      <ControlsCenter>
        {/* Mic Control - Only for streamer */}
        {isStreamer && (
          <ButtonWithMenu>
            <CircleButton onClick={() => toggleMic()}>{isMicEnabled ? <MicIcon /> : <MicOffIcon />}</CircleButton>
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
            <CircleButton onClick={() => toggleCamera()}>{isCameraEnabled ? <VideocamIcon /> : <VideocamOffIcon />}</CircleButton>
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

        {/* End Stream / Leave / Reconnect */}
        {isDisconnected ? (
          <EndStreamButton onClick={handleReconnect}>{t('streaming_controls.reconnect')}</EndStreamButton>
        ) : isStreamer ? (
          <EndStreamButton onClick={() => room?.disconnect()} startIcon={<CallEndIcon />}>
            {t('streaming_controls.end_streaming')}
          </EndStreamButton>
        ) : (
          <EndStreamButton onClick={() => room?.disconnect()} startIcon={<CallEndIcon />}>
            {t('streaming_controls.leave')}
          </EndStreamButton>
        )}
      </ControlsCenter>

      <ControlsRight>
        {/* Chat */}
        {onToggleChat && (
          <IconButton onClick={onToggleChat}>
            <ChatBubbleOutlineIcon />
          </IconButton>
        )}

        {/* People */}
        {onTogglePeople && (
          <IconButton onClick={onTogglePeople}>
            <PeopleIcon />
            <NotificationBadge>{totalParticipants}</NotificationBadge>
          </IconButton>
        )}
      </ControlsRight>
    </ControlsContainer>
  )
}
