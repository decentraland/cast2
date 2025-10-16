interface StreamingControlsProps {
  onToggleChat?: () => void
  onTogglePeople?: () => void
  isStreamer?: boolean
  onLeave?: () => void
  unreadMessagesCount?: number
}

export type { StreamingControlsProps }
