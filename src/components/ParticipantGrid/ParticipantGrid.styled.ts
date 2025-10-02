import styled from '@emotion/styled'

const ParticipantGridContainer = styled.div<{ $participantCount: number; $expandedView: boolean }>`
  width: 100%;
  height: 100%;
  position: relative;
  display: ${props => {
    if (props.$participantCount === 0) return 'flex'
    if (props.$participantCount === 1 || props.$expandedView) return 'block'
    if (props.$participantCount === 2) return 'grid'
    return 'grid'
  }};
  ${props => {
    if (props.$participantCount === 0) {
      return `
        align-items: center;
        justify-content: center;
      `
    }
    if (props.$participantCount === 1 || props.$expandedView) {
      return `
        position: relative;
      `
    }
    if (props.$participantCount === 2) {
      return `
        grid-template-columns: 1fr 1fr;
        gap: 8px; /* Small gap between videos */
      `
    }
    return `
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 8px;
      padding: 8px;
      align-content: start;
    `
  }}
`

const NoParticipants = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  gap: 1rem;
`

const NoParticipantsIcon = styled.div`
  font-size: 48px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
`

const ParticipantTileContainer = styled.div<{ isSpeaking?: boolean; $isFullscreen?: boolean; $clickable?: boolean }>`
  position: relative;
  overflow: hidden;
  background: #000;
  ${props => {
    if (props.$isFullscreen) {
      return `
        width: 100%;
        height: 100%;
      `
    }
    return `
      width: 100%;
      height: 100%; /* Occupy full height of grid cell */
    `
  }}
  border: ${props => (props.isSpeaking ? '3px solid #1e90ff' : 'none')};
  transition:
    border-color 0.3s ease,
    transform 0.2s ease;
  cursor: ${props => (props.$clickable ? 'pointer' : 'default')};

  ${props =>
    props.$clickable &&
    `
    &:hover {
      transform: scale(1.02);
    }
  `}

  /* Override LiveKit styles */
  .lk-participant-tile {
    background: transparent;
  }

  .lk-participant-metadata {
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(10px);
    border-radius: 8px;
    margin: 0.5rem;
  }

  .lk-participant-media-video {
    object-fit: contain !important;
  }
`

const FloatingVideoContainer = styled.div`
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 280px;
  height: 160px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: #000;
  cursor: pointer;
  z-index: 10;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    transform: scale(1.05);
    border-color: rgba(255, 255, 255, 0.5);
  }

  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (max-width: 768px) {
    width: 180px;
    height: 100px;
    bottom: 10px;
    right: 10px;
  }
`

const FloatingVideoName = styled.div`
  position: absolute;
  bottom: 8px;
  left: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  z-index: 11;
`

const ThumbnailGrid = styled.div<{ $count: number }>`
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: grid;
  grid-template-columns: repeat(${props => Math.min(props.$count, 2)}, 140px);
  gap: 8px;
  z-index: 10;

  @media (max-width: 768px) {
    grid-template-columns: repeat(${props => Math.min(props.$count, 2)}, 90px);
    bottom: 10px;
    right: 10px;
  }
`

const ThumbnailItem = styled.div`
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: #000;
  cursor: pointer;
  position: relative;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    transform: scale(1.05);
    border-color: rgba(255, 255, 255, 0.5);
  }

  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

const ThumbnailName = styled.div`
  position: absolute;
  bottom: 4px;
  left: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const SpeakingIndicatorWrapper = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 2;
`

const ParticipantName = styled.div`
  position: absolute;
  bottom: 12px;
  left: 12px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  padding: 6px 12px;
  border-radius: 8px;
  z-index: 2;
`

export {
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
}
