import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ConnectionState, LocalParticipant, Room, Track } from 'livekit-client'
import { StreamingControls } from './StreamingControls'
import { TranslationProvider } from '../../modules/translation'

jest.mock('@livekit/components-react')
jest.mock('../../context/LiveKitContext')

Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    enumerateDevices: jest.fn().mockResolvedValue([]),
    getDisplayMedia: jest.fn().mockResolvedValue({}),
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
      setCredentials: jest.fn(),
      streamMetadata: null,
      setStreamMetadata: jest.fn()
    })
    mockUseRemoteParticipants.mockReturnValue([])
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('when in streamer mode', () => {
    describe('and the microphone button is clicked', () => {
      it('should toggle microphone', async () => {
        renderWithProviders(<StreamingControls isStreamer={true} />)

        // Find microphone button by MicOffIcon (use getAllByTestId as there are desktop and mobile versions)
        const micButton = screen.getAllByTestId('MicOffIcon')[0].closest('button')

        fireEvent.click(micButton!)

        await waitFor(() => {
          expect(mockSetMicrophoneEnabled).toHaveBeenCalled()
        })
      })
    })

    describe('and the camera button is clicked', () => {
      it('should toggle camera', async () => {
        renderWithProviders(<StreamingControls isStreamer={true} />)

        // Find camera button by VideocamOffIcon (use getAllByTestId as there are desktop and mobile versions)
        const cameraButton = screen.getAllByTestId('VideocamOffIcon')[0].closest('button')

        fireEvent.click(cameraButton!)

        await waitFor(() => {
          expect(mockSetCameraEnabled).toHaveBeenCalled()
        })
      })
    })

    describe('and the screen share button is clicked', () => {
      it('should enable screen sharing', async () => {
        renderWithProviders(<StreamingControls isStreamer={true} onToggleChat={mockOnToggleChat} onTogglePeople={mockOnTogglePeople} />)

        // Find screen share button by ScreenShareIcon (use getAllByTestId as there are desktop and mobile versions)
        const screenShareButton = screen.getAllByTestId('ScreenShareIcon')[0].closest('button')

        fireEvent.click(screenShareButton!)

        await waitFor(() => {
          expect(mockSetScreenShareEnabled).toHaveBeenCalledWith(true)
        })
      })
    })

    describe('and the chat button is clicked', () => {
      it('should call onToggleChat', () => {
        renderWithProviders(<StreamingControls isStreamer={true} onToggleChat={mockOnToggleChat} onTogglePeople={mockOnTogglePeople} />)

        // Find chat button by ChatBubbleOutlineIcon (there are multiple, get the first one)
        const chatButtons = screen.getAllByTestId('ChatBubbleOutlineIcon')
        const chatButton = chatButtons[0].closest('button')

        fireEvent.click(chatButton!)
        expect(mockOnToggleChat).toHaveBeenCalled()
      })
    })

    describe('and the people button is clicked', () => {
      it('should call onTogglePeople', () => {
        renderWithProviders(<StreamingControls isStreamer={true} onToggleChat={mockOnToggleChat} onTogglePeople={mockOnTogglePeople} />)

        // Find people button by PeopleIcon (there are multiple, get the first one)
        const peopleButtons = screen.getAllByTestId('PeopleIcon')
        const peopleButton = peopleButtons[0].closest('button')

        fireEvent.click(peopleButton!)
        expect(mockOnTogglePeople).toHaveBeenCalled()
      })
    })

    describe('and the leave stream button is clicked', () => {
      it('should disconnect from the room', async () => {
        renderWithProviders(<StreamingControls isStreamer={true} />)

        const leaveButton = screen.getByText(/leave stream/i)

        fireEvent.click(leaveButton!)

        await waitFor(() => {
          expect(mockDisconnect).toHaveBeenCalled()
        })
      })
    })
  })

  describe('when in watcher mode', () => {
    it('should render leave button', () => {
      renderWithProviders(<StreamingControls isStreamer={false} />)

      // Get all CallEndIcon instances (desktop + mobile)
      const leaveIcons = screen.getAllByTestId('CallEndIcon')
      expect(leaveIcons.length).toBeGreaterThan(0)

      // Watcher mode should NOT show mic/camera/screen share controls
      expect(screen.queryByTestId('MicIcon')).not.toBeInTheDocument()
      expect(screen.queryByTestId('MicOffIcon')).not.toBeInTheDocument()
      expect(screen.queryByTestId('VideocamIcon')).not.toBeInTheDocument()
      expect(screen.queryByTestId('VideocamOffIcon')).not.toBeInTheDocument()
      expect(screen.queryByTestId('ScreenShareIcon')).not.toBeInTheDocument()
    })

    describe('and the leave button is clicked', () => {
      it('should disconnect from the room', () => {
        renderWithProviders(<StreamingControls isStreamer={false} />)

        // Get all CallEndIcon instances (desktop + mobile) and click the first one
        const leaveButtons = screen.getAllByTestId('CallEndIcon')
        const leaveButton = leaveButtons[0].closest('button')

        fireEvent.click(leaveButton!)
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
    })

    it('should not show disconnect button', () => {
      renderWithProviders(<StreamingControls isStreamer={true} />)

      expect(screen.queryByText(/leave stream/i)).not.toBeInTheDocument()
    })
  })
})
