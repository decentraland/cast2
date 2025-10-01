import { ReactNode, createContext, useContext, useState } from 'react'

interface LiveKitCredentials {
  token: string
  url: string
}

interface LiveKitContextValue {
  credentials: LiveKitCredentials | null
  setCredentials: (credentials: LiveKitCredentials | null) => void
}

const LiveKitContext = createContext<LiveKitContextValue | undefined>(undefined)

function LiveKitProvider({ children }: { children: ReactNode }) {
  const [credentials, setCredentials] = useState<LiveKitCredentials | null>(null)

  return <LiveKitContext.Provider value={{ credentials, setCredentials }}>{children}</LiveKitContext.Provider>
}

function useLiveKitCredentials() {
  const context = useContext(LiveKitContext)
  if (!context) {
    throw new Error('useLiveKitCredentials must be used within LiveKitProvider')
  }
  return context
}

export { LiveKitProvider, useLiveKitCredentials }
export type { LiveKitCredentials }
