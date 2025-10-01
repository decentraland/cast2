import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { TranslationProvider } from '../../modules/translation'
import { ChatPanel } from './ChatPanel'

// Mock useChat hook
jest.mock('../../hooks/useChat', () => ({
  useChat: jest.fn(() => ({
    chatMessages: [],
    sendMessage: jest.fn(),
    isSending: false
  }))
}))

const mockUseChat = jest.requireMock('../../hooks/useChat').useChat

const renderWithTranslation = (component: React.ReactElement) => {
  return render(<TranslationProvider>{component}</TranslationProvider>)
}

describe('ChatPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render chat title', () => {
    renderWithTranslation(<ChatPanel canSendMessages={true} />)

    expect(screen.getByText(/chat/i)).toBeInTheDocument()
  })

  it('should show empty state when no messages', () => {
    renderWithTranslation(<ChatPanel canSendMessages={true} />)

    expect(screen.getByText(/no messages yet/i)).toBeInTheDocument()
  })

  it('should show auth prompt when cannot send messages', () => {
    renderWithTranslation(<ChatPanel canSendMessages={false} />)

    expect(screen.getByText(/sign in to participate/i)).toBeInTheDocument()
  })

  it('should display messages when available', () => {
    const mockMessages = [
      {
        participantName: 'Alice',
        participantColor: '#ff0000',
        message: 'Hello world!',
        timestamp: Date.now()
      },
      {
        participantName: 'Bob',
        participantColor: '#00ff00',
        message: 'Hi Alice!',
        timestamp: Date.now()
      }
    ]

    mockUseChat.mockReturnValue({
      chatMessages: mockMessages,
      sendMessage: jest.fn(),
      isSending: false
    })

    renderWithTranslation(<ChatPanel canSendMessages={true} />)

    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Hello world!')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('Hi Alice!')).toBeInTheDocument()
  })

  it('should call sendMessage when user sends a message', () => {
    const mockSendMessage = jest.fn()

    mockUseChat.mockReturnValue({
      chatMessages: [],
      sendMessage: mockSendMessage,
      isSending: false
    })

    renderWithTranslation(<ChatPanel canSendMessages={true} />)

    const input = screen.getByPlaceholderText(/type.*message/i)
    const sendButton = screen.getByRole('button')

    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.click(sendButton)

    expect(mockSendMessage).toHaveBeenCalledWith('Test message')
  })

  it('should not send empty messages', () => {
    const mockSendMessage = jest.fn()

    mockUseChat.mockReturnValue({
      chatMessages: [],
      sendMessage: mockSendMessage,
      isSending: false
    })

    renderWithTranslation(<ChatPanel canSendMessages={true} />)

    const sendButton = screen.getByRole('button')
    expect(sendButton).toBeDisabled()

    fireEvent.click(sendButton)
    expect(mockSendMessage).not.toHaveBeenCalled()
  })

  it('should clear input after sending message', () => {
    const mockSendMessage = jest.fn()

    mockUseChat.mockReturnValue({
      chatMessages: [],
      sendMessage: mockSendMessage,
      isSending: false
    })

    renderWithTranslation(<ChatPanel canSendMessages={true} />)

    const input = screen.getByPlaceholderText(/type.*message/i) as HTMLInputElement
    const sendButton = screen.getByRole('button')

    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.click(sendButton)

    expect(input.value).toBe('')
  })

  it('should disable input and button when sending', () => {
    mockUseChat.mockReturnValue({
      chatMessages: [],
      sendMessage: jest.fn(),
      isSending: true
    })

    renderWithTranslation(<ChatPanel canSendMessages={true} />)

    const input = screen.getByPlaceholderText(/type.*message/i)
    const sendButton = screen.getByRole('button')

    expect(input).toBeDisabled()
    expect(sendButton).toBeDisabled()
  })
})
