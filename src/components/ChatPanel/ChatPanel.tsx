import { useEffect, useRef } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import { Typography } from 'decentraland-ui2'
import { ReceivedChatMessage } from '../../hooks/useChat'
import { useTranslation } from '../../modules/translation'
import { Avatar } from '../Avatar/Avatar'
import { useChatContext } from '../ChatProvider/ChatProvider'
import { ChatPanelProps } from './ChatPanel.types'
import {
  ChatContainer,
  ChatFooter,
  ChatHeader,
  ChatMessage,
  ChatMessages,
  CloseButton,
  EmptyChat,
  FooterLink,
  MessageContent,
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

export function ChatPanel({ onClose, chatMessages, onMessagesRead }: ChatPanelProps) {
  const { t } = useTranslation()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Mark messages as read when panel opens
  useEffect(() => {
    if (onMessagesRead) {
      onMessagesRead()
    }
  }, [onMessagesRead])

  // Get profiles from context (already prefetched)
  const { profiles } = useChatContext()

  const renderMessage = (msg: ReceivedChatMessage, index: number) => {
    // participantName contains the address
    const address = msg.participantName
    const profile = address?.startsWith('0x') ? profiles.get(address.toLowerCase()) : null

    // Display name: claimed name > truncated address > Unknown
    let displayName = 'Unknown'
    if (profile?.hasClaimedName && profile?.name) {
      displayName = profile.name
    } else if (address?.startsWith('0x')) {
      // Truncate address: 0x1234...5678
      displayName = `${address.slice(0, 6)}...${address.slice(-4)}`
    }

    return (
      <ChatMessage key={index}>
        <MessageHeader>
          <Avatar profile={profile} address={address} size={26} />
          <ParticipantName>{displayName}</ParticipantName>
          <MessageTime>{formatTime(msg.timestamp)}</MessageTime>
        </MessageHeader>
        <MessageContent>{msg.message}</MessageContent>
      </ChatMessage>
    )
  }

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  return (
    <ChatContainer>
      <ChatHeader>
        <Typography variant="h6">{t('chat.title')}</Typography>
        {onClose && (
          <CloseButton onClick={onClose}>
            <CloseIcon />
          </CloseButton>
        )}
      </ChatHeader>

      <ChatMessages>
        {chatMessages.length === 0 ? (
          <EmptyChat>
            <Typography variant="body2">{t('chat.no_messages_yet')}</Typography>
          </EmptyChat>
        ) : (
          <>
            {chatMessages.map((msg, index) => renderMessage(msg, index))}
            <div ref={messagesEndRef} />
          </>
        )}
      </ChatMessages>

      <ChatFooter>
        Join from{' '}
        <FooterLink href="https://decentraland.org/download" target="_blank" rel="noopener noreferrer">
          Decentraland App
        </FooterLink>{' '}
        to participate
      </ChatFooter>
    </ChatContainer>
  )
}
