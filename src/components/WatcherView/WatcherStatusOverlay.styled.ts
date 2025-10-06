import { styled } from 'decentraland-ui2'

const OverlayContainer = styled('div')({
  position: 'absolute',
  bottom: 16,
  right: 16,
  zIndex: 10,
  display: 'flex',
  gap: 8
})

const StatusBadge = styled('div')<{ $isActive: boolean }>(({ $isActive }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  padding: '4px 8px',
  borderRadius: 16,
  fontSize: 12,
  fontWeight: 500,
  background: $isActive ? 'rgba(255, 71, 87, 0.9)' : 'rgba(46, 204, 113, 0.9)',
  color: 'white',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  backdropFilter: 'blur(10px)'
}))

const IconWrapper = styled('span')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& svg': {
    fontSize: 16
  }
})

export { IconWrapper, OverlayContainer, StatusBadge }
