import { useRef, useState } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import { useTranslation } from '../../modules/translation'
import {
  BrowseButton,
  CloseButton,
  Divider,
  ErrorText,
  Modal,
  Overlay,
  ShareButton,
  SupportedFormats,
  Title,
  UrlInput,
  UrlRow
} from './SharePresentationModal.styled'

interface SharePresentationModalProps {
  onClose: () => void
  onFileSelected: (file: File) => void
  onUrlSubmitted: (url: string) => void
}

export function SharePresentationModal({ onClose, onFileSelected, onUrlSubmitted }: SharePresentationModalProps) {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [url, setUrl] = useState('')
  const [urlError, setUrlError] = useState<string | null>(null)

  const handleBrowse = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onFileSelected(file)
      onClose()
    }
    event.target.value = ''
  }

  const handleShareUrl = () => {
    const trimmed = url.trim()
    if (!trimmed) return
    let parsed: URL
    try {
      parsed = new URL(trimmed)
    } catch {
      setUrlError(t('streaming_controls.url_invalid'))
      return
    }
    if (parsed.protocol !== 'https:') {
      setUrlError(t('streaming_controls.url_https_required'))
      return
    }
    setUrlError(null)
    onUrlSubmitted(trimmed)
    onClose()
  }

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value)
    if (urlError) setUrlError(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleShareUrl()
    }
  }

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  return (
    <Overlay onClick={handleOverlayClick}>
      <Modal>
        <CloseButton onClick={onClose}>
          <CloseIcon />
        </CloseButton>

        <Title>{t('streaming_controls.share_presentation')}</Title>

        <UrlRow>
          <UrlInput
            placeholder={t('streaming_controls.paste_presentation_url')}
            value={url}
            onChange={handleUrlChange}
            onKeyDown={handleKeyDown}
          />
          <ShareButton onClick={handleShareUrl} disabled={!url.trim()}>
            {t('streaming_controls.share')}
          </ShareButton>
        </UrlRow>

        {urlError && <ErrorText>{urlError}</ErrorText>}

        <Divider>{t('streaming_controls.or')}</Divider>

        <BrowseButton onClick={handleBrowse}>{t('streaming_controls.browse_local_files')}</BrowseButton>
        <input ref={fileInputRef} type="file" accept=".pdf,.pptx" style={{ display: 'none' }} onChange={handleFileChange} />

        <SupportedFormats>{t('streaming_controls.supported_formats')}</SupportedFormats>
      </Modal>
    </Overlay>
  )
}
