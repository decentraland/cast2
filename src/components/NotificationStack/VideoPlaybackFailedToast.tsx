import { Toast } from './Toast'
import { Notification } from '../../context/NotificationContext'
import { useTranslation } from '../../modules/translation'

interface VideoPlaybackFailedToastProps {
  notification: Notification
  onDismiss: (id: string) => void
}

function VideoPlaybackFailedToast({ notification, onDismiss }: VideoPlaybackFailedToastProps) {
  const { t } = useTranslation()
  return (
    <Toast.Root id={notification.id} onDismiss={() => onDismiss(notification.id)}>
      <Toast.Header>
        <Toast.Body>
          <Toast.Title>{t('notifications.video_playback_failed.title')}</Toast.Title>
          {notification.message ? <Toast.Message>{notification.message}</Toast.Message> : null}
        </Toast.Body>
        <Toast.DismissButton />
      </Toast.Header>
      {notification.action ? <Toast.Action label={notification.action.label} onClick={notification.action.onClick} /> : null}
    </Toast.Root>
  )
}

export { VideoPlaybackFailedToast }
