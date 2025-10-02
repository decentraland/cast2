import React from 'react'
import { render, screen } from '@testing-library/react'
import { TranslationProvider } from '../../modules/translation'
import { WalletButton } from './WalletButton'

// Mock config before importing AuthContext
jest.mock('../../config', () => ({
  config: {
    get: jest.fn((key: string, defaultValue?: string) => {
      const configs: Record<string, string> = {
        LIVEKIT_URL: 'wss://test-livekit.example.com',
        API_URL: 'http://localhost:3000'
      }
      return configs[key] || defaultValue || ''
    })
  }
}))

// Mock the useAuth hook
jest.mock('../../context/AuthContext', () => ({
  ...jest.requireActual('../../context/AuthContext'),
  useAuth: jest.fn()
}))

const mockUseAuth = jest.requireMock('../../context/AuthContext').useAuth

const renderWithTranslation = (component: React.ReactElement) => {
  return render(<TranslationProvider>{component}</TranslationProvider>)
}

describe('WalletButton', () => {
  let mockConnectWallet: jest.Mock
  let mockDisconnectWallet: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockConnectWallet = jest.fn()
    mockDisconnectWallet = jest.fn()
    // Default mock setup - disconnected state
    mockUseAuth.mockReturnValue({
      isConnected: false,
      address: null,
      connectWallet: mockConnectWallet,
      disconnectWallet: mockDisconnectWallet,
      isConnecting: false,
      error: null,
      identity: null
    })
  })

  it('should render connect button when not connected', () => {
    renderWithTranslation(<WalletButton />)

    const button = screen.getByRole('button', { name: /connect wallet/i })
    expect(button).toBeInTheDocument()
    expect(button).not.toBeDisabled()
  })

  it('should render connecting state', () => {
    mockUseAuth.mockReturnValue({
      isConnected: false,
      address: null,
      connectWallet: mockConnectWallet,
      disconnectWallet: mockDisconnectWallet,
      isConnecting: true,
      error: null,
      identity: null
    })

    renderWithTranslation(<WalletButton />)

    const button = screen.getByRole('button', { name: /connecting/i })
    expect(button).toBeInTheDocument()
    expect(button).toBeDisabled()
  })

  it('should render disconnect button when connected', () => {
    mockUseAuth.mockReturnValue({
      isConnected: true,
      address: '0x1234567890abcdef1234567890abcdef12345678',
      connectWallet: mockConnectWallet,
      disconnectWallet: mockDisconnectWallet,
      isConnecting: false,
      error: null,
      identity: null
    })

    renderWithTranslation(<WalletButton />)

    expect(screen.getByText(/0x1234...5678/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /disconnect/i })).toBeInTheDocument()
  })

  it('should display shortened address when connected', () => {
    mockUseAuth.mockReturnValue({
      isConnected: true,
      address: '0xabcdef1234567890abcdef1234567890abcdef12',
      connectWallet: mockConnectWallet,
      disconnectWallet: mockDisconnectWallet,
      isConnecting: false,
      error: null,
      identity: null
    })

    renderWithTranslation(<WalletButton />)

    // Check that address is shortened: first 6 chars + ... + last 4 chars
    expect(screen.getByText(/0xabcd...ef12/)).toBeInTheDocument()
  })
})
