import { config } from '../config'
import { LiveKitCredentials } from '../types'

class CastApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = 'CastApiError'
  }
}

/**
 * Fetches streamer token from gatekeeper
 */
async function getStreamerToken(token: string, identity?: string): Promise<LiveKitCredentials> {
  const baseUrl = config.get('GATEKEEPER_URL')
  const response = await fetch(`${baseUrl}/cast/streamer-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ token, identity })
  })

  if (!response.ok) {
    throw new CastApiError(response.status, `Failed to get streamer token: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Fetches watcher token for anonymous viewing
 */
async function getWatcherToken(roomId: string, identity?: string): Promise<LiveKitCredentials> {
  const baseUrl = config.get('GATEKEEPER_URL')
  const response = await fetch(`${baseUrl}/cast/watcher-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ roomId, identity })
  })

  if (!response.ok) {
    throw new CastApiError(response.status, `Failed to get watcher token: ${response.statusText}`)
  }

  return response.json()
}

export { CastApiError, getStreamerToken, getWatcherToken }
