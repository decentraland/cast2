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

interface WorldSceneEntity {
  id: string
  type: string
  timestamp: number
  pointers: string[]
  metadata?: {
    display?: {
      title?: string
    }
    scene?: {
      base?: string
      parcels?: string[]
    }
  }
}

interface WorldScene {
  worldName: string
  entityId: string
  entity: WorldSceneEntity
  parcels: string[]
}

interface WorldScenesResponse {
  scenes: WorldScene[]
  total: number
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
 * @param parcel - The parcel coordinate for world streams (e.g. "1,4")
 */
async function getWatcherToken(location: string, identity: string, parcel?: string): Promise<LiveKitCredentials> {
  const baseUrl = config.get('GATEKEEPER_URL')
  const body: Record<string, string> = { location, identity }
  if (parcel) {
    body.parcel = parcel
  }
  const response = await fetch(`${baseUrl}/cast/watcher-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    let errorMessage = 'Unknown error'
    try {
      const errorBody = await response.json()
      if (errorBody.error) {
        errorMessage = errorBody.error
      }
    } catch {
      // Response wasn't JSON
    }
    throw new CastApiError(response.status, errorMessage)
  }

  return response.json()
}

/**
 * Fetches the list of scenes deployed in a world from the worlds content server
 */
async function getWorldScenes(worldName: string): Promise<WorldScenesResponse> {
  const baseUrl = config.get('WORLDS_CONTENT_URL')
  const response = await fetch(`${baseUrl}/world/${encodeURIComponent(worldName.toLowerCase())}/scenes`)

  if (!response.ok) {
    throw new CastApiError(response.status, `Failed to get world scenes: ${response.statusText}`)
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

interface PresentationBotTokenResponse {
  url: string
  token: string
  roomId: string
}

interface PresentationInfo {
  id: string
  slideCount: number
  currentSlide: number
  fileType: 'pdf' | 'pptx'
}

interface SlideVideoInfo {
  url: string
  geometry: { x: number; y: number; width: number; height: number }
}

interface PresentationState {
  id: string
  slideCount: number
  currentSlide: number
  fileType: 'pdf' | 'pptx'
  slideVideos: SlideVideoInfo[]
  videoState: 'idle' | 'playing' | 'paused'
}

async function getPresentationBotToken(streamingKey: string): Promise<PresentationBotTokenResponse> {
  const baseUrl = config.get('GATEKEEPER_URL')
  const response = await fetch(`${baseUrl}/cast/presentation-bot-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ streamingKey })
  })

  if (!response.ok) {
    throw new CastApiError(response.status, `Failed to get presentation bot token: ${response.statusText}`)
  }

  return response.json()
}

async function uploadPresentation(
  file: File,
  livekitToken: string,
  livekitUrl: string
): Promise<PresentationInfo> {
  const presenterUrl = config.get('PRESENTER_SERVER_URL')
  const formData = new FormData()
  formData.append('file', file)
  formData.append('livekitToken', livekitToken)
  formData.append('livekitUrl', livekitUrl)

  const response = await fetch(`${presenterUrl}/presentations`, {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    throw new CastApiError(response.status, `Failed to upload presentation: ${response.statusText}`)
  }

  return response.json()
}

async function navigatePresentation(
  id: string,
  action: 'next' | 'prev' | 'goto',
  slideIndex?: number
): Promise<PresentationState> {
  const presenterUrl = config.get('PRESENTER_SERVER_URL')
  const response = await fetch(`${presenterUrl}/presentations/${id}/navigate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, slideIndex })
  })

  if (!response.ok) {
    throw new CastApiError(response.status, `Failed to navigate presentation: ${response.statusText}`)
  }

  return response.json()
}

async function getPresentationState(id: string): Promise<PresentationState> {
  const presenterUrl = config.get('PRESENTER_SERVER_URL')
  const response = await fetch(`${presenterUrl}/presentations/${id}`)

  if (!response.ok) {
    throw new CastApiError(response.status, `Failed to get presentation state: ${response.statusText}`)
  }

  return response.json()
}

async function playPresentationVideo(id: string, videoIndex: number): Promise<void> {
  const presenterUrl = config.get('PRESENTER_SERVER_URL')
  const response = await fetch(`${presenterUrl}/presentations/${id}/video/play`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ videoIndex })
  })

  if (!response.ok) {
    throw new CastApiError(response.status, `Failed to play video: ${response.statusText}`)
  }
}

async function pausePresentationVideo(id: string): Promise<void> {
  const presenterUrl = config.get('PRESENTER_SERVER_URL')
  const response = await fetch(`${presenterUrl}/presentations/${id}/video/pause`, {
    method: 'POST'
  })

  if (!response.ok) {
    throw new CastApiError(response.status, `Failed to pause video: ${response.statusText}`)
  }
}

async function stopPresentation(id: string): Promise<void> {
  const presenterUrl = config.get('PRESENTER_SERVER_URL')
  const response = await fetch(`${presenterUrl}/presentations/${id}`, {
    method: 'DELETE'
  })

  if (!response.ok) {
    throw new CastApiError(response.status, `Failed to stop presentation: ${response.statusText}`)
  }
}

async function uploadPresentationFromUrl(
  url: string,
  livekitToken: string,
  livekitUrl: string
): Promise<PresentationInfo> {
  const presenterUrl = config.get('PRESENTER_SERVER_URL')
  const response = await fetch(`${presenterUrl}/presentations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, livekitToken, livekitUrl })
  })

  if (!response.ok) {
    throw new CastApiError(response.status, `Failed to upload presentation from URL: ${response.statusText}`)
  }

  return response.json()
}

export {
  CastApiError,
  getStreamerToken,
  getWatcherToken,
  getWorldScenes,
  getStreamInfo,
  getPresentationBotToken,
  uploadPresentation,
  uploadPresentationFromUrl,
  navigatePresentation,
  getPresentationState,
  playPresentationVideo,
  pausePresentationVideo,
  stopPresentation
}
export type { WorldScene, WorldSceneEntity, WorldScenesResponse, PresentationInfo, PresentationState, SlideVideoInfo }
