import { useRef } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import {
  BrowseButton,
  CloseButton,
  Divider,
  Modal,
  Overlay,
  SupportedFormats,
  Title
} from './SharePresentationModal.styled'

interface SharePresentationModalProps {
  onClose: () => void
  onFileSelected: (file: File) => void
}

export function SharePresentationModal({ onClose, onFileSelected }: SharePresentationModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

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

        <Divider>Browse a file from your computer</Divider>

        <BrowseButton onClick={handleBrowse}>Browse your local files</BrowseButton>
        <input ref={fileInputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleFileChange} />

        <SupportedFormats>Supported formats: PDF</SupportedFormats>
      </Modal>
    </Overlay>
  )
}
