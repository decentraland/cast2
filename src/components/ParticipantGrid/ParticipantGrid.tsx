import { TrackReferenceOrPlaceholder, VideoTrack, useIsSpeaking, useTracks } from '@livekit/components-react'
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import { Track } from 'livekit-client'
import { useTranslation } from '../../modules/translation'
import { SpeakingIndicator } from '../LiveKitEnhancements/SpeakingIndicator'
import {
  NoParticipants,
  NoParticipantsIcon,
  ParticipantGridContainer,
  ParticipantTileContainer,
  SpeakingIndicatorWrapper
} from './ParticipantGrid.styled'

interface ParticipantGridProps {
  localParticipantVisible?: boolean
}

function ParticipantGrid({ localParticipantVisible = true }: ParticipantGridProps) {
  const { t } = useTranslation()
  // Get video and screen share tracks
  const videoTracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare], {
    updateOnlyOn: []
  })

  // Filter out tracks based on whether local participant should be visible
  const filteredTracks = localParticipantVisible
    ? videoTracks
    : videoTracks.filter((track: TrackReferenceOrPlaceholder) => track.participant.isLocal === false)

  // Only show tracks that have actual publications
  const finalTracks = filteredTracks.filter((track: TrackReferenceOrPlaceholder) => track.publication !== undefined)

  if (finalTracks.length === 0) {
    return (
      <ParticipantGridContainer>
        <NoParticipants>
          <NoParticipantsIcon>
            <VideocamOffIcon sx={{ fontSize: '48px' }} />
          </NoParticipantsIcon>
          <div>{localParticipantVisible ? t('empty_state.no_video_streams') : t('empty_state.waiting_participants')}</div>
        </NoParticipants>
      </ParticipantGridContainer>
    )
  }

  return (
    <ParticipantGridContainer>
      {finalTracks.map(trackRef => (
        <ParticipantTile key={trackRef.participant.sid + trackRef.source} trackRef={trackRef} />
      ))}
    </ParticipantGridContainer>
  )
}

function ParticipantTile({ trackRef }: { trackRef: TrackReferenceOrPlaceholder }) {
  const participant = trackRef.participant
  const isSpeaking = useIsSpeaking(participant)

  // Only render if publication exists
  if (!trackRef.publication) {
    return null
  }

  return (
    <ParticipantTileContainer isSpeaking={isSpeaking}>
      <VideoTrack trackRef={trackRef} />
      <SpeakingIndicatorWrapper>
        <SpeakingIndicator participant={participant} />
      </SpeakingIndicatorWrapper>
    </ParticipantTileContainer>
  )
}

export { ParticipantGrid }
