import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { ReceivedChatMessage, useChat } from '../../hooks/useChat'
import { useProfiles } from '../../hooks/useProfiles'

interface ChatContextValue {
  chatMessages: ReceivedChatMessage[]
  unreadMessagesCount: number
  markMessagesAsRead: () => void
  isChatOpen: boolean
  setChatOpen: (open: boolean) => void
  profiles: ReturnType<typeof useProfiles>['profiles']
}

const ChatContext = createContext<ChatContextValue | null>(null)

function useChatContext() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider')
  }
  return context
}

interface ChatProviderProps {
  children: React.ReactNode
}

function ChatProvider({ children }: ChatProviderProps) {
  const { chatMessages } = useChat()
  const [lastReadMessageIndex, setLastReadMessageIndex] = useState(0)
  const [isChatOpen, setChatOpen] = useState(false)

  // Extract addresses from chat messages and prefetch profiles
  const addresses = useMemo(() => {
    const addressSet = new Set<string>()
    chatMessages.forEach(msg => {
      const address = msg.participantName
      if (address && address.startsWith('0x')) {
        addressSet.add(address)
      }
    })
    return Array.from(addressSet)
  }, [chatMessages])

  // Prefetch profiles for all participants
  const { profiles } = useProfiles(addresses)

  const markMessagesAsRead = useCallback(() => {
    setLastReadMessageIndex(chatMessages.length)
  }, [chatMessages.length])

  const unreadMessagesCount = isChatOpen ? 0 : Math.max(0, chatMessages.length - lastReadMessageIndex)

  return (
    <ChatContext.Provider
      value={{
        chatMessages,
        unreadMessagesCount,
        markMessagesAsRead,
        isChatOpen,
        setChatOpen,
        profiles
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export { useChatContext, ChatProvider }
