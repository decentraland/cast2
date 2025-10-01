import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import 'decentraland-ui/dist/themes/alternative/dark-theme.css'
import 'decentraland-ui/lib/styles.css'
import { DclThemeProvider, darkTheme } from 'decentraland-ui2'
import { App } from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DclThemeProvider theme={darkTheme}>
      <App />
    </DclThemeProvider>
  </React.StrictMode>
)
