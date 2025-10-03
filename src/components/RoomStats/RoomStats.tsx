import { useConnectionState, useLocalParticipant, useRemoteParticipants } from '@livekit/components-react'
import PeopleIcon from '@mui/icons-material/People'
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt'
import WifiIcon from '@mui/icons-material/Wifi'
import { ConnectionQuality, ConnectionState } from 'livekit-client'
import { useTranslation } from '../../modules/translation'
import { RoomStatsProps } from './RoomStats.types'
import { StatItem, StatLabel, StatValue, StatsContainer, StatsHeader, StatsList, StatsTitle, StatusWrapper } from './RoomStats.styled'

export function RoomStats({ isStreamer }: RoomStatsProps) {
  const { t } = useTranslation()
  const connectionState = useConnectionState()
  const { localParticipant } = useLocalParticipant()
  const remoteParticipants = useRemoteParticipants()

  // For streamer: only count viewers (remote participants)
  // For viewer: only count viewers (remote participants, excluding the viewer themselves)
  const totalParticipants = remoteParticipants.length
  const connectionQuality = localParticipant?.connectionQuality || 'unknown'

  const getConnectionString = (state: ConnectionState) => {
    switch (state) {
      case ConnectionState.Connected:
        return t('room_stats.connected')
      case ConnectionState.Connecting:
      case ConnectionState.Reconnecting:
        return t('room_stats.connecting')
      case ConnectionState.Disconnected:
        return t('room_stats.disconnected')
      default:
        return t('room_stats.unknown')
    }
  }

  const getQualityString = (quality: ConnectionQuality | 'unknown'): string => {
    switch (quality) {
      case ConnectionQuality.Excellent:
        return t('room_stats.excellent')
      case ConnectionQuality.Good:
        return t('room_stats.good')
      case ConnectionQuality.Poor:
        return t('room_stats.poor')
      default:
        return t('room_stats.unknown')
    }
  }

  return (
    <StatsContainer>
      <StatsHeader>
        <StatsTitle>{t('room_stats.title')}</StatsTitle>
      </StatsHeader>
      <StatsList>
        <StatItem>
          <StatusWrapper>
            <PeopleIcon fontSize="small" />
            <StatLabel>{isStreamer ? t('room_stats.people') : t('room_stats.viewers')}</StatLabel>
          </StatusWrapper>
          <StatValue>{totalParticipants}</StatValue>
        </StatItem>

        <StatItem>
          <StatusWrapper>
            <WifiIcon fontSize="small" />
            <StatLabel>{t('room_stats.connection')}</StatLabel>
          </StatusWrapper>
          <StatValue>{getConnectionString(connectionState)}</StatValue>
        </StatItem>

        <StatItem>
          <StatusWrapper>
            <SignalCellularAltIcon fontSize="small" />
            <StatLabel>{t('room_stats.quality')}</StatLabel>
          </StatusWrapper>
          <StatValue>{getQualityString(connectionQuality)}</StatValue>
        </StatItem>
      </StatsList>
    </StatsContainer>
  )
}
