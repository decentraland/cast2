import { useMemo } from 'react'
import { useLocalParticipant, useRemoteParticipants } from '@livekit/components-react'
import CloseIcon from '@mui/icons-material/Close'
import { PeopleSidebarProps } from './PeopleSidebar.type'
import { getAvatarColor, useFilteredParticipants } from '../../hooks/usePeopleSidebar'
import {
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
} from './PeopleSidebar.styled'

export function PeopleSidebar({ onClose }: PeopleSidebarProps) {
  const { localParticipant } = useLocalParticipant()
  const remoteParticipants = useRemoteParticipants()

  const allParticipants = useMemo(() => {
    return localParticipant ? [localParticipant, ...remoteParticipants] : remoteParticipants
  }, [localParticipant, remoteParticipants])

  const { streamers, watchers } = useFilteredParticipants(allParticipants)

  return (
    <SidebarContainer>
      <SidebarHeader>
        <SidebarTitle>People</SidebarTitle>
        <CloseButton onClick={onClose}>
          <CloseIcon />
        </CloseButton>
      </SidebarHeader>

      <SidebarContent>
        {/* Participants Section */}
        <Section>
          <SectionCard>
            <SectionHeader>
              <SectionTitle>Participants</SectionTitle>
              <SectionCount>{streamers.length}</SectionCount>
            </SectionHeader>
            <Divider />
            {streamers.length > 0 ? (
              streamers.map(participant => (
                <ParticipantItem key={participant.sid}>
                  <ParticipantAvatar $color={getAvatarColor(participant.identity)}>
                    <ParticipantAvatarImage src="/images/avatar.png" alt="Avatar" />
                  </ParticipantAvatar>
                  <ParticipantInfo>
                    <ParticipantName>{participant.identity || 'Anonymous'}</ParticipantName>
                    <ParticipantStatus $isStreaming={true}>Streaming</ParticipantStatus>
                  </ParticipantInfo>
                </ParticipantItem>
              ))
            ) : (
              <EmptyState>No streamers yet</EmptyState>
            )}
          </SectionCard>
        </Section>

        {/* Watchers Section */}
        <Section>
          <SectionCard>
            <SectionHeader>
              <SectionTitle>Watchers</SectionTitle>
              <SectionCount>{watchers.length}</SectionCount>
            </SectionHeader>
            <Divider />
            {watchers.length > 0 ? (
              watchers.slice(0, 20).map(participant => (
                <ParticipantItem key={participant.sid}>
                  <ParticipantAvatar $color={getAvatarColor(participant.identity)}>
                    <ParticipantAvatarImage src="/images/avatar.png" alt="Avatar" />
                  </ParticipantAvatar>
                  <ParticipantInfo>
                    <ParticipantName>{participant.identity || 'Anonymous'}</ParticipantName>
                    <ParticipantStatus>Watching</ParticipantStatus>
                  </ParticipantInfo>
                </ParticipantItem>
              ))
            ) : (
              <EmptyState>No watchers yet</EmptyState>
            )}
            {watchers.length > 20 && <EmptyState>and {watchers.length - 20} more...</EmptyState>}
          </SectionCard>
        </Section>
      </SidebarContent>
    </SidebarContainer>
  )
}
