import '@testing-library/jest-dom'
import { TextDecoder, TextEncoder } from 'util'

// jsdom doesn't expose TextEncoder/TextDecoder on globalThis — polyfill from Node's util.
if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = TextEncoder as unknown as typeof globalThis.TextEncoder
}
if (typeof globalThis.TextDecoder === 'undefined') {
  globalThis.TextDecoder = TextDecoder as unknown as typeof globalThis.TextDecoder
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
} as unknown as typeof IntersectionObserver

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn()

// Mock navigator.mediaDevices
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest.fn().mockResolvedValue({
      getTracks: () => [],
      getAudioTracks: () => [],
      getVideoTracks: () => []
    }),
    enumerateDevices: jest.fn().mockResolvedValue([]),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  },
  writable: true
})
