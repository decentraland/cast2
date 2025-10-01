// React 18 JSX Transform - React import not needed
import { LoadingContainer, LoadingSpinner, LoadingText } from './LoadingScreen.styled'

interface LoadingScreenProps {
  message?: string
}

export function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <LoadingContainer>
      <LoadingSpinner />
      <LoadingText>{message}</LoadingText>
    </LoadingContainer>
  )
}
