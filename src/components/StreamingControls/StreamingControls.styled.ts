import { Button, styled } from 'decentraland-ui2'

const ControlsContainer = styled('div', {
  shouldForwardProp: prop => typeof prop === 'string' && !prop.startsWith('$')
})<{ $hasRightControls?: boolean }>(({ theme, $hasRightControls }) => ({
  width: '100%',
  padding: 20,
  display: 'flex',
  justifyContent: $hasRightControls ? 'space-between' : 'center',
  alignItems: 'center',
  boxSizing: 'border-box',
  gap: 24,
  [theme.breakpoints.down('sm')]: {
    padding: 12,
    gap: 8,
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
}))

const ControlsLeft = styled('div')(({ theme }) => ({
  display: 'none',
  [theme.breakpoints.down('sm')]: {
    display: 'flex',
    gap: 8,
    alignItems: 'center'
  }
}))

const ControlsCenter = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: 12,
  alignItems: 'center',
  justifyContent: 'center',
  flex: 1,
  [theme.breakpoints.down('sm')]: {
    gap: 8,
    flex: 'unset'
  }
}))

const ControlsRight = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: 16,
  alignItems: 'center',
  [theme.breakpoints.down('sm')]: {
    gap: 8
  }
}))

const CircleButton = styled('button')(({ theme }) => ({
  width: 48,
  height: 48,
  borderRadius: '50%',
  background: 'white',
  border: 'none',
  color: '#16141a',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'background 0.2s ease, transform 0.1s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.9)'
  },
  '&:active': {
    transform: 'scale(0.95)'
  },
  '& svg': {
    fontSize: 24
  },
  [theme.breakpoints.down('sm')]: {
    width: 40,
    height: 40,
    '& svg': {
      fontSize: 20
    }
  }
}))

const ButtonWithMenu = styled('div')({
  position: 'relative',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8
})

const ChevronButton = styled('button')(({ theme }) => ({
  background: 'none',
  border: 'none',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  padding: 0,
  transition: 'opacity 0.2s ease',
  '&:hover': {
    opacity: 0.8
  },
  '& svg': {
    fontSize: 20
  },
  [theme.breakpoints.down('sm')]: {
    '& svg': {
      fontSize: 18
    }
  }
}))

const DeviceMenu = styled('div')({
  position: 'absolute',
  bottom: '100%',
  left: '50%',
  transform: 'translateX(-50%)',
  marginBottom: 8,
  background: 'rgba(0, 0, 0, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: 12,
  border: '1px solid rgba(255, 255, 255, 0.1)',
  padding: '8px 0',
  minWidth: 200,
  maxHeight: 300,
  overflowY: 'auto',
  zIndex: 100,
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
  }
})

const DeviceMenuItem = styled('div', {
  shouldForwardProp: prop => typeof prop === 'string' && !prop.startsWith('$')
})<{ $active?: boolean }>(({ $active }) => ({
  padding: '12px 16px',
  color: 'white',
  cursor: 'pointer',
  fontSize: 14,
  background: $active ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
  transition: 'background 0.2s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.1)'
  }
}))

const IconButton = styled('button')(({ theme }) => ({
  position: 'relative',
  width: 40,
  height: 40,
  borderRadius: '50%',
  background: 'transparent',
  border: 'none',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'background 0.2s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.1)'
  },
  '& svg': {
    fontSize: 24
  },
  [theme.breakpoints.down('sm')]: {
    display: 'none' // Hide in mobile, shown in ControlsLeft instead
  }
}))

const NotificationBadge = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: -4,
  right: -4,
  background: theme.palette.primary.main,
  color: 'white',
  borderRadius: 12,
  padding: '2px 6px',
  fontSize: 11,
  fontWeight: 'bold',
  minWidth: 20,
  textAlign: 'center',
  [theme.breakpoints.down('sm')]: {
    fontSize: 10,
    padding: '1px 5px'
  }
}))

const EndStreamButton = styled(Button)(({ theme }) => ({
  background: theme.palette.primary.main,
  borderColor: theme.palette.primary.main,
  color: 'white',
  fontWeight: 'bold',
  padding: '10px 20px',
  minWidth: 'unset',
  textTransform: 'uppercase',
  fontSize: 13,
  letterSpacing: 0.5,
  '&:hover': {
    background: theme.palette.primary.dark
  },
  '& .MuiButton-startIcon': {
    marginRight: 8
  },
  [theme.breakpoints.down('sm')]: {
    display: 'none' // Hide desktop button on mobile
  }
}))

const CircleEndButton = styled('button')(({ theme }) => ({
  display: 'none',
  [theme.breakpoints.down('sm')]: {
    display: 'flex',
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: theme.palette.primary.main,
    border: 'none',
    color: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background 0.2s ease, transform 0.1s ease',
    '&:hover': {
      background: theme.palette.primary.dark
    },
    '&:active': {
      transform: 'scale(0.95)'
    },
    '& svg': {
      fontSize: 24
    }
  }
}))

const MobileIconButton = styled('button')(({ theme }) => ({
  display: 'none',
  [theme.breakpoints.down('sm')]: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: 'transparent',
    border: 'none',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.1)'
    },
    '& svg': {
      fontSize: 20
    }
  }
}))

export {
  ButtonWithMenu,
  ChevronButton,
  CircleButton,
  CircleEndButton,
  ControlsCenter,
  ControlsContainer,
  ControlsLeft,
  ControlsRight,
  DeviceMenu,
  DeviceMenuItem,
  EndStreamButton,
  IconButton,
  MobileIconButton,
  NotificationBadge
}
