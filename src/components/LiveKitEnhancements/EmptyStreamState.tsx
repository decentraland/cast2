import TvIcon from '@mui/icons-material/Tv'
import VideocamIcon from '@mui/icons-material/Videocam'
import { useTranslation } from '../../modules/translation'
import { EmptyContainer, EmptyIconWrapper, EmptySubtitle, EmptyTitle } from './EmptyStreamState.styled'

interface EmptyStreamStateProps {
  type: 'streamer' | 'watcher'
  message?: string
}

export function EmptyStreamState({ type, message }: EmptyStreamStateProps) {
  const { t } = useTranslation()
  const isStreamer = type === 'streamer'

  const defaultMessage = isStreamer ? t('empty_state.streamer_message') : t('empty_state.watcher_message')

  const title = isStreamer ? t('empty_state.streamer_title') : t('empty_state.watcher_title')

  return (
    <EmptyContainer>
      <EmptyIconWrapper>{isStreamer ? <VideocamIcon /> : <TvIcon />}</EmptyIconWrapper>

      <EmptyTitle variant="h5">{title}</EmptyTitle>

      <EmptySubtitle variant="body1">{message || defaultMessage}</EmptySubtitle>
    </EmptyContainer>
  )
}
