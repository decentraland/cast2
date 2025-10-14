import { Card, styled } from 'decentraland-ui2'

const ViewContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100dvh',
  background: 'linear-gradient(247deg, #210A35 0%, #000 50%, #210A35 100%)',
  [theme.breakpoints.down('sm')]: {
    paddingTop: 0
  }
}))

const ViewLayout = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100dvh',
  width: '100%',
  position: 'relative',
  overflow: 'hidden',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    height: '100dvh'
  }
}))

const MainContent = styled('div')(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  minHeight: 0,
  transition: 'all 0.3s ease-in-out',
  padding: 24,
  [theme.breakpoints.down('sm')]: {
    padding: 0
  }
}))

const VideoContainer = styled('div')<{ $sidebarOpen: boolean }>(({ theme }) => ({
  flex: 1,
  display: 'flex',
  position: 'relative',
  minHeight: 0,
  gap: 18,
  [theme.breakpoints.down('sm')]: {
    gap: 0
  }
}))

const VideoArea = styled('div')<{ $sidebarOpen: boolean }>(({ theme, $sidebarOpen }) => ({
  flex: 1,
  minWidth: 0,
  background: '#1a0b2e',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  boxSizing: 'border-box',
  borderRadius: 12,
  transition: 'flex 0.3s ease-out',
  willChange: $sidebarOpen ? 'flex' : 'auto',
  '& video': {
    width: '100%',
    height: '100%',
    objectFit: 'contain'
  },
  [theme.breakpoints.down('sm')]: {
    borderRadius: 0,
    padding: 0,
    margin: 0
  }
}))

const Sidebar = styled('div')<{ $isOpen: boolean }>(({ theme, $isOpen }) => {
  return {
    width: $isOpen ? '400px' : '0',
    minWidth: $isOpen ? '400px' : '0',
    maxWidth: $isOpen ? '400px' : '0',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #66497f 0%, #3f2357 100%)',
    borderRadius: 12,
    boxSizing: 'border-box',
    flexShrink: 0,
    transition: 'width 0.3s ease-out, min-width 0.3s ease-out, max-width 0.3s ease-out',
    visibility: $isOpen ? 'visible' : 'hidden',
    willChange: $isOpen ? 'width, min-width, max-width' : 'auto',
    [theme.breakpoints.down('lg')]: {
      width: $isOpen ? '320px' : '0',
      minWidth: $isOpen ? '320px' : '0',
      maxWidth: $isOpen ? '320px' : '0'
    },
    [theme.breakpoints.down('sm')]: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      width: '100%',
      minWidth: '100%',
      maxWidth: '100%',
      height: $isOpen ? '100dvh' : '0',
      padding: 16,
      paddingBottom: 80,
      borderRadius: 0,
      zIndex: 100,
      transition: 'height 0.3s ease-out'
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
