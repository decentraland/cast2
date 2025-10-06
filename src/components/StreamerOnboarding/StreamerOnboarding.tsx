import { useState } from 'react'
import MicIcon from '@mui/icons-material/Mic'
import VideocamIcon from '@mui/icons-material/Videocam'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import { AudioOutputSelector } from './AudioOutputSelector'
import { CameraSelector } from './CameraSelector'
import { MicrophoneSelector } from './MicrophoneSelector'
import { useTranslation } from '../../modules/translation'
import { StreamerOnboardingProps } from './StreamerOnboarding.types'
import {
  DeviceSelectorRow,
  DeviceSelectorsContainer,
  JoinButton,
  JoiningContainer,
  JoiningLogo,
  JoiningLogoImage,
  JoiningSpinner,
  JoiningText,
  LogoContainer,
  LogoImage,
  OnboardingContainer,
  OnboardingModal,
  ParticipantLabel,
  StyledTextField,
  Title
} from './StreamerOnboarding.styled'

export function StreamerOnboarding({ streamName = 'Stream', onJoin, isJoining }: StreamerOnboardingProps) {
  const { t } = useTranslation()
  const [displayName, setDisplayName] = useState('')
  const [audioInputId, setAudioInputId] = useState('')
  const [audioOutputId, setAudioOutputId] = useState('')
  const [videoDeviceId, setVideoDeviceId] = useState('')

  const handleJoin = () => {
    onJoin({
      displayName: displayName.trim() || 'Participant',
      audioInputId,
      audioOutputId,
      videoDeviceId
    })
  }

  const canJoin = audioInputId && audioOutputId && videoDeviceId

  if (isJoining) {
    return (
      <OnboardingContainer>
        <JoiningContainer>
          <JoiningLogo>
            <JoiningLogoImage src="/images/logo.png" alt="Decentraland" />
          </JoiningLogo>
          <JoiningText>{t('onboarding.joining')}</JoiningText>
          <JoiningSpinner />
        </JoiningContainer>
      </OnboardingContainer>
    )
  }

  return (
    <OnboardingContainer>
      <OnboardingModal>
        <LogoContainer>
          <LogoImage src="/images/logo.png" alt="Decentraland" />
        </LogoContainer>

        <Title>{t('onboarding.ready_to_join', { streamName })}</Title>
        <ParticipantLabel>{t('onboarding.participant')}</ParticipantLabel>

        <StyledTextField
          fullWidth
          placeholder={t('onboarding.name_placeholder')}
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          variant="outlined"
          size="small"
        />

        <DeviceSelectorsContainer>
          <DeviceSelectorRow>
            <MicIcon />
            <MicrophoneSelector selectedDeviceId={audioInputId} onDeviceSelect={setAudioInputId} />
          </DeviceSelectorRow>

          <DeviceSelectorRow>
            <VolumeUpIcon />
            <AudioOutputSelector selectedDeviceId={audioOutputId} onDeviceSelect={setAudioOutputId} />
          </DeviceSelectorRow>

          <DeviceSelectorRow>
            <VideocamIcon />
            <CameraSelector selectedDeviceId={videoDeviceId} onDeviceSelect={setVideoDeviceId} />
          </DeviceSelectorRow>
        </DeviceSelectorsContainer>

        <JoinButton onClick={handleJoin} disabled={!canJoin || isJoining}>
          {t('onboarding.join_now')}
        </JoinButton>
      </OnboardingModal>
    </OnboardingContainer>
  )
}
