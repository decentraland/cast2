import { useConnectionState, useLocalParticipant } from '@livekit/components-react'
import { ConnectionState } from 'livekit-client'
import { useLocalVideoTracks } from '../../hooks/useLocalVideoTracks'
import { useTranslation } from '../../modules/translation'
import { EmptyStreamState } from '../LiveKitEnhancements/EmptyStreamState'
import { LiveStreamCounter } from '../LiveStreamCounter/LiveStreamCounter'
import { ParticipantGrid } from '../ParticipantGrid/ParticipantGrid'
import { ContentWrapper } from './StreamerViewContent.styled'

export function StreamerViewContent() {
  const { t } = useTranslation()
  const { localParticipant } = useLocalParticipant()
  const connectionState = useConnectionState()
  const { hasLocalCamera, hasLocalScreenShare } = useLocalVideoTracks()

  const isDisconnected = connectionState === ConnectionState.Disconnected
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
      <LiveStreamCounter />
      {hasAnyVideo ? (
        <ParticipantGrid localParticipantVisible={true} />
      ) : (
        <EmptyStreamState
          type="streamer"
          message={t('empty_state.streamer_action')}
          participantName={localParticipant?.identity}
          participant={localParticipant}
        />
      )}
    </ContentWrapper>
  )
}
