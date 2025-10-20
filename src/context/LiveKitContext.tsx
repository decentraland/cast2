import { ReactNode, createContext, useContext, useState } from 'react'
import { LiveKitContextValue, LiveKitCredentials, StreamMetadata } from './LiveKitContext.types'

const LiveKitContext = createContext<LiveKitContextValue | undefined>(undefined)

function LiveKitProvider({ children }: { children: ReactNode }) {
  const [credentials, setCredentials] = useState<LiveKitCredentials | null>(null)
  const [streamMetadata, setStreamMetadata] = useState<StreamMetadata | null>(null)

  return (
    <LiveKitContext.Provider value={{ credentials, setCredentials, streamMetadata, setStreamMetadata }}>{children}</LiveKitContext.Provider>
  )
}

function useLiveKitCredentials() {
  const context = useContext(LiveKitContext)
  if (!context) {
    throw new Error('useLiveKitCredentials must be used within LiveKitProvider')
  }
  return context
}

export { LiveKitProvider, useLiveKitCredentials }
export type { LiveKitCredentials, StreamMetadata }
