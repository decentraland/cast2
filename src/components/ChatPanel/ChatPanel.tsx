import { useEffect, useRef } from 'react'
import ChatIconMUI from '@mui/icons-material/Chat'
import CloseIcon from '@mui/icons-material/Close'
import { Typography } from 'decentraland-ui2'
import { ReceivedChatMessage, useChat } from '../../hooks/useChat'
import { useTranslation } from '../../modules/translation'
import { ChatPanelProps } from './ChatPanel.types'
import {
  ChatContainer,
  ChatHeader,
  ChatHeaderActions,
  ChatIcon,
  ChatMessage,
  ChatMessages,
  CloseButton,
  EmptyChat,
  MessageContent,
  MessageCount,
  MessageHeader,
  MessageTime,
  ParticipantName
} from './ChatPanel.styled'

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const renderMessage = (msg: ReceivedChatMessage, index: number) => (
  <ChatMessage key={index} $participantColor={msg.participantColor}>
    <MessageHeader>
      <ParticipantName $color={msg.participantColor}>{msg.participantName}</ParticipantName>
      <MessageTime>{formatTime(msg.timestamp)}</MessageTime>
    </MessageHeader>
    <MessageContent>{msg.message}</MessageContent>
  </ChatMessage>
)

export function ChatPanel({ onClose }: ChatPanelProps) {
  const { t } = useTranslation()
  const { chatMessages } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const messageCountKey = chatMessages.length === 1 ? 'chat.messages_count' : 'chat.messages_count_plural'

  return (
    <ChatContainer>
      <ChatHeader>
        <Typography variant="h6">
          <ChatIcon>
            <ChatIconMUI />
          </ChatIcon>
          {t('chat.title')}
        </Typography>
        <ChatHeaderActions>
          <MessageCount variant="body2">{t(messageCountKey, { count: chatMessages.length.toString() })}</MessageCount>
          {onClose && (
            <CloseButton onClick={onClose}>
              <CloseIcon />
            </CloseButton>
          )}
        </ChatHeaderActions>
      </ChatHeader>

      <ChatMessages>
        {chatMessages.length === 0 ? (
          <EmptyChat>
            <Typography variant="body2">{t('chat.no_messages_yet')}</Typography>
          </EmptyChat>
        ) : (
          <>
            {chatMessages.map(renderMessage)}
            <div ref={messagesEndRef} />
          </>
        )}
      </ChatMessages>
    </ChatContainer>
  )
}
