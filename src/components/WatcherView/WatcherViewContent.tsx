import { useRemoteParticipants } from '@livekit/components-react'
import { useTranslation } from '../../modules/translation'
import { EmptyStreamState } from '../LiveKitEnhancements/EmptyStreamState'
import { ParticipantGrid } from '../ParticipantGrid/ParticipantGrid'
import { WatcherStatusOverlay } from './WatcherStatusOverlay'
import { EmptyStateWrapper } from './WatcherViewContent.styled'

export function WatcherViewContent() {
  const { t } = useTranslation()
  const remoteParticipants = useRemoteParticipants()
  const hasActiveStreams = remoteParticipants.some(p => p.videoTrackPublications.size > 0)

  if (!hasActiveStreams) {
    return (
      <EmptyStateWrapper>
        <EmptyStreamState type="watcher" message={t('empty_state.watcher_message')} />
      </EmptyStateWrapper>
    )
  }

  return (
    <>
      <ParticipantGrid localParticipantVisible={false} />
      <WatcherStatusOverlay />
    </>
  )
}
