import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { ConnectionState, LocalParticipant, Room, Track } from 'livekit-client'
import { StreamingControls } from './StreamingControls'
import { TranslationProvider } from '../../modules/translation'

jest.mock('@livekit/components-react')
jest.mock('../../context/LiveKitContext')

Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    enumerateDevices: jest.fn().mockResolvedValue([]),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  },
  writable: true
})

const renderWithProviders = (component: React.ReactElement) => {
  return render(<TranslationProvider>{component}</TranslationProvider>)
}

describe('StreamingControls', () => {
  let mockDisconnect: jest.Mock
  let mockConnect: jest.Mock
  let mockSetMicrophoneEnabled: jest.Mock
  let mockSetCameraEnabled: jest.Mock
  let mockSetScreenShareEnabled: jest.Mock
  let mockUnpublishTrack: jest.Mock
  let mockLocalParticipant: LocalParticipant
  let mockRoom: Room
  let mockUseRoomContext: jest.Mock
  let mockUseLocalParticipant: jest.Mock
  let mockUseConnectionState: jest.Mock
  let mockUseTrackToggle: jest.Mock
  let mockUseLiveKitCredentials: jest.Mock
  let mockUseRemoteParticipants: jest.Mock
  let mockOnToggleChat: jest.Mock
  let mockOnTogglePeople: jest.Mock

  beforeEach(() => {
    mockDisconnect = jest.fn()
    mockConnect = jest.fn()
    mockSetMicrophoneEnabled = jest.fn()
    mockSetCameraEnabled = jest.fn()
    mockSetScreenShareEnabled = jest.fn()
    mockUnpublishTrack = jest.fn()
    mockOnToggleChat = jest.fn()
    mockOnTogglePeople = jest.fn()

    mockLocalParticipant = {
      isMicrophoneEnabled: false,
      isCameraEnabled: false,
      videoTrackPublications: new Map(),
      audioTrackPublications: new Map(),
      setMicrophoneEnabled: mockSetMicrophoneEnabled,
      setCameraEnabled: mockSetCameraEnabled,
      setScreenShareEnabled: mockSetScreenShareEnabled,
      unpublishTrack: mockUnpublishTrack,
      getTrackPublication: jest.fn()
    } as unknown as LocalParticipant

    mockRoom = {
      disconnect: mockDisconnect,
      connect: mockConnect,
      localParticipant: mockLocalParticipant
    } as unknown as Room

    mockUseRoomContext = jest.requireMock('@livekit/components-react').useRoomContext
    mockUseLocalParticipant = jest.requireMock('@livekit/components-react').useLocalParticipant
    mockUseConnectionState = jest.requireMock('@livekit/components-react').useConnectionState
    mockUseTrackToggle = jest.requireMock('@livekit/components-react').useTrackToggle
    mockUseLiveKitCredentials = jest.requireMock('../../context/LiveKitContext').useLiveKitCredentials
    mockUseRemoteParticipants = jest.requireMock('@livekit/components-react').useRemoteParticipants

    mockUseRoomContext.mockReturnValue(mockRoom)
    mockUseLocalParticipant.mockReturnValue({
      localParticipant: mockLocalParticipant
    })
    mockUseConnectionState.mockReturnValue(ConnectionState.Connected)
    mockUseTrackToggle.mockImplementation(({ source }) => {
      if (source === Track.Source.Microphone) {
        return { enabled: mockLocalParticipant.isMicrophoneEnabled }
      }
      if (source === Track.Source.Camera) {
        return { enabled: mockLocalParticipant.isCameraEnabled }
      }
      return { enabled: false }
    })
    mockUseLiveKitCredentials.mockReturnValue({
      credentials: { token: 'mock-token', url: 'ws://mock-url' },
      setCredentials: jest.fn()
    })
    mockUseRemoteParticipants.mockReturnValue([])
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('when in streamer mode', () => {
    it('should render all streamer control buttons', () => {
      renderWithProviders(<StreamingControls isStreamer={true} onToggleChat={mockOnToggleChat} onTogglePeople={mockOnTogglePeople} />)

      expect(screen.getByText(/end streaming/i)).toBeInTheDocument()
    })

    describe('and the microphone button is clicked', () => {
      describe('and the microphone is off', () => {
        beforeEach(() => {
          mockLocalParticipant.isMicrophoneEnabled = false
        })

        it('should enable the microphone', () => {
          renderWithProviders(<StreamingControls isStreamer={true} onToggleChat={mockOnToggleChat} onTogglePeople={mockOnTogglePeople} />)

          const buttons = document.querySelectorAll('button')
          const micButton = buttons[0]

          fireEvent.click(micButton)
          expect(mockSetMicrophoneEnabled).toHaveBeenCalledWith(true, undefined)
        })
      })

      describe('and the microphone is on', () => {
        beforeEach(() => {
          mockLocalParticipant.isMicrophoneEnabled = true
        })

        it('should disable the microphone', () => {
          renderWithProviders(<StreamingControls isStreamer={true} onToggleChat={mockOnToggleChat} onTogglePeople={mockOnTogglePeople} />)

          const buttons = document.querySelectorAll('button')
          const micButton = buttons[0]

          fireEvent.click(micButton)
          expect(mockSetMicrophoneEnabled).toHaveBeenCalledWith(false)
        })
      })
    })

    describe('and the camera button is clicked', () => {
      describe('and the camera is off', () => {
        beforeEach(() => {
          mockLocalParticipant.isCameraEnabled = false
        })

        it('should enable the camera', () => {
          renderWithProviders(<StreamingControls isStreamer={true} onToggleChat={mockOnToggleChat} onTogglePeople={mockOnTogglePeople} />)

          const buttons = document.querySelectorAll('button')
          const camButton = buttons[1]

          fireEvent.click(camButton)
          expect(mockSetCameraEnabled).toHaveBeenCalledWith(true, undefined)
        })
      })

      describe('and the camera is on', () => {
        beforeEach(() => {
          mockLocalParticipant.isCameraEnabled = true
        })

        it('should disable the camera', () => {
          renderWithProviders(<StreamingControls isStreamer={true} onToggleChat={mockOnToggleChat} onTogglePeople={mockOnTogglePeople} />)

          const buttons = document.querySelectorAll('button')
          const camButton = buttons[1]

          fireEvent.click(camButton)
          expect(mockSetCameraEnabled).toHaveBeenCalledWith(false)
        })
      })
    })

    describe('and the screen share button is clicked', () => {
      it('should enable screen sharing', () => {
        renderWithProviders(<StreamingControls isStreamer={true} onToggleChat={mockOnToggleChat} onTogglePeople={mockOnTogglePeople} />)

        const buttons = document.querySelectorAll('button')
        const screenShareButton = buttons[2]

        fireEvent.click(screenShareButton)
        expect(mockSetScreenShareEnabled).toHaveBeenCalledWith(true)
      })
    })

    describe('and the chat button is clicked', () => {
      it('should call onToggleChat', () => {
        renderWithProviders(<StreamingControls isStreamer={true} onToggleChat={mockOnToggleChat} onTogglePeople={mockOnTogglePeople} />)

        const buttons = document.querySelectorAll('button')
        const chatButton = buttons[4]

        fireEvent.click(chatButton)
        expect(mockOnToggleChat).toHaveBeenCalled()
      })
    })

    describe('and the people button is clicked', () => {
      it('should call onTogglePeople', () => {
        renderWithProviders(<StreamingControls isStreamer={true} onToggleChat={mockOnToggleChat} onTogglePeople={mockOnTogglePeople} />)

        const buttons = document.querySelectorAll('button')
        const peopleButton = buttons[5]

        fireEvent.click(peopleButton)
        expect(mockOnTogglePeople).toHaveBeenCalled()
      })
    })

    describe('and the end stream button is clicked', () => {
      it('should disconnect from the room', () => {
        renderWithProviders(<StreamingControls isStreamer={true} onToggleChat={mockOnToggleChat} onTogglePeople={mockOnTogglePeople} />)
        const endStreamButton = screen.getByText(/end streaming/i)

        fireEvent.click(endStreamButton)
        expect(mockDisconnect).toHaveBeenCalled()
      })
    })

    describe('and there are remote participants', () => {
      beforeEach(() => {
        mockUseRemoteParticipants.mockReturnValue([{ identity: 'user1' }, { identity: 'user2' }])
      })

      it('should display the participant count badge', () => {
        renderWithProviders(<StreamingControls isStreamer={true} onToggleChat={mockOnToggleChat} onTogglePeople={mockOnTogglePeople} />)

        expect(screen.getByText('3')).toBeInTheDocument()
      })
    })
  })

  describe('when in watcher mode', () => {
    it('should only render leave button', () => {
      renderWithProviders(<StreamingControls isStreamer={false} />)

      expect(screen.getByText(/leave/i)).toBeInTheDocument()
      const buttons = document.querySelectorAll('button')
      expect(buttons.length).toBe(1)
    })

    describe('and the leave button is clicked', () => {
      it('should disconnect from the room', () => {
        renderWithProviders(<StreamingControls isStreamer={false} />)
        const leaveButton = screen.getByText(/leave/i)

        fireEvent.click(leaveButton)
        expect(mockDisconnect).toHaveBeenCalled()
      })
    })
  })

  describe('when disconnected', () => {
    beforeEach(() => {
      mockUseConnectionState.mockReturnValue(ConnectionState.Disconnected)
    })

    it('should show reconnect button', () => {
      renderWithProviders(<StreamingControls isStreamer={true} />)

      expect(screen.getByText(/reconnect/i)).toBeInTheDocument()
      expect(screen.queryByText(/end streaming/i)).not.toBeInTheDocument()
    })

    describe('and the reconnect button is clicked', () => {
      it('should reconnect to the room', () => {
        renderWithProviders(<StreamingControls isStreamer={true} />)

        const reconnectButton = screen.getByText(/reconnect/i)
        fireEvent.click(reconnectButton)

        expect(mockConnect).toHaveBeenCalledWith('ws://mock-url', 'mock-token')
      })
    })
  })
})
