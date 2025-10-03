import { useCallback, useEffect, useRef, useState } from 'react'
import ChatIconMUI from '@mui/icons-material/Chat'
import CloseIcon from '@mui/icons-material/Close'
import SendIcon from '@mui/icons-material/Send'
import { Typography } from 'decentraland-ui2'
import { ReceivedChatMessage, useChat } from '../../hooks/useChat'
import { useTranslation } from '../../modules/translation'
import { ChatPanelProps } from './ChatPanel.types'
import {
  AuthSection,
  ChatContainer,
  ChatHeader,
  ChatHeaderActions,
  ChatIcon,
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

  const handleSendMessage = useCallback(async () => {
    if (!messageInput.trim() || isSending || !canSendMessages) return

    const message = messageInput.trim()
    setMessageInput('')

    try {
      await sendMessage(message)
      inputRef.current?.focus()
    } catch {
      setMessageInput(message)
    }
  }, [messageInput, isSending, canSendMessages, sendMessage])

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSendMessage()
      }
    },
    [handleSendMessage]
  )

  const formatTime = useCallback((timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }, [])

  const renderMessage = (msg: ReceivedChatMessage, index: number) => (
    <ChatMessage key={index} $participantColor={msg.participantColor}>
      <MessageHeader>
        <ParticipantName $color={msg.participantColor}>{msg.participantName}</ParticipantName>
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
