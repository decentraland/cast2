import { AnonymousIdentity } from '../types'

const AVATAR_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43']

const ADJECTIVES = [
  'Amazing',
  'Brave',
  'Cool',
  'Dynamic',
  'Epic',
  'Fantastic',
  'Great',
  'Happy',
  'Incredible',
  'Joyful',
  'Kind',
  'Lucky',
  'Magnificent',
  'Noble',
  'Outstanding',
  'Perfect',
  'Quick',
  'Radiant',
  'Super',
  'Tremendous'
]

const NOUNS = [
  'Explorer',
  'Creator',
  'Builder',
  'Dreamer',
  'Artist',
  'Wizard',
  'Hero',
  'Champion',
  'Guardian',
  'Pioneer',
  'Voyager',
  'Inventor',
  'Architect',
  'Designer',
  'Storyteller',
  'Musician',
  'Dancer',
  'Poet',
  'Philosopher',
  'Sage'
]

/**
 * Generates an anonymous identity for users who don't want to login
 */
function generateAnonymousIdentity(roomId: string): AnonymousIdentity {
  const randomId = Math.random().toString(36).substring(2, 15)
  const ulid = `${Date.now()}-${randomId}`

  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
  const number = Math.floor(Math.random() * 999) + 1

  const name = `${adjective}${noun}${number}`
  const avatar = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]

  return {
    id: `anon:${roomId}:${ulid}`,
    name,
    avatar
  }
}

/**
 * Creates the identity string for LiveKit rooms
 */
export function createLiveKitIdentity(roomId: string, walletAddress?: string): string {
  if (walletAddress) {
    // For authenticated users, use wallet but still make it unique per room to avoid conflicts
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    return `user:${walletAddress}:${roomId}:${randomSuffix}`
  }

  // For anonymous users
  return generateAnonymousIdentity(roomId).id
}
