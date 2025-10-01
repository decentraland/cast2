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

const ParticipantTileContainer = styled.div`
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.4);
  border: 2px solid rgba(255, 255, 255, 0.1);
  transition: border-color 0.2s ease;

  &:hover {
    border-color: #00ff88;
  }

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
`

export {
  CameraSection,
  NoParticipants,
  NoParticipantsIcon,
  ParticipantGridContainer,
  ParticipantTileContainer,
  ScreenShareGrid,
  ScreenShareSection,
  SectionTitle
}
