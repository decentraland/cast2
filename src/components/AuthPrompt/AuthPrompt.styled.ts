import { Card, Typography } from 'decentraland-ui2'
import styled from '@emotion/styled'

const AuthPromptCard = styled(Card)`
  && {
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 20px;
  }
`

const AuthContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  text-align: center;
`

const AuthError = styled.div`
  padding: 12px;
  background: rgba(255, 71, 87, 0.1);
  border: 1px solid rgba(255, 71, 87, 0.3);
  border-radius: 8px;
  width: 100%;
`

const AuthNote = styled(Typography)`
  && {
    color: rgba(255, 255, 255, 0.6);
    font-size: 12px;
  }
`

export { AuthContent, AuthError, AuthNote, AuthPromptCard }
