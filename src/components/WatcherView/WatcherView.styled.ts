import { Card } from 'decentraland-ui2'
import styled from '@emotion/styled'

const WatcherContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: white;

  &.with-navbar {
    padding-top: 60px; // Account for fixed navbar
  }
`

const WatcherLayout = styled.div`
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

  // Ensure proper aspect ratio
  min-height: 400px;
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

const AuthPromptStyled = styled.div`
  margin-top: 12px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
`

const LiveWatchingTitle = styled.div`
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

const StatsSpacer = styled.div`
  height: 16px;
`

const BackLink = styled.a`
  color: inherit;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

export {
  AuthPromptStyled,
  BackLink,
  ErrorContainer,
  LiveWatchingTitle,
  MainContent,
  Sidebar,
  StatsSpacer,
  StreamTitle,
  StreamingHeader,
  VideoArea,
  WatcherContainer,
  WatcherLayout
}
