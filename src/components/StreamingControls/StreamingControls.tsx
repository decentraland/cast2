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
  DesktopMediaControls,
  DeviceMenu,
  DeviceMenuItem,
  EndStreamButton,
  IconButton,
  MobileIconButton,
  MobileLeftGroup,
  MobileRightGroup,
  NotificationBadge
} from './StreamingControls.styled'

export function StreamingControls({
  onToggleChat,
  onTogglePeople,
  isStreamer = false,
  onLeave,
  unreadMessagesCount = 0
}: StreamingControlsProps) {
  const { t } = useTranslation()
  const room = useRoomContext()
  const { localParticipant } = useLocalParticipant()
  const remoteParticipants = useRemoteParticipants()
  console.log('remoteParticipants', remoteParticipants)
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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      // Check if click is outside of any dropdown menu
      if (!target.closest('[data-dropdown-menu]') && !target.closest('[data-dropdown-button]')) {
        setShowAudioMenu(false)
        setShowVideoMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const screenShareTrack = Array.from(localParticipant?.videoTrackPublications.values() || []).find(
      pub => pub.source === Track.Source.ScreenShare
    )
    setIsScreenSharing(!!screenShareTrack)

    // Listen for screen share track ending (e.g., when user stops from Chrome controls)
    if (screenShareTrack?.track) {
      const handleTrackEnded = () => {
        console.log('[StreamingControls] Screen share track ended (stopped by browser)')
        setIsScreenSharing(false)
      }

      const mediaStreamTrack = screenShareTrack.track.mediaStreamTrack
      mediaStreamTrack?.addEventListener('ended', handleTrackEnded)

      return () => {
        mediaStreamTrack?.removeEventListener('ended', handleTrackEnded)
      }
    }
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
    if (!localParticipant) {
      console.error('[StreamingControls] No local participant for screen share')
      return
    }

    console.log('[StreamingControls] Screen share toggle requested', {
      currentState: isScreenSharing,
      isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
      userAgent: navigator.userAgent,
      hasGetDisplayMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia)
    })

    if (isScreenSharing) {
      console.log('[StreamingControls] Stopping screen share')
      const screenShareTrack = Array.from(localParticipant.videoTrackPublications.values()).find(
        pub => pub.source === Track.Source.ScreenShare
      )
      if (screenShareTrack) {
        await localParticipant.unpublishTrack(screenShareTrack.track!)
        setIsScreenSharing(false)
        console.log('[StreamingControls] Screen share stopped successfully')
      }
    } else {
      try {
        // Check if screen share is supported
        const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

        if (isMobileDevice) {
          alert(t('streaming_controls.screen_share_mobile_not_supported'))
          return
        }

        if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
          console.error('[StreamingControls] Screen share not supported on this device/browser')
          alert('Screen sharing is not supported on this device or browser')
          return
        }

        console.log('[StreamingControls] Starting screen share')
        await localParticipant.setScreenShareEnabled(true)
        setIsScreenSharing(true)
        console.log('[StreamingControls] Screen share started successfully')
      } catch (error) {
        console.error('[StreamingControls] Error enabling screen share:', error)
        console.error('[StreamingControls] Error details:', {
          name: error instanceof Error ? error.name : 'Unknown',
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        })
        setIsScreenSharing(false)

        // Show user-friendly error message
        if (error instanceof Error) {
          if (error.name === 'NotAllowedError') {
            console.log('[StreamingControls] User denied screen share permission')
            alert('Permission denied. Please allow screen sharing to continue.')
          } else if (error.name === 'NotSupportedError') {
            alert('Screen sharing is not supported on this device')
          }
        }
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
    <ControlsContainer>
      {/* Mobile Left Controls: Media controls (visible only on mobile) */}
      <ControlsLeft>
        {/* Mic Control - Only for streamer */}
        {isStreamer && (
          <ButtonWithMenu>
            <CircleButton onClick={handleToggleMic}>{isMicEnabled ? <MicIcon /> : <MicOffIcon />}</CircleButton>
            {audioDevices.length > 1 && (
              <ChevronButton data-dropdown-button onClick={() => setShowAudioMenu(!showAudioMenu)}>
                <ExpandMoreIcon />
              </ChevronButton>
            )}
            {showAudioMenu && (
              <DeviceMenu data-dropdown-menu>
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
              <ChevronButton data-dropdown-button onClick={() => setShowVideoMenu(!showVideoMenu)}>
                <ExpandMoreIcon />
              </ChevronButton>
            )}
            {showVideoMenu && (
              <DeviceMenu data-dropdown-menu>
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
      </ControlsLeft>

      {/* Center Controls: Media controls (desktop) + Chat/People (mobile) */}
      <ControlsCenter>
        {/* Media controls - Only for streamer, visible only on desktop */}
        {isStreamer && (
          <DesktopMediaControls>
            <ButtonWithMenu>
              <CircleButton onClick={handleToggleMic}>{isMicEnabled ? <MicIcon /> : <MicOffIcon />}</CircleButton>
              {audioDevices.length > 1 && (
                <ChevronButton data-dropdown-button onClick={() => setShowAudioMenu(!showAudioMenu)}>
                  <ExpandMoreIcon />
                </ChevronButton>
              )}
              {showAudioMenu && (
                <DeviceMenu data-dropdown-menu>
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

            <ButtonWithMenu>
              <CircleButton onClick={handleToggleCamera}>{isCameraEnabled ? <VideocamIcon /> : <VideocamOffIcon />}</CircleButton>
              {videoDevices.length > 1 && (
                <ChevronButton data-dropdown-button onClick={() => setShowVideoMenu(!showVideoMenu)}>
                  <ExpandMoreIcon />
                </ChevronButton>
              )}
              {showVideoMenu && (
                <DeviceMenu data-dropdown-menu>
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

            <CircleButton onClick={handleScreenShare}>{isScreenSharing ? <StopScreenShareIcon /> : <ScreenShareIcon />}</CircleButton>

            {/* Leave/Hang-up button - Desktop only, positioned after media controls */}
            {isDisconnected ? (
              <EndStreamButton onClick={handleReconnect}>{t('streaming_controls.reconnect')}</EndStreamButton>
            ) : (
              <EndStreamButton onClick={handleLeave} startIcon={<CallEndIcon />}>
                {isStreamer ? t('streaming_controls.leave_stream') : t('streaming_controls.leave')}
              </EndStreamButton>
            )}
          </DesktopMediaControls>
        )}

        {/* Leave button for watchers (centered) */}
        {!isStreamer && (
          <>
            {isDisconnected ? (
              <EndStreamButton onClick={handleReconnect}>{t('streaming_controls.reconnect')}</EndStreamButton>
            ) : (
              <EndStreamButton onClick={handleLeave} startIcon={<CallEndIcon />}>
                {t('streaming_controls.leave')}
              </EndStreamButton>
            )}
          </>
        )}
      </ControlsCenter>

      {/* Right Controls: Chat + People buttons */}
      <ControlsRight>
        {/* Desktop buttons */}
        {onToggleChat && (
          <IconButton onClick={onToggleChat}>
            <ChatBubbleOutlineIcon />
            {unreadMessagesCount > 0 && <NotificationBadge>{unreadMessagesCount}</NotificationBadge>}
          </IconButton>
        )}

        {onTogglePeople && (
          <IconButton onClick={onTogglePeople}>
            <PeopleIcon />
            <NotificationBadge>{totalParticipants}</NotificationBadge>
          </IconButton>
        )}

        {/* Mobile: Chat and People on the left */}
        <MobileLeftGroup>
          {onToggleChat && (
            <MobileIconButton onClick={onToggleChat}>
              <ChatBubbleOutlineIcon />
              {unreadMessagesCount > 0 && <NotificationBadge>{unreadMessagesCount}</NotificationBadge>}
            </MobileIconButton>
          )}

          {onTogglePeople && (
            <MobileIconButton onClick={onTogglePeople}>
              <PeopleIcon />
              <NotificationBadge>{totalParticipants}</NotificationBadge>
            </MobileIconButton>
          )}
        </MobileLeftGroup>

        {/* Mobile: End Call on the right */}
        <MobileRightGroup>
          {isDisconnected ? (
            <CircleEndButton onClick={handleReconnect}>
              <CallEndIcon />
            </CircleEndButton>
          ) : (
            <CircleEndButton onClick={handleLeave}>
              <CallEndIcon />
            </CircleEndButton>
          )}
        </MobileRightGroup>
      </ControlsRight>
    </ControlsContainer>
  )
}
