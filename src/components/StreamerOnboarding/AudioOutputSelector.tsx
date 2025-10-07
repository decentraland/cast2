import { useCallback, useEffect, useState } from 'react'
import { CircularProgress } from 'decentraland-ui2'
import { DeviceOption, DeviceSelector } from '../common/DeviceSelector'
import { DropdownItem, DropdownList, SelectorButton, SelectorLabel } from './StreamerOnboarding.styled'

interface AudioOutputSelectorProps {
  selectedDeviceId: string
  onDeviceSelect: (deviceId: string) => void
}

export function AudioOutputSelector({ selectedDeviceId, onDeviceSelect }: AudioOutputSelectorProps) {
  const [audioOutputs, setAudioOutputs] = useState<DeviceOption[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const getAudioOutputs = useCallback(async () => {
    try {
      setIsLoading(true)
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

      console.log('[AudioOutputSelector] Audio outputs found:', outputs)
      setAudioOutputs(outputs)

      // Auto-select default device (first one) if none selected
      if (outputs.length > 0) {
        const defaultDevice = outputs.find(d => d.deviceId === 'default') || outputs[0]
        const hasValidSelection = selectedDeviceId && outputs.some(d => d.deviceId === selectedDeviceId)
        if (!selectedDeviceId || !hasValidSelection) {
          console.log('[AudioOutputSelector] Auto-selecting device:', defaultDevice)
          onDeviceSelect(defaultDevice.deviceId)
        } else {
          console.log('[AudioOutputSelector] Current selection is valid:', selectedDeviceId)
        }
      }
    } catch (error) {
      console.error('[AudioOutputSelector] Error getting audio outputs:', error)
    } finally {
      setIsLoading(false)
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

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40px' }}>
        <CircularProgress size={20} />
      </div>
    )
  }

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
      logPrefix="AudioOutputSelector"
    />
  )
}
