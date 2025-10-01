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
import { AudioDeviceSelector } from '../AudioDeviceSelector/AudioDeviceSelector'
import { VideoDeviceSelector } from '../VideoDeviceSelector/VideoDeviceSelector'
import { ControlGroup, ControlsContainer, ControlsRow, DeviceSelectorWrapper } from './StreamingControls.styled'

export function StreamingControls() {
  const room = useRoomContext()
  const { localParticipant } = useLocalParticipant()
  const connectionState = useConnectionState()
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('')
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>('')

  const { enabled: isMicEnabled } = useTrackToggle({
    source: Track.Source.Microphone
  })

  const { enabled: isCameraEnabled } = useTrackToggle({
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
      } catch {
        setIsScreenSharing(false)
      }
    }
  }

  // Function to toggle camera, fixing the re-enable bug after End Stream
  const handleToggleCamera = async () => {
    if (!localParticipant) return

    try {
      if (isCameraEnabled) {
        await localParticipant.setCameraEnabled(false)
      } else {
        await localParticipant.setCameraEnabled(true)

        // Force refresh of camera track if it's still not working
        const existingCameraTrack = localParticipant.getTrackPublication(Track.Source.Camera)
        if (existingCameraTrack && !existingCameraTrack.track) {
          // Unpublish and republish to force new track
          await localParticipant.unpublishTrack(existingCameraTrack.track!)
          setTimeout(async () => {
            await localParticipant.setCameraEnabled(true)
          }, 100)
        }
      }
    } catch {
      // Try to force a fresh camera start
      setTimeout(async () => {
        try {
          await localParticipant.setCameraEnabled(true)
        } catch {
          // Camera retry failed
        }
      }, 500)
    }
  }

  // Function to toggle microphone
  const handleToggleMic = async () => {
    if (!localParticipant) return
    try {
      await localParticipant.setMicrophoneEnabled(!isMicEnabled)
    } catch {
      // Microphone toggle error
    }
  }

  // Handle audio device selection
  const handleAudioDeviceSelect = async (deviceId: string) => {
    setSelectedAudioDevice(deviceId)
    if (localParticipant && isMicEnabled) {
      try {
        await localParticipant.setMicrophoneEnabled(false)
        await localParticipant.setMicrophoneEnabled(true, { deviceId })
      } catch {
        // Failed to switch audio device
      }
    }
  }

  // Handle video device selection
  const handleVideoDeviceSelect = async (deviceId: string) => {
    setSelectedVideoDevice(deviceId)
    if (localParticipant && isCameraEnabled) {
      try {
        await localParticipant.setCameraEnabled(false)
        await localParticipant.setCameraEnabled(true, { deviceId })
      } catch {
        // Failed to switch video device
      }
    }
  }

  // Check if we're disconnected to show "Stream" button instead of "End Stream"
  const isDisconnected = connectionState === ConnectionState.Disconnected

  return (
    <ControlsContainer>
      <ControlsRow>
        <ControlGroup>
          <Button onClick={handleToggleMic} variant="contained" startIcon={isMicEnabled ? <MicIcon /> : <MicOffIcon />}>
            {isMicEnabled ? 'Mute Mic' : 'Unmute Mic'}
          </Button>
          <DeviceSelectorWrapper>
            <AudioDeviceSelector selectedDeviceId={selectedAudioDevice} onDeviceSelect={handleAudioDeviceSelect} />
          </DeviceSelectorWrapper>
        </ControlGroup>

        <ControlGroup>
          <Button onClick={handleToggleCamera} variant="contained" startIcon={isCameraEnabled ? <VideocamIcon /> : <VideocamOffIcon />}>
            {isCameraEnabled ? 'Stop Cam' : 'Start Cam'}
          </Button>
          <DeviceSelectorWrapper>
            <VideoDeviceSelector selectedDeviceId={selectedVideoDevice} onDeviceSelect={handleVideoDeviceSelect} />
          </DeviceSelectorWrapper>
        </ControlGroup>

        <Button onClick={handleScreenShare} variant="contained" startIcon={isScreenSharing ? <StopScreenShareIcon /> : <ScreenShareIcon />}>
          {isScreenSharing ? 'Stop Share' : 'Share Screen'}
        </Button>

        {isDisconnected ? (
          <Button onClick={() => window.location.reload()} variant="contained">
            Reconnect
          </Button>
        ) : (
          <Button onClick={() => room?.disconnect()} variant="contained" startIcon={<CallEndIcon />}>
            End Stream
          </Button>
        )}
      </ControlsRow>
    </ControlsContainer>
  )
}
