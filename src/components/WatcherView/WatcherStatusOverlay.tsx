import { useRemoteParticipants } from '@livekit/components-react'
import MicOffIcon from '@mui/icons-material/MicOff'
import { IconWrapper, OverlayContainer, StatusBadge } from './WatcherStatusOverlay.styled'

export function WatcherStatusOverlay() {
  const remoteParticipants = useRemoteParticipants()

  // Get the first remote participant (streamer)
  const streamer = remoteParticipants[0]

  // Check if streamer is muted (no audio track or muted)
  const isStreamerMuted =
    !streamer?.isMicrophoneEnabled || !Array.from(streamer?.audioTrackPublications.values() || []).some(pub => pub.track && !pub.isMuted)

  if (!streamer) return null

  return (
    <OverlayContainer>
      {isStreamerMuted && (
        <StatusBadge $isActive={true}>
          <IconWrapper>
            <MicOffIcon />
          </IconWrapper>
          Streamer Muted
        </StatusBadge>
      )}
    </OverlayContainer>
  )
}
