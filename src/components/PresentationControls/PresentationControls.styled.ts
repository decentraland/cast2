import { styled } from 'decentraland-ui2'

export const PresentationControlsOverlay = styled('div')({
  position: 'absolute',
  bottom: 16,
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  alignItems: 'center',
  gap: 4
})

export const NavButton = styled('button')({
  width: 36,
  height: 36,
  borderRadius: '50%',
  background: 'rgba(0, 0, 0, 0.6)',
  backdropFilter: 'blur(10px)',
  border: 'none',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'background 0.2s ease',
  '&:hover': {
    background: 'rgba(0, 0, 0, 0.8)'
  },
  '&:disabled': {
    opacity: 0.3,
    cursor: 'default'
  },
  '& svg': {
    fontSize: 22
  }
})

export const SlideInfo = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '6px 16px',
  background: 'rgba(0, 0, 0, 0.6)',
  backdropFilter: 'blur(10px)',
  borderRadius: 20,
  color: 'white',
  fontSize: 13,
  fontWeight: 500,
  userSelect: 'none'
})

export const VideoButton = styled('button')({
  width: 36,
  height: 36,
  borderRadius: '50%',
  background: 'rgba(0, 0, 0, 0.6)',
  backdropFilter: 'blur(10px)',
  border: 'none',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'background 0.2s ease',
  '&:hover': {
    background: 'rgba(0, 0, 0, 0.8)'
  },
  '&:disabled': {
    opacity: 0.6,
    cursor: 'wait'
  },
  '& svg': {
    fontSize: 20
  }
})

export const Divider = styled('div')({
  width: 1,
  height: 24,
  background: 'rgba(255, 255, 255, 0.3)',
  margin: '0 4px'
})

export const UploadingOverlay = styled('div')({
  position: 'absolute',
  bottom: 16,
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '8px 20px',
  background: 'rgba(0, 0, 0, 0.75)',
  backdropFilter: 'blur(10px)',
  borderRadius: 20,
  color: 'white',
  fontSize: 14
})

export const ErrorOverlay = styled('div')(({ theme }) => ({
  position: 'absolute',
  bottom: 16,
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '10px 16px 10px 20px',
  background: theme.palette.primary.main,
  borderRadius: 20,
  color: 'white',
  fontSize: 14,
  maxWidth: 'calc(100vw - 32px)'
}))

export const ErrorMessage = styled('span')({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
})

export const ErrorDismissButton = styled('button')({
  width: 24,
  height: 24,
  borderRadius: '50%',
  background: 'rgba(255, 255, 255, 0.2)',
  border: 'none',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  flexShrink: 0,
  transition: 'background 0.2s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.35)'
  },
  '& svg': {
    fontSize: 16
  }
})
