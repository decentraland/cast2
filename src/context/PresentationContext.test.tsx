import React from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import { RoomEvent } from 'livekit-client'
import type { PresentationInfo } from '../utils/api'
import { TranslationProvider } from '../modules/translation'
import { encodeCommsPacket } from '../utils/commsProtocol'
import { NotificationProvider, useNotifications } from './NotificationContext'
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
  notifications: ReturnType<typeof useNotifications>
}

function Probe({ onReady }: { onReady: (api: ProbeApi) => void }) {
  const ctx = usePresentation()
  const notifications = useNotifications()
  React.useEffect(() => {
    onReady({ ctx, notifications })
  })
  return <div data-testid="status">{ctx.state.status}</div>
}

function renderWithProvider(onReady: (api: ProbeApi) => void) {
  return render(
    <TranslationProvider>
      <NotificationProvider>
        <PresentationProvider>
          <Probe onReady={onReady} />
        </PresentationProvider>
      </NotificationProvider>
    </TranslationProvider>
  )
}

function emitFromBot(room: ReturnType<typeof createRoomStub>, message: unknown) {
  const payload = encodeCommsPacket('presentation', message)
  room.emit(RoomEvent.DataReceived, payload, {
    identity: 'presentation-bot-1',
    metadata: JSON.stringify({ role: 'presentation' })
  })
}

function emitFromImposter(room: ReturnType<typeof createRoomStub>, message: unknown) {
  const payload = encodeCommsPacket('presentation', message)
  room.emit(RoomEvent.DataReceived, payload, {
    identity: 'evil-user',
    metadata: JSON.stringify({ role: 'streamer' })
  })
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

    it('should reset status to idle and let the persistent toast carry the error', async () => {
      renderWithProvider(api => {
        latestApi = api
      })

      await act(async () => {
        await latestApi!.ctx.startPresentation(new File(['x'], 'slides.pdf'))
      })

      // Status returns to idle so the user can retry immediately.
      expect(screen.getByTestId('status').textContent).toBe('idle')
      // The toast carries the error message; it's marked persistent so the
      // user gets time to read it.
      const fired = latestApi!.notifications.notifications
      expect(fired).toHaveLength(1)
      expect(fired[0]).toMatchObject({
        variant: 'PresentationDownloadFailed',
        message: 'upload blew up',
        persistent: true
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
        <TranslationProvider key={key}>
          <NotificationProvider>
            <PresentationProvider>
              <Probe
                onReady={api => {
                  latestApi = api
                }}
              />
            </PresentationProvider>
          </NotificationProvider>
        </TranslationProvider>
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

  describe('toast notifications for upload + video errors', () => {
    it('fires a PresentationDownloadFailed toast when the upload throws', async () => {
      mockUploadPresentation.mockRejectedValueOnce(new Error('URL not publicly accessible'))

      renderWithProvider(api => {
        latestApi = api
      })

      await act(async () => {
        await latestApi!.ctx.startPresentation(new File(['x'], 'slides.pdf'))
      })

      const fired = latestApi!.notifications.notifications
      expect(fired).toHaveLength(1)
      expect(fired[0]).toMatchObject({
        variant: 'PresentationDownloadFailed',
        message: 'URL not publicly accessible'
      })
    })

    it('fires a VideoPlaybackFailed toast when a presentation:error event arrives over the data channel', async () => {
      // Prime an active presentation so playVideo (used by the action) is callable.
      mockUseRemoteParticipants.mockReturnValue([
        makeBotParticipant({ role: 'presentation', id: 'pres-1', slideCount: 5, currentSlide: 0, fileType: 'pdf' })
      ])
      renderWithProvider(api => {
        latestApi = api
      })
      await waitFor(() => expect(latestApi?.ctx.state.status).toBe('active'))

      act(() => {
        emitFromBot(room, {
          type: 'presentation:error',
          code: 'video-invalid-format',
          message: "We couldn't play that video. The URL points to a Google Drive preview page.",
          videoIndex: 2,
          videoUrl: 'https://drive.google.com/file/d/x/preview'
        })
      })

      const fired = latestApi!.notifications.notifications
      expect(fired).toHaveLength(1)
      expect(fired[0]).toMatchObject({
        variant: 'VideoPlaybackFailed',
        code: 'video-invalid-format',
        message: "We couldn't play that video. The URL points to a Google Drive preview page."
      })
      // Non-retryable code → no Retry action.
      expect(fired[0].action).toBeUndefined()
    })

    it('attaches a Retry action only when the video error code is retryable', async () => {
      mockUseRemoteParticipants.mockReturnValue([
        makeBotParticipant({ role: 'presentation', id: 'pres-1', slideCount: 5, currentSlide: 0, fileType: 'pdf' })
      ])
      renderWithProvider(api => {
        latestApi = api
      })
      await waitFor(() => expect(latestApi?.ctx.state.status).toBe('active'))

      act(() => {
        emitFromBot(room, {
          type: 'presentation:error',
          code: 'video-timeout',
          message: 'Timed out fetching the video.',
          videoIndex: 3
        })
      })

      const fired = latestApi!.notifications.notifications
      expect(fired).toHaveLength(1)
      expect(fired[0].action).toBeDefined()

      // Invoking the action should issue a play command for the failed video index.
      await act(async () => {
        fired[0].action!.onClick()
      })
      expect(room.localParticipant.publishData).toHaveBeenCalledTimes(1)
    })

    it('omits the Retry action when videoIndex is missing, even on a retryable code', async () => {
      mockUseRemoteParticipants.mockReturnValue([
        makeBotParticipant({ role: 'presentation', id: 'pres-1', slideCount: 5, currentSlide: 0, fileType: 'pdf' })
      ])
      renderWithProvider(api => {
        latestApi = api
      })
      await waitFor(() => expect(latestApi?.ctx.state.status).toBe('active'))

      act(() => {
        emitFromBot(room, {
          type: 'presentation:error',
          code: 'video-stream-error',
          message: 'Stream died mid-playback.'
        })
      })

      expect(latestApi!.notifications.notifications[0].action).toBeUndefined()
    })

    it('rejects a presentation:error packet from a non-bot sender (spoofing protection)', async () => {
      mockUseRemoteParticipants.mockReturnValue([
        makeBotParticipant({ role: 'presentation', id: 'pres-1', slideCount: 5, currentSlide: 0, fileType: 'pdf' })
      ])
      renderWithProvider(api => {
        latestApi = api
      })
      await waitFor(() => expect(latestApi?.ctx.state.status).toBe('active'))

      act(() => {
        emitFromImposter(room, {
          type: 'presentation:error',
          code: 'video-permission-denied',
          message: 'spoofed message'
        })
      })

      expect(latestApi!.notifications.notifications).toHaveLength(0)
    })

    it('ignores a presentation:error packet missing required fields', async () => {
      mockUseRemoteParticipants.mockReturnValue([
        makeBotParticipant({ role: 'presentation', id: 'pres-1', slideCount: 5, currentSlide: 0, fileType: 'pdf' })
      ])
      renderWithProvider(api => {
        latestApi = api
      })
      await waitFor(() => expect(latestApi?.ctx.state.status).toBe('active'))

      act(() => {
        // Missing `message`.
        emitFromBot(room, { type: 'presentation:error', code: 'video-timeout' })
      })

      expect(latestApi!.notifications.notifications).toHaveLength(0)
    })
  })

  describe('when presentation:state arrives before the upload POST resolves (race)', () => {
    it('should not revert active status back to starting when the late upload response lands', async () => {
      // Bot is already in the room (matches what we see with a fast local backend
      // that publishes state before its own HTTP response returns). This keeps
      // the bot-absence cleanup effect from firing and masking the race.
      mockUseRemoteParticipants.mockReturnValue([makeBotParticipant({ role: 'presentation' })])

      // Hang the upload so we can inject a data-channel presentation:state
      // before the HTTP response resolves, reproducing the local-backend race.
      let resolveUpload!: (info: PresentationInfo) => void
      mockUploadPresentation.mockReturnValueOnce(
        new Promise<PresentationInfo>(res => {
          resolveUpload = res
        })
      )

      renderWithProvider(api => {
        latestApi = api
      })

      let uploadCall!: Promise<void>
      act(() => {
        uploadCall = latestApi!.ctx.startPresentation(new File(['x'], 'slides.pdf'))
      })
      await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('uploading'))

      // Bot broadcasts presentation:state while the POST is still in flight.
      act(() => {
        emitFromBot(room, {
          type: 'presentation:state',
          id: UPLOAD_INFO.id,
          slideCount: UPLOAD_INFO.slideCount,
          currentSlide: 0,
          fileType: 'pdf'
        })
      })
      expect(screen.getByTestId('status').textContent).toBe('active')

      // Now the POST resolves late. This MUST NOT overwrite 'active' with 'starting'.
      await act(async () => {
        resolveUpload(UPLOAD_INFO)
        await uploadCall
      })

      expect(screen.getByTestId('status').textContent).toBe('active')
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
      const buildTree = () => (
        <TranslationProvider>
          <NotificationProvider>
            <PresentationProvider>
              <Probe
                onReady={api => {
                  latestApi = api
                }}
              />
            </PresentationProvider>
          </NotificationProvider>
        </TranslationProvider>
      )
      const { rerender } = render(buildTree())

      await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('active'))

      // Bot leaves the room.
      mockUseRemoteParticipants.mockReturnValue([])
      rerender(buildTree())

      await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('idle'))
    })
  })
})
