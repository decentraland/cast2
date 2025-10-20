interface LiveKitCredentials {
  token: string
  url: string
  identity: string
  roomId: string
  roomName?: string
  placeName?: string
}

interface StreamMetadata {
  placeName: string
  location: string // parcel (e.g. "-116,129") or world name (e.g. "aworld.dcl.eth")
  isWorld: boolean
}

interface LiveKitContextValue {
  credentials: LiveKitCredentials | null
  setCredentials: (credentials: LiveKitCredentials | null) => void
  streamMetadata: StreamMetadata | null
  setStreamMetadata: (metadata: StreamMetadata | null) => void
}

export type { LiveKitCredentials, LiveKitContextValue, StreamMetadata }
