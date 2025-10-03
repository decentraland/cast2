import TvIcon from '@mui/icons-material/Tv'
import { useTranslation } from '../../modules/translation'
import { EmptyStreamStateProps } from './EmptyStreamState.types'
import {
  AvatarImage,
  EmptyContainer,
  EmptyIconWrapper,
  EmptySubtitle,
  EmptyTitle,
  ParticipantNameOverlay,
  StreamerEmptyContainer
} from './EmptyStreamState.styled'

export function EmptyStreamState({ type, message, participantName }: EmptyStreamStateProps) {
  const { t } = useTranslation()
  const isStreamer = type === 'streamer'

  const defaultMessage = isStreamer ? t('empty_state.streamer_message') : t('empty_state.watcher_message')
  const title = isStreamer ? t('empty_state.streamer_title') : t('empty_state.watcher_title')

  // For streamer, show gradient background with avatar
  if (isStreamer) {
    return (
      <StreamerEmptyContainer>
        <AvatarImage src="/images/avatar.png" alt="Default Avatar" />
        {participantName && <ParticipantNameOverlay>{participantName}</ParticipantNameOverlay>}
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
