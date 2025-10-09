import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import { useTranslation } from '../../modules/translation'
import { CounterContainer, LivePill } from './LiveStreamCounter.styled'

export function LiveStreamCounter() {
  const { t } = useTranslation()

  return (
    <CounterContainer>
      <LivePill>
        <FiberManualRecordIcon />
        {t('live_counter.live')}
      </LivePill>
    </CounterContainer>
  )
}
