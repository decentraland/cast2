import { useCallback, useState } from 'react'
import { WatcherViewContent } from './WatcherViewContent'
import { ChatPanel } from '../ChatPanel/ChatPanel'
import { useChatContext } from '../ChatProvider/ChatProvider'
import { ControlsArea, MainContent, Sidebar, VideoArea, VideoContainer, ViewLayout as WatcherLayout } from '../CommonView/CommonView.styled'
import { PeopleSidebar } from '../PeopleSidebar/PeopleSidebar'
import { StreamingControls } from '../StreamingControls/StreamingControls'

interface WatcherViewWithChatProps {
  onLeave: () => void
}

export function WatcherViewWithChat({ onLeave }: WatcherViewWithChatProps) {
  const [peopleOpen, setPeopleOpen] = useState(false)
  const { chatMessages, unreadMessagesCount, markMessagesAsRead, isChatOpen, setChatOpen } = useChatContext()

  const sidebarOpen = isChatOpen || peopleOpen

  const handleToggleChat = useCallback(() => {
    if (peopleOpen) setPeopleOpen(false)
    setChatOpen(!isChatOpen)
  }, [peopleOpen, isChatOpen, setChatOpen])

  const handleTogglePeople = useCallback(() => {
    if (isChatOpen) setChatOpen(false)
    setPeopleOpen(!peopleOpen)
  }, [isChatOpen, peopleOpen, setChatOpen])

  return (
    <WatcherLayout>
      <MainContent>
        <VideoContainer $sidebarOpen={sidebarOpen}>
          <VideoArea $sidebarOpen={sidebarOpen}>
            <WatcherViewContent />
          </VideoArea>

          <Sidebar $isOpen={sidebarOpen}>
            {isChatOpen && <ChatPanel onClose={handleToggleChat} chatMessages={chatMessages} onMessagesRead={markMessagesAsRead} />}
            {peopleOpen && <PeopleSidebar onClose={handleTogglePeople} />}
          </Sidebar>
        </VideoContainer>

        <ControlsArea>
          <StreamingControls
            onToggleChat={handleToggleChat}
            onTogglePeople={handleTogglePeople}
            isStreamer={false}
            onLeave={onLeave}
            unreadMessagesCount={unreadMessagesCount}
          />
        </ControlsArea>
      </MainContent>
    </WatcherLayout>
  )
}
