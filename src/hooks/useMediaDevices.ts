import { useCallback, useEffect, useState } from 'react'

interface MediaDevice {
  deviceId: string
  label: string
  kind: MediaDeviceKind
}

interface UseMediaDevicesOptions {
  requestAudio?: boolean
  requestVideo?: boolean
  requestAudioOutput?: boolean
}

interface UseMediaDevicesResult {
  audioInputs: MediaDevice[]
  audioOutputs: MediaDevice[]
  videoInputs: MediaDevice[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

let cachedStream: MediaStream | null = null
let permissionsRequested = false

function useMediaDevices(options: UseMediaDevicesOptions = {}): UseMediaDevicesResult {
  const { requestAudio = false, requestVideo = false, requestAudioOutput = false } = options

  const [audioInputs, setAudioInputs] = useState<MediaDevice[]>([])
  const [audioOutputs, setAudioOutputs] = useState<MediaDevice[]>([])
  const [videoInputs, setVideoInputs] = useState<MediaDevice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchDevices = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Request permissions only for audio input (microphone) or video
      // NOTE: Audio output (speakers) does NOT require permissions
      if (!permissionsRequested && (requestAudio || requestVideo)) {
        console.log('[useMediaDevices] Requesting permissions:', {
          audio: requestAudio,
          video: requestVideo
        })

        const constraints: MediaStreamConstraints = {}
        if (requestAudio) constraints.audio = true
        if (requestVideo) constraints.video = true

        try {
          // Close any existing stream first
          if (cachedStream) {
            cachedStream.getTracks().forEach(track => track.stop())
          }

          cachedStream = await navigator.mediaDevices.getUserMedia(constraints)
          permissionsRequested = true
          console.log('[useMediaDevices] Permissions granted')
        } catch (err) {
          console.error('[useMediaDevices] Permission denied:', err)
          throw new Error('Permission denied to access media devices')
        }
      }

      // Enumerate all devices
      const devices = await navigator.mediaDevices.enumerateDevices()
      console.log('[useMediaDevices] All devices enumerated:', devices)
      console.log('[useMediaDevices] All devices enumerated:', devices.length)

      const audioIns: MediaDevice[] = []
      const audioOuts: MediaDevice[] = []
      const videoIns: MediaDevice[] = []

      // Check if we have real device info (permissions granted) or just placeholders
      const hasRealDeviceInfo = devices.some(d => d.deviceId !== '')

      devices.forEach((device, index) => {
        console.log('device', device)

        // Skip devices without deviceId (browser security restriction when no permissions)
        if (!device.deviceId) {
          console.warn(`[useMediaDevices] Device without ID: ${device.kind}`)
          return
        }

        const mediaDevice: MediaDevice = {
          deviceId: device.deviceId,
          label: device.label || `${device.kind} ${index + 1}`,
          kind: device.kind
        }

        if (device.kind === 'audioinput' && requestAudio) {
          audioIns.push(mediaDevice)
        } else if (device.kind === 'audiooutput' && requestAudioOutput) {
          audioOuts.push(mediaDevice)
        } else if (device.kind === 'videoinput' && requestVideo) {
          videoIns.push(mediaDevice)
        }
      })

      // Special case: If requesting audioOutput but got no devices (no permissions granted),
      // create a synthetic "default" device which the browser will handle automatically
      if (requestAudioOutput && audioOuts.length === 0 && !hasRealDeviceInfo) {
        console.log('[useMediaDevices] No audio output info available (no permissions), using default device')
        audioOuts.push({
          deviceId: 'default',
          label: 'Default Audio Output',
          kind: 'audiooutput'
        })
      }

      console.log('[useMediaDevices] Filtered devices:', {
        audioInputs: audioIns.length,
        audioOutputs: audioOuts.length,
        videoInputs: videoIns.length
      })

      setAudioInputs(audioIns)
      setAudioOutputs(audioOuts)
      setVideoInputs(videoIns)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error fetching devices')
      console.error('[useMediaDevices] Error:', error)
      setError(error)
    } finally {
      setIsLoading(false)
    }
  }, [requestAudio, requestVideo, requestAudioOutput])

  useEffect(() => {
    fetchDevices()

    const handleDeviceChange = () => {
      console.log('[useMediaDevices] Device change detected, refetching...')
      fetchDevices()
    }

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange)

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange)
    }
  }, [fetchDevices])

  // Cleanup stream on unmount if all components are unmounted
  useEffect(() => {
    return () => {
      // Note: We don't stop the stream here because other components might still need it
      // The stream will be cleaned up when the page is unloaded
    }
  }, [])

  return {
    audioInputs,
    audioOutputs,
    videoInputs,
    isLoading,
    error,
    refetch: fetchDevices
  }
}

export type { MediaDevice }

export { useMediaDevices }
