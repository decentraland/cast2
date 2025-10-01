// React 18 JSX Transform - React import not needed
import { useRemoteParticipants } from '@livekit/components-react'
import { EmptyStreamState } from '../LiveKitEnhancements/EmptyStreamState'
import { ParticipantGrid } from '../ParticipantGrid/ParticipantGrid'
import { WatcherStatusOverlay } from './WatcherStatusOverlay'

export function WatcherViewContent() {
  const remoteParticipants = useRemoteParticipants()
  const hasActiveStreams = remoteParticipants.length > 0

  if (!hasActiveStreams) {
    return <EmptyStreamState type="watcher" />
  }

  return (
    <>
      <ParticipantGrid localParticipantVisible={false} />
      <WatcherStatusOverlay />
    </>
  )
}
