import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthContext'

// Mock the config
jest.mock('../config', () => ({
  config: {
    get: jest.fn((key: string, defaultValue: string) => defaultValue)
  }
}))

// Mock SingleSignOn with factory function that creates new mocks
jest.mock('@dcl/single-sign-on-client', () => ({
  SingleSignOn: {
    getInstance: jest.fn(() => ({
      init: jest.fn().mockResolvedValue(undefined),
      getIdentity: jest.fn().mockResolvedValue(null),
      setIdentity: jest.fn().mockResolvedValue(undefined),
      getConnectionData: jest.fn().mockResolvedValue(null),
      setConnectionData: jest.fn().mockResolvedValue(undefined)
    }))
  }
}))

function TestComponent() {
  const { isSignedIn, wallet, isConnecting, signIn, signOut } = useAuth()

  return (
    <div>
      <div data-testid="connection-status">{isSignedIn ? 'connected' : 'disconnected'}</div>
      <div data-testid="address">{wallet || 'no-address'}</div>
      <div data-testid="connecting">{isConnecting ? 'connecting' : 'idle'}</div>
      <button onClick={signIn}>Connect</button>
      <button onClick={signOut}>Disconnect</button>
    </div>
  )
}

describe('AuthContext', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('when initially rendered', () => {
    it('should provide initial disconnected state', async () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(screen.getByTestId('connection-status')).toHaveTextContent('disconnected')
        expect(screen.getByTestId('address')).toHaveTextContent('no-address')
        expect(screen.getByTestId('connecting')).toHaveTextContent('idle')
      })
    })
  })
})
