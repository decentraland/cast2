import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { StreamingControls } from './StreamingControls'
import { TranslationProvider } from '../../modules/translation'
import { ConnectionState, LocalParticipant, Room, Track } from 'livekit-client'

// Mock LiveKit hooks
const mockDisconnect = jest.fn()
const mockConnect = jest.fn()
const mockSetMicrophoneEnabled = jest.fn()
const mockSetCameraEnabled = jest.fn()
const mockSetScreenShareEnabled = jest.fn()
const mockUnpublishTrack = jest.fn()

let mockMicEnabled = false
let mockCameraEnabled = false

const mockLocalParticipant = {
  isMicrophoneEnabled: false,
  isCameraEnabled: false,
  videoTrackPublications: new Map(),
  audioTrackPublications: new Map(),
  setMicrophoneEnabled: mockSetMicrophoneEnabled,
  setCameraEnabled: mockSetCameraEnabled,
  setScreenShareEnabled: mockSetScreenShareEnabled,
  unpublishTrack: mockUnpublishTrack
} as unknown as LocalParticipant

const mockRoom = {
  disconnect: mockDisconnect,
  connect: mockConnect,
  localParticipant: mockLocalParticipant
} as unknown as Room

jest.mock('@livekit/components-react', () => ({
  useRoomContext: jest.fn(() => mockRoom),
  useLocalParticipant: jest.fn(() => ({
    localParticipant: mockLocalParticipant
  })),
  useRemoteParticipants: jest.fn(() => []),
  useConnectionState: jest.fn(() => ConnectionState.Connected),
  useTrackToggle: jest.fn(({ source }) => {
    if (source === Track.Source.Microphone) {
      return {
        enabled: mockMicEnabled,
        toggle: () => {
          mockMicEnabled = !mockMicEnabled
        }
      }
    }
    if (source === Track.Source.Camera) {
      return {
        enabled: mockCameraEnabled,
        toggle: () => {
          mockCameraEnabled = !mockCameraEnabled
        }
      }
    }
    return { enabled: false, toggle: jest.fn() }
  })
}))

jest.mock('../../context/LiveKitContext', () => ({
  useLiveKitCredentials: jest.fn(() => ({
    credentials: { token: 'mock-token', url: 'ws://mock-url' },
    setCredentials: jest.fn()
  }))
}))

// Mock navigator.mediaDevices
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    enumerateDevices: jest.fn().mockResolvedValue([]),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  },
  writable: true
})

const mockUseRoomContext = jest.requireMock('@livekit/components-react').useRoomContext
const mockUseLocalParticipant = jest.requireMock('@livekit/components-react').useLocalParticipant
const mockUseConnectionState = jest.requireMock('@livekit/components-react').useConnectionState
const mockUseTrackToggle = jest.requireMock('@livekit/components-react').useTrackToggle
const mockUseLiveKitCredentials = jest.requireMock('../../context/LiveKitContext').useLiveKitCredentials
const mockUseRemoteParticipants = jest.requireMock('@livekit/components-react').useRemoteParticipants

const renderWithProviders = (component: React.ReactElement) => {
  return render(<TranslationProvider>{component}</TranslationProvider>)
}

describe('StreamingControls', () => {
  const mockOnToggleChat = jest.fn()
  const mockOnTogglePeople = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    // Reset mock state for each test
    mockMicEnabled = false
    mockCameraEnabled = false
    mockLocalParticipant.isMicrophoneEnabled = false
    mockLocalParticipant.isCameraEnabled = false
    mockLocalParticipant.videoTrackPublications.clear()
    mockUseConnectionState.mockReturnValue(ConnectionState.Connected)
    mockUseLiveKitCredentials.mockReturnValue({
      credentials: { token: 'mock-token', url: 'ws://mock-url' },
      setCredentials: jest.fn()
    })
    mockUseRemoteParticipants.mockReturnValue([])
  })

  describe('Streamer mode', () => {
    it('should render all streamer control buttons', () => {
      renderWithProviders(<StreamingControls isStreamer={true} onToggleChat={mockOnToggleChat} onTogglePeople={mockOnTogglePeople} />)

      expect(screen.getByText(/end streaming/i)).toBeInTheDocument()
    })

    it('should toggle microphone when mic button clicked', () => {
      renderWithProviders(<StreamingControls isStreamer={true} onToggleChat={mockOnToggleChat} onTogglePeople={mockOnTogglePeople} />)

      // Find mic button (first circular button)
      const buttons = document.querySelectorAll('button')
      const micButton = buttons[0] // First button is mic

      expect(mockMicEnabled).toBe(false)
      fireEvent.click(micButton)
      expect(mockMicEnabled).toBe(true)

      fireEvent.click(micButton)
      expect(mockMicEnabled).toBe(false)
    })

    it('should toggle camera when cam button clicked', () => {
      renderWithProviders(<StreamingControls isStreamer={true} onToggleChat={mockOnToggleChat} onTogglePeople={mockOnTogglePeople} />)

      const buttons = document.querySelectorAll('button')
      const camButton = buttons[1] // Second button is camera

      expect(mockCameraEnabled).toBe(false)
      fireEvent.click(camButton)
      expect(mockCameraEnabled).toBe(true)

      fireEvent.click(camButton)
      expect(mockCameraEnabled).toBe(false)
    })

    it('should toggle screen share when screen share button clicked', async () => {
      renderWithProviders(<StreamingControls isStreamer={true} onToggleChat={mockOnToggleChat} onTogglePeople={mockOnTogglePeople} />)

      const buttons = document.querySelectorAll('button')
      const screenShareButton = buttons[2] // Third button is screen share

      fireEvent.click(screenShareButton)
      expect(mockSetScreenShareEnabled).toHaveBeenCalledWith(true)
    })

    it('should call onToggleChat when chat button clicked', () => {
      renderWithProviders(<StreamingControls isStreamer={true} onToggleChat={mockOnToggleChat} onTogglePeople={mockOnTogglePeople} />)

      const buttons = document.querySelectorAll('button')
      // In streamer mode: [mic, camera, screen, end, chat, people]
      const chatButton = buttons[4]

      fireEvent.click(chatButton)
      expect(mockOnToggleChat).toHaveBeenCalled()
    })

    it('should call onTogglePeople when people button clicked', () => {
      renderWithProviders(<StreamingControls isStreamer={true} onToggleChat={mockOnToggleChat} onTogglePeople={mockOnTogglePeople} />)

      const buttons = document.querySelectorAll('button')
      const peopleButton = buttons[5] // Sixth button is people

      fireEvent.click(peopleButton)
      expect(mockOnTogglePeople).toHaveBeenCalled()
    })

    it('should disconnect room when end stream clicked', () => {
      renderWithProviders(<StreamingControls isStreamer={true} onToggleChat={mockOnToggleChat} onTogglePeople={mockOnTogglePeople} />)
      const endStreamButton = screen.getByText(/end streaming/i)

      fireEvent.click(endStreamButton)
      expect(mockDisconnect).toHaveBeenCalled()
    })

    it('should display participant count badge', () => {
      mockUseRemoteParticipants.mockReturnValue([{ identity: 'user1' }, { identity: 'user2' }])

      renderWithProviders(<StreamingControls isStreamer={true} onToggleChat={mockOnToggleChat} onTogglePeople={mockOnTogglePeople} />)

      // Should show 3 (2 remote + 1 local)
      expect(screen.getByText('3')).toBeInTheDocument()
    })
  })

  describe('Watcher mode', () => {
    it('should only render leave button for watchers', () => {
      renderWithProviders(<StreamingControls isStreamer={false} />)

      expect(screen.getByText(/leave/i)).toBeInTheDocument()
      // Should not have mic/camera/screen share controls
      const buttons = document.querySelectorAll('button')
      expect(buttons.length).toBe(1) // Only leave button
    })

    it('should disconnect room when leave clicked', () => {
      renderWithProviders(<StreamingControls isStreamer={false} />)
      const leaveButton = screen.getByText(/leave/i)

      fireEvent.click(leaveButton)
      expect(mockDisconnect).toHaveBeenCalled()
    })
  })

  describe('Disconnected state', () => {
    it('should show reconnect button when disconnected', () => {
      mockUseConnectionState.mockReturnValue(ConnectionState.Disconnected)
      renderWithProviders(<StreamingControls isStreamer={true} />)

      expect(screen.getByText(/reconnect/i)).toBeInTheDocument()
      expect(screen.queryByText(/end streaming/i)).not.toBeInTheDocument()
    })

    it('should reconnect when reconnect button clicked', async () => {
      mockUseConnectionState.mockReturnValue(ConnectionState.Disconnected)
      renderWithProviders(<StreamingControls isStreamer={true} />)

      const reconnectButton = screen.getByText(/reconnect/i)
      fireEvent.click(reconnectButton)

      expect(mockConnect).toHaveBeenCalledWith('ws://mock-url', 'mock-token')
    })
  })
})
