import { useEffect, useState } from 'react'
import { InputLabel, Select } from 'decentraland-ui2'
import { LoadingText, NoDevicesText, SelectorContainer, StyledFormControl, StyledMenuItem } from './VideoDeviceSelector.styled'

interface VideoDevice {
  deviceId: string
  label: string
  kind: string
}

interface VideoDeviceSelectorProps {
  selectedDeviceId?: string
  onDeviceSelect: (deviceId: string) => void
}

export function VideoDeviceSelector({ selectedDeviceId, onDeviceSelect }: VideoDeviceSelectorProps) {
  const [videoDevices, setVideoDevices] = useState<VideoDevice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getVideoDevices = async () => {
      try {
        // Request camera permission first
        await navigator.mediaDevices.getUserMedia({ video: true })

        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoInputs = devices
          .filter(device => device.kind === 'videoinput')
          .map(device => ({
            deviceId: device.deviceId,
            label: device.label || `Camera ${device.deviceId.slice(0, 8)}`,
            kind: device.kind
          }))

        setVideoDevices(videoInputs)

        // Auto-select first device if none selected or invalid ID
        const hasValidSelection = selectedDeviceId && videoInputs.some(d => d.deviceId === selectedDeviceId)
        if ((!selectedDeviceId || !hasValidSelection) && videoInputs.length > 0) {
          onDeviceSelect(videoInputs[0].deviceId)
        }
      } catch {
        // Error getting video devices
      } finally {
        setLoading(false)
      }
    }

    getVideoDevices()

    // Listen for device changes
    const handleDeviceChange = () => {
      getVideoDevices()
    }

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange)

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange)
    }
  }, [selectedDeviceId, onDeviceSelect])

  if (loading) {
    return (
      <SelectorContainer>
        <LoadingText variant="body2">Loading video devices...</LoadingText>
      </SelectorContainer>
    )
  }

  if (videoDevices.length === 0) {
    return (
      <SelectorContainer>
        <NoDevicesText variant="body2">No video devices found</NoDevicesText>
      </SelectorContainer>
    )
  }

  return (
    <SelectorContainer>
      <StyledFormControl variant="outlined" size="small">
        <InputLabel>Video Input</InputLabel>
        <Select
          value={selectedDeviceId && videoDevices.some(d => d.deviceId === selectedDeviceId) ? selectedDeviceId : ''}
          onChange={e => onDeviceSelect(e.target.value)}
          label="Video Input"
          displayEmpty
        >
          {!selectedDeviceId && (
            <StyledMenuItem value="">
              <em>Select Video Device</em>
            </StyledMenuItem>
          )}
          {videoDevices.map(device => (
            <StyledMenuItem key={device.deviceId} value={device.deviceId}>
              {device.label}
            </StyledMenuItem>
          ))}
        </Select>
      </StyledFormControl>
    </SelectorContainer>
  )
}
