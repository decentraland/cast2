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
 * @param token - The streaming token
 * @param identity - The identity/display name for the streamer (required)
 */
async function getStreamerToken(token: string, identity: string): Promise<LiveKitCredentials> {
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
 * Fetches watcher token for viewing
 * @param location - The location (parcel coordinates like "20,-4" or world name like "goerliplaza.dcl.eth")
 * @param identity - The identity/display name for the watcher (required)
 */
async function getWatcherToken(location: string, identity: string): Promise<LiveKitCredentials> {
  const baseUrl = config.get('GATEKEEPER_URL')
  const response = await fetch(`${baseUrl}/cast/watcher-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ location, identity })
  })

  if (!response.ok) {
    throw new CastApiError(response.status, `Failed to get watcher token: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Fetches stream info (place name, location, etc.) for a streaming key
 * @param streamingKey - The streaming key from the URL
 */
async function getStreamInfo(streamingKey: string): Promise<{ placeName: string; placeId: string; location: string; isWorld: boolean }> {
  const baseUrl = config.get('GATEKEEPER_URL')
  const response = await fetch(`${baseUrl}/cast/stream-info/${streamingKey}`, {
    method: 'GET'
  })

  if (!response.ok) {
    throw new CastApiError(response.status, `Failed to get stream info: ${response.statusText}`)
  }

  return response.json()
}

export { CastApiError, getStreamerToken, getWatcherToken, getStreamInfo }
