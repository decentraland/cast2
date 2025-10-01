import React from 'react'
import { render, screen } from '@testing-library/react'
import { ParticipantGrid } from './ParticipantGrid'
import { TranslationProvider } from '../../modules/translation'

// Mock SpeakingIndicator to avoid useAudioWaveform issues
jest.mock('../LiveKitEnhancements/SpeakingIndicator', () => ({
  SpeakingIndicator: () => <div data-testid="speaking-indicator" />
}))

// Mock LiveKit hooks
jest.mock('@livekit/components-react', () => ({
  useTracks: jest.fn(),
  useIsSpeaking: jest.fn(),
  VideoTrack: ({ trackRef }: any) => <div data-testid="video-track">{trackRef?.participant?.identity}</div>
}))

const mockUseTracks = jest.requireMock('@livekit/components-react').useTracks
const mockUseIsSpeaking = jest.requireMock('@livekit/components-react').useIsSpeaking

const renderWithTranslation = (component: React.ReactElement) => {
  return render(<TranslationProvider>{component}</TranslationProvider>)
}

describe('ParticipantGrid', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseIsSpeaking.mockReturnValue(false)
  })

  it('should show empty state when no tracks', () => {
    mockUseTracks.mockReturnValue([])

    renderWithTranslation(<ParticipantGrid localParticipantVisible={true} />)

    expect(screen.getByText(/no video streams/i)).toBeInTheDocument()
  })

  it('should show watcher message when local participant not visible', () => {
    mockUseTracks.mockReturnValue([])

    renderWithTranslation(<ParticipantGrid localParticipantVisible={false} />)

    // Check for the watcher empty state message
    expect(screen.getByText(/waiting/i)).toBeInTheDocument()
  })

  it('should render video tracks when available', () => {
    const mockTracks = [
      {
        participant: { sid: 'p1', identity: 'streamer', isLocal: true },
        publication: { track: {}, source: 'camera' },
        source: 'camera'
      }
    ]

    mockUseTracks.mockReturnValue(mockTracks)

    renderWithTranslation(<ParticipantGrid localParticipantVisible={true} />)

    expect(screen.getByTestId('video-track')).toBeInTheDocument()
  })

  it('should filter out local participant when not visible', () => {
    const mockTracks = [
      {
        participant: { sid: 'p1', identity: 'streamer', isLocal: true },
        publication: { track: {}, source: 'camera' },
        source: 'camera'
      },
      {
        participant: { sid: 'p2', identity: 'viewer', isLocal: false },
        publication: { track: {}, source: 'camera' },
        source: 'camera'
      }
    ]

    mockUseTracks.mockReturnValue(mockTracks)

    renderWithTranslation(<ParticipantGrid localParticipantVisible={false} />)

    // Should only show remote participant
    const videoTracks = screen.getAllByTestId('video-track')
    expect(videoTracks).toHaveLength(1)
    expect(videoTracks[0]).toHaveTextContent('viewer')
  })

  it('should filter out tracks without publications', () => {
    const mockTracks = [
      {
        participant: { sid: 'p1', identity: 'streamer', isLocal: true },
        publication: undefined,
        source: 'camera'
      },
      {
        participant: { sid: 'p2', identity: 'viewer', isLocal: false },
        publication: { track: {}, source: 'camera' },
        source: 'camera'
      }
    ]

    mockUseTracks.mockReturnValue(mockTracks)

    renderWithTranslation(<ParticipantGrid localParticipantVisible={true} />)

    // Should only show participant with publication
    const videoTracks = screen.getAllByTestId('video-track')
    expect(videoTracks).toHaveLength(1)
    expect(videoTracks[0]).toHaveTextContent('viewer')
  })

  it('should render multiple participants', () => {
    const mockTracks = [
      {
        participant: { sid: 'p1', identity: 'user1', isLocal: false },
        publication: { track: {}, source: 'camera' },
        source: 'camera'
      },
      {
        participant: { sid: 'p2', identity: 'user2', isLocal: false },
        publication: { track: {}, source: 'camera' },
        source: 'camera'
      },
      {
        participant: { sid: 'p3', identity: 'user3', isLocal: false },
        publication: { track: {}, source: 'camera' },
        source: 'camera'
      }
    ]

    mockUseTracks.mockReturnValue(mockTracks)

    renderWithTranslation(<ParticipantGrid localParticipantVisible={false} />)

    const videoTracks = screen.getAllByTestId('video-track')
    expect(videoTracks).toHaveLength(3)
  })

  it('should apply speaking state to participant tile', () => {
    mockUseIsSpeaking.mockReturnValue(true)

    const mockTracks = [
      {
        participant: { sid: 'p1', identity: 'speaker', isLocal: false },
        publication: { track: {}, source: 'camera' },
        source: 'camera'
      }
    ]

    mockUseTracks.mockReturnValue(mockTracks)

    renderWithTranslation(<ParticipantGrid localParticipantVisible={true} />)

    expect(screen.getByTestId('video-track')).toBeInTheDocument()
  })
})
