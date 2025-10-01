import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { StreamingControls } from './StreamingControls'
import { TranslationProvider } from '../../modules/translation'
import { LiveKitProvider } from '../../context/LiveKitContext'

// Mock LiveKit hooks
jest.mock('@livekit/components-react', () => ({
  useRoomContext: jest.fn(() => ({
    disconnect: jest.fn(),
    connect: jest.fn()
  })),
  useLocalParticipant: jest.fn(() => ({
    localParticipant: {
      isMicrophoneEnabled: false,
      isCameraEnabled: false,
      videoTrackPublications: new Map(),
      setMicrophoneEnabled: jest.fn(),
      setCameraEnabled: jest.fn(),
      setScreenShareEnabled: jest.fn(),
      unpublishTrack: jest.fn()
    }
  })),
  useConnectionState: jest.fn(() => 'connected'),
  useTrackToggle: jest.fn(({ source }) => ({
    enabled: false,
    toggle: jest.fn()
  }))
}))

const mockUseRoomContext = jest.requireMock('@livekit/components-react').useRoomContext
const mockUseLocalParticipant = jest.requireMock('@livekit/components-react').useLocalParticipant
const mockUseTrackToggle = jest.requireMock('@livekit/components-react').useTrackToggle
const mockUseConnectionState = jest.requireMock('@livekit/components-react').useConnectionState

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <TranslationProvider>
      <LiveKitProvider>{component}</LiveKitProvider>
    </TranslationProvider>
  )
}

describe('StreamingControls', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render all control buttons', () => {
    renderWithProviders(<StreamingControls />)

    expect(screen.getByText(/mute mic|unmute mic/i)).toBeInTheDocument()
    expect(screen.getByText(/start cam|stop cam/i)).toBeInTheDocument()
    expect(screen.getByText(/share screen|stop share/i)).toBeInTheDocument()
    expect(screen.getByText(/end stream/i)).toBeInTheDocument()
  })

  it('should toggle microphone when mic button clicked', () => {
    const mockToggleMic = jest.fn()
    mockUseTrackToggle.mockImplementation(({ source }: any) => {
      if (source === 'microphone') {
        return { enabled: false, toggle: mockToggleMic }
      }
      return { enabled: false, toggle: jest.fn() }
    })

    renderWithProviders(<StreamingControls />)

    const micButton = screen.getByText(/unmute mic/i).closest('button')
    if (micButton) {
      fireEvent.click(micButton)
      expect(mockToggleMic).toHaveBeenCalled()
    }
  })

  it('should toggle camera when cam button clicked', () => {
    const mockToggleCamera = jest.fn()
    mockUseTrackToggle.mockImplementation(({ source }: any) => {
      if (source === 'camera') {
        return { enabled: false, toggle: mockToggleCamera }
      }
      return { enabled: false, toggle: jest.fn() }
    })

    renderWithProviders(<StreamingControls />)

    const camButton = screen.getByText(/start cam/i).closest('button')
    if (camButton) {
      fireEvent.click(camButton)
      expect(mockToggleCamera).toHaveBeenCalled()
    }
  })

  it('should show reconnect button when disconnected', () => {
    mockUseConnectionState.mockReturnValue('disconnected')

    renderWithProviders(<StreamingControls />)

    expect(screen.getByText(/reconnect/i)).toBeInTheDocument()
    expect(screen.queryByText(/end stream/i)).not.toBeInTheDocument()
  })

  it('should disconnect room when end stream clicked', () => {
    const mockDisconnect = jest.fn()
    mockUseRoomContext.mockReturnValue({
      disconnect: mockDisconnect,
      connect: jest.fn()
    })
    mockUseConnectionState.mockReturnValue('connected')

    renderWithProviders(<StreamingControls />)

    const endStreamButton = screen.getByText(/end stream/i).closest('button')
    if (endStreamButton) {
      fireEvent.click(endStreamButton)
      expect(mockDisconnect).toHaveBeenCalled()
    }
  })

  it('should render audio and video device selectors', () => {
    renderWithProviders(<StreamingControls />)

    // Device selectors should be rendered (they will show loading/no devices initially)
    const selectors = screen.getAllByText(/loading|no.*devices/i)
    expect(selectors.length).toBeGreaterThan(0)
  })
})
