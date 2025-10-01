import { useLocalParticipant, useRemoteParticipants } from '@livekit/components-react'
import { Track } from 'livekit-client'
import { EmptyStreamState } from '../LiveKitEnhancements/EmptyStreamState'
import { ParticipantGrid } from '../ParticipantGrid/ParticipantGrid'
import { EmptyStateWrapper } from './StreamerViewContent.styled'

export function StreamerViewContent() {
  const { localParticipant } = useLocalParticipant()
  const remoteParticipants = useRemoteParticipants()

  // Check if there are any active video tracks (camera or screen share)
  const hasLocalVideo = localParticipant?.videoTrackPublications.size > 0
  const hasLocalScreenShare = Array.from(localParticipant?.videoTrackPublications.values() || []).some(
    pub => pub.source === Track.Source.ScreenShare && pub.track
  )
  const hasRemoteStreams = remoteParticipants.length > 0

  const hasAnyVideo = hasLocalVideo || hasLocalScreenShare || hasRemoteStreams

  if (!hasAnyVideo) {
    return (
      <EmptyStateWrapper>
        <EmptyStreamState type="streamer" message="Start sharing by clicking Camera or Share Screen below" />
      </EmptyStateWrapper>
    )
  }

  return <ParticipantGrid localParticipantVisible={true} />
}
