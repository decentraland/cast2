import { Card } from 'decentraland-ui2'
import { keyframes } from '@emotion/react'
import styled from '@emotion/styled'

const slideInFromRight = keyframes`
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
`

const slideOutToRight = keyframes`
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(100%);
  }
`

const ViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #301646;
  padding-top: 60px;
`

const ViewLayout = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px);
  width: 100%;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 0;
  transition: all 0.3s ease-in-out;
  padding: 24px;
`

const VideoContainer = styled.div<{ $sidebarOpen: boolean }>`
  flex: 1;
  display: flex;
  position: relative;
  min-height: 0;
  transition: all 0.3s ease-in-out;
`

const VideoArea = styled.div<{ $sidebarOpen: boolean }>`
  flex: 1;
  background: #1a0b2e;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-sizing: border-box;
  transition: flex 0.3s ease-in-out;
  border-radius: 12px;

  video {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  @media (max-width: 768px) {
    padding: 16px;
    margin: 8px;
  }
`

const Sidebar = styled.div<{ $isOpen: boolean; $isClosing?: boolean }>`
  width: ${({ $isOpen }) => ($isOpen ? '400px' : '0')};
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease-in-out;
  overflow: hidden;
  background: linear-gradient(135deg, #66497f 0%, #3f2357 100%);
  border-radius: 12px;
  flex-shrink: 0;
  animation: ${({ $isOpen, $isClosing }) => {
      if ($isClosing) return slideOutToRight
      if ($isOpen) return slideInFromRight
      return 'none'
    }}
    0.3s ease-out;
  margin-left: 18px;
  box-sizing: border-box;

  @media (max-width: 1200px) {
    width: ${({ $isOpen }) => ($isOpen ? '320px' : '0')};
  }

  @media (max-width: 768px) {
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    width: 100%;
    height: ${({ $isOpen }) => ($isOpen ? '40vh' : '0')};
    margin: 8px;
    padding: 16px;
    z-index: 100;
  }
`

const ControlsArea = styled.div`
  width: 100%;
  background: transparent;
  flex-shrink: 0;
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

export { AuthPrompt, ControlsArea, ErrorContainer, MainContent, Sidebar, VideoArea, VideoContainer, ViewContainer, ViewLayout }
