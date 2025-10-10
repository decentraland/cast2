import { Participant } from 'livekit-client'

/**
 * Gets the display name for a LiveKit participant.
 *
 * The backend generates a unique internal ID for LiveKit identity (prevents collisions)
 * and stores the user-friendly display name in metadata.
 *
 * - Streamers: their chosen name (e.g., "pepe") or random (e.g., "happy-fox")
 * - Watchers: random name (e.g., "brave-falcon")
 * - Scene users: their wallet/DCL identity
 *
 * @param participant - The LiveKit participant
 * @returns The display name from metadata, or a fallback
 */
export function getDisplayName(participant: Participant): string {
  try {
    // Try to parse metadata for displayName
    const metadata = participant.metadata ? JSON.parse(participant.metadata) : null
    if (metadata?.displayName) {
      return metadata.displayName
    }
  } catch (error) {
    console.warn('[getDisplayName] Failed to parse metadata:', error)
  }

  // Fallback to identity (shouldn't happen with our backend, but safety first)
  return participant.identity || 'Anonymous'
}
