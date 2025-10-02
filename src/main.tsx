import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import { DclThemeProvider, darkTheme } from 'decentraland-ui2'
import { App } from './App'
import { TranslationProvider } from './modules/translation'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TranslationProvider>
      <DclThemeProvider theme={darkTheme}>
        <App />
      </DclThemeProvider>
    </TranslationProvider>
  </React.StrictMode>
)
