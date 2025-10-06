import { useCallback, useEffect, useState } from 'react'
import { DeviceOption, DeviceSelector } from '../common/DeviceSelector'
import { DropdownItem, DropdownList, SelectorButton, SelectorLabel } from './StreamerOnboarding.styled'

interface MicrophoneSelectorProps {
  selectedDeviceId: string
  onDeviceSelect: (deviceId: string) => void
}

export function MicrophoneSelector({ selectedDeviceId, onDeviceSelect }: MicrophoneSelectorProps) {
  const [microphones, setMicrophones] = useState<DeviceOption[]>([])

  const getMicrophones = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })

      const devices = await navigator.mediaDevices.enumerateDevices()
      console.log('[MicrophoneSelector] All devices:', devices)

      const audioInputs = devices
        .filter(device => device.kind === 'audioinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Microphone ${device.deviceId.slice(0, 8)}`,
          kind: device.kind
        }))

      console.log('[MicrophoneSelector] Audio inputs found:', audioInputs)
      setMicrophones(audioInputs)

      // Auto-select default device (first one) if none selected
      if (audioInputs.length > 0) {
        const defaultDevice = audioInputs.find(d => d.deviceId === 'default') || audioInputs[0]
        const hasValidSelection = selectedDeviceId && audioInputs.some(d => d.deviceId === selectedDeviceId)
        if (!selectedDeviceId || !hasValidSelection) {
          console.log('[MicrophoneSelector] Auto-selecting device:', defaultDevice)
          onDeviceSelect(defaultDevice.deviceId)
        } else {
          console.log('[MicrophoneSelector] Current selection is valid:', selectedDeviceId)
        }
      }
    } catch (error) {
      console.error('[MicrophoneSelector] Error getting microphones:', error)
    }
  }, [selectedDeviceId, onDeviceSelect])

  useEffect(() => {
    getMicrophones()

    const handleDeviceChange = () => {
      getMicrophones()
    }

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange)

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange)
    }
  }, [getMicrophones])

  if (microphones.length === 0) {
    return null
  }

  return (
    <DeviceSelector
      label="Microphone"
      devices={microphones}
      selectedDeviceId={selectedDeviceId}
      onDeviceSelect={onDeviceSelect}
      styledComponents={{ SelectorButton, SelectorLabel, DropdownList, DropdownItem }}
      logPrefix="MicrophoneSelector"
    />
  )
}
