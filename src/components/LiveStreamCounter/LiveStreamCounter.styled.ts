import styled from '@emotion/styled'

const CounterContainer = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 15;

  @media (max-width: 768px) {
    top: 10px;
    left: 10px;
  }
`

const CounterMainContainer = styled.div<{ $expanded: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(42, 12, 67, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  width: 290px;
  box-sizing: border-box;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;
  user-select: none;

  &:hover {
    background: rgba(42, 12, 67, 1);
    border-color: rgba(255, 255, 255, 0.2);
  }

  @media (max-width: 768px) {
    padding: 10px 12px;
    width: auto;
    min-width: 200px;
    gap: 8px;
  }
`

const LivePill = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--primary);
  border-radius: 20px;
  font-weight: bold;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;

  svg {
    font-size: 14px;
    animation: pulse 1.5s infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
  }

  @media (max-width: 768px) {
    padding: 4px 10px;
    font-size: 11px;
    gap: 4px;
  }
`

const ParticipantText = styled.div`
  flex: 1;
  color: #cfcdd4;
  font-weight: bold;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 768px) {
    font-size: 12px;
  }
`

const ExpandIcon = styled.div<{ $expanded: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
  transform: ${({ $expanded }) => ($expanded ? 'rotate(180deg)' : 'rotate(0deg)')};
  color: #cfcdd4;
  flex-shrink: 0;

  svg {
    font-size: 20px;
  }

  @media (max-width: 768px) {
    svg {
      font-size: 18px;
    }
  }
`

const ParticipantDropdown = styled.div`
  margin-top: 8px;
  background: rgba(42, 12, 67, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px 0;
  min-width: 270px;
  max-height: 300px;
  overflow-y: auto;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);

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

  @media (max-width: 768px) {
    min-width: 200px;
    max-height: 200px;
  }
`

const ParticipantItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: white;
  cursor: default;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  @media (max-width: 768px) {
    padding: 10px 12px;
    gap: 10px;
  }
`

const LiveDot = styled.div<{ $small?: boolean }>`
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    font-size: ${({ $small }) => ($small ? '12px' : '14px')};
    animation: pulse 1.5s infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
  }
`

const ParticipantName = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: white;

  @media (max-width: 768px) {
    font-size: 13px;
  }
`

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
