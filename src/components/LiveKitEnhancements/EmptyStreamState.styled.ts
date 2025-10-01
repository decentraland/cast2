import { Typography } from 'decentraland-ui2'
import { keyframes } from '@emotion/react'
import styled from '@emotion/styled'

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
  border-radius: 12px;
  border: 2px dashed rgba(255, 255, 255, 0.2);
  text-align: center;
  padding: 40px 20px;
  box-sizing: border-box;
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

export { EmptyContainer, EmptyIconWrapper, EmptySubtitle, EmptyTitle }
