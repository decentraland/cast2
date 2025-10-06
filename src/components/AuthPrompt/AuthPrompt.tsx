import { useState } from 'react'
import { Button, Typography } from 'decentraland-ui2'
import { useTranslation } from '../../modules/translation'
import { AuthPromptProps, WindowWithEthereum } from './AuthPrompt.types'
import { AuthContent, AuthError, AuthNote, AuthPromptCard } from './AuthPrompt.styled'

export function AuthPrompt({ onAuthenticate }: AuthPromptProps) {
  const { t } = useTranslation()
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConnect = async () => {
    setIsConnecting(true)
    setError(null)

    try {
      // Check if MetaMask or similar wallet is available
      const windowWithEth = window as WindowWithEthereum

      if (!windowWithEth.ethereum) {
        throw new Error(t('auth.no_wallet'))
      }

      // Request account access
      const accounts = (await windowWithEth.ethereum.request({
        method: 'eth_requestAccounts'
      })) as string[]

      if (!accounts || accounts.length === 0) {
        throw new Error(t('auth.no_accounts'))
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
      setError(err instanceof Error ? err.message : t('auth.auth_failed'))
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <AuthPromptCard>
      <AuthContent>
        <Typography variant="h6">🔐 {t('auth.join_conversation')}</Typography>
        <Typography variant="body2">{t('auth.connect_prompt')}</Typography>

        {error && (
          <AuthError>
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          </AuthError>
        )}

        <Button onClick={handleConnect} disabled={isConnecting} variant="contained">
          {isConnecting ? `🔄 ${t('auth.connecting')}` : `🦊 ${t('auth.connect_wallet')}`}
        </Button>

        <AuthNote variant="body2">{t('auth.privacy_note')}</AuthNote>
      </AuthContent>
    </AuthPromptCard>
  )
}
