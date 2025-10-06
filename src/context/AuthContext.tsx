import { FC, ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { AuthIdentity } from '@dcl/crypto'
import { SingleSignOn } from '@dcl/single-sign-on-client'
import { config } from '../config'

// Debug logging
const debugLog = (message: string, data?: unknown) => {
  // Disabled in production
  console.log(`[Auth] ${message}`, data)
}

interface AuthContextValue {
  wallet?: string
  identity?: AuthIdentity
  isSignedIn: boolean
  isConnecting: boolean
  signIn: () => void
  signOut: () => void
}

interface AuthProviderProps {
  children: ReactNode
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// Initialize SSO instance
const sso = SingleSignOn.getInstance()

const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const { pathname, search } = useLocation()

  const [wallet, setWallet] = useState<string>()
  const [identity, setIdentity] = useState<AuthIdentity>()
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [ssoInitialized, setSsoInitialized] = useState(false)

  // Initialize SSO on mount
  useEffect(() => {
    const initSSO = async () => {
      try {
        debugLog('Initializing SSO')
        // For local development, don't provide src. For production, use https://id.decentraland.org
        const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        await sso.init(isDevelopment ? {} : { src: 'https://id.decentraland.org' })
        setSsoInitialized(true)
        debugLog('SSO initialized')
      } catch (error) {
        console.error('Error initializing SSO:', error)
        setSsoInitialized(true) // Still mark as initialized to proceed
      }
    }

    initSSO()
  }, [])

  // Sign in - redirect to auth page
  const signIn = useCallback(() => {
    debugLog('Initiating sign in', { pathname, search })
    const authUrl = config.get('AUTH_URL', 'https://decentraland.zone/auth')
    const currentUrl = encodeURIComponent(`${window.location.origin}${pathname}${search}`)
    const redirectUrl = `${authUrl}/login?redirectTo=${currentUrl}`
    debugLog('Redirecting to auth', { redirectUrl })
    window.location.replace(redirectUrl)
  }, [pathname, search])

  const signOut = useCallback(async () => {
    try {
      debugLog('Signing out', { wallet })

      // Clear identity using SSO
      if (wallet) {
        await sso.setIdentity(wallet, null)
      }

      // Clear connection data
      await sso.setConnectionData(null)

      // Clear state
      setWallet(undefined)
      setIdentity(undefined)
      setIsSignedIn(false)

      debugLog('Sign out completed')
    } catch (error: unknown) {
      console.error('Error during sign-out:', error)
    }
  }, [wallet])

  // Check for existing identity on mount
  useEffect(() => {
    if (!ssoInitialized) return

    const checkAuthStatus = async () => {
      try {
        setIsConnecting(true)
        debugLog('Checking auth status')

        // Check for connection data
        const connectionData = await sso.getConnectionData()
        if (connectionData && connectionData.address) {
          const walletAddress = connectionData.address.toLowerCase()
          debugLog('Connection data found', { address: walletAddress })

          // Check for valid identity
          try {
            const storedIdentity = await sso.getIdentity(walletAddress)
            if (storedIdentity && storedIdentity.expiration) {
              const expiration = new Date(storedIdentity.expiration)
              const now = new Date()
              if (now.getTime() <= expiration.getTime()) {
                debugLog('Identity valid', { expiration })
                setWallet(walletAddress)
                setIdentity(storedIdentity)
                setIsSignedIn(true)
              } else {
                debugLog('Identity expired', { expiration, now })
              }
            } else {
              debugLog('No identity found')
            }
          } catch (identityError) {
            console.error('Error checking identity:', identityError)
          }
        } else {
          debugLog('No connection data found')
        }
      } catch (error: unknown) {
        console.error('Error checking auth status:', error)
      } finally {
        setIsConnecting(false)
      }
    }

    checkAuthStatus()

    // Listen for storage changes from other tabs/windows
    const handleStorageChange = () => {
      debugLog('Storage changed, rechecking...')
      setTimeout(checkAuthStatus, 100)
    }

    // Listen for window focus to check for new identities
    const handleFocus = () => {
      debugLog('Window focused, checking for new identity...')
      setTimeout(checkAuthStatus, 500)
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [ssoInitialized])

  // Context value
  const contextValue: AuthContextValue = useMemo(
    () => ({
      wallet,
      identity,
      isSignedIn,
      isConnecting,
      signIn,
      signOut
    }),
    [wallet, identity, isSignedIn, isConnecting, signIn, signOut]
  )

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}

export { AuthProvider, useAuth }
