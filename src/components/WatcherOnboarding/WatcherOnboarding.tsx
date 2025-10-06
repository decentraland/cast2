import { useState } from 'react'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import { AudioOutputSelector } from './AudioOutputSelector'
import { useTranslation } from '../../modules/translation'
import { WatcherOnboardingProps } from './WatcherOnboarding.types'
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
  Title,
  WatcherLabel
} from './WatcherOnboarding.styled'

export function WatcherOnboarding({ streamName = 'Stream', onJoin, isJoining }: WatcherOnboardingProps) {
  const { t } = useTranslation()
  const [audioOutputId, setAudioOutputId] = useState('')

  const handleJoin = () => {
    onJoin({
      audioOutputId
    })
  }

  const canJoin = audioOutputId

  if (isJoining) {
    return (
      <OnboardingContainer>
        <JoiningContainer>
          <JoiningLogo>
            <JoiningLogoImage src="/images/logo.png" alt="Decentraland Logo" />
          </JoiningLogo>
          <JoiningSpinner />
          <JoiningText>{t('onboarding.joining')}</JoiningText>
        </JoiningContainer>
      </OnboardingContainer>
    )
  }

  return (
    <OnboardingContainer>
      <OnboardingModal>
        <LogoContainer>
          <LogoImage src="/images/logo.png" alt="Decentraland Logo" />
        </LogoContainer>

        <Title>{t('onboarding.ready_to_join', { streamName })}</Title>
        <WatcherLabel>Watcher</WatcherLabel>

        <DeviceSelectorsContainer>
          <DeviceSelectorRow>
            <VolumeUpIcon />
            <AudioOutputSelector selectedDeviceId={audioOutputId} onDeviceSelect={setAudioOutputId} />
          </DeviceSelectorRow>
        </DeviceSelectorsContainer>

        <JoinButton onClick={handleJoin} disabled={!canJoin || isJoining}>
          {t('onboarding.join_now')}
        </JoinButton>
      </OnboardingModal>
    </OnboardingContainer>
  )
}
