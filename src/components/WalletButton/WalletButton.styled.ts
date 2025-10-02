import styled from '@emotion/styled'
import { Button, Typography } from 'decentraland-ui2'

const WalletContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
  min-width: 160px;
`

const ConnectedState = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(0, 213, 99, 0.1);
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(0, 213, 99, 0.2);
`

const SignInButton = styled(Button)`
  width: 100% !important;
  background: var(--primary) !important;
  border-color: var(--primary) !important;
  box-shadow: 0 2px 8px rgba(255, 45, 85, 0.3) !important;

  &:hover {
    background: var(--primary-hover) !important;
    border-color: var(--primary-hover) !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 45, 85, 0.4) !important;
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none !important;
  }
`

const ErrorText = styled(Typography)`
  color: var(--error) !important;
  font-size: 0.85rem;
  text-align: center;
  margin-top: 4px;
`

export { ConnectedState, ErrorText, SignInButton, WalletContainer }
