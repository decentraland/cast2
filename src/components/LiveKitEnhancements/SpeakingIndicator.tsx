import { TrackReferenceOrPlaceholder, useAudioWaveform, useIsSpeaking } from '@livekit/components-react'
import { LocalAudioTrack, Participant, RemoteAudioTrack } from 'livekit-client'
import { useTranslation } from '../../modules/translation'
import { SpeakingCircle } from './SpeakingIndicator.styled'

interface SpeakingIndicatorProps {
  participant?: Participant
  trackRef?: LocalAudioTrack | RemoteAudioTrack | TrackReferenceOrPlaceholder
}

export function SpeakingIndicator({ participant, trackRef }: SpeakingIndicatorProps) {
  const { t } = useTranslation()
  const isSpeaking = useIsSpeaking(participant)

  // Get audio waveform for intensity (experimental)
  const audioWaveform = useAudioWaveform(trackRef, {
    barCount: 1,
    updateInterval: 100,
    volMultiplier: 1.5
  })

  // Calculate speaking intensity from waveform
  const intensity = audioWaveform?.bars?.length ? Math.max(...audioWaveform.bars) / 255 : 0.5

  // Debug logs
  if (isSpeaking) {
    console.log('[SpeakingIndicator] Speaking detected', {
      participant: participant?.identity,
      isSpeaking,
      intensity,
      bars: audioWaveform?.bars,
      trackRef
    })
  }

  return (
    <SpeakingCircle isSpeaking={isSpeaking} intensity={intensity} title={isSpeaking ? t('status.speaking') : t('status.not_speaking')} />
  )
}
