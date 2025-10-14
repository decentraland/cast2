import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { TranslationProvider } from '../../modules/translation'
import { ChatPanel } from './ChatPanel'
import { ChatPanelProps } from './ChatPanel.types'

// Mock useChatContext hook
jest.mock('../ChatProvider/ChatProvider', () => ({
  useChatContext: jest.fn(() => ({
    chatMessages: [],
    unreadMessagesCount: 0,
    markMessagesAsRead: jest.fn(),
    isChatOpen: false,
    setChatOpen: jest.fn(),
    profiles: new Map()
  }))
}))

const mockUseChatContext = jest.requireMock('../ChatProvider/ChatProvider').useChatContext

const renderWithTranslation = (props: Partial<ChatPanelProps> = {}) => {
  const defaultProps: ChatPanelProps = {
    chatMessages: [],
    ...props
  }
  return render(
    <TranslationProvider>
      <ChatPanel {...defaultProps} />
    </TranslationProvider>
  )
}

describe('ChatPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset mock to default
    mockUseChatContext.mockReturnValue({
      chatMessages: [],
      unreadMessagesCount: 0,
      markMessagesAsRead: jest.fn(),
      isChatOpen: false,
      setChatOpen: jest.fn(),
      profiles: new Map()
    })
  })

  describe('when there are no messages', () => {
    it('should render chat title', () => {
      renderWithTranslation()

      expect(screen.getByText('Chat')).toBeInTheDocument()
    })

    it('should show empty state', () => {
      renderWithTranslation()

      expect(screen.getByText(/no.*messages.*yet/i)).toBeInTheDocument()
    })

    it('should show footer with Decentraland App link', () => {
      renderWithTranslation()

      const link = screen.getByRole('link', { name: /decentraland app/i })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', 'https://decentraland.org/download')
      expect(link).toHaveAttribute('target', '_blank')
    })
  })

  describe('when there are messages', () => {
    let mockMessages: any[]
    let mockProfiles: Map<string, any>

    beforeEach(() => {
      mockMessages = [
        {
          participantName: '0x1234567890abcdef',
          participantColor: '#ff0000',
          message: 'Hello world!',
          timestamp: Date.now()
        },
        {
          participantName: '0xfedcba0987654321',
          participantColor: '#00ff00',
          message: 'Hi Alice!',
          timestamp: Date.now()
        }
      ]
      mockProfiles = new Map()

      mockUseChatContext.mockReturnValue({
        chatMessages: [],
        unreadMessagesCount: 0,
        markMessagesAsRead: jest.fn(),
        isChatOpen: false,
        setChatOpen: jest.fn(),
        profiles: mockProfiles
      })
    })

    it('should display all messages', () => {
      renderWithTranslation({ chatMessages: mockMessages })

      // Should show truncated addresses
      expect(screen.getByText(/0x1234\.\.\.cdef/)).toBeInTheDocument()
      expect(screen.getByText('Hello world!')).toBeInTheDocument()
      expect(screen.getByText(/0xfedc\.\.\.4321/)).toBeInTheDocument()
      expect(screen.getByText('Hi Alice!')).toBeInTheDocument()
    })

    it('should not show empty state', () => {
      renderWithTranslation({ chatMessages: mockMessages })

      expect(screen.queryByText('No messages yet')).not.toBeInTheDocument()
    })

    it('should show footer with Decentraland App link', () => {
      renderWithTranslation({ chatMessages: mockMessages })

      const link = screen.getByRole('link', { name: /decentraland app/i })
      expect(link).toBeInTheDocument()
    })
  })

  describe('when onClose is provided', () => {
    let mockOnClose: jest.Mock

    beforeEach(() => {
      mockOnClose = jest.fn()
    })

    it('should render close button', () => {
      renderWithTranslation({ onClose: mockOnClose })

      const closeButton = screen.getByRole('button')
      expect(closeButton).toBeInTheDocument()
    })

    it('should call onClose when close button is clicked', () => {
      renderWithTranslation({ onClose: mockOnClose })

      const closeButton = screen.getByRole('button')
      fireEvent.click(closeButton)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('when onClose is not provided', () => {
    it('should not render close button', () => {
      renderWithTranslation()

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })

  describe('when onMessagesRead is provided', () => {
    let mockOnMessagesRead: jest.Mock

    beforeEach(() => {
      mockOnMessagesRead = jest.fn()
    })

    it('should call onMessagesRead when component mounts', () => {
      renderWithTranslation({ onMessagesRead: mockOnMessagesRead })

      expect(mockOnMessagesRead).toHaveBeenCalledTimes(1)
    })
  })
})
