import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthContext'

jest.mock('../config', () => ({
  config: {
    get: jest.fn((key: string, defaultValue: string) => defaultValue)
  }
}))

const mockEthereum = {
  request: jest.fn(),
  on: jest.fn(),
  removeListener: jest.fn(),
  isMetaMask: true
}

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
  describe('when initially rendered', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'ethereum', {
        value: mockEthereum,
        writable: true,
        configurable: true
      })
    })

    afterEach(() => {
      jest.clearAllMocks()
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
  })

  describe('when connectWallet is called', () => {
    let mockAddress: string

    beforeEach(() => {
      mockAddress = '0x1234567890123456789012345678901234567890'
      mockEthereum.request.mockResolvedValueOnce([mockAddress])

      const mockIdentity = {
        address: mockAddress,
        authChain: [],
        ephemeralIdentity: {}
      }
      localStorage.setItem(`dcl:identity:${mockAddress}`, JSON.stringify(mockIdentity))

      Object.defineProperty(window, 'ethereum', {
        value: mockEthereum,
        writable: true,
        configurable: true
      })
    })

    afterEach(() => {
      jest.clearAllMocks()
      localStorage.clear()
      delete (window as any).ethereum
    })

    it('should show connecting state', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      const connectButton = screen.getByText('Connect')
      fireEvent.click(connectButton)

      await waitFor(() => {
        expect(screen.getByTestId('connecting')).toHaveTextContent('connecting')
      })

      expect(mockEthereum.request).toHaveBeenCalledWith({
        method: 'eth_requestAccounts'
      })
    })
  })

  describe('when wallet connection fails', () => {
    beforeEach(() => {
      mockEthereum.request.mockRejectedValueOnce(new Error('User rejected'))

      Object.defineProperty(window, 'ethereum', {
        value: mockEthereum,
        writable: true,
        configurable: true
      })
    })

    afterEach(() => {
      jest.clearAllMocks()
      delete (window as any).ethereum
    })

    it('should handle wallet connection error', async () => {
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
  })

  describe('when disconnectWallet is called', () => {
    let mockAddress: string

    beforeEach(() => {
      mockAddress = '0x1234567890123456789012345678901234567890'
      mockEthereum.request.mockResolvedValueOnce([mockAddress])

      Object.defineProperty(window, 'ethereum', {
        value: mockEthereum,
        writable: true,
        configurable: true
      })
    })

    afterEach(() => {
      jest.clearAllMocks()
      delete (window as any).ethereum
    })

    it('should disconnect wallet', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      const connectButton = screen.getByText('Connect')
      fireEvent.click(connectButton)

      await waitFor(() => {
        expect(screen.getByTestId('connection-status')).toHaveTextContent('connected')
      })

      const disconnectButton = screen.getByText('Disconnect')
      fireEvent.click(disconnectButton)

      await waitFor(() => {
        expect(screen.getByTestId('connection-status')).toHaveTextContent('disconnected')
        expect(screen.getByTestId('address')).toHaveTextContent('no-address')
      })
    })
  })

  describe('when ethereum provider is missing', () => {
    beforeEach(() => {
      delete (window as any).ethereum
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should handle missing ethereum provider gracefully', async () => {
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
  })

  describe('when useAuth is used outside provider', () => {
    it('should throw error', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

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
})
