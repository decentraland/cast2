import { useIsSpeaking, useTracks } from '@livekit/components-react'
import TvIcon from '@mui/icons-material/Tv'
import { Track } from 'livekit-client'
import { SpeakingIndicator } from './SpeakingIndicator'
import { useTranslation } from '../../modules/translation'
import { EmptyStreamStateProps } from './EmptyStreamState.types'
import {
  AvatarImage,
  EmptyContainer,
  EmptyIconWrapper,
  EmptySubtitle,
  EmptyTitle,
  ParticipantNameOverlay,
  SpeakingIndicatorWrapper,
  StreamerEmptyContainer
} from './EmptyStreamState.styled'

export function EmptyStreamState({ type, message, participantName, participant }: EmptyStreamStateProps) {
  const { t } = useTranslation()
  const isStreamer = type === 'streamer'

  const defaultMessage = isStreamer ? t('empty_state.streamer_message') : t('empty_state.watcher_message')
  const title = isStreamer ? t('empty_state.streamer_title') : t('empty_state.watcher_title')

  // Get audio track for speaking indicator
  const audioTracks = useTracks([{ source: Track.Source.Microphone, withPlaceholder: false }])
  const participantAudioTrack = participant ? audioTracks.find(t => t.participant.identity === participant.identity) : undefined

  // Detect if speaking
  const isSpeaking = useIsSpeaking(participant)

  // For streamer, show gradient background with avatar
  if (isStreamer) {
    return (
      <StreamerEmptyContainer $isSpeaking={isSpeaking}>
        <AvatarImage src="/images/avatar.png" alt="Default Avatar" />
        {participantName && <ParticipantNameOverlay>{participantName}</ParticipantNameOverlay>}
        {participant && participantAudioTrack && (
          <SpeakingIndicatorWrapper>
            <SpeakingIndicator participant={participant} trackRef={participantAudioTrack} />
          </SpeakingIndicatorWrapper>
        )}
      </StreamerEmptyContainer>
    )
  }

  // For watcher, show the icon and text
  return (
    <EmptyContainer>
      <EmptyIconWrapper>
        <TvIcon />
      </EmptyIconWrapper>

      <EmptyTitle variant="h5">{title}</EmptyTitle>

      <EmptySubtitle variant="body1">{message || defaultMessage}</EmptySubtitle>
    </EmptyContainer>
  )
}
