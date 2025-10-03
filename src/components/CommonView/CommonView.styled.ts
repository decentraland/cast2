import { Card, keyframes, styled } from 'decentraland-ui2'

const slideInFromRight = keyframes({
  from: {
    transform: 'translateX(100%)'
  },
  to: {
    transform: 'translateX(0)'
  }
})

const slideOutToRight = keyframes({
  from: {
    transform: 'translateX(0)'
  },
  to: {
    transform: 'translateX(100%)'
  }
})

const ViewContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  background: 'linear-gradient(247deg, #210A35 0%, #000 50%, #210A35 100%)',
  paddingTop: 60
})

const ViewLayout = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: 'calc(100vh - 60px)',
  width: '100%',
  position: 'relative',
  overflow: 'hidden',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column'
  }
}))

const MainContent = styled('div')({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  minHeight: 0,
  transition: 'all 0.3s ease-in-out',
  padding: 24
})

const VideoContainer = styled('div')<{ $sidebarOpen: boolean }>(() => ({
  flex: 1,
  display: 'flex',
  position: 'relative',
  minHeight: 0,
  transition: 'all 0.3s ease-in-out'
}))

const VideoArea = styled('div')<{ $sidebarOpen: boolean }>(({ theme }) => ({
  flex: 1,
  background: '#1a0b2e',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  boxSizing: 'border-box',
  transition: 'flex 0.3s ease-in-out',
  borderRadius: 12,
  '& video': {
    width: '100%',
    height: '100%',
    objectFit: 'contain'
  },
  [theme.breakpoints.down('sm')]: {
    padding: 16,
    margin: 8
  }
}))

const Sidebar = styled('div')<{ $isOpen: boolean; $isClosing?: boolean }>(({ theme, $isOpen, $isClosing }) => {
  let animationValue = 'none'
  if ($isClosing) {
    animationValue = `${slideOutToRight} 0.3s ease-out`
  } else if ($isOpen) {
    animationValue = `${slideInFromRight} 0.3s ease-out`
  }

  return {
    width: $isOpen ? '400px' : '0',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.3s ease-in-out',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #66497f 0%, #3f2357 100%)',
    borderRadius: 12,
    flexShrink: 0,
    animation: animationValue,
    marginLeft: 18,
    boxSizing: 'border-box',
    [theme.breakpoints.down('lg')]: {
      width: $isOpen ? '320px' : '0'
    },
    [theme.breakpoints.down('sm')]: {
      position: 'fixed',
      top: 60,
      left: 0,
      right: 0,
      width: '100%',
      height: $isOpen ? '40vh' : '0',
      margin: 8,
      padding: 16,
      zIndex: 100
    }
  }
})

const ControlsArea = styled('div')({
  width: '100%',
  background: 'transparent',
  flexShrink: 0
})

const ErrorContainer = styled(Card)(() => ({
  padding: 24,
  margin: 20,
  background: 'rgba(255, 77, 77, 0.1)',
  border: '1px solid rgba(255, 77, 77, 0.3)',
  color: 'white'
}))

const AuthPrompt = styled('div')({
  marginTop: 12,
  padding: 12,
  background: 'rgba(0, 0, 0, 0.6)',
  borderRadius: 8,
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  alignItems: 'center',
  '& .MuiTypography-root': {
    marginBottom: 8
  }
})

export { AuthPrompt, ControlsArea, ErrorContainer, MainContent, Sidebar, VideoArea, VideoContainer, ViewContainer, ViewLayout }
