import styled from '@emotion/styled'
import { Card, Typography } from 'decentraland-ui2'

const StatsContainer = styled(Card)`
  && {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: white;
    padding: 16px;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 280px;
  }
`

const StatsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`

const StatsTitle = styled(Typography)`
  && {
    color: white !important;
    font-weight: 600;
    font-size: 1rem;
    display: flex;
    align-items: center;
    gap: 6px;
  }
`

const StatsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const StatItem = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  min-height: 52px;
  text-align: left;
  gap: 12px;
`

const StatLabel = styled(Typography)`
  && {
    color: rgba(255, 255, 255, 0.75) !important;
    font-size: 0.75rem;
    font-weight: 500;
    margin: 0;
    line-height: 1.2;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`

const StatValue = styled(Typography)`
  && {
    color: white !important;
    font-weight: bold;
    font-size: 1.1rem;
    margin: 0;
    line-height: 1;
  }
`

const ConnectionQuality = styled.div<{ quality: string }>`
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${({ quality }) => {
      switch (quality) {
        case 'excellent':
          return '#00d563'
        case 'good':
          return '#50e3c2'
        case 'poor':
          return '#ff9500'
        case 'unknown':
        default:
          return '#666'
      }
    }};
    animation: ${({ quality }) => (quality !== 'unknown' ? 'pulse 2s infinite' : 'none')};
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`

const StatusWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    color: rgba(255, 255, 255, 0.9);
  }
`

const SmallStatValue = styled(Typography)`
  && {
    color: white;
    font-weight: bold;
    font-size: 0.9rem;
    margin: 0;
    line-height: 1;
  }
`

const FullWidthStatItem = styled(StatItem)`
  grid-column: span 2;
`

export {
  StatItem,
  StatusWrapper,
  StatLabel,
  StatValue,
  SmallStatValue,
  StatsContainer,
  StatsHeader,
  StatsTitle,
  StatsList,
  ConnectionQuality,
  FullWidthStatItem
}
