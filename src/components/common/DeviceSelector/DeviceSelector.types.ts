import { ComponentType } from 'react'

interface DeviceOption {
  deviceId: string
  label: string
  kind: string
}

interface StyledComponents {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  SelectorButton: ComponentType<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  SelectorLabel: ComponentType<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DropdownList: ComponentType<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DropdownItem: ComponentType<any>
}

interface DeviceSelectorProps {
  label: string
  devices: DeviceOption[]
  selectedDeviceId: string
  onDeviceSelect: (deviceId: string) => void
  styledComponents: StyledComponents
  logPrefix?: string
}

export type { DeviceOption, DeviceSelectorProps, StyledComponents }
