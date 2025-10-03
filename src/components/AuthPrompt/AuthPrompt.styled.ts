import { Card, Typography, styled } from 'decentraland-ui2'

const AuthPromptCard = styled(Card)(() => ({
  background: 'rgba(0, 0, 0, 0.6)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 12,
  padding: 20
}))

const AuthContent = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  alignItems: 'center',
  textAlign: 'center'
})

const AuthError = styled('div')({
  padding: 12,
  background: 'rgba(255, 71, 87, 0.1)',
  border: '1px solid rgba(255, 71, 87, 0.3)',
  borderRadius: 8,
  width: '100%'
})

const AuthNote = styled(Typography)(() => ({
  color: 'rgba(255, 255, 255, 0.6)',
  fontSize: 12
}))

export { AuthContent, AuthError, AuthNote, AuthPromptCard }
