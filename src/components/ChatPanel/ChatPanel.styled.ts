import { Button, Input, Typography, styled } from 'decentraland-ui2'

const ChatContainer = styled('div')({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  background: 'transparent',
  color: 'white',
  overflow: 'hidden'
})

const ChatHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: 16,
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  flexShrink: 0,
  '& .MuiTypography-root': {
    color: 'white',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: 8
  },
  [theme.breakpoints.down('sm')]: {
    padding: 12
  }
}))

const ChatHeaderActions = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: 12
})

const ChatIcon = styled('span')({
  fontSize: 18,
  marginRight: 4,
  verticalAlign: 'middle',
  display: 'flex',
  alignItems: 'center'
})

const MessageCount = styled(Typography)(() => ({
  color: 'rgba(255, 255, 255, 0.7)',
  fontSize: '0.875rem'
}))

const ChatMessages = styled('div')(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  padding: 16,
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  '&::-webkit-scrollbar': {
    width: 6
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 3
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.3)'
    }
  },
  [theme.breakpoints.down('sm')]: {
    padding: 12
  }
}))

const EmptyChat = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  color: 'rgba(255, 255, 255, 0.5)',
  textAlign: 'center',
  '& .MuiTypography-root': {
    color: 'rgba(255, 255, 255, 0.5)'
  }
})

const ChatMessage = styled('div')<{ $participantColor?: string }>(({ $participantColor }) => ({
  padding: 12,
  background: 'rgba(236, 235, 237, 0.15)',
  borderRadius: 8,
  borderLeft: `3px solid ${$participantColor || 'rgba(255, 255, 255, 0.3)'}`
}))

const MessageHeader = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 4
})

const ParticipantName = styled('span')<{ $color?: string }>(({ $color }) => ({
  fontWeight: 600,
  fontSize: '0.875rem',
  color: $color || 'white'
}))

const MessageTime = styled('span')({
  color: 'rgba(255, 255, 255, 0.5)',
  fontSize: '0.75rem'
})

const MessageContent = styled('div')({
  wordWrap: 'break-word',
  lineHeight: 1.4,
  color: 'white',
  fontSize: 14,
  fontWeight: 400
})

const ChatInputSection = styled('div')(({ theme }) => ({
  padding: 16,
  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  flexShrink: 0,
  [theme.breakpoints.down('sm')]: {
    padding: 12
  }
}))

const ChatInputContainer = styled('div')({
  display: 'flex',
  gap: 8,
  alignItems: 'flex-end'
})

const StyledInput = styled(Input)(({ theme }) => ({
  flex: 1,
  '& .MuiInputBase-input': {
    color: 'white',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: '12px 16px',
    fontSize: 14,
    '&::placeholder': {
      color: 'rgba(255, 255, 255, 0.5)'
    }
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(255, 255, 255, 0.3)'
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
    borderWidth: 2
  },
  '&.Mui-disabled': {
    opacity: 0.6,
    '& .MuiInputBase-input': {
      color: 'rgba(255, 255, 255, 0.3)'
    }
  }
}))

const SendButton = styled(Button)(({ theme }) => ({
  minWidth: 48,
  width: 48,
  height: 48,
  padding: 0,
  background: theme.palette.primary.main,
  borderColor: theme.palette.primary.main,
  color: 'white',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&:hover': {
    background: theme.palette.primary.dark,
    borderColor: theme.palette.primary.dark
  },
  '&:disabled': {
    background: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    color: 'rgba(255, 255, 255, 0.3)'
  },
  '& svg': {
    fontSize: 20
  }
}))

const AuthSection = styled('div')({
  textAlign: 'center',
  '& .MuiTypography-root': {
    color: 'rgba(255, 255, 255, 0.6)'
  }
})

const CloseButton = styled('button')({
  background: 'none',
  border: 'none',
  color: 'rgba(255, 255, 255, 0.7)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 4,
  transition: 'color 0.2s ease',
  '&:hover': {
    color: 'white'
  },
  '& svg': {
    fontSize: 20
  }
})

export {
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
}
