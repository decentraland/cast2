import { Button, Typography, styled } from 'decentraland-ui2'

const WalletContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  gap: 8,
  minWidth: 160
})

const ConnectedState = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  background: 'rgba(0, 213, 99, 0.1)',
  padding: '8px 12px',
  borderRadius: 8,
  border: '1px solid rgba(0, 213, 99, 0.2)'
})

const SignInButton = styled(Button)(({ theme }) => ({
  width: '100%',
  background: theme.palette.primary.main,
  borderColor: theme.palette.primary.main,
  boxShadow: '0 2px 8px rgba(255, 45, 85, 0.3)',
  '&:hover': {
    background: theme.palette.primary.dark,
    borderColor: theme.palette.primary.dark,
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(255, 45, 85, 0.4)'
  },
  '&:active': {
    transform: 'translateY(0)'
  },
  '&:disabled': {
    opacity: 0.6,
    cursor: 'not-allowed',
    transform: 'none',
    boxShadow: 'none'
  }
}))

const ErrorText = styled(Typography)(({ theme }) => ({
  color: theme.palette.error.main,
  fontSize: '0.85rem',
  textAlign: 'center',
  marginTop: 4
}))

export { ConnectedState, ErrorText, SignInButton, WalletContainer }
