import styled from '@emotion/styled'
import { Button } from 'decentraland-ui2'

const ControlsContainer = styled.div<{ $hasRightControls?: boolean }>`
  width: 100%;
  padding: 20px;
  display: flex;
  justify-content: ${({ $hasRightControls }) => ($hasRightControls ? 'space-between' : 'center')};
  align-items: center;
  box-sizing: border-box;
  gap: 24px;

  @media (max-width: 768px) {
    padding: 12px;
    gap: 12px;
  }
`

const ControlsCenter = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
  flex: 1;

  @media (max-width: 768px) {
    gap: 8px;
  }
`

const ControlsRight = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;

  @media (max-width: 768px) {
    gap: 12px;
  }
`

const CircleButton = styled.button`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: white;
  border: none;
  color: #16141a;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    background 0.2s ease,
    transform 0.1s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.9);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    font-size: 24px;
  }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;

    svg {
      font-size: 20px;
    }
  }
`

const ButtonWithMenu = styled.div`
  position: relative;
  display: flex;
  flex-direction: row; /* Changed from column to row */
  align-items: center;
  gap: 8px;
`

const ChevronButton = styled.button`
  background: none;
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
  }

  svg {
    font-size: 20px;
  }

  @media (max-width: 768px) {
    svg {
      font-size: 18px;
    }
  }
`

const DeviceMenu = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 8px;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px 0;
  min-width: 200px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 100;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
`

const DeviceMenuItem = styled.div<{ $active?: boolean }>`
  padding: 12px 16px;
  color: white;
  cursor: pointer;
  font-size: 14px;
  background: ${({ $active }) => ($active ? 'rgba(255, 255, 255, 0.15)' : 'transparent')};
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`

const IconButton = styled.button`
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  svg {
    font-size: 24px;
  }

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;

    svg {
      font-size: 20px;
    }
  }
`

const NotificationBadge = styled.div`
  position: absolute;
  top: -4px;
  right: -4px;
  background: var(--primary);
  color: white;
  border-radius: 12px;
  padding: 2px 6px;
  font-size: 11px;
  font-weight: bold;
  min-width: 20px;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 10px;
    padding: 1px 5px;
  }
`

const EndStreamButton = styled(Button)`
  && {
    background: var(--primary) !important;
    border-color: var(--primary) !important;
    color: white !important;
    font-weight: bold;
    padding: 10px 20px;
    min-width: unset;
    text-transform: uppercase;
    font-size: 13px;
    letter-spacing: 0.5px;

    &:hover {
      background: var(--primary-hover) !important;
    }

    .MuiButton-startIcon {
      margin-right: 8px;
    }

    @media (max-width: 768px) {
      padding: 8px 16px;
      font-size: 12px;

      .MuiButton-startIcon {
        margin-right: 4px;

        svg {
          font-size: 18px;
        }
      }
    }
  }
`

export {
  ButtonWithMenu,
  ChevronButton,
  CircleButton,
  ControlsCenter,
  ControlsContainer,
  ControlsRight,
  DeviceMenu,
  DeviceMenuItem,
  EndStreamButton,
  IconButton,
  NotificationBadge
}
