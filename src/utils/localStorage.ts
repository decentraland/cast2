const STREAMER_TOKEN_KEY = 'dcl_cast_streamer_token'

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

export { saveStreamerToken, getStreamerToken, clearStreamerToken }
