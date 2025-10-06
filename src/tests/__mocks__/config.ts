export const config = {
  get: (key: string, defaultValue?: string) => {
    const configs: Record<string, string> = {
      LIVEKIT_URL: 'wss://test-livekit.example.com',
      API_URL: 'http://localhost:3000'
    }
    return configs[key] || defaultValue || ''
  }
}
