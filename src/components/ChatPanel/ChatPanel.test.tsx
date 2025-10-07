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
    // Default mock setup
    mockUseChat.mockReturnValue({
      chatMessages: [],
      sendMessage: jest.fn(),
      isSending: false
    })
  })

  describe('when there are no messages', () => {
    beforeEach(() => {
      mockUseChat.mockReturnValue({
        chatMessages: [],
        sendMessage: jest.fn(),
        isSending: false
      })
    })

    it('should render chat title', () => {
      renderWithTranslation(<ChatPanel />)

      expect(screen.getByText('Chat')).toBeInTheDocument()
    })

    it('should show empty state', () => {
      renderWithTranslation(<ChatPanel />)

      expect(screen.getByText(/no.*messages.*yet/i)).toBeInTheDocument()
    })

    it('should show message count as 0', () => {
      renderWithTranslation(<ChatPanel />)

      expect(screen.getByText('0 messages')).toBeInTheDocument()
    })
  })

  describe('when there are messages', () => {
    let mockMessages: any[]

    beforeEach(() => {
      mockMessages = [
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
    })

    it('should display all messages', () => {
      renderWithTranslation(<ChatPanel />)

      expect(screen.getByText('Alice')).toBeInTheDocument()
      expect(screen.getByText('Hello world!')).toBeInTheDocument()
      expect(screen.getByText('Bob')).toBeInTheDocument()
      expect(screen.getByText('Hi Alice!')).toBeInTheDocument()
    })

    it('should show correct message count', () => {
      renderWithTranslation(<ChatPanel />)

      expect(screen.getByText('2 messages')).toBeInTheDocument()
    })

    it('should not show empty state', () => {
      renderWithTranslation(<ChatPanel />)

      expect(screen.queryByText('No messages yet')).not.toBeInTheDocument()
    })
  })

  describe('when onClose is provided', () => {
    let mockOnClose: jest.Mock

    beforeEach(() => {
      mockOnClose = jest.fn()
    })

    it('should render close button', () => {
      renderWithTranslation(<ChatPanel onClose={mockOnClose} />)

      const closeButton = screen.getByRole('button')
      expect(closeButton).toBeInTheDocument()
    })

    it('should call onClose when close button is clicked', () => {
      renderWithTranslation(<ChatPanel onClose={mockOnClose} />)

      const closeButton = screen.getByRole('button')
      fireEvent.click(closeButton)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('when onClose is not provided', () => {
    it('should not render close button', () => {
      renderWithTranslation(<ChatPanel />)

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })
})
