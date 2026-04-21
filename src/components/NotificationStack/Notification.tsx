import CloseIcon from '@mui/icons-material/Close'
import { Notification as NotificationModel, NotificationVariant } from '../../context/NotificationContext'
import { useTranslation } from '../../modules/translation'
import { ActionButton, CloseButton, Message, TextBlock, Title, Toast, TopRow } from './NotificationStack.styled'

interface NotificationProps {
  notification: NotificationModel
  onDismiss: (id: string) => void
}

// Per-variant title key. Body text is sourced from the notification's `message`
// (backend-provided, already localized at source) — falling back to a generic
// `default_message` only when the source gave us nothing.
const TITLE_KEY: Record<NotificationVariant, string> = {
  PresentationDownloadFailed: 'notifications.presentation_download_failed.title',
  VideoPlaybackFailed: 'notifications.video_playback_failed.title'
}

const FALLBACK_MESSAGE_KEY: Partial<Record<NotificationVariant, string>> = {
  PresentationDownloadFailed: 'notifications.presentation_download_failed.default_message'
}

function Notification({ notification, onDismiss }: NotificationProps) {
  const { t } = useTranslation()
  const title = t(TITLE_KEY[notification.variant])
  const fallbackKey = FALLBACK_MESSAGE_KEY[notification.variant]
  const body = notification.message ?? (fallbackKey ? t(fallbackKey) : undefined)

  return (
    <Toast data-testid={`notification-${notification.id}`}>
      <TopRow>
        <TextBlock>
          <Title>{title}</Title>
          {body && <Message data-testid="notification-message">{body}</Message>}
        </TextBlock>
        <CloseButton aria-label={t('notifications.dismiss')} onClick={() => onDismiss(notification.id)}>
          <CloseIcon />
        </CloseButton>
      </TopRow>
      {notification.action && (
        <ActionButton
          onClick={() => {
            notification.action?.onClick()
            onDismiss(notification.id)
          }}
        >
          {notification.action.label}
        </ActionButton>
      )}
    </Toast>
  )
}

export { Notification }
