import { useEffect, useState } from 'react'
import { useMobileMediaQuery } from 'decentraland-ui2'

interface DropdownPosition {
  top: number
  left?: number
  right?: number
  width: number
}

interface UseDropdownPositionOptions {
  isOpen: boolean
  containerRef: React.RefObject<HTMLDivElement>
  minWidth?: number
}

export function useDropdownPosition({ isOpen, containerRef, minWidth = 250 }: UseDropdownPositionOptions): DropdownPosition | null {
  const [position, setPosition] = useState<DropdownPosition | null>(null)
  const isMobile = useMobileMediaQuery()

  useEffect(() => {
    if (!isOpen || !containerRef.current) {
      setPosition(null)
      return
    }

    const rect = containerRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const dropdownWidth = Math.max(minWidth, rect.width)

    // On mobile, check if dropdown would overflow on the right
    const wouldOverflowRight = rect.left + dropdownWidth > viewportWidth - 16

    let calculatedPosition: DropdownPosition

    if (isMobile && wouldOverflowRight) {
      // On mobile, align dropdown to the right edge of the button
      // This ensures it opens towards the left (inward) instead of overflowing right
      calculatedPosition = {
        top: rect.bottom + 4,
        right: viewportWidth - rect.right,
        width: Math.min(dropdownWidth, rect.right - 16)
      }
    } else {
      // Normal positioning (left-aligned)
      calculatedPosition = {
        top: rect.bottom + 4,
        left: rect.left,
        width: dropdownWidth
      }
    }

    setPosition(calculatedPosition)
  }, [isOpen, isMobile, minWidth, containerRef])

  return position
}
