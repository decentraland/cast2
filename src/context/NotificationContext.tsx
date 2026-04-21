import { ReactNode, createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

type NotificationVariant = 'PresentationDownloadFailed' | 'VideoPlaybackFailed'

interface NotificationAction {
  label: string
  onClick: () => void
}

interface NotificationOptions {
  message?: string
  code?: string
  action?: NotificationAction
}

interface Notification {
  id: string
  variant: NotificationVariant
  message?: string
  code?: string
  action?: NotificationAction
}

interface NotificationContextValue {
  notifications: Notification[]
  show: (variant: NotificationVariant, options?: NotificationOptions) => string
  dismiss: (id: string) => void
}

// Auto-dismiss only when there's no action button. Action-bearing toasts wait for
// the user — losing a Retry to a timer would be a bug, not a feature.
const AUTO_DISMISS_MS = 6000

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined)

let counter = 0
function nextId(): string {
  counter += 1
  return `notification-${Date.now()}-${counter}`
}

function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Track timers so we can clear them on unmount or manual dismiss without
  // leaving setState calls firing into an unmounted tree.
  const timersRef = useRef(new Map<string, ReturnType<typeof setTimeout>>())

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const show = useCallback((variant: NotificationVariant, options?: NotificationOptions): string => {
    const id = nextId()
    const notification: Notification = {
      id,
      variant,
      message: options?.message,
      code: options?.code,
      action: options?.action
    }
    setNotifications(prev => [...prev, notification])

    if (!notification.action) {
      const timer = setTimeout(() => {
        timersRef.current.delete(id)
        setNotifications(prev => prev.filter(n => n.id !== id))
      }, AUTO_DISMISS_MS)
      timersRef.current.set(id, timer)
    }

    return id
  }, [])

  useEffect(() => {
    const timers = timersRef.current
    return () => {
      timers.forEach(clearTimeout)
      timers.clear()
    }
  }, [])

  return <NotificationContext.Provider value={{ notifications, show, dismiss }}>{children}</NotificationContext.Provider>
}

function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext)
  if (!ctx) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return ctx
}

export { NotificationProvider, useNotifications }
export type { Notification, NotificationVariant, NotificationOptions, NotificationAction, NotificationContextValue }
