import { useEffect, useState } from 'react'
import { useRoomContext } from '@livekit/components-react'
import { DataPacket_Kind, Participant, RoomEvent } from 'livekit-client'

// Simple chat message format (instead of DCL Protocol for now)
interface ChatPacket {
  type: 'chat'
  timestamp: number
  message: string
}

interface ReceivedChatMessage {
  from: Participant | undefined
  timestamp: number
  message: string
  participantName?: string
  participantColor?: string
}

function useChat() {
  const room = useRoomContext()
  const [chatMessages, setChatMessages] = useState<ReceivedChatMessage[]>([])
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    if (!room) return

    const messages: ReceivedChatMessage[] = []

    // Listen for data messages
    const handleDataReceived = (payload: Uint8Array, participant?: Participant, _kind?: DataPacket_Kind, _topic?: string) => {
      try {
        // Decode simple JSON chat message
        const text = new TextDecoder().decode(payload)
        const packet: ChatPacket = JSON.parse(text)

        if (packet.type === 'chat' && packet.message) {
          const newMessage: ReceivedChatMessage = {
            from: participant,
            timestamp: packet.timestamp,
            message: packet.message,
            participantName: participant?.name || participant?.identity || 'Unknown',
            participantColor: getParticipantColor(participant?.identity)
          }

          messages.push(newMessage)
          setChatMessages([...messages])
        }
      } catch {
        // Failed to decode chat message
      }
    }

    room.on(RoomEvent.DataReceived, handleDataReceived)

    return () => {
      room.off(RoomEvent.DataReceived, handleDataReceived)
    }
  }, [room])

  const sendMessage = async (message: string) => {
    if (!room || !room.localParticipant || isSending) return

    const packet: ChatPacket = {
      type: 'chat',
      timestamp: Date.now(),
      message: message.trim()
    }

    const encodedMsg = new TextEncoder().encode(JSON.stringify(packet))

    setIsSending(true)
    try {
      await room.localParticipant.publishData(encodedMsg, {
        reliable: true,
        destinationIdentities: [] // Send to all participants
      })

      // Add our own message to the chat
      const ourMessage: ReceivedChatMessage = {
        from: room.localParticipant,
        timestamp: Date.now(),
        message: message.trim(),
        participantName: room.localParticipant.name || 'You',
        participantColor: getParticipantColor(room.localParticipant.identity)
      }

      setChatMessages(prev => [...prev, ourMessage])
    } catch {
      // Failed to send message
    } finally {
      setIsSending(false)
    }
  }

  return {
    chatMessages,
    sendMessage,
    isSending
  }
}

function getParticipantColor(identity?: string): string {
  if (!identity) return '#666666'

  // Generate consistent color based on identity
  let hash = 0
  for (let i = 0; i < identity.length; i++) {
    hash = identity.charCodeAt(i) + ((hash << 5) - hash)
  }

  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 70%, 50%)`
}

export type { ReceivedChatMessage }
export { useChat }
