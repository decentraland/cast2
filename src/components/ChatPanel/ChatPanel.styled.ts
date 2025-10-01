import { Button, Card, Input, Typography } from 'decentraland-ui2'
import styled from '@emotion/styled'

const ChatContainer = styled(Card)`
  && {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: rgba(255, 255, 255, 0.08) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    backdrop-filter: blur(20px);
    color: white;
    border-radius: 12px;
    overflow: hidden;
  }
`

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;

  .MuiTypography-root {
    color: white !important;
    font-weight: 600;
  }
`

const MessageCount = styled(Typography)`
  && {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.875rem;
  }
`

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  max-height: calc(100vh - 200px);
  display: flex;
  flex-direction: column;
  gap: 12px;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
`

const EmptyChat = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;

  .MuiTypography-root {
    color: rgba(255, 255, 255, 0.5) !important;
  }
`

const ChatMessage = styled.div`
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border-left: 3px solid var(--participant-color, rgba(255, 255, 255, 0.3));
`

const MessageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.25rem;
`

const ParticipantName = styled.span`
  font-weight: 600;
  font-size: 0.875rem;
  color: white !important;
`

const MessageTime = styled.span`
  color: rgba(255, 255, 255, 0.5) !important;
  font-size: 0.75rem;
`

const MessageContent = styled.div`
  word-wrap: break-word;
  line-height: 1.4;
  color: white !important;
  font-size: 14px;
  font-weight: 500;
`

const ChatInputSection = styled.div`
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
`

const ChatInputContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
`

const StyledInput = styled(Input)`
  && {
    flex: 1;

    .MuiInputBase-input {
      color: white !important;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 12px;
      font-size: 14px;

      &::placeholder {
        color: rgba(255, 255, 255, 0.5) !important;
      }
    }

    .MuiOutlinedInput-notchedOutline {
      border-color: rgba(255, 255, 255, 0.2);
    }

    &:hover .MuiOutlinedInput-notchedOutline {
      border-color: rgba(255, 255, 255, 0.3);
    }

    &.Mui-focused .MuiOutlinedInput-notchedOutline {
      border-color: var(--primary);
      border-width: 2px;
    }

    &.Mui-disabled {
      opacity: 0.6;

      .MuiInputBase-input {
        color: rgba(255, 255, 255, 0.3) !important;
      }
    }
  }
`

const SendButton = styled(Button)`
  && {
    min-width: 60px;
    padding: 12px 16px;
    background: var(--primary) !important;
    border-color: var(--primary) !important;
    color: var(--text-on-primary) !important;
    font-size: 16px;

    &:hover {
      background: var(--primary-hover) !important;
      border-color: var(--primary-hover) !important;
    }

    &:disabled {
      background: rgba(255, 255, 255, 0.1) !important;
      border-color: rgba(255, 255, 255, 0.1) !important;
      color: rgba(255, 255, 255, 0.3) !important;
    }
  }
`

const AuthSection = styled.div`
  text-align: center;

  .MuiTypography-root {
    color: rgba(255, 255, 255, 0.6) !important;
  }
`

export {
  AuthSection,
  ChatContainer,
  ChatHeader,
  ChatInputContainer,
  ChatInputSection,
  ChatMessage,
  ChatMessages,
  EmptyChat,
  MessageContent,
  MessageCount,
  MessageHeader,
  MessageTime,
  ParticipantName,
  SendButton,
  StyledInput
}
