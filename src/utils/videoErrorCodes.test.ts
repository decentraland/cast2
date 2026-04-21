import { isRetryableVideoErrorCode } from './videoErrorCodes'

describe('isRetryableVideoErrorCode', () => {
  // Codes the backend defines as transient — worth offering a Retry button.
  const RETRYABLE = [
    'video-timeout',
    'video-server-error',
    'video-playback-interrupted',
    'video-stream-error',
    'audio-processing-failed'
  ]

  // Codes that won't get better on retry (auth, bad input, quota).
  const NON_RETRYABLE = [
    'video-quota-exceeded',
    'video-permission-denied',
    'video-not-found',
    'video-too-large',
    'video-too-many-redirects',
    'video-invalid-format',
    'video-playback-failed'
  ]

  it.each(RETRYABLE)('returns true for retryable code %s', code => {
    expect(isRetryableVideoErrorCode(code)).toBe(true)
  })

  it.each(NON_RETRYABLE)('returns false for non-retryable code %s', code => {
    expect(isRetryableVideoErrorCode(code)).toBe(false)
  })

  it('returns false for an unknown code (forward-compat with new backend codes)', () => {
    expect(isRetryableVideoErrorCode('video-future-code-we-dont-know-yet')).toBe(false)
  })

  it('returns false for an empty string', () => {
    expect(isRetryableVideoErrorCode('')).toBe(false)
  })
})
