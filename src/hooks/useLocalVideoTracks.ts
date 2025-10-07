import { useMemo } from 'react'
import { useTracks } from '@livekit/components-react'
import { Track } from 'livekit-client'

export function useLocalVideoTracks() {
  // Use LiveKit's useTracks hook which already handles polling and events efficiently
  const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare], {
    updateOnlyOn: [],
    onlySubscribed: false
  })

  const { hasLocalCamera, hasLocalScreenShare } = useMemo(() => {
    // Filter for local participant tracks only
    const localTracks = tracks.filter(trackRef => trackRef.participant.isLocal)

    const hasCamera = localTracks.some(
      trackRef => trackRef.source === Track.Source.Camera && trackRef.publication !== undefined && !trackRef.publication.isMuted
    )

    const hasScreen = localTracks.some(
      trackRef => trackRef.source === Track.Source.ScreenShare && trackRef.publication !== undefined && !trackRef.publication.isMuted
    )

    return { hasLocalCamera: hasCamera, hasLocalScreenShare: hasScreen }
  }, [tracks])

  return { hasLocalCamera, hasLocalScreenShare }
}
