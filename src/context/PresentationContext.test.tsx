import React from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import type { PresentationInfo } from '../utils/api'
import { PresentationProvider, usePresentation } from './PresentationContext'

jest.mock('@livekit/components-react', () => ({
  useRemoteParticipants: jest.fn(),
  useRoomContext: jest.fn()
}))

jest.mock('../utils/api', () => ({
  getPresentationBotToken: jest.fn(),
  uploadPresentation: jest.fn(),
  uploadPresentationFromUrl: jest.fn()
}))

jest.mock('../utils/localStorage', () => ({
  getStreamerToken: jest.fn()
}))

const mockUseRemoteParticipants = jest.requireMock('@livekit/components-react').useRemoteParticipants
const mockUseRoomContext = jest.requireMock('@livekit/components-react').useRoomContext
const mockGetPresentationBotToken = jest.requireMock('../utils/api').getPresentationBotToken
const mockUploadPresentation = jest.requireMock('../utils/api').uploadPresentation
const mockGetStreamerToken = jest.requireMock('../utils/localStorage').getStreamerToken

const STREAMING_KEY = 'test-streaming-key'
const BOT_TOKEN = { url: 'wss://livekit.example', token: 'bot-token', roomId: 'room-1' }
const UPLOAD_INFO: PresentationInfo = { id: 'pres-1', slideCount: 5, currentSlide: 0, fileType: 'pdf' }

function makeBotParticipant(metadata: Record<string, unknown>) {
  return { identity: 'presentation-bot-1', metadata: JSON.stringify(metadata) }
}

// Minimal Room stub that captures the data-channel handler so tests can
// simulate bot → client messages, and records publishData for outbound checks.
function createRoomStub() {
  const listeners = new Map<string, Array<(...args: unknown[]) => void>>()
  return {
    localParticipant: {
      publishData: jest.fn().mockResolvedValue(undefined)
    },
    on: jest.fn((event: string, cb: (...args: unknown[]) => void) => {
      const arr = listeners.get(event) ?? []
      arr.push(cb)
      listeners.set(event, arr)
    }),
    off: jest.fn((event: string, cb: (...args: unknown[]) => void) => {
      const arr = listeners.get(event) ?? []
      listeners.set(
        event,
        arr.filter(fn => fn !== cb)
      )
    }),
    emit(event: string, ...args: unknown[]) {
      const arr = listeners.get(event) ?? []
      arr.forEach(cb => cb(...args))
    }
  }
}

type ProbeApi = {
  ctx: ReturnType<typeof usePresentation>
}

function Probe({ onReady }: { onReady: (api: ProbeApi) => void }) {
  const ctx = usePresentation()
  React.useEffect(() => {
    onReady({ ctx })
  })
  return <div data-testid="status">{ctx.state.status}</div>
}

function renderWithProvider(onReady: (api: ProbeApi) => void) {
  return render(
    <PresentationProvider>
      <Probe onReady={onReady} />
    </PresentationProvider>
  )
}

describe('PresentationContext', () => {
  let room: ReturnType<typeof createRoomStub>
  let latestApi: ProbeApi | null

  beforeEach(() => {
    room = createRoomStub()
    latestApi = null
    mockUseRoomContext.mockReturnValue(room)
    mockUseRemoteParticipants.mockReturnValue([])
    mockGetStreamerToken.mockReturnValue(STREAMING_KEY)
    mockGetPresentationBotToken.mockResolvedValue(BOT_TOKEN)
    mockUploadPresentation.mockResolvedValue(UPLOAD_INFO)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('when the provider mounts with no bot present', () => {
    it('should expose the initial idle state', () => {
      renderWithProvider(api => {
        latestApi = api
      })

      expect(screen.getByTestId('status').textContent).toBe('idle')
      expect(latestApi?.ctx.state.id).toBeNull()
      expect(latestApi?.ctx.isPresentationActive).toBe(false)
    })
  })

  describe('when startPresentation resolves successfully', () => {
    it('should transition status to starting with the returned presentation info', async () => {
      renderWithProvider(api => {
        latestApi = api
      })

      await act(async () => {
        await latestApi!.ctx.startPresentation(new File(['x'], 'slides.pdf'))
      })

      expect(screen.getByTestId('status').textContent).toBe('starting')
      expect(latestApi?.ctx.state.id).toBe(UPLOAD_INFO.id)
      expect(latestApi?.ctx.state.slideCount).toBe(UPLOAD_INFO.slideCount)
      expect(latestApi?.ctx.isPresentationActive).toBe(true)
    })
  })

  describe('when startPresentation fails', () => {
    beforeEach(() => {
      mockUploadPresentation.mockRejectedValueOnce(new Error('upload blew up'))
    })

    it('should transition status to error and expose the error message', async () => {
      renderWithProvider(api => {
        latestApi = api
      })

      await act(async () => {
        await latestApi!.ctx.startPresentation(new File(['x'], 'slides.pdf'))
      })

      expect(screen.getByTestId('status').textContent).toBe('error')
      expect(latestApi?.ctx.state.error).toBe('upload blew up')
    })

    describe('and dismissError is called', () => {
      it('should reset status back to idle', async () => {
        renderWithProvider(api => {
          latestApi = api
        })

        await act(async () => {
          await latestApi!.ctx.startPresentation(new File(['x'], 'slides.pdf'))
        })
        expect(screen.getByTestId('status').textContent).toBe('error')

        act(() => {
          latestApi!.ctx.dismissError()
        })

        expect(screen.getByTestId('status').textContent).toBe('idle')
        expect(latestApi?.ctx.state.error).toBeNull()
      })
    })
  })

  describe('when startPresentation is invoked twice concurrently', () => {
    it('should only run one upload (ref-based mutex drops the second call)', async () => {
      // Make the first upload hang so we can fire the second before it resolves.
      let resolveFirst!: (info: PresentationInfo) => void
      mockUploadPresentation.mockReturnValueOnce(
        new Promise(res => {
          resolveFirst = res
        })
      )

      renderWithProvider(api => {
        latestApi = api
      })

      await act(async () => {
        // Fire both calls in the same act scope. The first awaits the hanging
        // upload; the second sees the mutex set and returns immediately. We
        // resolve + await everything inside this act to avoid interleaving.
        const first = latestApi!.ctx.startPresentation(new File(['a'], 'a.pdf'))
        const second = latestApi!.ctx.startPresentation(new File(['b'], 'b.pdf'))
        await second
        resolveFirst(UPLOAD_INFO)
        await first
      })

      expect(mockUploadPresentation).toHaveBeenCalledTimes(1)
    })
  })

  describe('when the bot participant appears in the room while status is starting', () => {
    it('should transition status from starting to active', async () => {
      const makeTree = (key: number) => (
        <PresentationProvider key={key}>
          <Probe
            onReady={api => {
              latestApi = api
            }}
          />
        </PresentationProvider>
      )
      const { rerender } = render(makeTree(0))

      await act(async () => {
        await latestApi!.ctx.startPresentation(new File(['x'], 'slides.pdf'))
      })
      expect(screen.getByTestId('status').textContent).toBe('starting')

      // Simulate bot joining. We rerender with a different key to defeat React's
      // element-identity short-circuit so the provider's hooks re-evaluate and
      // pick up the updated useRemoteParticipants mock.
      // NOTE: a new key remounts the provider, which resets state to 'idle'.
      // To verify the metadata-sync transition without a remount, we instead
      // trigger an in-tree render by dispatching a benign setState via the
      // ref-captured api — useRemoteParticipants is re-read on that render.
      mockUseRemoteParticipants.mockReturnValue([
        makeBotParticipant({
          role: 'presentation',
          id: UPLOAD_INFO.id,
          slideCount: UPLOAD_INFO.slideCount,
          currentSlide: 0,
          fileType: 'pdf'
        })
      ])

      await act(async () => {
        rerender(makeTree(0))
      })

      await waitFor(() => expect(latestApi?.ctx.state.status).toBe('active'))
      expect(latestApi?.ctx.presentationParticipantIdentity).toBe('presentation-bot-1')
    })
  })

  describe('when the bot participant disappears while status is active', () => {
    it('should reset state back to idle', async () => {
      // Prime the provider with a bot already present.
      mockUseRemoteParticipants.mockReturnValue([
        makeBotParticipant({
          role: 'presentation',
          id: UPLOAD_INFO.id,
          slideCount: UPLOAD_INFO.slideCount,
          currentSlide: 0,
          fileType: 'pdf'
        })
      ])
      const { rerender } = render(
        <PresentationProvider>
          <Probe
            onReady={api => {
              latestApi = api
            }}
          />
        </PresentationProvider>
      )

      await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('active'))

      // Bot leaves the room.
      mockUseRemoteParticipants.mockReturnValue([])
      rerender(
        <PresentationProvider>
          <Probe
            onReady={api => {
              latestApi = api
            }}
          />
        </PresentationProvider>
      )

      await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('idle'))
    })
  })
})
