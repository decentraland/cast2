// Wire contract from cast-presenter-server: src/logic/presentation-manager/component.ts.
// Mirror the union verbatim so future code can branch on a known type, but treat
// unknown strings on the wire as opaque-passthrough — per backend spec, the
// `message` field is the source of truth for display and unknown codes must
// fall back to it.
type VideoErrorCode =
  // Presenter-initiated play failed
  | 'video-quota-exceeded'
  | 'video-permission-denied'
  | 'video-not-found'
  | 'video-server-error'
  | 'video-timeout'
  | 'video-too-large'
  | 'video-too-many-redirects'
  | 'video-invalid-format'
  | 'video-playback-failed'
  // Fired mid-stream
  | 'video-playback-interrupted'
  | 'video-stream-error'
  | 'audio-processing-failed'

const RETRYABLE_VIDEO_ERROR_CODES = new Set<string>([
  'video-timeout',
  'video-server-error',
  'video-playback-interrupted',
  'video-stream-error',
  'audio-processing-failed'
])

function isRetryableVideoErrorCode(code: string): boolean {
  return RETRYABLE_VIDEO_ERROR_CODES.has(code)
}

export { isRetryableVideoErrorCode }
export type { VideoErrorCode }
