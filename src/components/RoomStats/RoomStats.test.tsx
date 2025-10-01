import React from 'react'
import { render, screen } from '@testing-library/react'
import { RoomStats } from './RoomStats'
import { TranslationProvider } from '../../modules/translation'

// Mock LiveKit hooks
jest.mock('@livekit/components-react', () => ({
  useConnectionState: jest.fn(),
  useLocalParticipant: jest.fn(),
  useRemoteParticipants: jest.fn()
}))

const mockUseConnectionState = jest.requireMock('@livekit/components-react').useConnectionState
const mockUseLocalParticipant = jest.requireMock('@livekit/components-react').useLocalParticipant
const mockUseRemoteParticipants = jest.requireMock('@livekit/components-react').useRemoteParticipants

const renderWithTranslation = (component: React.ReactElement) => {
  return render(<TranslationProvider>{component}</TranslationProvider>)
}

describe('RoomStats', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseConnectionState.mockReturnValue('connected')
    mockUseLocalParticipant.mockReturnValue({
      localParticipant: {
        connectionQuality: 'excellent'
      }
    })
    mockUseRemoteParticipants.mockReturnValue([])
  })

  it('should render room stats container with connection info', () => {
    renderWithTranslation(<RoomStats isStreamer={true} />)

    // Check that connection info is rendered
    expect(screen.getByText(/connection/i)).toBeInTheDocument()
    expect(screen.getByText(/quality/i)).toBeInTheDocument()
  })

  it('should show "People" label for streamer', () => {
    renderWithTranslation(<RoomStats isStreamer={true} />)

    expect(screen.getByText(/people/i)).toBeInTheDocument()
  })

  it('should show "Viewers" label for watcher', () => {
    renderWithTranslation(<RoomStats isStreamer={false} />)

    expect(screen.getByText(/viewers/i)).toBeInTheDocument()
  })

  it('should display correct participant count for streamer', () => {
    // 2 remote participants
    mockUseRemoteParticipants.mockReturnValue([{ identity: 'viewer1' }, { identity: 'viewer2' }])

    renderWithTranslation(<RoomStats isStreamer={true} />)

    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('should display correct viewer count (excluding local)', () => {
    // 1 remote participant + local participant should show 1 viewer
    mockUseRemoteParticipants.mockReturnValue([{ identity: 'viewer1' }])

    renderWithTranslation(<RoomStats isStreamer={false} />)

    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('should show connection state', () => {
    mockUseConnectionState.mockReturnValue('connected')

    renderWithTranslation(<RoomStats isStreamer={true} />)

    expect(screen.getByText(/connected/i)).toBeInTheDocument()
  })

  it('should show connecting state', () => {
    mockUseConnectionState.mockReturnValue('connecting')

    renderWithTranslation(<RoomStats isStreamer={true} />)

    expect(screen.getByText(/connecting/i)).toBeInTheDocument()
  })

  it('should show disconnected state', () => {
    mockUseConnectionState.mockReturnValue('disconnected')

    renderWithTranslation(<RoomStats isStreamer={true} />)

    expect(screen.getByText(/disconnected/i)).toBeInTheDocument()
  })

  it('should show connection quality', () => {
    mockUseLocalParticipant.mockReturnValue({
      localParticipant: {
        connectionQuality: 'excellent'
      }
    })

    renderWithTranslation(<RoomStats isStreamer={true} />)

    expect(screen.getByText(/excellent/i)).toBeInTheDocument()
  })

  it('should show good quality', () => {
    mockUseLocalParticipant.mockReturnValue({
      localParticipant: {
        connectionQuality: 'good'
      }
    })

    renderWithTranslation(<RoomStats isStreamer={true} />)

    expect(screen.getByText(/good/i)).toBeInTheDocument()
  })

  it('should show poor quality', () => {
    mockUseLocalParticipant.mockReturnValue({
      localParticipant: {
        connectionQuality: 'poor'
      }
    })

    renderWithTranslation(<RoomStats isStreamer={true} />)

    expect(screen.getByText(/poor/i)).toBeInTheDocument()
  })

  it('should show unknown quality when not available', () => {
    mockUseLocalParticipant.mockReturnValue({
      localParticipant: {
        connectionQuality: undefined
      }
    })

    renderWithTranslation(<RoomStats isStreamer={true} />)

    expect(screen.getByText(/unknown/i)).toBeInTheDocument()
  })
})
