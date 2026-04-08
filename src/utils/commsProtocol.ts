import { Packet } from '@dcl/protocol/out-js/decentraland/kernel/comms/rfc4/comms.gen'

const MSG_TYPE_COMMS_DATA = 3

/**
 * Encodes a JSON-serializable message into a protobuf Packet with the CommsData wire format.
 * Wire format inside Scene.data: [MsgType.CommsData=3][topicLen 2 bytes LE][topic UTF-8][data UTF-8].
 */
export function encodeCommsPacket(topic: string, data: unknown): Uint8Array {
  const topicBytes = new TextEncoder().encode(topic)
  const dataBytes = new TextEncoder().encode(JSON.stringify(data))

  const sceneData = new Uint8Array(1 + 2 + topicBytes.length + dataBytes.length)
  sceneData[0] = MSG_TYPE_COMMS_DATA
  sceneData[1] = topicBytes.length & 0xff
  sceneData[2] = (topicBytes.length >> 8) & 0xff
  sceneData.set(topicBytes, 3)
  sceneData.set(dataBytes, 3 + topicBytes.length)

  return Packet.encode({
    message: { $case: 'scene', scene: { sceneId: '', data: sceneData } }
  }).finish()
}

/**
 * Decodes a raw LiveKit payload into a CommsData message.
 * Returns { topic, sender, data } or null if the payload is not a valid CommsData packet.
 * Includes a raw JSON fallback for backward compatibility.
 */
export function decodeCommsPacket(payload: Uint8Array): { topic: string; data: unknown } | null {
  // Try protobuf decode first.
  try {
    const packet = Packet.decode(payload)
    if (packet.message?.$case === 'scene') {
      const sd = packet.message.scene.data
      if (sd.length > 3 && sd[0] === MSG_TYPE_COMMS_DATA) {
        const topicLen = sd[1] | (sd[2] << 8)
        if (sd.length >= 3 + topicLen) {
          const topic = new TextDecoder().decode(sd.slice(3, 3 + topicLen))
          const data = JSON.parse(new TextDecoder().decode(sd.slice(3 + topicLen)))
          return { topic, data }
        }
      }
    }
  } catch {
    // Not a valid protobuf packet — try raw JSON fallback.
  }

  // Fallback: raw JSON for backward compatibility during migration.
  try {
    const data = JSON.parse(new TextDecoder().decode(payload))
    if (typeof data?.type === 'string') {
      return { topic: '', data }
    }
  } catch {
    // Ignore malformed payloads.
  }

  return null
}
