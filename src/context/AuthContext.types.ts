import { AuthIdentity } from '@dcl/crypto'

// Types
interface AuthState {
  isConnecting: boolean
  isConnected: boolean
  address: string | null
  identity: AuthIdentity | null
  error: string | null
}

// Action types
type AuthAction =
  | { type: 'CONNECT_START' }
  | { type: 'CONNECT_SUCCESS'; payload: { address: string; identity: AuthIdentity } }
  | { type: 'CONNECT_ERROR'; payload: string }
  | { type: 'DISCONNECT' }
  | { type: 'CLEAR_ERROR' }

export type { AuthState, AuthAction }
