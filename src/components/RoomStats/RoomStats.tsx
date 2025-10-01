import { useConnectionState, useLocalParticipant, useRemoteParticipants } from '@livekit/components-react'
import BarChartIcon from '@mui/icons-material/BarChart'
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt'
import VideocamIcon from '@mui/icons-material/Videocam'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { ConnectionState } from 'livekit-client'
import {
  ConnectionQuality,
  FullWidthStatItem,
  SmallStatValue,
  StatItem,
  StatLabel,
  StatValue,
  StatsContainer,
  StatsHeader,
  StatsList,
  StatsTitle,
  StatusWrapper
} from './RoomStats.styled'

interface RoomStatsProps {
  isStreamer?: boolean
}

export function RoomStats({ isStreamer = false }: RoomStatsProps) {
  const connectionState = useConnectionState()
  const { localParticipant } = useLocalParticipant()
  const remoteParticipants = useRemoteParticipants()

  // For streamers: show viewers (remote participants only)
  // For watchers: show viewers including themselves
  const viewerCount = isStreamer ? remoteParticipants.length : remoteParticipants.length + 1
  const connectionQuality = localParticipant?.connectionQuality || 'unknown'

  const getConnectionString = (state: ConnectionState) => {
    switch (state) {
      case ConnectionState.Connected:
        return 'Connected'
      case ConnectionState.Connecting:
        return 'Connecting...'
      case ConnectionState.Disconnected:
        return 'Disconnected'
      case ConnectionState.Reconnecting:
        return 'Reconnecting...'
      default:
        return 'Unknown'
    }
  }

  return (
    <StatsContainer>
      <StatsHeader>
        <StatsTitle variant="h6">
          <BarChartIcon fontSize="small" />
          Stats
        </StatsTitle>
      </StatsHeader>

      <StatsList>
        <StatItem>
          <StatusWrapper>
            <VisibilityIcon fontSize="small" />
            <StatLabel>Viewers</StatLabel>
          </StatusWrapper>
          <StatValue>{viewerCount}</StatValue>
        </StatItem>

        <StatItem>
          <StatusWrapper>
            <VideocamIcon fontSize="small" />
            <StatLabel>Streams</StatLabel>
          </StatusWrapper>
          <StatValue>{isStreamer ? 1 : remoteParticipants.length}</StatValue>
        </StatItem>

        <FullWidthStatItem>
          <StatusWrapper>
            <SignalCellularAltIcon fontSize="small" />
            <StatLabel>Status</StatLabel>
          </StatusWrapper>
          <StatusWrapper>
            <ConnectionQuality quality={connectionQuality} />
            <SmallStatValue>{getConnectionString(connectionState)}</SmallStatValue>
          </StatusWrapper>
        </FullWidthStatItem>
      </StatsList>
    </StatsContainer>
  )
}
