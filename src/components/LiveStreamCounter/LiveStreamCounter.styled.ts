import { keyframes, styled } from 'decentraland-ui2'

const pulse = keyframes({
  '0%, 100%': {
    opacity: 1
  },
  '50%': {
    opacity: 0.6
  }
})

const CounterContainer = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: 20,
  left: 20,
  zIndex: 15,
  [theme.breakpoints.down('sm')]: {
    top: 10,
    left: 10
  }
}))

const CounterMainContainer = styled('div')<{ $expanded: boolean }>(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '12px 16px',
  background: 'rgba(42, 12, 67, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: 12,
  border: '1px solid rgba(255, 255, 255, 0.1)',
  color: 'white',
  width: 290,
  boxSizing: 'border-box',
  cursor: 'pointer',
  transition: 'background 0.2s ease, border-color 0.2s ease',
  userSelect: 'none',
  '&:hover': {
    background: 'rgba(42, 12, 67, 1)',
    borderColor: 'rgba(255, 255, 255, 0.2)'
  },
  [theme.breakpoints.down('sm')]: {
    padding: '10px 12px',
    width: 'auto',
    minWidth: 200,
    gap: 8
  }
}))

const LivePill = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 12px',
  background: theme.palette.primary.main,
  borderRadius: 20,
  fontWeight: 'bold',
  fontSize: 12,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  flexShrink: 0,
  '& svg': {
    fontSize: 14,
    animation: `${pulse} 1.5s infinite`
  },
  [theme.breakpoints.down('sm')]: {
    padding: '4px 10px',
    fontSize: 11,
    gap: 4
  }
}))

const ParticipantText = styled('div')(({ theme }) => ({
  flex: 1,
  color: '#cfcdd4',
  fontWeight: 'bold',
  fontSize: 14,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  [theme.breakpoints.down('sm')]: {
    fontSize: 12
  }
}))

const ExpandIcon = styled('div')<{ $expanded: boolean }>(({ theme, $expanded }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'transform 0.2s ease',
  transform: $expanded ? 'rotate(180deg)' : 'rotate(0deg)',
  color: '#cfcdd4',
  flexShrink: 0,
  '& svg': {
    fontSize: 20
  },
  [theme.breakpoints.down('sm')]: {
    '& svg': {
      fontSize: 18
    }
  }
}))

const ParticipantDropdown = styled('div')(({ theme }) => ({
  marginTop: 8,
  background: 'rgba(42, 12, 67, 0.98)',
  backdropFilter: 'blur(20px)',
  borderRadius: 12,
  border: '1px solid rgba(255, 255, 255, 0.1)',
  padding: '8px 0',
  minWidth: 270,
  maxHeight: 300,
  overflowY: 'auto',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
  '&::-webkit-scrollbar': {
    width: 6
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 3
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.3)'
    }
  },
  [theme.breakpoints.down('sm')]: {
    minWidth: 200,
    maxHeight: 200
  }
}))

const ParticipantItem = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '12px 16px',
  color: 'white',
  cursor: 'default',
  transition: 'background 0.2s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.05)'
  },
  [theme.breakpoints.down('sm')]: {
    padding: '10px 12px',
    gap: 10
  }
}))

const LiveDot = styled('div')<{ $small?: boolean }>(({ theme, $small }) => ({
  color: theme.palette.primary.main,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  '& svg': {
    fontSize: $small ? 12 : 14,
    animation: `${pulse} 1.5s infinite`
  }
}))

const ParticipantName = styled('span')(({ theme }) => ({
  fontSize: 14,
  fontWeight: 500,
  color: 'white',
  [theme.breakpoints.down('sm')]: {
    fontSize: 13
  }
}))

export {
  CounterContainer,
  CounterMainContainer,
  ExpandIcon,
  LiveDot,
  LivePill,
  ParticipantDropdown,
  ParticipantItem,
  ParticipantName,
  ParticipantText
}
