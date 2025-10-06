import { Card, Typography, keyframes, styled } from 'decentraland-ui2'

const pulse = keyframes({
  '0%, 100%': {
    opacity: 1
  },
  '50%': {
    opacity: 0.5
  }
})

const StatsContainer = styled(Card)(() => ({
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  color: 'white',
  padding: 16,
  borderRadius: 12,
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  minHeight: 280
}))

const StatsHeader = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 4,
  paddingBottom: 8,
  borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
})

const StatsTitle = styled(Typography)(() => ({
  color: 'white',
  fontWeight: 600,
  fontSize: '1rem',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  textTransform: 'none'
}))

const StatsList = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: 8
})

const StatItem = styled('div')({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 12px',
  background: 'rgba(255, 255, 255, 0.08)',
  borderRadius: 8,
  border: '1px solid rgba(255, 255, 255, 0.12)',
  minHeight: 52,
  textAlign: 'left',
  gap: 12
})

const StatLabel = styled(Typography)(() => ({
  color: 'rgba(255, 255, 255, 0.75)',
  fontSize: '0.75rem',
  fontWeight: 500,
  margin: 0,
  lineHeight: 1.2,
  textTransform: 'uppercase',
  letterSpacing: 0.5
}))

const StatValue = styled(Typography)(() => ({
  color: 'white',
  fontWeight: 'bold',
  fontSize: '1.1rem',
  margin: 0,
  lineHeight: 1
}))

const ConnectionQuality = styled('div')<{ quality: string }>(({ quality }) => {
  let bgColor = '#666'
  switch (quality) {
    case 'excellent':
      bgColor = '#00d563'
      break
    case 'good':
      bgColor = '#50e3c2'
      break
    case 'poor':
      bgColor = '#ff9500'
      break
    default:
      bgColor = '#666'
      break
  }

  return {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    '&::before': {
      content: '""',
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: bgColor,
      animation: quality !== 'unknown' ? `${pulse} 2s infinite` : 'none'
    }
  }
})

const StatusWrapper = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  '& svg': {
    color: 'rgba(255, 255, 255, 0.9)'
  }
})

const SmallStatValue = styled(Typography)(() => ({
  color: 'white',
  fontWeight: 'bold',
  fontSize: '0.9rem',
  margin: 0,
  lineHeight: 1
}))

const FullWidthStatItem = styled(StatItem)({
  gridColumn: 'span 2'
})

export {
  ConnectionQuality,
  FullWidthStatItem,
  SmallStatValue,
  StatItem,
  StatLabel,
  StatsList,
  StatsContainer,
  StatsHeader,
  StatsTitle,
  StatValue,
  StatusWrapper
}
