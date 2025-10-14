import { useCallback, useMemo } from 'react'
import { useLocalParticipant, useRemoteParticipants } from '@livekit/components-react'
import CloseIcon from '@mui/icons-material/Close'
import { Participant } from 'livekit-client'
import { PeopleSidebarProps } from './PeopleSidebar.type'
import { useFilteredParticipants } from '../../hooks/usePeopleSidebar'
import { useProfiles } from '../../hooks/useProfiles'
import { useTranslation } from '../../modules/translation'
import { getDisplayName } from '../../utils/displayName'
import { Avatar } from '../Avatar/Avatar'
import {
  CloseButton,
  Divider,
  EmptyState,
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
  const { t } = useTranslation()
  const { localParticipant } = useLocalParticipant()
  const remoteParticipants = useRemoteParticipants()

  const allParticipants = useMemo(() => {
    return localParticipant ? [localParticipant, ...remoteParticipants] : remoteParticipants
  }, [localParticipant, remoteParticipants])

  const { streamers, watchers } = useFilteredParticipants(allParticipants)

  // Extract addresses from participants
  const addresses = useMemo(() => {
    const addressSet = new Set<string>()
    allParticipants.forEach(p => {
      try {
        const metadata = p.metadata ? JSON.parse(p.metadata) : null
        if (metadata?.address) {
          addressSet.add(metadata.address)
        }
      } catch {
        // Ignore parse errors
      }
    })
    return Array.from(addressSet)
  }, [allParticipants])

  // Get profiles for all participants
  const { profiles } = useProfiles(addresses)

  const getParticipantProfile = useCallback(
    (participant: Participant) => {
      let address: string | undefined
      let profile = null

      try {
        const metadata = participant.metadata ? JSON.parse(participant.metadata) : null
        address = metadata?.address
        if (address) {
          profile = profiles.get(address.toLowerCase())
        }
      } catch {
        // Ignore parse errors
      }

      const isLocalUser = localParticipant?.sid === participant.sid
      let displayName: string

      if (isLocalUser) {
        displayName = t('live_counter.you').toUpperCase()
      } else {
        displayName = profile?.hasClaimedName && profile?.name ? profile.name : getDisplayName(participant)
      }
      return { displayName, address, profile }
    },
    [localParticipant, profiles, t]
  )

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
              streamers.map(participant => {
                const { address, profile, displayName } = getParticipantProfile(participant)

                return (
                  <ParticipantItem key={participant.sid}>
                    <Avatar profile={profile} address={address} size={40} />
                    <ParticipantInfo>
                      <ParticipantName>{displayName}</ParticipantName>
                      <ParticipantStatus $isStreaming={true}>Streaming</ParticipantStatus>
                    </ParticipantInfo>
                  </ParticipantItem>
                )
              })
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
              watchers.slice(0, 20).map(participant => {
                const { address, profile, displayName } = getParticipantProfile(participant)

                return (
                  <ParticipantItem key={participant.sid}>
                    <Avatar profile={profile} address={address} size={40} />
                    <ParticipantInfo>
                      <ParticipantName>{displayName}</ParticipantName>
                      <ParticipantStatus>Watching</ParticipantStatus>
                    </ParticipantInfo>
                  </ParticipantItem>
                )
              })
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
