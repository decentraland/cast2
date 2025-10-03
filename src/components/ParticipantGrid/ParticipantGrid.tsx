import { useCallback, useMemo, useState } from 'react'
import { TrackReferenceOrPlaceholder, VideoTrack, useIsSpeaking, useTracks } from '@livekit/components-react'
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import { Track } from 'livekit-client'
import { useTranslation } from '../../modules/translation'
import { SpeakingIndicator } from '../LiveKitEnhancements/SpeakingIndicator'
import { ParticipantGridProps } from './ParticipantGrid.types'
import {
  FloatingVideoContainer,
  FloatingVideoName,
  NoParticipants,
  NoParticipantsIcon,
  ParticipantGridContainer,
  ParticipantName,
  ParticipantTileContainer,
  SpeakingIndicatorWrapper,
  ThumbnailGrid,
  ThumbnailItem,
  ThumbnailName
} from './ParticipantGrid.styled'

function ParticipantGrid({ localParticipantVisible = true }: ParticipantGridProps) {
  const { t } = useTranslation()
  const [expandedTrackSid, setExpandedTrackSid] = useState<string | null>(null)

  const videoTracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare], {
    updateOnlyOn: []
  })

  const filteredTracks = useMemo(
    () =>
      localParticipantVisible
        ? videoTracks
        : videoTracks.filter((track: TrackReferenceOrPlaceholder) => track.participant.isLocal === false),
    [localParticipantVisible, videoTracks]
  )

  const finalTracks = useMemo(
    () => filteredTracks.filter((track: TrackReferenceOrPlaceholder) => track.publication !== undefined),
    [filteredTracks]
  )

  const participantCount = finalTracks.length
  const isFullscreen = participantCount === 1
  const hasMultipleParticipants = participantCount >= 2

  const handleTileClick = useCallback(
    (trackSid: string) => {
      if (!hasMultipleParticipants) return

      if (expandedTrackSid === trackSid) {
        setExpandedTrackSid(null)
      } else {
        setExpandedTrackSid(trackSid)
      }
    },
    [hasMultipleParticipants, expandedTrackSid]
  )

  if (finalTracks.length === 0) {
    return (
      <ParticipantGridContainer $participantCount={0} $expandedView={false}>
        <NoParticipants>
          <NoParticipantsIcon>
            <VideocamOffIcon />
          </NoParticipantsIcon>
          <div>{localParticipantVisible ? t('empty_state.no_video_streams') : t('empty_state.waiting_participants')}</div>
        </NoParticipants>
      </ParticipantGridContainer>
    )
  }

  // When there are multiple participants and one is expanded
  if (hasMultipleParticipants && expandedTrackSid) {
    const expandedTrack = finalTracks.find(t => t.participant.sid + t.source === expandedTrackSid)
    const otherTracks = finalTracks.filter(t => t.participant.sid + t.source !== expandedTrackSid)

    return (
      <ParticipantGridContainer $participantCount={participantCount} $expandedView={true}>
        {expandedTrack && (
          <ParticipantTile
            trackRef={expandedTrack}
            isFullscreen={true}
            onClick={() => handleTileClick(expandedTrack.participant.sid + expandedTrack.source)}
          />
        )}
        {/* Show other tracks in thumbnail grid */}
        {otherTracks.length === 1 ? (
          // Single floating video
          <FloatingVideoContainer onClick={() => handleTileClick(otherTracks[0].participant.sid + otherTracks[0].source)}>
            <VideoTrack trackRef={otherTracks[0]} />
            <FloatingVideoName>{otherTracks[0].participant.identity}</FloatingVideoName>
          </FloatingVideoContainer>
        ) : (
          // Multiple thumbnails in grid
          <ThumbnailGrid $count={otherTracks.length}>
            {otherTracks.map(trackRef => (
              <ThumbnailItem
                key={trackRef.participant.sid + trackRef.source}
                onClick={() => handleTileClick(trackRef.participant.sid + trackRef.source)}
              >
                <VideoTrack trackRef={trackRef} />
                <ThumbnailName>{trackRef.participant.identity}</ThumbnailName>
              </ThumbnailItem>
            ))}
          </ThumbnailGrid>
        )}
      </ParticipantGridContainer>
    )
  }

  return (
    <ParticipantGridContainer $participantCount={participantCount} $expandedView={false}>
      {finalTracks.map(trackRef => (
        <ParticipantTile
          key={trackRef.participant.sid + trackRef.source}
          trackRef={trackRef}
          isFullscreen={isFullscreen}
          onClick={hasMultipleParticipants ? () => handleTileClick(trackRef.participant.sid + trackRef.source) : undefined}
        />
      ))}
    </ParticipantGridContainer>
  )
}

function ParticipantTile({
  trackRef,
  isFullscreen = false,
  onClick
}: {
  trackRef: TrackReferenceOrPlaceholder
  isFullscreen?: boolean
  onClick?: () => void
}) {
  const participant = trackRef.participant
  const isSpeaking = useIsSpeaking(participant)

  // Get audio track for speaking indicator
  const audioTrackRefs = useTracks([Track.Source.Microphone], {
    updateOnlyOn: [],
    onlySubscribed: false
  })
  const participantAudioTrack = audioTrackRefs.find(track => track.participant.identity === participant.identity)

  // Only render if publication exists
  if (!trackRef.publication) {
    return null
  }

  return (
    <ParticipantTileContainer $isSpeaking={isSpeaking} $isFullscreen={isFullscreen} onClick={onClick} $clickable={!!onClick}>
      <VideoTrack trackRef={trackRef} />
      <SpeakingIndicatorWrapper>
        <SpeakingIndicator participant={participant} trackRef={participantAudioTrack} />
      </SpeakingIndicatorWrapper>
      <ParticipantName>{participant.identity}</ParticipantName>
    </ParticipantTileContainer>
  )
}

export { ParticipantGrid }
