import React from 'react'

import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { StreamerView } from './StreamerView'
import * as localStorage from '../../utils/localStorage'
import * as api from '../../utils/api'

// Mock dependencies
jest.mock('../../context/LiveKitContext', () => ({
  useLiveKitCredentials: jest.fn(() => ({
    credentials: null,
    setCredentials: jest.fn()
  }))
}))

jest.mock('../../modules/translation/context', () => ({
  useTranslation: jest.fn(() => ({
    t: (key: string) => key,
    changeLocale: jest.fn(),
    locale: 'en'
  }))
}))

jest.mock('../../utils/localStorage')
jest.mock('../../utils/api')
jest.mock('@livekit/components-styles', () => ({}))
jest.mock('@livekit/components-react', () => ({
  LiveKitRoom: ({ children }: { children: React.ReactNode }) => <div data-testid="livekit-room">{children}</div>,
  RoomAudioRenderer: () => <div data-testid="room-audio-renderer" />,
  ConnectionStateToast: () => <div data-testid="connection-state-toast" />
}))

jest.mock('../StreamerOnboarding/StreamerOnboarding', () => ({
  StreamerOnboarding: () => <div data-testid="streamer-onboarding">Onboarding</div>
}))

jest.mock('decentraland-ui2', () => ({
  ...jest.requireActual('decentraland-ui2'),
  Navbar: () => <div data-testid="navbar">Navbar</div>
}))

const mockLocalStorage = localStorage as jest.Mocked<typeof localStorage>
const mockApi = api as jest.Mocked<typeof api>

describe('StreamerView - Token Management', () => {
  beforeEach(() => {
    mockLocalStorage.saveStreamerToken = jest.fn()
    mockLocalStorage.getStreamerToken = jest.fn()
    mockLocalStorage.clearStreamerToken = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('when accessing with a token in the URL', () => {
    let tokenFromUrl: string

    beforeEach(() => {
      tokenFromUrl = 'test-streaming-key-123'
      // Token will be saved to localStorage, so we return it when asked
      mockLocalStorage.getStreamerToken.mockReturnValue(tokenFromUrl)
    })

    it('should save the token to localStorage', async () => {
      render(
        <MemoryRouter initialEntries={[`/cast/s/${tokenFromUrl}`]}>
          <Routes>
            <Route path="/cast/s/:token" element={<StreamerView />} />
            <Route path="/cast/s/streaming" element={<StreamerView />} />
          </Routes>
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(mockLocalStorage.saveStreamerToken).toHaveBeenCalledWith(tokenFromUrl)
      })
    })

    it('should display the onboarding screen', async () => {
      render(
        <MemoryRouter initialEntries={[`/cast/s/${tokenFromUrl}`]}>
          <Routes>
            <Route path="/cast/s/:token" element={<StreamerView />} />
            <Route path="/cast/s/streaming" element={<StreamerView />} />
          </Routes>
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByTestId('streamer-onboarding')).toBeInTheDocument()
      })
    })
  })

  describe('when accessing the streaming route', () => {
    describe('and a valid token exists in localStorage', () => {
      let storedToken: string

      beforeEach(() => {
        storedToken = 'stored-token-456'
        mockLocalStorage.getStreamerToken.mockReturnValue(storedToken)
      })

      it('should retrieve the token from localStorage', async () => {
        render(
          <MemoryRouter initialEntries={['/cast/s/streaming']}>
            <Routes>
              <Route path="/cast/s/:token" element={<StreamerView />} />
              <Route path="/cast/s/streaming" element={<StreamerView />} />
            </Routes>
          </MemoryRouter>
        )

        await waitFor(() => {
          expect(mockLocalStorage.getStreamerToken).toHaveBeenCalled()
        })
      })

      it('should display the onboarding screen with valid token', async () => {
        render(
          <MemoryRouter initialEntries={['/cast/s/streaming']}>
            <Routes>
              <Route path="/cast/s/:token" element={<StreamerView />} />
              <Route path="/cast/s/streaming" element={<StreamerView />} />
            </Routes>
          </MemoryRouter>
        )

        await waitFor(() => {
          expect(screen.getByTestId('streamer-onboarding')).toBeInTheDocument()
        })
      })
    })

    describe('and no token exists in localStorage', () => {
      beforeEach(() => {
        mockLocalStorage.getStreamerToken.mockReturnValue(null)
      })

      it('should display an error message with translated error_no_token', async () => {
        render(
          <MemoryRouter initialEntries={['/cast/s/streaming']}>
            <Routes>
              <Route path="/cast/s/:token" element={<StreamerView />} />
              <Route path="/cast/s/streaming" element={<StreamerView />} />
            </Routes>
          </MemoryRouter>
        )

        await waitFor(() => {
          expect(screen.getByText('streamer.error_connection')).toBeInTheDocument()
          expect(screen.getByText('streamer.error_no_token')).toBeInTheDocument()
        })
      })

      it('should not save any token', async () => {
        render(
          <MemoryRouter initialEntries={['/cast/s/streaming']}>
            <Routes>
              <Route path="/cast/s/:token" element={<StreamerView />} />
              <Route path="/cast/s/streaming" element={<StreamerView />} />
            </Routes>
          </MemoryRouter>
        )

        await waitFor(() => {
          expect(mockLocalStorage.saveStreamerToken).not.toHaveBeenCalled()
        })
      })
    })
  })

  describe('when accessing without a token', () => {
    beforeEach(() => {
      mockLocalStorage.getStreamerToken.mockReturnValue(null)
    })

    it('should check localStorage for a stored token', async () => {
      render(
        <MemoryRouter initialEntries={['/cast/s/streaming']}>
          <Routes>
            <Route path="/cast/s/:token" element={<StreamerView />} />
            <Route path="/cast/s/streaming" element={<StreamerView />} />
          </Routes>
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(mockLocalStorage.getStreamerToken).toHaveBeenCalled()
      })
    })

    it('should not attempt to save a token', async () => {
      render(
        <MemoryRouter initialEntries={['/cast/s/streaming']}>
          <Routes>
            <Route path="/cast/s/:token" element={<StreamerView />} />
            <Route path="/cast/s/streaming" element={<StreamerView />} />
          </Routes>
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(mockLocalStorage.saveStreamerToken).not.toHaveBeenCalled()
      })
    })
  })
})
