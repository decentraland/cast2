import { Typography } from 'decentraland-ui2'
import styled from '@emotion/styled'

const SidebarContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  color: white;
  overflow: hidden;
`

const SidebarHeader = styled.div`
  padding: 24px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`

const SidebarTitle = styled(Typography)`
  && {
    color: white !important;
    font-size: 20px;
    font-weight: 700;
  }
`

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  svg {
    color: white;
    font-size: 20px;
  }
`

const SidebarContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;

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

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px;
`

const SectionTitle = styled(Typography)`
  && {
    color: rgba(255, 255, 255, 0.7) !important;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`

const SectionCount = styled.span`
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  font-weight: 600;
`

const SectionCard = styled.div`
  background: rgba(236, 235, 237, 0.2);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 0;
`

const Divider = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 12px 0;
`

const ParticipantItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`

const ParticipantAvatar = styled.div<{ $color?: string }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${props => props.$color || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  position: relative;
`

const ParticipantAvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: relative;
  z-index: 1;
`

const ParticipantInfo = styled.div`
  flex: 1;
  min-width: 0;
`

const ParticipantName = styled.div`
  color: white;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const ParticipantStatus = styled.div<{ $isStreaming?: boolean }>`
  color: ${props => (props.$isStreaming ? '#00ff88' : 'rgba(255, 255, 255, 0.5)')};
  font-size: 11px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${props => (props.$isStreaming ? '#00ff88' : 'rgba(255, 255, 255, 0.3)')};
  }
`

const EmptyState = styled.div`
  text-align: center;
  padding: 24px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 13px;
`

export {
  CloseButton,
  Divider,
  EmptyState,
  ParticipantAvatar,
  ParticipantAvatarImage,
  ParticipantInfo,
  ParticipantItem,
  ParticipantName,
  ParticipantStatus,
  Section,
  SectionCard,
  SectionCount,
  SectionHeader,
  SectionTitle,
  SidebarContainer,
  SidebarContent,
  SidebarHeader,
  SidebarTitle
}
