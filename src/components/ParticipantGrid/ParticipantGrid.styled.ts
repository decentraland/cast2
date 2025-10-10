import { styled } from 'decentraland-ui2'

const ParticipantGridContainer = styled('div', {
  shouldForwardProp: prop => typeof prop === 'string' && !prop.startsWith('$')
})<{ $participantCount: number; $expandedView: boolean }>(({ theme, $participantCount, $expandedView }) => {
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
      gap: 16,
      // Mobile: horizontal layout for 2 participants (square tiles, not full height)
      [theme.breakpoints.down('sm')]: {
        gridTemplateColumns: '1fr 1fr',
        gap: 8,
        alignItems: 'center',
        justifyContent: 'center',
        '& > *': {
          aspectRatio: '1 / 1',
          maxHeight: 'calc((100vw - 16px) / 2)' // Square based on width
        }
      }
    }
  } else if ($participantCount === 3) {
    gridStyles = {
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: 16,
      // Mobile: 1 large on top, 2 small below
      [theme.breakpoints.down('sm')]: {
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: 'auto auto',
        gap: 8,
        '& > *:nth-of-type(1)': {
          gridColumn: '1 / -1',
          aspectRatio: 'auto'
        },
        '& > *:nth-of-type(2), & > *:nth-of-type(3)': {
          aspectRatio: '1 / 1'
        }
      }
    }
  } else if ($participantCount === 4) {
    gridStyles = {
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: '1fr 1fr',
      gap: 16,
      [theme.breakpoints.down('sm')]: {
        gap: 8
      }
    }
  } else if ($participantCount <= 6) {
    gridStyles = {
      gridTemplateColumns: 'repeat(3, 1fr)',
      gridTemplateRows: 'repeat(2, 1fr)',
      gap: 16,
      [theme.breakpoints.down('sm')]: {
        gridTemplateColumns: '1fr 1fr',
        gap: 8
      }
    }
  } else if ($participantCount <= 9) {
    gridStyles = {
      gridTemplateColumns: 'repeat(3, 1fr)',
      gridTemplateRows: 'repeat(3, 1fr)',
      gap: 16,
      [theme.breakpoints.down('sm')]: {
        gridTemplateColumns: '1fr 1fr',
        gap: 8
      }
    }
  } else {
    gridStyles = {
      gridTemplateColumns: 'repeat(3, 1fr)',
      gridTemplateRows: 'repeat(3, 1fr)',
      gap: 16,
      [theme.breakpoints.down('sm')]: {
        gridTemplateColumns: '1fr 1fr',
        gap: 8
      }
    }
  }

  return {
    width: '100%',
    height: '100%',
    position: 'relative',
    display,
    padding: 8,
    [theme.breakpoints.down('sm')]: {
      padding: 4
    },
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

const ParticipantTileContainer = styled('div', {
  shouldForwardProp: prop => typeof prop === 'string' && !prop.startsWith('$')
})<{ $isSpeaking?: boolean; $isFullscreen?: boolean; $clickable?: boolean; $mirror?: boolean }>(({
  $isSpeaking,
  $isFullscreen,
  $clickable,
  $mirror
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
    border: $isSpeaking ? '3px solid #1e90ff' : 'none',
    borderRadius: 16,
    transition: 'border 0.3s ease, transform 0.2s ease',
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
      objectFit: 'contain',
      borderRadius: 16,
      ...($mirror && {
        transform: 'scaleX(-1)'
      })
    }
  }
})

const FloatingVideoContainer = styled('div', {
  shouldForwardProp: prop => typeof prop === 'string' && !prop.startsWith('$')
})<{ $mirror?: boolean }>(({ theme, $mirror }) => ({
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
    objectFit: 'cover',
    ...($mirror && {
      transform: 'scaleX(-1)'
    })
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
  color: 'white',
  padding: '6px 10px',
  fontSize: 12,
  fontWeight: 700,
  textAlign: 'left',
  textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: 'calc(100% - 16px)',
  zIndex: 11
})

const ThumbnailGrid = styled('div')(({ theme }) => ({
  position: 'absolute',
  bottom: 20,
  right: 20,
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  zIndex: 10,
  maxHeight: 'calc(100vh - 200px)',
  [theme.breakpoints.down('sm')]: {
    bottom: 10,
    right: 10,
    gap: 8
  }
}))

const ThumbnailItem = styled('div', {
  shouldForwardProp: prop => typeof prop === 'string' && !prop.startsWith('$')
})<{ $mirror?: boolean }>(({ theme, $mirror }) => ({
  width: 180,
  aspectRatio: '16/9',
  borderRadius: 8,
  overflow: 'hidden',
  border: '2px solid rgba(255, 255, 255, 0.3)',
  background: '#000',
  cursor: 'pointer',
  position: 'relative',
  transition: 'transform 0.2s ease, border-color 0.2s ease',
  flexShrink: 0,
  '&:hover': {
    transform: 'scale(1.05)',
    borderColor: 'rgba(255, 255, 255, 0.5)'
  },
  '& video': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    ...($mirror && {
      transform: 'scaleX(-1)'
    })
  },
  [theme.breakpoints.down('sm')]: {
    width: 120
  }
}))

const ThumbnailName = styled('div')({
  position: 'absolute',
  bottom: 4,
  left: 4,
  color: 'white',
  padding: '4px 6px',
  fontSize: 10,
  fontWeight: 700,
  textAlign: 'left',
  textShadow: '0 2px 6px rgba(0, 0, 0, 0.8)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: 'calc(100% - 8px)'
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

const OverflowCard = styled('div')({
  position: 'relative',
  width: '100%',
  height: '100%',
  background: 'linear-gradient(135deg, rgba(30, 144, 255, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
  border: '2px solid rgba(255, 255, 255, 0.2)',
  borderRadius: 16,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  overflow: 'hidden',
  '&:hover': {
    transform: 'scale(1.05)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
    background: 'linear-gradient(135deg, rgba(30, 144, 255, 0.2) 0%, rgba(147, 51, 234, 0.2) 100%)'
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 70%)',
    pointerEvents: 'none'
  }
})

const OverflowCount = styled('div')({
  fontSize: 72,
  fontWeight: 700,
  color: '#fff',
  textShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
  marginBottom: 8,
  zIndex: 1
})

const OverflowLabel = styled('div')({
  fontSize: 16,
  fontWeight: 600,
  color: 'rgba(255, 255, 255, 0.9)',
  textTransform: 'uppercase',
  letterSpacing: 1,
  zIndex: 1
})

const ParticipantName = styled('div')({
  position: 'absolute',
  bottom: 12,
  left: 12,
  color: 'white',
  fontSize: 14,
  fontWeight: 700,
  textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
  zIndex: 2
})

const ThumbnailOverflowCard = styled('div')(({ theme }) => ({
  width: 180,
  aspectRatio: '16/9',
  borderRadius: 8,
  overflow: 'hidden',
  border: '2px solid rgba(255, 255, 255, 0.2)',
  background: 'linear-gradient(135deg, rgba(30, 144, 255, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
  cursor: 'pointer',
  position: 'relative',
  transition: 'transform 0.2s ease, border-color 0.2s ease, background 0.2s ease',
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&:hover': {
    transform: 'scale(1.05)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
    background: 'linear-gradient(135deg, rgba(30, 144, 255, 0.2) 0%, rgba(147, 51, 234, 0.2) 100%)'
  },
  [theme.breakpoints.down('sm')]: {
    width: 120
  }
}))

export {
  FloatingVideoContainer,
  FloatingVideoName,
  NoParticipants,
  OverflowCard,
  OverflowCount,
  OverflowLabel,
  NoParticipantsIcon,
  ParticipantGridContainer,
  ParticipantName,
  ParticipantTileContainer,
  SpeakingIndicatorWrapper,
  ThumbnailGrid,
  ThumbnailItem,
  ThumbnailName,
  ThumbnailOverflowCard
}
