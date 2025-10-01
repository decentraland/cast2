import { Card, Typography } from 'decentraland-ui2'
import styled from '@emotion/styled'

const StatsContainer = styled(Card)`
  && {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: white;
    padding: 12px;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: 200px; /* Increased height for better visibility */
  }
`

const StatsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`

const StatsTitle = styled(Typography)`
  && {
    color: white;
    font-weight: 600;
    font-size: 0.95rem;
    display: flex;
    align-items: center;
    gap: 6px;
  }
`

const StatsList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
`

const StatItem = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  min-height: 48px;
  text-align: left;
  gap: 8px;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`

const StatLabel = styled(Typography)`
  && {
    color: rgba(255, 255, 255, 0.65);
    font-size: 0.7rem;
    font-weight: 500;
    margin: 0;
    line-height: 1.2;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`

const StatValue = styled(Typography)`
  && {
    color: white;
    font-weight: bold;
    font-size: 1.3rem;
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
  gap: 6px;
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
