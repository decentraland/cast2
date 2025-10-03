import { ReactNode, createContext, useContext, useEffect, useReducer } from 'react'
import { AuthIdentity } from '@dcl/crypto'
import { config } from '../config'
import { AuthAction, AuthState } from './AuthContext.types'

// Enhanced debug logging for auth flow
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const logAuth = (_message: string, _data?: unknown) => {
  // Debug logging disabled in production
}

// Identity management - check ALL possible storage patterns used by DCL
function findDCLIdentity(): { address: string; identity: AuthIdentity } | null {
  try {
    const allKeys = Object.keys(localStorage)
    logAuth(`Scanning ${allKeys.length} localStorage keys for DCL identity`)

    // Check for various DCL identity patterns
    const patterns = [
      /^dcl:identity:/i,
      /^dcl-identity:/i,
      /^identity:/i,
      /^decentraland-identity:/i,
      /^decentraland:identity:/i,
      /^auth:identity:/i,
      /identity.*0x/i,
      /0x.*identity/i
    ]

    for (const key of allKeys) {
      const matchesPattern = patterns.some(pattern => pattern.test(key))
      if (matchesPattern) {
        try {
          const value = localStorage.getItem(key)
          if (value) {
            logAuth(`Found potential identity key: ${key}`)
            const parsed = JSON.parse(value)

            // Check if this looks like a valid DCL identity
            if (
              parsed &&
              (parsed.authChain ||
                parsed.ephemeralIdentity ||
                parsed.address ||
                parsed.publicKey ||
                parsed.privateKey ||
                (Array.isArray(parsed.authChain) && parsed.authChain.length > 0))
            ) {
              // Extract address from various possible locations
              let address = parsed.address || parsed.ethAddress
              if (!address && key.includes('0x')) {
                address = key.match(/0x[a-fA-F0-9]{40}/)?.[0]
              }

              if (address && parsed) {
                logAuth('✅ Found valid DCL identity', {
                  key,
                  address: address.substring(0, 6) + '...' + address.substring(address.length - 4),
                  hasAuthChain: !!parsed.authChain,
                  hasEphemeralIdentity: !!parsed.ephemeralIdentity
                })
                return { address: address.toLowerCase(), identity: parsed }
              }
            }
          }
        } catch (err) {
          logAuth(`Error parsing key ${key}:`, err)
        }
      }
    }
    logAuth('No DCL identity found in localStorage')
    return null
  } catch (error) {
    logAuth('Error scanning localStorage:', error)
    return null
  }
}

function clearIdentity(address: string): void {
  try {
    // Clear all possible identity keys for this address
    const allKeys = Object.keys(localStorage)
    const addressLower = address.toLowerCase()

    const keysToRemove = allKeys.filter(key => key.includes(addressLower) && (key.includes('identity') || key.includes('dcl')))

    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
      logAuth(`Removed key: ${key}`)
    })
  } catch (error) {
    logAuth('Error clearing identity:', error)
  }
}

const initialState: AuthState = {
  isConnecting: false,
  isConnected: false,
  address: null,
  identity: null,
  error: null
}

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'CONNECT_START':
      return { ...state, isConnecting: true, error: null }
    case 'CONNECT_SUCCESS':
      logAuth('✅ AUTH SUCCESS', {
        address: action.payload.address.substring(0, 6) + '...' + action.payload.address.substring(action.payload.address.length - 4)
      })
      return {
        ...state,
        isConnecting: false,
        isConnected: true,
        address: action.payload.address,
        identity: action.payload.identity,
        error: null
      }
    case 'CONNECT_ERROR':
      logAuth('❌ AUTH ERROR:', action.payload)
      return {
        ...state,
        isConnecting: false,
        isConnected: false,
        address: null,
        identity: null,
        error: action.payload
      }
    case 'DISCONNECT':
      logAuth('🔌 DISCONNECTED')
      return {
        ...state,
        isConnecting: false,
        isConnected: false,
        address: null,
        identity: null,
        error: null
      }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    default:
      return state
  }
}

// Context
const AuthContext = createContext<
  | {
      state: AuthState
      connectWallet: () => Promise<void>
      disconnectWallet: () => void
      clearError: () => void
    }
  | undefined
>(undefined)

// Provider
function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Check for existing connection on mount
  useEffect(() => {
    logAuth('🚀 AuthProvider initialized')

    const checkExistingConnection = async () => {
      try {
        // First: Look for existing DCL identity in storage
        const existingIdentity = findDCLIdentity()
        if (existingIdentity) {
          logAuth('Found existing DCL identity in storage')
          dispatch({
            type: 'CONNECT_SUCCESS',
            payload: existingIdentity
          })
          return
        }

        // Second: Check if wallet is connected
        if (window.ethereum) {
          const accounts = (await window.ethereum.request({
            method: 'eth_accounts'
          })) as string[]

          if (accounts && accounts.length > 0) {
            const address = accounts[0].toLowerCase()
            logAuth(`Wallet connected: ${address.substring(0, 6)}...${address.substring(address.length - 4)}`)

            // Look for identity specific to this address
            const addressSpecificIdentity = findDCLIdentity()
            if (addressSpecificIdentity && addressSpecificIdentity.address === address) {
              dispatch({
                type: 'CONNECT_SUCCESS',
                payload: addressSpecificIdentity
              })
            } else {
              logAuth('Wallet connected but no DCL identity found')
            }
          } else {
            logAuth('No wallet connected')
          }
        }
      } catch (error) {
        logAuth('Error checking existing connection:', error)
      }
    }

    checkExistingConnection()

    // Listen for storage changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.includes('identity')) {
        logAuth('Identity storage changed, rechecking...', { key: e.key })
        setTimeout(checkExistingConnection, 100)
      }
    }

    // Listen for window focus to check for new identities
    const handleFocus = () => {
      logAuth('Window focused, checking for new identity...')
      setTimeout(checkExistingConnection, 500)
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const connectWallet = async () => {
    logAuth('🔐 Connect wallet requested')

    if (!window.ethereum) {
      dispatch({ type: 'CONNECT_ERROR', payload: 'Please install MetaMask to sign in.' })
      return
    }

    dispatch({ type: 'CONNECT_START' })

    try {
      const accounts = (await window.ethereum.request({
        method: 'eth_requestAccounts'
      })) as string[]

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please connect your wallet.')
      }

      const address = accounts[0].toLowerCase()
      logAuth(`Wallet connected: ${address.substring(0, 6)}...${address.substring(address.length - 4)}`)

      // Look for existing DCL identity
      const existingIdentity = findDCLIdentity()
      if (existingIdentity && existingIdentity.address === address) {
        logAuth('Found existing DCL identity for this address')
        dispatch({
          type: 'CONNECT_SUCCESS',
          payload: existingIdentity
        })
        return
      }

      // No DCL identity found - redirect to DCL Auth
      logAuth('❌ No DCL identity found - redirecting to auth')

      const authUrl = config.get('AUTH_URL', 'https://decentraland.zone/auth')
      const currentUrl = encodeURIComponent(window.location.href)
      const redirectUrl = `${authUrl}/login?redirectTo=${currentUrl}`

      logAuth('🔄 Redirecting to DCL Auth', { redirectUrl })
      window.location.replace(redirectUrl)
    } catch (error) {
      dispatch({
        type: 'CONNECT_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to connect wallet'
      })
    }
  }

  const disconnectWallet = () => {
    if (state.address) {
      clearIdentity(state.address)
    }
    dispatch({ type: 'DISCONNECT' })
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  return <AuthContext.Provider value={{ state, connectWallet, disconnectWallet, clearError }}>{children}</AuthContext.Provider>
}

// Hook
function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  const { state, connectWallet, disconnectWallet, clearError } = context

  return {
    isConnecting: state.isConnecting,
    isConnected: state.isConnected,
    address: state.address,
    identity: state.identity,
    error: state.error,
    connectWallet,
    disconnectWallet,
    clearError
  }
}

export { AuthProvider, useAuth }
