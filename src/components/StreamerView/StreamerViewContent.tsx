import { useConnectionState, useLocalParticipant } from '@livekit/components-react'
import { ConnectionState, Track } from 'livekit-client'
import { useTranslation } from '../../modules/translation'
import { EmptyStreamState } from '../LiveKitEnhancements/EmptyStreamState'
import { LiveStreamCounter } from '../LiveStreamCounter/LiveStreamCounter'
import { ParticipantGrid } from '../ParticipantGrid/ParticipantGrid'
import { ContentWrapper } from './StreamerViewContent.styled'

export function StreamerViewContent() {
  const { t } = useTranslation()
  const { localParticipant } = useLocalParticipant()
  const connectionState = useConnectionState()

  // Check if disconnected
  const isDisconnected = connectionState === ConnectionState.Disconnected

  // Check if there are any active video tracks (camera or screen share) from the LOCAL participant
  const hasLocalCamera = Array.from(localParticipant?.videoTrackPublications.values() || []).some(
    pub => pub.source === Track.Source.Camera && pub.track && !pub.isMuted
  )
  const hasLocalScreenShare = Array.from(localParticipant?.videoTrackPublications.values() || []).some(
    pub => pub.source === Track.Source.ScreenShare && pub.track && !pub.isMuted
  )

  // For streamer, we only care if THEY are sharing something
  const hasAnyVideo = hasLocalCamera || hasLocalScreenShare

  // If disconnected, show reconnection message
  if (isDisconnected) {
    return (
      <ContentWrapper>
        <EmptyStreamState type="watcher" message={t('empty_state.streamer_disconnected')} />
      </ContentWrapper>
    )
  }

  // Always show the LiveStreamCounter when connected as streamer
  return (
    <ContentWrapper>
      <LiveStreamCounter isStreamer={true} />
      {hasAnyVideo ? (
        <ParticipantGrid localParticipantVisible={true} />
      ) : (
        <EmptyStreamState type="streamer" message={t('empty_state.streamer_action')} participantName={localParticipant?.identity} />
      )}
    </ContentWrapper>
  )
}
