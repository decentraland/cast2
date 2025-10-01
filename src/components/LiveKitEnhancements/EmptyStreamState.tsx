import TvIcon from '@mui/icons-material/Tv'
import VideocamIcon from '@mui/icons-material/Videocam'
import { EmptyContainer, EmptyIconWrapper, EmptySubtitle, EmptyTitle } from './EmptyStreamState.styled'

interface EmptyStreamStateProps {
  type: 'streamer' | 'watcher'
  message?: string
}

export function EmptyStreamState({ type, message }: EmptyStreamStateProps) {
  const isStreamer = type === 'streamer'

  const defaultMessage = isStreamer
    ? 'Turn on your camera or share your screen so viewers can see your content'
    : 'The stream will start shortly. Please wait while the streamer gets ready.'

  return (
    <EmptyContainer>
      <EmptyIconWrapper>{isStreamer ? <VideocamIcon /> : <TvIcon />}</EmptyIconWrapper>

      <EmptyTitle variant="h5">{isStreamer ? 'Ready to Stream' : 'Waiting for Stream'}</EmptyTitle>

      <EmptySubtitle variant="body1">{message || defaultMessage}</EmptySubtitle>
    </EmptyContainer>
  )
}
