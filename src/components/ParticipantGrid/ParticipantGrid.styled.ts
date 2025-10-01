import styled from '@emotion/styled'

const ParticipantGridContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: auto;
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

const ScreenShareSection = styled.div`
  margin-bottom: 2rem;
`

const SectionTitle = styled.h3`
  color: #00ff88;
  margin-bottom: 1rem;
  padding: 0 1rem;
`

const ScreenShareGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0 1rem;
`

const CameraSection = styled.div`
  padding: 0 1rem;
`

const ParticipantTileContainer = styled.div<{ isSpeaking?: boolean }>`
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  border: 2px solid ${props => (props.isSpeaking ? '#1e90ff' : 'rgba(255, 255, 255, 0.1)')};
  transition: border-color 0.3s ease;
  box-shadow: ${props => (props.isSpeaking ? '0 0 20px rgba(30, 144, 255, 0.5)' : 'none')};

  /* Override LiveKit styles */
  .lk-participant-tile {
    background: transparent;
    border-radius: 12px;
  }

  .lk-participant-metadata {
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(10px);
    border-radius: 8px;
    margin: 0.5rem;
  }

  /* Override LiveKit video object-fit to show full stream */
  .lk-participant-media-video {
    object-fit: contain !important;
  }
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
  CameraSection,
  NoParticipants,
  NoParticipantsIcon,
  ParticipantGridContainer,
  ParticipantName,
  ParticipantTileContainer,
  ScreenShareGrid,
  ScreenShareSection,
  SectionTitle,
  SpeakingIndicatorWrapper
}
