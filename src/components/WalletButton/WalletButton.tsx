import { Button } from 'decentraland-ui2'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from '../../modules/translation'
import { WalletContainer } from './WalletButton.styled'

export function WalletButton() {
  const { t } = useTranslation()
  const { isConnected, address, connectWallet, disconnectWallet, isConnecting } = useAuth()

  if (isConnected && address) {
    return (
      <WalletContainer>
        <span>
          {t('auth.sign_in')}: {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <Button onClick={disconnectWallet} variant="outlined" size="small">
          {t('auth.disconnect')}
        </Button>
      </WalletContainer>
    )
  }

  return (
    <WalletContainer>
      <Button onClick={connectWallet} disabled={isConnecting} variant="contained">
        {isConnecting ? t('auth.connecting') : t('auth.connect_wallet')}
      </Button>
    </WalletContainer>
  )
}
