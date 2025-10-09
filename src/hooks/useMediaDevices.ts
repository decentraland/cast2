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

      console.log('[useMediaDevices] Filtered devices BEFORE default:', {
        audioInputs: audioIns.length,
        audioOutputs: audioOuts.length,
        videoInputs: videoIns.length,
        requestAudioOutput
      })

      // Special case: If requesting audioOutput but got no devices
      // This is NORMAL on iOS/Safari which doesn't expose audio outputs for privacy
      // Create a synthetic "default" device which the browser/system will handle automatically
      if (requestAudioOutput && audioOuts.length === 0) {
        console.log("✅ [useMediaDevices] ADDING DEFAULT AUDIO OUTPUT - iOS/Safari doesn't expose audio outputs")
        audioOuts.push({
          deviceId: 'default',
          label: 'Default Audio Output',
          kind: 'audiooutput'
        })
        console.log('✅ [useMediaDevices] DEFAULT ADDED - audioOuts now has:', audioOuts.length, 'device(s)')
      } else if (requestAudioOutput && audioOuts.length > 0) {
        console.log('[useMediaDevices] Audio outputs already available, no need for default')
      } else if (!requestAudioOutput) {
        console.log('[useMediaDevices] NOT requesting audio output, skipping default creation')
      }

      console.log('[useMediaDevices] Filtered devices AFTER default:', {
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

    // Only set up device change listener if API is available
    if (navigator.mediaDevices && navigator.mediaDevices.addEventListener) {
      const handleDeviceChange = () => {
        console.log('[useMediaDevices] Device change detected, refetching...')
        fetchDevices()
      }

      navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange)

      return () => {
        if (navigator.mediaDevices && navigator.mediaDevices.removeEventListener) {
          navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange)
        }
        // Stop any cached stream when component unmounts
        if (cachedStream) {
          cachedStream.getTracks().forEach(track => track.stop())
          cachedStream = null
          permissionsRequested = false
        }
      }
    }

    // Cleanup when no listener is set up
    return () => {
      if (cachedStream) {
        cachedStream.getTracks().forEach(track => track.stop())
        cachedStream = null
        permissionsRequested = false
      }
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
