import { useLocalParticipant } from '@livekit/components-react'
import MicOffIcon from '@mui/icons-material/MicOff'
import { useTranslation } from '../../modules/translation'
import { IconWrapper, OverlayContainer, StatusBadge } from './StreamerStatusOverlay.styled'

export function StreamerStatusOverlay() {
  const { t } = useTranslation()
  const { localParticipant } = useLocalParticipant()

  // Simple mute detection from track publications
  const isMicMuted = !localParticipant?.isMicrophoneEnabled

  // Check if any video is streaming (camera or screen share)
  const hasVideoTrack = localParticipant?.videoTrackPublications && localParticipant.videoTrackPublications.size > 0

  // Only show muted badge if user is actually streaming video but muted
  // Note: Speaking indicator is shown in ParticipantTile, not here, to avoid duplication
  return (
    <OverlayContainer>
      {hasVideoTrack && isMicMuted && (
        <StatusBadge $isActive={true} $type="muted">
          <IconWrapper>
            <MicOffIcon />
          </IconWrapper>
          {t('status.muted')}
        </StatusBadge>
      )}
    </OverlayContainer>
  )
}
