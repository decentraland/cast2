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
    const viewportHeight = window.innerHeight
    const dropdownWidth = Math.max(minWidth, rect.width)
    const estimatedDropdownHeight = 200 // Approximate height

    // On mobile, check if dropdown would overflow on the right or if it's in the left half
    const wouldOverflowRight = rect.left + dropdownWidth > viewportWidth - 16
    const isInLeftHalf = rect.left < viewportWidth / 2

    // Check if dropdown should open upwards (not enough space below)
    const wouldOverflowBottom = rect.bottom + estimatedDropdownHeight > viewportHeight - 16
    const shouldOpenUpwards = isMobile && wouldOverflowBottom && rect.top > estimatedDropdownHeight

    let calculatedPosition: DropdownPosition

    if (isMobile && (wouldOverflowRight || isInLeftHalf)) {
      // On mobile in left half, align dropdown to open towards the right
      calculatedPosition = {
        top: shouldOpenUpwards ? rect.top - estimatedDropdownHeight - 4 : rect.bottom + 4,
        right: viewportWidth - rect.right - 40, // Offset to the right
        width: Math.min(dropdownWidth, viewportWidth - rect.left - 56)
      }
    } else {
      // Normal positioning (left-aligned or desktop)
      calculatedPosition = {
        top: shouldOpenUpwards ? rect.top - estimatedDropdownHeight - 4 : rect.bottom + 4,
        left: rect.left,
        width: dropdownWidth
      }
    }

    setPosition(calculatedPosition)
  }, [isOpen, isMobile, minWidth, containerRef])

  return position
}
