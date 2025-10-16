import { useCallback, useState } from 'react'
import { StreamerViewContent } from './StreamerViewContent'
import { ChatPanel } from '../ChatPanel/ChatPanel'
import { useChatContext } from '../ChatProvider/ChatProvider'
import {
  ControlsArea,
  MainContent,
  Sidebar,
  ViewLayout as StreamerLayout,
  VideoArea,
  VideoContainer
} from '../CommonView/CommonView.styled'
import { PeopleSidebar } from '../PeopleSidebar/PeopleSidebar'
import { StreamingControls } from '../StreamingControls/StreamingControls'

interface StreamerViewWithChatProps {
  onLeave: () => void
}

export function StreamerViewWithChat({ onLeave }: StreamerViewWithChatProps) {
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
    <StreamerLayout>
      <MainContent>
        <VideoContainer $sidebarOpen={sidebarOpen}>
          <VideoArea $sidebarOpen={sidebarOpen}>
            <StreamerViewContent />
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
            isStreamer
            onLeave={onLeave}
            unreadMessagesCount={unreadMessagesCount}
          />
        </ControlsArea>
      </MainContent>
    </StreamerLayout>
  )
}
