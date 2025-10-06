import React from 'react'
import { render, screen } from '@testing-library/react'
import { RoomStats } from './RoomStats'
import { TranslationProvider } from '../../modules/translation'

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
  describe('when rendered', () => {
    beforeEach(() => {
      mockUseConnectionState.mockReturnValue('connected')
      mockUseLocalParticipant.mockReturnValue({
        localParticipant: {
          connectionQuality: 'excellent'
        }
      })
      mockUseRemoteParticipants.mockReturnValue([])
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should render room stats container with connection info', () => {
      renderWithTranslation(<RoomStats isStreamer={true} />)

      expect(screen.getByText(/connection/i)).toBeInTheDocument()
      expect(screen.getByText(/quality/i)).toBeInTheDocument()
    })
  })

  describe('when isStreamer is true', () => {
    beforeEach(() => {
      mockUseConnectionState.mockReturnValue('connected')
      mockUseLocalParticipant.mockReturnValue({
        localParticipant: {
          connectionQuality: 'excellent'
        }
      })
      mockUseRemoteParticipants.mockReturnValue([])
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should show "People" label', () => {
      renderWithTranslation(<RoomStats isStreamer={true} />)

      expect(screen.getByText(/people/i)).toBeInTheDocument()
    })

    describe('and there are 2 remote participants', () => {
      beforeEach(() => {
        mockUseRemoteParticipants.mockReturnValue([{ identity: 'viewer1' }, { identity: 'viewer2' }])
      })

      it('should display correct participant count', () => {
        renderWithTranslation(<RoomStats isStreamer={true} />)

        expect(screen.getByText('2')).toBeInTheDocument()
      })
    })
  })

  describe('when isStreamer is false', () => {
    beforeEach(() => {
      mockUseConnectionState.mockReturnValue('connected')
      mockUseLocalParticipant.mockReturnValue({
        localParticipant: {
          connectionQuality: 'excellent'
        }
      })
      mockUseRemoteParticipants.mockReturnValue([])
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should show "Viewers" label', () => {
      renderWithTranslation(<RoomStats isStreamer={false} />)

      expect(screen.getByText(/viewers/i)).toBeInTheDocument()
    })

    describe('and there is 1 remote participant', () => {
      beforeEach(() => {
        mockUseRemoteParticipants.mockReturnValue([{ identity: 'viewer1' }])
      })

      it('should display correct viewer count', () => {
        renderWithTranslation(<RoomStats isStreamer={false} />)

        expect(screen.getByText('1')).toBeInTheDocument()
      })
    })
  })

  describe('when connection state is connected', () => {
    beforeEach(() => {
      mockUseConnectionState.mockReturnValue('connected')
      mockUseLocalParticipant.mockReturnValue({
        localParticipant: {
          connectionQuality: 'excellent'
        }
      })
      mockUseRemoteParticipants.mockReturnValue([])
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should show connected state', () => {
      renderWithTranslation(<RoomStats isStreamer={true} />)

      expect(screen.getByText(/connected/i)).toBeInTheDocument()
    })
  })

  describe('when connection state is connecting', () => {
    beforeEach(() => {
      mockUseConnectionState.mockReturnValue('connecting')
      mockUseLocalParticipant.mockReturnValue({
        localParticipant: {
          connectionQuality: 'excellent'
        }
      })
      mockUseRemoteParticipants.mockReturnValue([])
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should show connecting state', () => {
      renderWithTranslation(<RoomStats isStreamer={true} />)

      expect(screen.getByText(/connecting/i)).toBeInTheDocument()
    })
  })

  describe('when connection state is disconnected', () => {
    beforeEach(() => {
      mockUseConnectionState.mockReturnValue('disconnected')
      mockUseLocalParticipant.mockReturnValue({
        localParticipant: {
          connectionQuality: 'excellent'
        }
      })
      mockUseRemoteParticipants.mockReturnValue([])
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should show disconnected state', () => {
      renderWithTranslation(<RoomStats isStreamer={true} />)

      expect(screen.getByText(/disconnected/i)).toBeInTheDocument()
    })
  })

  describe('when connection quality is excellent', () => {
    beforeEach(() => {
      mockUseConnectionState.mockReturnValue('connected')
      mockUseLocalParticipant.mockReturnValue({
        localParticipant: {
          connectionQuality: 'excellent'
        }
      })
      mockUseRemoteParticipants.mockReturnValue([])
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should show excellent quality', () => {
      renderWithTranslation(<RoomStats isStreamer={true} />)

      expect(screen.getByText(/excellent/i)).toBeInTheDocument()
    })
  })

  describe('when connection quality is good', () => {
    beforeEach(() => {
      mockUseConnectionState.mockReturnValue('connected')
      mockUseLocalParticipant.mockReturnValue({
        localParticipant: {
          connectionQuality: 'good'
        }
      })
      mockUseRemoteParticipants.mockReturnValue([])
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should show good quality', () => {
      renderWithTranslation(<RoomStats isStreamer={true} />)

      expect(screen.getByText(/good/i)).toBeInTheDocument()
    })
  })

  describe('when connection quality is poor', () => {
    beforeEach(() => {
      mockUseConnectionState.mockReturnValue('connected')
      mockUseLocalParticipant.mockReturnValue({
        localParticipant: {
          connectionQuality: 'poor'
        }
      })
      mockUseRemoteParticipants.mockReturnValue([])
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should show poor quality', () => {
      renderWithTranslation(<RoomStats isStreamer={true} />)

      expect(screen.getByText(/poor/i)).toBeInTheDocument()
    })
  })

  describe('when connection quality is not available', () => {
    beforeEach(() => {
      mockUseConnectionState.mockReturnValue('connected')
      mockUseLocalParticipant.mockReturnValue({
        localParticipant: {
          connectionQuality: undefined
        }
      })
      mockUseRemoteParticipants.mockReturnValue([])
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should show unknown quality', () => {
      renderWithTranslation(<RoomStats isStreamer={true} />)

      expect(screen.getByText(/unknown/i)).toBeInTheDocument()
    })
  })
})
