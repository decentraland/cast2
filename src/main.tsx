import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import { DclThemeProvider, darkTheme } from 'decentraland-ui2'
import { App } from './App'
import { config } from './config'
import { initializePeerAPI } from './lib/peer'
import { TranslationProvider } from './modules/translation'

// Initialize Peer API for profile fetching
initializePeerAPI(config.get('PEER_URL'))

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TranslationProvider>
      <DclThemeProvider theme={darkTheme}>
        <App />
      </DclThemeProvider>
    </TranslationProvider>
  </React.StrictMode>
)
