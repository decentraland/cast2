import { styled } from 'decentraland-ui2'

const ParticipantGridContainer = styled('div')<{ $participantCount: number; $expandedView: boolean }>(({
  $participantCount,
  $expandedView
}) => {
  let display = 'grid'
  let gridStyles = {}

  if ($participantCount === 0) {
    display = 'flex'
    gridStyles = {
      alignItems: 'center',
      justifyContent: 'center'
    }
  } else if ($participantCount === 1 || $expandedView) {
    display = 'block'
    gridStyles = {
      position: 'relative'
    }
  } else if ($participantCount === 2) {
    gridStyles = {
      gridTemplateColumns: '1fr 1fr',
      gap: 8
    }
  } else {
    gridStyles = {
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: 8,
      padding: 8,
      alignContent: 'start'
    }
  }

  return {
    width: '100%',
    height: '100%',
    position: 'relative',
    display,
    ...gridStyles
  }
})

const NoParticipants = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  textAlign: 'center',
  color: 'rgba(255, 255, 255, 0.6)',
  gap: '1rem'
})

const NoParticipantsIcon = styled('div')({
  fontSize: 48,
  marginBottom: '1rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& svg': {
    fontSize: 48
  }
})

const ParticipantTileContainer = styled('div')<{ isSpeaking?: boolean; $isFullscreen?: boolean; $clickable?: boolean }>(({
  isSpeaking,
  $isFullscreen,
  $clickable
}) => {
  const sizeStyles = $isFullscreen
    ? {
        width: '100%',
        height: '100%'
      }
    : {
        width: '100%',
        height: '100%'
      }

  return {
    position: 'relative',
    overflow: 'hidden',
    background: '#000',
    ...sizeStyles,
    border: isSpeaking ? '3px solid #1e90ff' : 'none',
    transition: 'border-color 0.3s ease, transform 0.2s ease',
    cursor: $clickable ? 'pointer' : 'default',
    ...($clickable && {
      '&:hover': {
        transform: 'scale(1.02)'
      }
    }),
    '& .lk-participant-tile': {
      background: 'transparent'
    },
    '& .lk-participant-metadata': {
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(10px)',
      borderRadius: 8,
      margin: '0.5rem'
    },
    '& .lk-participant-media-video': {
      objectFit: 'contain'
    }
  }
})

const FloatingVideoContainer = styled('div')(({ theme }) => ({
  position: 'absolute',
  bottom: 20,
  right: 20,
  width: 280,
  height: 160,
  borderRadius: 12,
  overflow: 'hidden',
  border: '2px solid rgba(255, 255, 255, 0.3)',
  background: '#000',
  cursor: 'pointer',
  zIndex: 10,
  transition: 'transform 0.2s ease, border-color 0.2s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    borderColor: 'rgba(255, 255, 255, 0.5)'
  },
  '& video': {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  [theme.breakpoints.down('sm')]: {
    width: 180,
    height: 100,
    bottom: 10,
    right: 10
  }
}))

const FloatingVideoName = styled('div')({
  position: 'absolute',
  bottom: 8,
  left: 8,
  right: 8,
  background: 'rgba(0, 0, 0, 0.8)',
  color: 'white',
  padding: '6px 10px',
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 600,
  textAlign: 'center',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  zIndex: 11
})

const ThumbnailGrid = styled('div')<{ $count: number }>(({ theme, $count }) => ({
  position: 'absolute',
  bottom: 20,
  right: 20,
  display: 'grid',
  gridTemplateColumns: `repeat(${Math.min($count, 2)}, 140px)`,
  gap: 8,
  zIndex: 10,
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: `repeat(${Math.min($count, 2)}, 90px)`,
    bottom: 10,
    right: 10
  }
}))

const ThumbnailItem = styled('div')({
  width: '100%',
  aspectRatio: '16/9',
  borderRadius: 8,
  overflow: 'hidden',
  border: '2px solid rgba(255, 255, 255, 0.3)',
  background: '#000',
  cursor: 'pointer',
  position: 'relative',
  transition: 'transform 0.2s ease, border-color 0.2s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    borderColor: 'rgba(255, 255, 255, 0.5)'
  },
  '& video': {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  }
})

const ThumbnailName = styled('div')({
  position: 'absolute',
  bottom: 4,
  left: 4,
  right: 4,
  background: 'rgba(0, 0, 0, 0.8)',
  color: 'white',
  padding: '4px 6px',
  borderRadius: 4,
  fontSize: 10,
  fontWeight: 600,
  textAlign: 'center',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
})

const SpeakingIndicatorWrapper = styled('div')({
  position: 'absolute',
  top: 12,
  right: 12,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  zIndex: 2
})

const ParticipantName = styled('div')({
  position: 'absolute',
  bottom: 12,
  left: 12,
  color: 'white',
  fontSize: 14,
  fontWeight: 500,
  textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
  background: 'rgba(0, 0, 0, 0.7)',
  backdropFilter: 'blur(10px)',
  padding: '6px 12px',
  borderRadius: 8,
  zIndex: 2
})

export {
  FloatingVideoContainer,
  FloatingVideoName,
  NoParticipants,
  NoParticipantsIcon,
  ParticipantGridContainer,
  ParticipantName,
  ParticipantTileContainer,
  SpeakingIndicatorWrapper,
  ThumbnailGrid,
  ThumbnailItem,
  ThumbnailName
}
