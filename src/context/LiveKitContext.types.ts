interface LiveKitCredentials {
  token: string
  url: string
}

interface LiveKitContextValue {
  credentials: LiveKitCredentials | null
  setCredentials: (credentials: LiveKitCredentials | null) => void
}

export type { LiveKitCredentials, LiveKitContextValue }
