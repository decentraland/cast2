import { Card } from 'decentraland-ui2'
import { keyframes } from '@emotion/react'
import styled from '@emotion/styled'

const StreamerContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #d80029 0%, #16213e 50%, #d80029 100%);
  padding-top: 60px; // Account for fixed navbar
`

const StreamerLayout = styled.div`
  display: flex;
  height: calc(100vh - 60px);
  gap: 16px;
  padding: 16px;
  box-sizing: border-box;
`

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const StreamingHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
`

const StreamTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const VideoArea = styled.div`
  flex: 1;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  overflow: hidden;
  position: relative;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;

  // Make video content fit properly with object-fit: contain
  video {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`

const Sidebar = styled.div`
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%; // Full height for chat

  @media (max-width: 1200px) {
    width: 280px;
  }
`

const ErrorContainer = styled(Card)`
  && {
    padding: 24px;
    margin: 20px;
    background: rgba(255, 77, 77, 0.1);
    border: 1px solid rgba(255, 77, 77, 0.3);
    color: white;
  }
`

const pulseAnimation = keyframes`
  0% {
    transform: scale(0.9);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(0.9);
    opacity: 0.7;
  }
`

const LiveStreamingTitle = styled.div`
  color: white;
  text-shadow:
    0px 0px 20px rgba(0, 0, 0, 1),
    0px 0px 10px rgba(0, 0, 0, 1);
  background: rgba(0, 0, 0, 0.7);
  padding: 10px 20px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  gap: 8px;
`

const PulseIcon = styled.div`
  color: #ff2d55; // Red color for the pulse
  animation: ${pulseAnimation} 1.5s infinite;
  display: flex;
  align-items: center;
`

const StatsSpacer = styled.div`
  height: 16px;
`

const AuthPrompt = styled.div`
  margin-top: 12px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
`

export {
  AuthPrompt,
  ErrorContainer,
  LiveStreamingTitle,
  MainContent,
  PulseIcon,
  Sidebar,
  StatsSpacer,
  StreamerContainer,
  StreamerLayout,
  StreamingHeader,
  StreamTitle,
  VideoArea
}
