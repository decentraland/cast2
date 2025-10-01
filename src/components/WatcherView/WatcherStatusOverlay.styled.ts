import styled from '@emotion/styled'

const OverlayContainer = styled.div`
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 10;
  display: flex;
  gap: 8px;
`

const StatusBadge = styled.div<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  background: ${({ $isActive }) => ($isActive ? 'rgba(255, 71, 87, 0.9)' : 'rgba(46, 204, 113, 0.9)')};
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
`

const IconWrapper = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    font-size: 16px;
  }
`

export { IconWrapper, OverlayContainer, StatusBadge }
