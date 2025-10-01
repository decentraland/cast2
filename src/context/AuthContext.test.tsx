import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthContext'

// Mock config module
jest.mock('../config', () => ({
  config: {
    get: jest.fn((key: string, defaultValue: string) => defaultValue)
  }
}))

// Mock window.ethereum
const mockEthereum = {
  request: jest.fn(),
  on: jest.fn(),
  removeListener: jest.fn(),
  isMetaMask: true
}

// Test component to use the hook
function TestComponent() {
  const { isConnected, address, isConnecting, connectWallet, disconnectWallet } = useAuth()

  return (
    <div>
      <div data-testid="connection-status">{isConnected ? 'connected' : 'disconnected'}</div>
      <div data-testid="address">{address || 'no-address'}</div>
      <div data-testid="connecting">{isConnecting ? 'connecting' : 'idle'}</div>
      <button onClick={connectWallet}>Connect</button>
      <button onClick={disconnectWallet}>Disconnect</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Setup window.ethereum mock
    Object.defineProperty(window, 'ethereum', {
      value: mockEthereum,
      writable: true,
      configurable: true
    })
  })

  afterEach(() => {
    // Clean up
    delete (window as any).ethereum
  })

  it('should provide initial disconnected state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('connection-status')).toHaveTextContent('disconnected')
    expect(screen.getByTestId('address')).toHaveTextContent('no-address')
    expect(screen.getByTestId('connecting')).toHaveTextContent('idle')
  })

  it('should show connecting state when connectWallet is called', async () => {
    const mockAddress = '0x1234567890123456789012345678901234567890'
    mockEthereum.request.mockResolvedValueOnce([mockAddress])

    // Mock localStorage to have a valid DCL identity
    const mockIdentity = {
      address: mockAddress,
      authChain: [],
      ephemeralIdentity: {}
    }
    localStorage.setItem(`dcl:identity:${mockAddress}`, JSON.stringify(mockIdentity))

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const connectButton = screen.getByText('Connect')
    fireEvent.click(connectButton)

    // Should show connecting state
    await waitFor(() => {
      expect(screen.getByTestId('connecting')).toHaveTextContent('connecting')
    })

    expect(mockEthereum.request).toHaveBeenCalledWith({
      method: 'eth_requestAccounts'
    })

    localStorage.clear()
  })

  it('should handle wallet connection error', async () => {
    mockEthereum.request.mockRejectedValueOnce(new Error('User rejected'))

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const connectButton = screen.getByText('Connect')
    fireEvent.click(connectButton)

    await waitFor(() => {
      expect(screen.getByTestId('connection-status')).toHaveTextContent('disconnected')
      expect(screen.getByTestId('connecting')).toHaveTextContent('idle')
    })
  })

  it('should disconnect wallet when disconnectWallet is called', async () => {
    const mockAddress = '0x1234567890123456789012345678901234567890'
    mockEthereum.request.mockResolvedValueOnce([mockAddress])

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // First connect
    const connectButton = screen.getByText('Connect')
    fireEvent.click(connectButton)

    await waitFor(() => {
      expect(screen.getByTestId('connection-status')).toHaveTextContent('connected')
    })

    // Then disconnect
    const disconnectButton = screen.getByText('Disconnect')
    fireEvent.click(disconnectButton)

    await waitFor(() => {
      expect(screen.getByTestId('connection-status')).toHaveTextContent('disconnected')
      expect(screen.getByTestId('address')).toHaveTextContent('no-address')
    })
  })

  it('should handle missing ethereum provider gracefully', async () => {
    delete (window as any).ethereum

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const connectButton = screen.getByText('Connect')
    fireEvent.click(connectButton)

    await waitFor(() => {
      expect(screen.getByTestId('connection-status')).toHaveTextContent('disconnected')
    })
  })

  it('should throw error when useAuth is used outside provider', () => {
    // Suppress console errors for this test
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    // Wrap in a try-catch because rendering will throw
    let errorThrown = false
    try {
      render(<TestComponent />)
    } catch (error) {
      errorThrown = true
      expect((error as Error).message).toContain('useAuth must be used within')
    }

    expect(errorThrown).toBe(true)
    consoleErrorSpy.mockRestore()
  })
})
