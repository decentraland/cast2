import { Button } from 'decentraland-ui2'
import styled from '@emotion/styled'

const NotFoundContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #d80029 0%, #16213e 50%, #0d1117 100%);
  color: white;
  text-align: center;
  padding: 2rem;
`

const NotFoundIcon = styled.div`
  font-size: 120px;
  margin-bottom: 2rem;
  opacity: 0.6;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    font-size: 120px;
  }
`

const NotFoundTitle = styled.h1`
  font-size: 3rem;
  font-weight: bold;
  margin: 0 0 1rem 0;
  color: white;
`

const NotFoundDescription = styled.p`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 2rem;
  max-width: 600px;
  line-height: 1.6;
`

const NotFoundButton = styled(Button)`
  && {
    background: var(--primary) !important;
    border-color: var(--primary) !important;
    color: var(--text-on-primary) !important;
    padding: 12px 24px;
    font-size: 1rem;
    font-weight: 600;
    min-width: 200px;

    &:hover {
      background: var(--primary-hover) !important;
      border-color: var(--primary-hover) !important;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 45, 85, 0.3);
    }

    &:active {
      transform: translateY(0);
    }
  }
`

const NotFoundLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--secondary);
  border: 1px solid var(--outline);
  color: var(--text);
  font-size: 1rem;
  font-weight: 600;
  min-width: 200px;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    background: var(--secondary-hover);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    text-decoration: none;
    color: var(--text);
  }

  &:active {
    transform: translateY(0);
  }
`

const ButtonWrapper = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
`

export { ButtonWrapper, NotFoundButton, NotFoundContainer, NotFoundDescription, NotFoundIcon, NotFoundLink, NotFoundTitle }
