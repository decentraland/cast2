import { Notification } from './Notification'
import { useNotifications } from '../../context/NotificationContext'
import { StackRoot } from './NotificationStack.styled'

function NotificationStack() {
  const { notifications, dismiss } = useNotifications()
  if (notifications.length === 0) return null
  return (
    <StackRoot>
      {notifications.map(n => (
        <Notification key={n.id} notification={n} onDismiss={dismiss} />
      ))}
    </StackRoot>
  )
}

export { NotificationStack }
