import { useState } from 'react'
import { useLocalParticipant, useRemoteParticipants } from '@livekit/components-react'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import { useTranslation } from '../../modules/translation'
import {
  CounterContainer,
  CounterMainContainer,
  ExpandIcon,
  LiveDot,
  LivePill,
  ParticipantDropdown,
  ParticipantItem,
  ParticipantName,
  ParticipantText
} from './LiveStreamCounter.styled'

export function LiveStreamCounter() {
  const { t } = useTranslation()
  const { localParticipant } = useLocalParticipant()
  const remoteParticipants = useRemoteParticipants()
  const [expanded, setExpanded] = useState(false)

  // Get all participants (local + remote)
  const allParticipants = localParticipant ? [localParticipant, ...remoteParticipants] : remoteParticipants

  // Filter participants with role 'streamer'
  const streamers = allParticipants.filter(participant => {
    const metadata = participant.metadata ? JSON.parse(participant.metadata) : {}
    return metadata.role === 'streamer'
  })

  const streamingCount = streamers.length

  if (streamingCount === 0) return null

  const participantText =
    streamingCount === 1 ? `1 ${t('live_counter.participant_streaming')}` : `${streamingCount} ${t('live_counter.participants_streaming')}`

  return (
    <CounterContainer>
      <CounterMainContainer onClick={() => setExpanded(!expanded)} $expanded={expanded}>
        <LivePill>
          <FiberManualRecordIcon />
          {t('live_counter.live')}
        </LivePill>
        <ParticipantText>{participantText}</ParticipantText>
        <ExpandIcon $expanded={expanded}>
          <ExpandMoreIcon />
        </ExpandIcon>
      </CounterMainContainer>

      {expanded && (
        <ParticipantDropdown>
          {streamers.map(participant => (
            <ParticipantItem key={participant.sid}>
              <LiveDot $small>
                <FiberManualRecordIcon />
              </LiveDot>
              <ParticipantName>
                {participant.identity}
                {participant.sid === localParticipant?.sid && ` (${t('live_counter.you')})`}
              </ParticipantName>
            </ParticipantItem>
          ))}
        </ParticipantDropdown>
      )}
    </CounterContainer>
  )
}
