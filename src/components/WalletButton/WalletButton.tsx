import { Button } from 'decentraland-ui2'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from '../../modules/translation'
import { WalletContainer } from './WalletButton.styled'

export function WalletButton() {
  const { t } = useTranslation()
  const { isSignedIn, wallet, signIn, signOut, isConnecting } = useAuth()

  if (isSignedIn && wallet) {
    return (
      <WalletContainer>
        <span>
          {wallet.slice(0, 6)}...{wallet.slice(-4)}
        </span>
        <Button onClick={signOut} variant="outlined" size="small">
          {t('auth.sign_out')}
        </Button>
      </WalletContainer>
    )
  }

  return (
    <WalletContainer>
      <Button onClick={signIn} disabled={isConnecting} variant="contained">
        {isConnecting ? t('auth.connecting') : t('auth.sign_in')}
      </Button>
    </WalletContainer>
  )
}
