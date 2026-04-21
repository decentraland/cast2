import { Toast } from './Toast'
import { Notification } from '../../context/NotificationContext'
import { useTranslation } from '../../modules/translation'

interface PresentationDownloadFailedToastProps {
  notification: Notification
  onDismiss: (id: string) => void
}

function PresentationDownloadFailedToast({ notification, onDismiss }: PresentationDownloadFailedToastProps) {
  const { t } = useTranslation()
  const body = notification.message ?? t('notifications.presentation_download_failed.default_message')

  return (
    <Toast.Root id={notification.id} onDismiss={() => onDismiss(notification.id)}>
      <Toast.Header>
        <Toast.Body>
          <Toast.Title>{t('notifications.presentation_download_failed.title')}</Toast.Title>
          <Toast.Message>{body}</Toast.Message>
        </Toast.Body>
        <Toast.DismissButton />
      </Toast.Header>
    </Toast.Root>
  )
}

export { PresentationDownloadFailedToast }
