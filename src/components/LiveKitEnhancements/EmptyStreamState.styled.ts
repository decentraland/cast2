import { keyframes } from '@emotion/react'
import styled from '@emotion/styled'
import { Typography } from 'decentraland-ui2'

const fadeInOut = keyframes`
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
`

const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(74, 144, 226, 0.1) 0%, rgba(80, 227, 194, 0.1) 100%);
  text-align: center;
  padding: 40px 20px;
  box-sizing: border-box;
`

const StreamerEmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, rgba(102, 73, 127, 0.6) 0%, rgba(63, 35, 87, 0.6) 100%);
  padding: 40px 20px;
  box-sizing: border-box;
  border: 1px solid #a24bf3;
  border-radius: 12px;
  position: relative;
`

const AvatarImage = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  animation: ${fadeInOut} 2s ease-in-out infinite;
`

const ParticipantNameOverlay = styled.div`
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

const EmptyIconWrapper = styled.div`
  font-size: 64px;
  margin-bottom: 20px;
  animation: ${fadeInOut} 2s ease-in-out infinite;
  display: flex;
  justify-content: center;
  align-items: center;

  svg {
    font-size: 64px;
    color: rgba(255, 255, 255, 0.7);
  }
`

const EmptyTitle = styled(Typography)`
  && {
    color: white;
    font-weight: 600;
    margin-bottom: 12px;
    font-size: 24px;
  }
`

const EmptySubtitle = styled(Typography)`
  && {
    color: rgba(255, 255, 255, 0.7);
    font-size: 16px;
    max-width: 300px;
    line-height: 1.5;
  }
`

export { AvatarImage, EmptyContainer, EmptyIconWrapper, EmptySubtitle, EmptyTitle, ParticipantNameOverlay, StreamerEmptyContainer }
