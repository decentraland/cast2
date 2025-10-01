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
async function getStreamerToken(token: string): Promise<LiveKitCredentials> {
  const baseUrl = config.get('GATEKEEPER_URL')
  const response = await fetch(`${baseUrl}/cast/streamer-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ token })
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

/**
 * Upgrades anonymous user permissions after DCL login
 */
async function upgradeToAuthenticated(roomId: string, participantId: string, walletAddress: string, signature: string): Promise<void> {
  const baseUrl = config.get('GATEKEEPER_URL')
  const response = await fetch(`${baseUrl}/cast/upgrade-permissions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      roomId,
      participantId,
      walletAddress,
      signature
    })
  })

  if (!response.ok) {
    throw new CastApiError(response.status, `Failed to upgrade permissions: ${response.statusText}`)
  }
}

/**
 * Gets room info including participant count and active streams
 */
async function getRoomInfo(roomId: string) {
  const baseUrl = config.get('GATEKEEPER_URL')
  const response = await fetch(`${baseUrl}/cast/room-info/${roomId}`)

  if (!response.ok) {
    throw new CastApiError(response.status, `Failed to get room info: ${response.statusText}`)
  }

  return response.json()
}

export { CastApiError, getStreamerToken, getWatcherToken, upgradeToAuthenticated, getRoomInfo }
