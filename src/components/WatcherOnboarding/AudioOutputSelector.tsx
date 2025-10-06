import { useCallback, useEffect, useState } from 'react'
import { DeviceOption, DeviceSelector } from '../common/DeviceSelector'
import { DropdownItem, DropdownList, SelectorButton, SelectorLabel } from './WatcherOnboarding.styled'

interface AudioOutputSelectorProps {
  selectedDeviceId: string
  onDeviceSelect: (deviceId: string) => void
}

export function AudioOutputSelector({ selectedDeviceId, onDeviceSelect }: AudioOutputSelectorProps) {
  const [audioOutputs, setAudioOutputs] = useState<DeviceOption[]>([])

  const getAudioOutputs = useCallback(async () => {
    try {
      // Request audio permission first to get device labels
      await navigator.mediaDevices.getUserMedia({ audio: true })

      const devices = await navigator.mediaDevices.enumerateDevices()
      const outputs = devices
        .filter(device => device.kind === 'audiooutput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Audio Output ${device.deviceId.slice(0, 8)}`,
          kind: device.kind
        }))

      setAudioOutputs(outputs)

      // Auto-select default device (first one) if none selected
      if (outputs.length > 0) {
        const defaultDevice = outputs.find(d => d.deviceId === 'default') || outputs[0]
        const hasValidSelection = selectedDeviceId && outputs.some(d => d.deviceId === selectedDeviceId)
        if (!selectedDeviceId || !hasValidSelection) {
          onDeviceSelect(defaultDevice.deviceId)
        }
      }
    } catch (error) {
      console.error('[AudioOutputSelector] Error getting audio outputs:', error)
    }
  }, [selectedDeviceId, onDeviceSelect])

  useEffect(() => {
    getAudioOutputs()

    const handleDeviceChange = () => {
      getAudioOutputs()
    }

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange)

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange)
    }
  }, [getAudioOutputs])

  if (audioOutputs.length === 0) {
    return null
  }

  return (
    <DeviceSelector
      label="Audio"
      devices={audioOutputs}
      selectedDeviceId={selectedDeviceId}
      onDeviceSelect={onDeviceSelect}
      childComponents={{ SelectorButton, SelectorLabel, DropdownList, DropdownItem }}
      logPrefix="WatcherAudioOutputSelector"
    />
  )
}
