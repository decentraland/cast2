import { Packet } from '@dcl/protocol/out-js/decentraland/kernel/comms/rfc4/comms.gen'
import { decodeCommsPacket, encodeCommsPacket } from './commsProtocol'

describe('commsProtocol', () => {
  describe('when round-tripping via encodeCommsPacket → decodeCommsPacket', () => {
    describe('and the payload is a flat object', () => {
      it('should return the original topic and data', () => {
        const topic = 'presentation'
        const data = { type: 'presentation:navigate', action: 'next' }

        const encoded = encodeCommsPacket(topic, data)
        const decoded = decodeCommsPacket(encoded)

        expect(decoded).toEqual({ topic, data })
      })
    })

    describe('and the payload is a nested object with arrays and mixed types', () => {
      it('should preserve the full structure', () => {
        const topic = 'presentation'
        const data = {
          type: 'presentation:state',
          id: 'abc-123',
          slideCount: 10,
          currentSlide: 3,
          fileType: 'pdf',
          slideVideos: [
            { slideIndex: 1, url: 'https://example.com/a.mp4' },
            { slideIndex: 4, url: 'https://example.com/b.mp4' }
          ],
          videoState: 'playing'
        }

        const encoded = encodeCommsPacket(topic, data)
        const decoded = decodeCommsPacket(encoded)

        expect(decoded).toEqual({ topic, data })
      })
    })

    describe('and the topic contains multi-byte UTF-8 characters', () => {
      it('should preserve the topic exactly', () => {
        const topic = 'présentation-🎥'
        const data = { ok: true }

        const encoded = encodeCommsPacket(topic, data)
        const decoded = decodeCommsPacket(encoded)

        expect(decoded).toEqual({ topic, data })
      })
    })

    describe('and the data contains multi-byte UTF-8 characters', () => {
      it('should preserve the data exactly', () => {
        const topic = 'presentation'
        const data = { message: 'héllo 你好 🌍' }

        const encoded = encodeCommsPacket(topic, data)
        const decoded = decodeCommsPacket(encoded)

        expect(decoded).toEqual({ topic, data })
      })
    })
  })

  describe('when decoding a garbage (non-protobuf) payload', () => {
    it('should return null', () => {
      const garbage = new Uint8Array([0xff, 0xfe, 0xfd, 0xfc, 0xfb])

      expect(decodeCommsPacket(garbage)).toBeNull()
    })
  })

  describe('when decoding an empty payload', () => {
    it('should return null', () => {
      expect(decodeCommsPacket(new Uint8Array(0))).toBeNull()
    })
  })

  describe('when decoding a protobuf Packet with a non-scene message', () => {
    it('should return null', () => {
      const packet = Packet.encode({
        message: { $case: 'voice', voice: { encodedSamples: new Uint8Array([1, 2, 3]), index: 0, codec: 0 } }
      }).finish()

      expect(decodeCommsPacket(packet)).toBeNull()
    })
  })

  describe('when decoding a scene packet whose first byte is not the CommsData msg type', () => {
    it('should return null', () => {
      const badSceneData = new Uint8Array([99, 0, 0])
      const packet = Packet.encode({
        message: { $case: 'scene', scene: { sceneId: '', data: badSceneData } }
      }).finish()

      expect(decodeCommsPacket(packet)).toBeNull()
    })
  })

  describe('when decoding a CommsData packet with a truncated topic section', () => {
    it('should return null', () => {
      // Claim topicLen=100 but only provide 3 bytes of scene data (header only).
      const truncated = new Uint8Array([3, 100, 0])
      const packet = Packet.encode({
        message: { $case: 'scene', scene: { sceneId: '', data: truncated } }
      }).finish()

      expect(decodeCommsPacket(packet)).toBeNull()
    })
  })
})
