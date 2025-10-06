import { useCallback, useEffect, useState } from 'react'
import { DeviceOption, DeviceSelector } from '../common/DeviceSelector'
import { DropdownItem, DropdownList, SelectorButton, SelectorLabel } from './StreamerOnboarding.styled'

interface CameraSelectorProps {
  selectedDeviceId: string
  onDeviceSelect: (deviceId: string) => void
}

export function CameraSelector({ selectedDeviceId, onDeviceSelect }: CameraSelectorProps) {
  const [cameras, setCameras] = useState<DeviceOption[]>([])

  const getCameras = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true })

      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoInputs = devices
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId.slice(0, 8)}`,
          kind: device.kind
        }))

      console.log('[CameraSelector] Video inputs found:', videoInputs)
      setCameras(videoInputs)

      // Auto-select default device (first one) if none selected
      if (videoInputs.length > 0) {
        const defaultDevice = videoInputs.find(d => d.deviceId === 'default') || videoInputs[0]
        const hasValidSelection = selectedDeviceId && videoInputs.some(d => d.deviceId === selectedDeviceId)
        if (!selectedDeviceId || !hasValidSelection) {
          console.log('[CameraSelector] Auto-selecting device:', defaultDevice)
          onDeviceSelect(defaultDevice.deviceId)
        } else {
          console.log('[CameraSelector] Current selection is valid:', selectedDeviceId)
        }
      }
    } catch (error) {
      console.error('[CameraSelector] Error getting cameras:', error)
    }
  }, [selectedDeviceId, onDeviceSelect])

  useEffect(() => {
    getCameras()

    const handleDeviceChange = () => {
      getCameras()
    }

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange)

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange)
    }
  }, [getCameras])

  if (cameras.length === 0) {
    return null
  }

  return (
    <DeviceSelector
      label="Camera"
      devices={cameras}
      selectedDeviceId={selectedDeviceId}
      onDeviceSelect={onDeviceSelect}
      styledComponents={{ SelectorButton, SelectorLabel, DropdownList, DropdownItem }}
      logPrefix="CameraSelector"
    />
  )
}
