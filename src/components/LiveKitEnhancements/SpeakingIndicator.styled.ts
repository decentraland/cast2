import { keyframes } from '@emotion/react'
import styled from '@emotion/styled'

const waveAnimation = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(2.5);
    opacity: 0;
  }
`

const SpeakingCircle = styled.div<{ isSpeaking: boolean; intensity: number }>`
  position: relative;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${props => (props.isSpeaking ? '#1e90ff' : 'rgba(255, 255, 255, 0.3)')};
  transition: all 0.2s ease;
  opacity: ${props => (props.isSpeaking ? 1 : 0.5)};
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  /* Inner core */
  &::before {
    content: '';
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: white;
    opacity: ${props => (props.isSpeaking ? 0.8 : 0.3)};
  }

  /* Wave effect - only when speaking */
  &::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 2px solid #1e90ff;
    opacity: ${props => (props.isSpeaking ? 0.6 : 0)};
    animation: ${props => (props.isSpeaking ? waveAnimation : 'none')} 1.5s ease-out infinite;
  }
`

export { SpeakingCircle }
