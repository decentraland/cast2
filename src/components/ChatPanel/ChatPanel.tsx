import { useEffect, useRef, useState } from 'react'
import ChatIcon from '@mui/icons-material/Chat'
import CloseIcon from '@mui/icons-material/Close'
import SendIcon from '@mui/icons-material/Send'
import { Typography } from 'decentraland-ui2'
import { ReceivedChatMessage, useChat } from '../../hooks/useChat'
import { useTranslation } from '../../modules/translation'
import {
  AuthSection,
  ChatContainer,
  ChatHeader,
  ChatInputContainer,
  ChatInputSection,
  ChatMessage,
  ChatMessages,
  CloseButton,
  EmptyChat,
  MessageContent,
  MessageCount,
  MessageHeader,
  MessageTime,
  ParticipantName,
  SendButton,
  StyledInput
} from './ChatPanel.styled'

interface ChatPanelProps {
  canSendMessages: boolean
  authPrompt?: React.ReactNode
  onClose?: () => void
}

export function ChatPanel({ canSendMessages, authPrompt, onClose }: ChatPanelProps) {
  const { t } = useTranslation()
  const { chatMessages, sendMessage, isSending } = useChat()
  const [messageInput, setMessageInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const handleSendMessage = async () => {
    if (!messageInput.trim() || isSending || !canSendMessages) return

    const message = messageInput.trim()
    setMessageInput('')

    try {
      await sendMessage(message)
      inputRef.current?.focus()
    } catch {
      // Restore message on error
      setMessageInput(message)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderMessage = (msg: ReceivedChatMessage, index: number) => (
    <ChatMessage key={index} style={{ '--participant-color': msg.participantColor } as React.CSSProperties}>
      <MessageHeader>
        <ParticipantName style={{ color: msg.participantColor }}>{msg.participantName}</ParticipantName>
        <MessageTime>{formatTime(msg.timestamp)}</MessageTime>
      </MessageHeader>
      <MessageContent>{msg.message}</MessageContent>
    </ChatMessage>
  )

  const messageCountKey = chatMessages.length === 1 ? 'chat.messages_count' : 'chat.messages_count_plural'
  const emptyAction = canSendMessages ? t('chat.start_conversation') : t('chat.sign_in_to_participate')

  return (
    <ChatContainer>
      <ChatHeader>
        <Typography variant="h6">
          <ChatIcon sx={{ fontSize: '18px', marginRight: '4px', verticalAlign: 'middle' }} />
          {t('chat.title')}
        </Typography>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <MessageCount variant="body2">{t(messageCountKey, { count: chatMessages.length.toString() })}</MessageCount>
          {onClose && (
            <CloseButton onClick={onClose}>
              <CloseIcon />
            </CloseButton>
          )}
        </div>
      </ChatHeader>

      <ChatMessages>
        {chatMessages.length === 0 ? (
          <EmptyChat>
            <Typography variant="body2">{t('chat.no_messages', { action: emptyAction })}</Typography>
          </EmptyChat>
        ) : (
          <>
            {chatMessages.map(renderMessage)}
            <div ref={messagesEndRef} />
          </>
        )}
      </ChatMessages>

      <ChatInputSection>
        {canSendMessages ? (
          <ChatInputContainer>
            <StyledInput
              inputRef={inputRef}
              value={messageInput}
              onChange={e => setMessageInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={t('chat.type_message')}
              disabled={isSending}
            />
            <SendButton onClick={handleSendMessage} disabled={!messageInput.trim() || isSending} size="small" variant="contained">
              <SendIcon />
            </SendButton>
          </ChatInputContainer>
        ) : (
          <AuthSection>{authPrompt || <Typography variant="body2">{t('chat.sign_in_prompt')}</Typography>}</AuthSection>
        )}
      </ChatInputSection>
    </ChatContainer>
  )
}
