import { Participant } from 'livekit-client'

/**
 * Gets the display name for a LiveKit participant.
 *
 * With the simplified approach, the identity IS the display name.
 * - Streamers: their chosen name (e.g., "pepe") or random (e.g., "happy-fox")
 * - Watchers: random name (e.g., "brave-falcon")
 * - Scene users: their wallet/DCL identity
 *
 * @param participant - The LiveKit participant
 * @returns The display name (simply the participant's identity)
 */
export function getDisplayName(participant: Participant): string {
  return participant.identity || 'Anonymous'
}
