import { useRef, useState } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import {
  BrowseButton,
  CloseButton,
  Divider,
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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [url, setUrl] = useState('')

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
    onUrlSubmitted(trimmed)
    onClose()
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

        <Title>Share Presentation</Title>

        <UrlRow>
          <UrlInput
            placeholder="Paste your presentation URL"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <ShareButton onClick={handleShareUrl} disabled={!url.trim()}>Share</ShareButton>
        </UrlRow>

        <Divider>or</Divider>

        <BrowseButton onClick={handleBrowse}>Browse your local files</BrowseButton>
        <input ref={fileInputRef} type="file" accept=".pdf,.pptx" style={{ display: 'none' }} onChange={handleFileChange} />

        <SupportedFormats>Supported formats: gslides (Google Slides) and PDF.</SupportedFormats>
      </Modal>
    </Overlay>
  )
}
