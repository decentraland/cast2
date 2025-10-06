import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import { WalletButton } from './WalletButton'
import { TranslationProvider } from '../../modules/translation'

jest.mock('../../config')
jest.mock('../../context/AuthContext', () => ({
  ...jest.requireActual('../../context/AuthContext'),
  useAuth: jest.fn()
}))

const renderWithTranslation = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <TranslationProvider>{component}</TranslationProvider>
    </BrowserRouter>
  )
}

describe('WalletButton', () => {
  let mockSignIn: jest.Mock
  let mockSignOut: jest.Mock
  let mockUseAuth: jest.Mock
  let mockConfigGet: jest.Mock

  beforeEach(() => {
    mockSignIn = jest.fn()
    mockSignOut = jest.fn()

    mockUseAuth = jest.requireMock('../../context/AuthContext').useAuth
    mockConfigGet = jest.requireMock('../../config').config.get

    mockConfigGet.mockImplementation((key: string, defaultValue?: string) => {
      const configs: Record<string, string> = {
        LIVEKIT_URL: 'wss://test-livekit.example.com',
        API_URL: 'http://localhost:3000'
      }
      return configs[key] || defaultValue || ''
    })

    mockUseAuth.mockReturnValue({
      isSignedIn: false,
      wallet: null,
      signIn: mockSignIn,
      signOut: mockSignOut,
      isConnecting: false,
      identity: null
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('when not signed in', () => {
    it('should render sign in button', () => {
      renderWithTranslation(<WalletButton />)

      const button = screen.getByRole('button', { name: /sign in/i })
      expect(button).toBeInTheDocument()
      expect(button).not.toBeDisabled()
    })
  })

  describe('when connecting', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isSignedIn: false,
        wallet: null,
        signIn: mockSignIn,
        signOut: mockSignOut,
        isConnecting: true,
        identity: null
      })
    })

    it('should render connecting state', () => {
      renderWithTranslation(<WalletButton />)

      const button = screen.getByRole('button', { name: /connecting/i })
      expect(button).toBeInTheDocument()
      expect(button).toBeDisabled()
    })
  })

  describe('when signed in', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isSignedIn: true,
        wallet: '0x1234567890abcdef1234567890abcdef12345678',
        signIn: mockSignIn,
        signOut: mockSignOut,
        isConnecting: false,
        identity: null
      })
    })

    it('should render sign out button', () => {
      renderWithTranslation(<WalletButton />)

      expect(screen.getByText(/0x1234...5678/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
    })

    it('should display shortened address', () => {
      mockUseAuth.mockReturnValue({
        isSignedIn: true,
        wallet: '0xabcdef1234567890abcdef1234567890abcdef12',
        signIn: mockSignIn,
        signOut: mockSignOut,
        isConnecting: false,
        identity: null
      })

      renderWithTranslation(<WalletButton />)

      expect(screen.getByText(/0xabcd...ef12/)).toBeInTheDocument()
    })
  })
})
