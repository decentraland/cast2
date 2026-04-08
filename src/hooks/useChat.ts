import { useEffect, useState } from 'react'
import { Packet } from '@dcl/protocol/out-js/decentraland/kernel/comms/rfc4/comms.gen'
import { useRoomContext } from '@livekit/components-react'
import { Participant, RoomEvent } from 'livekit-client'
import { getDisplayName } from '../utils/displayName'

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
    const handleDataReceived = (payload: Uint8Array, participant?: Participant) => {
      try {
        // Decode Decentraland protocol message (protobuf)
        const packet = Packet.decode(payload)

        // Filter out non-chat messages and special messages (ping, pong, emotes)
        if (
          packet.message?.$case === 'chat' &&
          !packet.message.chat.message.startsWith('␆') && // ping
          !packet.message.chat.message.startsWith('␑') && // pong
          !packet.message.chat.message.startsWith('␐') // emotes
        ) {
          const { timestamp, message } = packet.message.chat

          const newMessage: ReceivedChatMessage = {
            from: participant,
            timestamp: timestamp,
            message: message,
            participantName: participant ? getDisplayName(participant) : 'Unknown',
            participantColor: getParticipantColor(participant?.identity)
          }

          messages.push(newMessage)
          setChatMessages([...messages])
        }
      } catch (error) {
        console.error('[useChat] Failed to decode protocol message:', error)
        console.error('[useChat] Payload:', payload)
        // Try to decode as text for debugging
        try {
          const text = new TextDecoder().decode(payload)
          console.error('[useChat] Payload as text:', text)
        } catch {
          console.error('[useChat] Could not decode payload as text')
        }
      }
    }

    room.on(RoomEvent.DataReceived, handleDataReceived)

    return () => {
      room.off(RoomEvent.DataReceived, handleDataReceived)
    }
  }, [room])

  const sendMessage = async (message: string) => {
    if (!room || !room.localParticipant || isSending) return

    // Encode message using Decentraland protocol (protobuf)
    const encodedMsg = Packet.encode({
      message: {
        $case: 'chat',
        chat: {
          timestamp: Date.now(),
          message: message.trim()
        }
      }
    }).finish()

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
        participantName: getDisplayName(room.localParticipant),
        participantColor: getParticipantColor(room.localParticipant.identity)
      }

      setChatMessages(prev => [...prev, ourMessage])
    } catch (error) {
      console.error('[useChat] Failed to send message:', error)
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
