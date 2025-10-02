import { Button, Input, Typography } from 'decentraland-ui2'
import styled from '@emotion/styled'

const ChatContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background: transparent;
  color: white;
  overflow: hidden;
`

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;

  .MuiTypography-root {
    color: white !important;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  @media (max-width: 768px) {
    padding: 12px;
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
  padding: 16px;
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

  @media (max-width: 768px) {
    padding: 12px;
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
  padding: 12px;
  background: rgba(236, 235, 237, 0.15);
  border-radius: 8px;
  border-left: 3px solid var(--participant-color, rgba(255, 255, 255, 0.3));
`

const MessageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
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
  font-weight: 400;
`

const ChatInputSection = styled.div`
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;

  @media (max-width: 768px) {
    padding: 12px;
  }
`

const ChatInputContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-end;
`

const StyledInput = styled(Input)`
  && {
    flex: 1;

    .MuiInputBase-input {
      color: white !important;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 12px 16px;
      font-size: 14px;

      &::placeholder {
        color: rgba(255, 255, 255, 0.5) !important;
      }
    }

    .MuiOutlinedInput-notchedOutline {
      border-color: rgba(255, 255, 255, 0.2);
      border-radius: 20px;
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
    min-width: 48px;
    width: 48px;
    height: 48px;
    padding: 0;
    background: var(--primary) !important;
    border-color: var(--primary) !important;
    color: white !important;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background: var(--primary-hover) !important;
      border-color: var(--primary-hover) !important;
    }

    &:disabled {
      background: rgba(255, 255, 255, 0.1) !important;
      border-color: rgba(255, 255, 255, 0.1) !important;
      color: rgba(255, 255, 255, 0.3) !important;
    }

    svg {
      font-size: 20px;
    }
  }
`

const AuthSection = styled.div`
  text-align: center;

  .MuiTypography-root {
    color: rgba(255, 255, 255, 0.6) !important;
  }
`

const CloseButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  transition: color 0.2s ease;

  &:hover {
    color: white;
  }

  svg {
    font-size: 20px;
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
  CloseButton,
  EmptyChat,
  MessageContent,
  MessageCount,
  MessageHeader,
  MessageTime,
  ParticipantName,
  SendButton,
  StyledInput
}
