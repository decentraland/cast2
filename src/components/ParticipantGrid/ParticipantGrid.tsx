import { useCallback, useMemo, useState } from 'react'
import { TrackReferenceOrPlaceholder, VideoTrack, useIsSpeaking, useTracks } from '@livekit/components-react'
import MicOffIcon from '@mui/icons-material/MicOff'
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import { Track } from 'livekit-client'
import avatarImage from '../../assets/images/avatar.png'
import { useTranslation } from '../../modules/translation'
import { getDisplayName } from '../../utils/displayName'
import { SpeakingIndicator } from '../LiveKitEnhancements/SpeakingIndicator'
import { ParticipantGridProps } from './ParticipantGrid.types'
import {
  AvatarFallback,
  FloatingVideoContainer,
  LoadingSpinner,
  LoadingText,
  MutedIndicator,
  NoParticipants,
  NoParticipantsIcon,
  OverflowAvatarStack,
  OverflowCard,
  OverflowCount,
  ParticipantGridContainer,
  ParticipantName,
  ParticipantTileContainer,
  SpeakingIndicatorWrapper,
  ThumbnailGrid,
  ThumbnailItem,
  ThumbnailOverflowCard
} from './ParticipantGrid.styled'

const MAX_VISIBLE_PARTICIPANTS = 9
const MAX_THUMBNAILS = 1

function ParticipantGrid({ localParticipantVisible = true }: ParticipantGridProps) {
  const { t } = useTranslation()
  const [expandedTrackSid, setExpandedTrackSid] = useState<string | null>(null)
  const [showAllParticipants, setShowAllParticipants] = useState(false)

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
  const hasOverflow = participantCount > MAX_VISIBLE_PARTICIPANTS && !showAllParticipants

  // Determine which tracks to display
  const displayTracks = useMemo(() => {
    if (!hasOverflow) return finalTracks
    return finalTracks.slice(0, MAX_VISIBLE_PARTICIPANTS - 1)
  }, [hasOverflow, finalTracks])

  const overflowCount = finalTracks.length - displayTracks.length

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

  const handleShowAll = useCallback(() => {
    setShowAllParticipants(true)
  }, [])

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

    // Check if we have more thumbnails than MAX_THUMBNAILS
    // Only show overflow card if there are at least 2 more participants (+2 minimum)
    const hasEnoughForOverflow = otherTracks.length > MAX_THUMBNAILS + 1
    const hasThumbnailOverflow = hasEnoughForOverflow
    const visibleThumbnails = hasThumbnailOverflow ? otherTracks.slice(0, MAX_THUMBNAILS) : otherTracks
    const thumbnailOverflowCount = otherTracks.length - visibleThumbnails.length

    return (
      <ParticipantGridContainer $participantCount={participantCount} $expandedView={true}>
        {expandedTrack && (
          <ParticipantTile
            trackRef={expandedTrack}
            isFullscreen={true}
            onClick={() => handleTileClick(expandedTrack.participant.sid + expandedTrack.source)}
          />
        )}
        {/* Show other tracks in vertical thumbnail grid */}
        {otherTracks.length === 1 ? (
          // Single floating video
          <FloatingVideoContainer>
            <ParticipantTile
              trackRef={otherTracks[0]}
              isFullscreen={false}
              onClick={() => handleTileClick(otherTracks[0].participant.sid + otherTracks[0].source)}
            />
          </FloatingVideoContainer>
        ) : (
          // Multiple thumbnails in vertical grid
          <ThumbnailGrid>
            {visibleThumbnails.map(trackRef => (
              <ThumbnailItem key={trackRef.participant.sid + trackRef.source}>
                <ParticipantTile
                  trackRef={trackRef}
                  isFullscreen={false}
                  onClick={() => handleTileClick(trackRef.participant.sid + trackRef.source)}
                />
              </ThumbnailItem>
            ))}
            {hasThumbnailOverflow && (
              <ThumbnailOverflowCard onClick={handleShowAll}>
                <OverflowAvatarStack>
                  <img src={avatarImage} alt="" />
                  <img src={avatarImage} alt="" />
                </OverflowAvatarStack>
                <OverflowCount>+{thumbnailOverflowCount}</OverflowCount>
              </ThumbnailOverflowCard>
            )}
          </ThumbnailGrid>
        )}
      </ParticipantGridContainer>
    )
  }

  // Calculate the count to pass to the container (for grid layout)
  const gridCount = hasOverflow ? MAX_VISIBLE_PARTICIPANTS : participantCount

  return (
    <ParticipantGridContainer $participantCount={gridCount} $expandedView={false}>
      {displayTracks.map(trackRef => (
        <ParticipantTile
          key={trackRef.participant.sid + trackRef.source}
          trackRef={trackRef}
          isFullscreen={isFullscreen}
          onClick={hasMultipleParticipants ? () => handleTileClick(trackRef.participant.sid + trackRef.source) : undefined}
        />
      ))}
      {hasOverflow && (
        <OverflowCard onClick={handleShowAll}>
          <OverflowAvatarStack>
            <img src={avatarImage} alt="" />
            <img src={avatarImage} alt="" />
          </OverflowAvatarStack>
          <OverflowCount>+{overflowCount}</OverflowCount>
        </OverflowCard>
      )}
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
  const { participant, source, publication } = trackRef
  const isScreenShare = source === Track.Source.ScreenShare

  // Only apply speaking indicator to camera, not screen share
  const isSpeaking = useIsSpeaking(participant) && !isScreenShare

  // Get audio track for speaking indicator and muted state
  const audioTrackRefs = useTracks([Track.Source.Microphone], {
    updateOnlyOn: [],
    onlySubscribed: false
  })
  const participantAudioTrack = audioTrackRefs.find(track => track.participant.identity === participant.identity)
  const isMuted = participantAudioTrack ? participantAudioTrack.publication?.isMuted === true : true

  // Mirror the video if it's the local participant's camera (not screen share)
  const shouldMirror = participant.isLocal && source === Track.Source.Camera

  // Check if video track is actually publishing (not muted/disabled)
  // For camera tracks, also check if mediaStream is active (handles when camera is turned off)
  const hasActiveVideo =
    publication &&
    publication.track &&
    !publication.isMuted &&
    (isScreenShare || !publication.track.mediaStream || publication.track.mediaStream.active)

  // Check if track is initializing (readyState is 'live' when ready)
  // Note: readyState might not be available on all track types
  const isTrackInitializing =
    publication && publication.track && 'readyState' in publication.track && publication.track.readyState !== 'live' && !publication.isMuted

  // Only render if publication exists
  if (!publication) {
    return null
  }

  // Get display name with " - screen" suffix for screen share
  const displayName = isScreenShare ? `${getDisplayName(participant)} - screen` : getDisplayName(participant)

  return (
    <ParticipantTileContainer
      $isSpeaking={isSpeaking}
      $isFullscreen={isFullscreen}
      $clickable={!!onClick}
      $mirror={shouldMirror}
      onClick={onClick}
    >
      {isTrackInitializing ? (
        <AvatarFallback>
          <LoadingSpinner />
          <LoadingText>Initializing video...</LoadingText>
        </AvatarFallback>
      ) : hasActiveVideo ? (
        <VideoTrack trackRef={trackRef} />
      ) : (
        <AvatarFallback>
          <img src={avatarImage} alt="Avatar" />
        </AvatarFallback>
      )}

      {!isScreenShare && (
        <SpeakingIndicatorWrapper>
          <SpeakingIndicator participant={participant} trackRef={participantAudioTrack} />
        </SpeakingIndicatorWrapper>
      )}

      {isMuted && !isScreenShare && (
        <MutedIndicator>
          <MicOffIcon />
        </MutedIndicator>
      )}

      <ParticipantName>{displayName}</ParticipantName>
    </ParticipantTileContainer>
  )
}

export { ParticipantGrid }
