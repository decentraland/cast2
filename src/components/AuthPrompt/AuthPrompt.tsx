import { useState } from 'react'
import { Button, Typography } from 'decentraland-ui2'
import { AuthContent, AuthError, AuthNote, AuthPromptCard } from './AuthPrompt.styled'

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

interface WindowWithEthereum extends Window {
  ethereum?: EthereumProvider
}

interface AuthPromptProps {
  onAuthenticate: (walletAddress: string, signature: string) => Promise<void>
}

export function AuthPrompt({ onAuthenticate }: AuthPromptProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConnect = async () => {
    setIsConnecting(true)
    setError(null)

    try {
      // Check if MetaMask or similar wallet is available
      const windowWithEth = window as WindowWithEthereum

      if (!windowWithEth.ethereum) {
        throw new Error('No wallet found. Please install MetaMask or similar.')
      }

      // Request account access
      const accounts = (await windowWithEth.ethereum.request({
        method: 'eth_requestAccounts'
      })) as string[]

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please connect your wallet.')
      }

      const walletAddress = accounts[0]

      // Create signature message
      const message = `Sign this message to join Decentraland Cast chat.\n\nTimestamp: ${Date.now()}`

      // Request signature
      const signature = (await windowWithEth.ethereum.request({
        method: 'personal_sign',
        params: [message, walletAddress]
      })) as string

      await onAuthenticate(walletAddress, signature)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <AuthPromptCard>
      <AuthContent>
        <Typography variant="h6">🔐 Join the Conversation</Typography>
        <Typography variant="body2">Connect your wallet to send messages in chat and participate in the discussion.</Typography>

        {error && (
          <AuthError>
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          </AuthError>
        )}

        <Button onClick={handleConnect} disabled={isConnecting} variant="contained">
          {isConnecting ? '🔄 Connecting...' : '🦊 Connect Wallet'}
        </Button>

        <AuthNote variant="body2">We'll never store your private keys. This signature is only used to verify your identity.</AuthNote>
      </AuthContent>
    </AuthPromptCard>
  )
}
