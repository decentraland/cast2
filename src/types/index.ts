interface StreamerViewProps {
  token: string
}

interface WatcherViewProps {
  roomId: string
}

interface AnonymousIdentity {
  id: string
  name: string
  avatar: string
}

interface LiveKitCredentials {
  url: string
  token: string
}

interface CastMessage {
  type: 'chat' | 'ping' | 'pong' | 'emote'
  timestamp: number
  message: string
  from?: string
}

interface RoomStats {
  participantCount: number
  streamCount: number
}

enum RoomType {
  WORLD = 'world',
  COMMUNITY = 'community',
  GENESIS = 'genesis'
}

interface TokenPayload {
  identity: string
  roomId: string
  permissions: {
    canPublish: boolean
    canSubscribe: boolean
    canPublishData: boolean
  }
}

export type { StreamerViewProps, WatcherViewProps, AnonymousIdentity, LiveKitCredentials, CastMessage, RoomStats, RoomType, TokenPayload }
