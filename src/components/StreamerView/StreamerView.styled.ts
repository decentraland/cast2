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
  flex: 1;
  gap: 16px;
  padding: 16px;
  height: calc(100vh - 76px); // Match watcher view with consistent height
  min-height: calc(100vh - 76px); // Ensure minimum viewport height
  overflow: hidden;
`

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px; // Reduced from 16px to save space
  min-height: 0;
`

const StreamingHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px; // Reduced padding
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.1);
`

const StreamTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const VideoArea = styled.div`
  flex: 1;
  min-height: 300px; // Reduced from auto to save space
  background: rgba(0, 0, 0, 0.4);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  position: relative; // For status overlay positioning
  display: flex;
  justify-content: center;
  align-items: center;
`

const Sidebar = styled.div`
  width: 320px;
  display: flex;
  flex-direction: column;
  height: 100%; // Full height

  @media (max-width: 1200px) {
    width: 280px;
  }
`

const ErrorMessage = styled.div`
  color: var(--error);
  text-align: center;
  margin-top: 20px;
`

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  padding: 20px;
  text-align: center;
  color: white;
  gap: 16px;
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

const PulseIcon = styled.span`
  color: #ff2d55;
  font-size: 20px;
  animation: pulse 2s infinite;
  display: flex;
  align-items: center;

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`

const StatsSpacer = styled.div`
  height: 16px;
`

const AuthPrompt = styled.div`
  margin-top: 12px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 8px;
`

export {
  AuthPrompt,
  ErrorContainer,
  ErrorMessage,
  LiveStreamingTitle,
  MainContent,
  PulseIcon,
  Sidebar,
  StatsSpacer,
  StreamTitle,
  StreamerContainer,
  StreamerLayout,
  StreamingHeader,
  VideoArea
}
