import { clearStreamerToken, getStreamerToken, saveStreamerToken } from './localStorage'

const STREAMER_TOKEN_KEY = 'dcl_cast_streamer_token'

describe('localStorage utilities', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('when saving a streamer token', () => {
    let tokenToSave: string

    beforeEach(() => {
      tokenToSave = 'test-streaming-key-abc123'
    })

    it('should store the token in localStorage', () => {
      saveStreamerToken(tokenToSave)

      const stored = localStorage.getItem(STREAMER_TOKEN_KEY)
      expect(stored).toBe(tokenToSave)
    })

    it('should overwrite existing tokens', () => {
      const firstToken = 'first-token-123'
      const secondToken = 'second-token-456'

      saveStreamerToken(firstToken)
      saveStreamerToken(secondToken)

      const stored = localStorage.getItem(STREAMER_TOKEN_KEY)
      expect(stored).toBe(secondToken)
    })
  })

  describe('when retrieving a streamer token', () => {
    describe('and a token exists in localStorage', () => {
      let existingToken: string

      beforeEach(() => {
        existingToken = 'existing-token-xyz789'
        localStorage.setItem(STREAMER_TOKEN_KEY, existingToken)
      })

      it('should return the stored token', () => {
        const retrieved = getStreamerToken()

        expect(retrieved).toBe(existingToken)
      })
    })

    describe('and no token exists in localStorage', () => {
      beforeEach(() => {
        localStorage.removeItem(STREAMER_TOKEN_KEY)
      })

      it('should return null', () => {
        const retrieved = getStreamerToken()

        expect(retrieved).toBeNull()
      })
    })
  })

  describe('when clearing a streamer token', () => {
    describe('and a token exists in localStorage', () => {
      let existingToken: string

      beforeEach(() => {
        existingToken = 'token-to-clear-abc'
        localStorage.setItem(STREAMER_TOKEN_KEY, existingToken)
      })

      it('should remove the token from localStorage', () => {
        clearStreamerToken()

        const retrieved = localStorage.getItem(STREAMER_TOKEN_KEY)
        expect(retrieved).toBeNull()
      })
    })

    describe('and no token exists in localStorage', () => {
      beforeEach(() => {
        localStorage.removeItem(STREAMER_TOKEN_KEY)
      })

      it('should not throw an error', () => {
        expect(() => clearStreamerToken()).not.toThrow()
      })
    })
  })

  describe('when localStorage throws an error', () => {
    beforeEach(() => {
      jest.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      ;(console.error as jest.Mock).mockRestore()
    })

    describe('and saving fails', () => {
      beforeEach(() => {
        jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
          throw new Error('Storage quota exceeded')
        })
      })

      afterEach(() => {
        ;(Storage.prototype.setItem as jest.Mock).mockRestore()
      })

      it('should log the error to console', () => {
        saveStreamerToken('test-token')

        expect(console.error).toHaveBeenCalledWith('[localStorage] Failed to save streamer token:', expect.any(Error))
      })
    })

    describe('and retrieving fails', () => {
      beforeEach(() => {
        jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
          throw new Error('Storage access denied')
        })
      })

      afterEach(() => {
        ;(Storage.prototype.getItem as jest.Mock).mockRestore()
      })

      it('should return null', () => {
        const result = getStreamerToken()

        expect(result).toBeNull()
      })

      it('should log the error to console', () => {
        getStreamerToken()

        expect(console.error).toHaveBeenCalledWith('[localStorage] Failed to get streamer token:', expect.any(Error))
      })
    })

    describe('and clearing fails', () => {
      beforeEach(() => {
        jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
          throw new Error('Storage access denied')
        })
      })

      afterEach(() => {
        ;(Storage.prototype.removeItem as jest.Mock).mockRestore()
      })

      it('should log the error to console', () => {
        clearStreamerToken()

        expect(console.error).toHaveBeenCalledWith('[localStorage] Failed to clear streamer token:', expect.any(Error))
      })
    })
  })
})
