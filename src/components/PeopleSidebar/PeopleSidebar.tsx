import { useLocalParticipant, useRemoteParticipants } from '@livekit/components-react'
import CloseIcon from '@mui/icons-material/Close'
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

interface PeopleSidebarProps {
  onClose: () => void
}

export function PeopleSidebar({ onClose }: PeopleSidebarProps) {
  const { localParticipant } = useLocalParticipant()
  const remoteParticipants = useRemoteParticipants()

  // Get all participants (local + remote)
  const allParticipants = localParticipant ? [localParticipant, ...remoteParticipants] : remoteParticipants

  // Filter participants by role in metadata
  const streamers = allParticipants.filter(participant => {
    try {
      const metadata = participant.metadata ? JSON.parse(participant.metadata) : {}
      return metadata.role === 'streamer'
    } catch {
      return false
    }
  })

  const watchers = allParticipants.filter(participant => {
    try {
      const metadata = participant.metadata ? JSON.parse(participant.metadata) : {}
      return metadata.role === 'watcher'
    } catch {
      return false
    }
  })

  const getAvatarColor = (identity: string) => {
    const colors = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
    ]
    const index = identity.charCodeAt(0) % colors.length
    return colors[index]
  }

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
