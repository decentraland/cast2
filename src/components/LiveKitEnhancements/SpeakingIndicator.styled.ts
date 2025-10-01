import { keyframes } from '@emotion/react'
import styled from '@emotion/styled'

const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
`

const SpeakingCircle = styled.div<{ isSpeaking: boolean; intensity: number }>`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${({ intensity }) =>
    `radial-gradient(circle, rgba(255, 45, 85, ${Math.min(intensity * 2, 1)}) 0%, rgba(255, 45, 85, 0.6) 100%)`};
  border: 2px solid rgba(255, 45, 85, 0.8);
  display: ${({ isSpeaking }) => (isSpeaking ? 'block' : 'none')};
  animation: ${({ isSpeaking }) => (isSpeaking ? pulseAnimation : 'none')} 1s ease-in-out infinite;
  z-index: 5;
`

export { SpeakingCircle }
