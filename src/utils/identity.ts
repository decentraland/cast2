import { AnonymousIdentity } from '../types'

const AVATAR_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43']

const ADJECTIVES = [
  'happy',
  'brave',
  'clever',
  'bright',
  'swift',
  'gentle',
  'mighty',
  'calm',
  'wise',
  'bold',
  'eager',
  'noble',
  'proud',
  'quiet',
  'agile',
  'fancy',
  'jolly',
  'keen',
  'lively',
  'merry',
  'sharp',
  'warm',
  'wild',
  'cosmic',
  'crystal',
  'golden',
  'silver',
  'royal',
  'mystic',
  'ancient'
]

const NOUNS = [
  'rabbit',
  'falcon',
  'dolphin',
  'tiger',
  'phoenix',
  'dragon',
  'wolf',
  'eagle',
  'panda',
  'lion',
  'fox',
  'hawk',
  'owl',
  'bear',
  'deer',
  'raven',
  'snake',
  'shark',
  'whale',
  'panther',
  'jaguar',
  'cheetah',
  'lynx',
  'otter',
  'beaver',
  'badger',
  'koala',
  'sloth',
  'penguin',
  'octopus'
]

/**
 * Generates an anonymous identity for users who don't want to login
 */
function generateAnonymousIdentity(roomId: string): AnonymousIdentity {
  const randomId = Math.random().toString(36).substring(2, 15)
  const ulid = `${Date.now()}-${randomId}`

  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]

  const name = `${adjective}-${noun}`
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
function createLiveKitIdentity(roomId: string): string {
  // For anonymous users
  return generateAnonymousIdentity(roomId).id
}

export { createLiveKitIdentity }
