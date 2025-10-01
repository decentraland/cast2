import { useConnectionState, useLocalParticipant } from '@livekit/components-react'
import { ConnectionState, Track } from 'livekit-client'
import { useTranslation } from '../../modules/translation'
import { EmptyStreamState } from '../LiveKitEnhancements/EmptyStreamState'
import { ParticipantGrid } from '../ParticipantGrid/ParticipantGrid'
import { EmptyStateWrapper } from './StreamerViewContent.styled'

export function StreamerViewContent() {
  const { t } = useTranslation()
  const { localParticipant } = useLocalParticipant()
  const connectionState = useConnectionState()

  // Check if disconnected
  const isDisconnected = connectionState === ConnectionState.Disconnected

  // Check if there are any active video tracks (camera or screen share) from the LOCAL participant
  const hasLocalVideo = localParticipant?.videoTrackPublications.size > 0
  const hasLocalScreenShare = Array.from(localParticipant?.videoTrackPublications.values() || []).some(
    pub => pub.source === Track.Source.ScreenShare && pub.track
  )

  // For streamer, we only care if THEY are sharing something, not if there are viewers
  const hasAnyVideo = hasLocalVideo || hasLocalScreenShare

  // If disconnected, show reconnection message
  if (isDisconnected) {
    return (
      <EmptyStateWrapper>
        <EmptyStreamState type="streamer" message={t('empty_state.streamer_disconnected')} />
      </EmptyStateWrapper>
    )
  }

  if (!hasAnyVideo) {
    return (
      <EmptyStateWrapper>
        <EmptyStreamState type="streamer" message={t('empty_state.streamer_action')} />
      </EmptyStateWrapper>
    )
  }

  return <ParticipantGrid localParticipantVisible={true} />
}
