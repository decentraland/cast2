import { useMemo } from 'react'
import { useLocalParticipant } from '@livekit/components-react'
import { Track } from 'livekit-client'

export function useLocalVideoTracks() {
  const { localParticipant } = useLocalParticipant()

  const hasLocalCamera = useMemo(() => {
    return Array.from(localParticipant?.videoTrackPublications.values() || []).some(
      pub => pub.source === Track.Source.Camera && pub.track && !pub.isMuted
    )
  }, [localParticipant])

  const hasLocalScreenShare = useMemo(() => {
    return Array.from(localParticipant?.videoTrackPublications.values() || []).some(
      pub => pub.source === Track.Source.ScreenShare && pub.track && !pub.isMuted
    )
  }, [localParticipant])

  return { hasLocalCamera, hasLocalScreenShare }
}
