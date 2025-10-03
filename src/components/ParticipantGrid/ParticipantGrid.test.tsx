import React from 'react'
import { render, screen } from '@testing-library/react'
import { ParticipantGrid } from './ParticipantGrid'
import { TranslationProvider } from '../../modules/translation'

jest.mock('../LiveKitEnhancements/SpeakingIndicator', () => ({
  SpeakingIndicator: () => <div data-testid="speaking-indicator" />
}))

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
  describe('when there are no tracks', () => {
    beforeEach(() => {
      mockUseTracks.mockReturnValue([])
      mockUseIsSpeaking.mockReturnValue(false)
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    describe('and local participant is visible', () => {
      it('should show empty state with no video streams message', () => {
        renderWithTranslation(<ParticipantGrid localParticipantVisible={true} />)

        expect(screen.getByText(/no video streams/i)).toBeInTheDocument()
      })
    })

    describe('and local participant is not visible', () => {
      it('should show watcher message', () => {
        renderWithTranslation(<ParticipantGrid localParticipantVisible={false} />)

        expect(screen.getByText(/waiting/i)).toBeInTheDocument()
      })
    })
  })

  describe('when there is one track available', () => {
    beforeEach(() => {
      const mockTracks = [
        {
          participant: { sid: 'p1', identity: 'streamer', isLocal: true },
          publication: { track: {}, source: 'camera' },
          source: 'camera'
        }
      ]
      mockUseTracks.mockReturnValue(mockTracks)
      mockUseIsSpeaking.mockReturnValue(false)
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should render video track', () => {
      renderWithTranslation(<ParticipantGrid localParticipantVisible={true} />)

      expect(screen.getByTestId('video-track')).toBeInTheDocument()
    })
  })

  describe('when local participant is not visible', () => {
    beforeEach(() => {
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
      mockUseIsSpeaking.mockReturnValue(false)
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should filter out local participant', () => {
      renderWithTranslation(<ParticipantGrid localParticipantVisible={false} />)

      const videoTracks = screen.getAllByTestId('video-track')
      expect(videoTracks).toHaveLength(1)
      expect(videoTracks[0]).toHaveTextContent('viewer')
    })
  })

  describe('when there are tracks without publications', () => {
    beforeEach(() => {
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
      mockUseIsSpeaking.mockReturnValue(false)
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should filter out tracks without publications', () => {
      renderWithTranslation(<ParticipantGrid localParticipantVisible={true} />)

      const videoTracks = screen.getAllByTestId('video-track')
      expect(videoTracks).toHaveLength(1)
      expect(videoTracks[0]).toHaveTextContent('viewer')
    })
  })

  describe('when there are multiple participants', () => {
    beforeEach(() => {
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
      mockUseIsSpeaking.mockReturnValue(false)
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should render all participants', () => {
      renderWithTranslation(<ParticipantGrid localParticipantVisible={false} />)

      const videoTracks = screen.getAllByTestId('video-track')
      expect(videoTracks).toHaveLength(3)
    })
  })

  describe('when a participant is speaking', () => {
    beforeEach(() => {
      const mockTracks = [
        {
          participant: { sid: 'p1', identity: 'speaker', isLocal: false },
          publication: { track: {}, source: 'camera' },
          source: 'camera'
        }
      ]
      mockUseTracks.mockReturnValue(mockTracks)
      mockUseIsSpeaking.mockReturnValue(true)
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should render video track with speaking state', () => {
      renderWithTranslation(<ParticipantGrid localParticipantVisible={true} />)

      expect(screen.getByTestId('video-track')).toBeInTheDocument()
    })
  })
})
