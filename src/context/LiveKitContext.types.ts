interface LiveKitCredentials {
  token: string
  url: string
  identity: string
  roomId: string
  roomName?: string
  placeName?: string
}

interface LiveKitContextValue {
  credentials: LiveKitCredentials | null
  setCredentials: (credentials: LiveKitCredentials | null) => void
}

export type { LiveKitCredentials, LiveKitContextValue }
