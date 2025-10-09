const STREAMER_TOKEN_KEY = 'dcl_cast_streamer_token'
const DEVICE_SETTINGS_KEY = 'dcl_cast_device_settings'

interface DeviceSettings {
  audioInputId?: string
  audioOutputId?: string
  videoDeviceId?: string
}

function saveStreamerToken(token: string): void {
  try {
    localStorage.setItem(STREAMER_TOKEN_KEY, token)
    console.log('[localStorage] Streamer token saved')
  } catch (error) {
    console.error('[localStorage] Failed to save streamer token:', error)
  }
}

function getStreamerToken(): string | null {
  try {
    const token = localStorage.getItem(STREAMER_TOKEN_KEY)
    console.log('[localStorage] Streamer token retrieved:', token ? 'exists' : 'not found')
    return token
  } catch (error) {
    console.error('[localStorage] Failed to get streamer token:', error)
    return null
  }
}

function clearStreamerToken(): void {
  try {
    localStorage.removeItem(STREAMER_TOKEN_KEY)
    console.log('[localStorage] Streamer token cleared')
  } catch (error) {
    console.error('[localStorage] Failed to clear streamer token:', error)
  }
}

function saveDeviceSettings(settings: DeviceSettings): void {
  try {
    localStorage.setItem(DEVICE_SETTINGS_KEY, JSON.stringify(settings))
    console.log('[localStorage] Device settings saved')
  } catch (error) {
    console.error('[localStorage] Error saving device settings:', error)
  }
}

function getDeviceSettings(): DeviceSettings | null {
  try {
    const settings = localStorage.getItem(DEVICE_SETTINGS_KEY)
    if (settings) {
      console.log('[localStorage] Device settings retrieved')
      return JSON.parse(settings)
    }
    console.log('[localStorage] No device settings found')
    return null
  } catch (error) {
    console.error('[localStorage] Error retrieving device settings:', error)
    return null
  }
}

function clearDeviceSettings(): void {
  try {
    localStorage.removeItem(DEVICE_SETTINGS_KEY)
    console.log('[localStorage] Device settings cleared')
  } catch (error) {
    console.error('[localStorage] Error clearing device settings:', error)
  }
}

export { saveStreamerToken, getStreamerToken, clearStreamerToken, saveDeviceSettings, getDeviceSettings, clearDeviceSettings }
