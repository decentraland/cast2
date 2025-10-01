import { Button, Typography } from 'decentraland-ui2'
import { useAuth } from '../../context/AuthContext'
import { ConnectedState, ErrorText, SignInButton, WalletContainer } from './WalletButton.styled'

export function WalletButton() {
  const { isConnected, isConnecting, address, connectWallet, disconnectWallet, error, clearError } = useAuth()

  const handleConnect = async () => {
    clearError()
    await connectWallet()
  }

  const handleDisconnect = () => {
    disconnectWallet()
  }

  if (isConnected && address) {
    return (
      <WalletContainer>
        <ConnectedState>
          <Typography variant="body2">
            {address.substring(0, 6)}...{address.substring(address.length - 4)}
          </Typography>
          <Button onClick={handleDisconnect} size="small" variant="outlined">
            Sign Out
          </Button>
        </ConnectedState>
      </WalletContainer>
    )
  }

  return (
    <WalletContainer>
      <SignInButton onClick={handleConnect} disabled={isConnecting} size="medium" variant="contained">
        {isConnecting ? 'Connecting...' : 'SIGN IN'}
      </SignInButton>
      {error && <ErrorText variant="body2">{error}</ErrorText>}
    </WalletContainer>
  )
}
