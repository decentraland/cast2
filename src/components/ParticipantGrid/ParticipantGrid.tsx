// React 18 JSX Transform - no need to import React
import { TrackReferenceOrPlaceholder, VideoTrack, useTracks } from '@livekit/components-react'
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import { Track } from 'livekit-client'
import { NoParticipants, NoParticipantsIcon, ParticipantGridContainer, ParticipantTileContainer } from './ParticipantGrid.styled'

interface ParticipantGridProps {
  localParticipantVisible?: boolean
}

export function ParticipantGrid({ localParticipantVisible = true }: ParticipantGridProps) {
  // Get all video tracks (camera and screen share)
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false }
    ],
    { onlySubscribed: false }
  )

  // Filter tracks based on localParticipantVisible setting
  const filteredTracks = localParticipantVisible ? tracks : tracks.filter(track => !track.participant.isLocal)

  // Also filter placeholder tracks for better display
  const finalTracks = filteredTracks.filter((track: TrackReferenceOrPlaceholder) => track.publication !== undefined)

  if (finalTracks.length === 0) {
    return (
      <ParticipantGridContainer>
        <NoParticipants>
          <NoParticipantsIcon>
            <VideocamOffIcon sx={{ fontSize: '48px' }} />
          </NoParticipantsIcon>
          <div>{localParticipantVisible ? 'No video streams' : 'Waiting for participants...'}</div>
        </NoParticipants>
      </ParticipantGridContainer>
    )
  }

  return (
    <ParticipantGridContainer>
      {finalTracks.map((track, index) => (
        <ParticipantTileContainer key={`${track.participant.identity}-${track.source}-${index}`}>
          <VideoTrack trackRef={track} />
          <div className="participant-info">
            <span className="participant-name">{track.participant.name || track.participant.identity}</span>
          </div>
        </ParticipantTileContainer>
      ))}
    </ParticipantGridContainer>
  )
}
