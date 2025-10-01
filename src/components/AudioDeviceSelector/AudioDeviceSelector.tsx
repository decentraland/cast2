import { useEffect, useState } from 'react'
import { InputLabel, Select } from 'decentraland-ui2'
import { useTranslation } from '../../modules/translation'
import { LoadingText, NoDevicesText, SelectorContainer, StyledFormControl, StyledMenuItem } from './AudioDeviceSelector.styled'

interface AudioDevice {
  deviceId: string
  label: string
  kind: string
}

interface AudioDeviceSelectorProps {
  selectedDeviceId?: string
  onDeviceSelect: (deviceId: string) => void
}

export function AudioDeviceSelector({ selectedDeviceId, onDeviceSelect }: AudioDeviceSelectorProps) {
  const { t } = useTranslation()
  const [audioDevices, setAudioDevices] = useState<AudioDevice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getAudioDevices = async () => {
      try {
        // Request microphone permission first
        await navigator.mediaDevices.getUserMedia({ audio: true })

        const devices = await navigator.mediaDevices.enumerateDevices()
        const audioInputs = devices
          .filter(device => device.kind === 'audioinput')
          .map(device => ({
            deviceId: device.deviceId,
            label: device.label || `Microphone ${device.deviceId.slice(0, 8)}`,
            kind: device.kind
          }))

        setAudioDevices(audioInputs)

        // Auto-select first device if none selected or invalid ID
        const hasValidSelection = selectedDeviceId && audioInputs.some(d => d.deviceId === selectedDeviceId)
        if ((!selectedDeviceId || !hasValidSelection) && audioInputs.length > 0) {
          onDeviceSelect(audioInputs[0].deviceId)
        }
      } catch {
        // Error getting audio devices
      } finally {
        setLoading(false)
      }
    }

    getAudioDevices()

    // Listen for device changes
    const handleDeviceChange = () => {
      getAudioDevices()
    }

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange)

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange)
    }
  }, [selectedDeviceId, onDeviceSelect])

  if (loading) {
    return (
      <SelectorContainer>
        <LoadingText variant="body2">{t('device_selector.loading', { type: 'audio' })}</LoadingText>
      </SelectorContainer>
    )
  }

  if (audioDevices.length === 0) {
    return (
      <SelectorContainer>
        <NoDevicesText variant="body2">{t('device_selector.no_devices', { type: 'audio' })}</NoDevicesText>
      </SelectorContainer>
    )
  }

  return (
    <SelectorContainer>
      <StyledFormControl variant="outlined" size="small">
        <InputLabel>{t('device_selector.audio_input')}</InputLabel>
        <Select
          value={selectedDeviceId && audioDevices.some(d => d.deviceId === selectedDeviceId) ? selectedDeviceId : ''}
          onChange={e => onDeviceSelect(e.target.value)}
          label={t('device_selector.audio_input')}
          displayEmpty
        >
          {!selectedDeviceId && (
            <StyledMenuItem value="">
              <em>{t('device_selector.select_device', { type: 'Audio' })}</em>
            </StyledMenuItem>
          )}
          {audioDevices.map(device => (
            <StyledMenuItem key={device.deviceId} value={device.deviceId}>
              {device.label}
            </StyledMenuItem>
          ))}
        </Select>
      </StyledFormControl>
    </SelectorContainer>
  )
}
