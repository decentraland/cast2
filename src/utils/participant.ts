import type { Participant } from 'livekit-client'

function parseParticipantMetadata<T = Record<string, unknown>>(participant: Pick<Participant, 'metadata'>): T | null {
  try {
    return participant.metadata ? (JSON.parse(participant.metadata) as T) : null
  } catch {
    return null
  }
}

function isPresentationBot(participant: Pick<Participant, 'metadata'>): boolean {
  const metadata = parseParticipantMetadata<{ role?: string }>(participant)
  return metadata?.role === 'presentation'
}

export { parseParticipantMetadata, isPresentationBot }
