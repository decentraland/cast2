import { WorldScene } from '../../utils/api'

interface WorldSceneSelectorProps {
  scenes: WorldScene[]
  worldName: string
  onSelect: (parcel: string) => void
}

export type { WorldSceneSelectorProps }
