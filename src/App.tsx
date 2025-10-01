import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import { Box, Typography } from 'decentraland-ui2'
import { NotFound } from './components/NotFound/NotFound'
import { StreamerView } from './components/StreamerView/StreamerView'
import { WalletButton } from './components/WalletButton/WalletButton'
import { WatcherView } from './components/WatcherView/WatcherView'
import { AuthProvider } from './context/AuthContext'
import { LiveKitProvider } from './context/LiveKitContext'
import { useTranslation } from './modules/translation'
import { DocsLink } from './App.styled'

const HomePage = () => {
  const { t } = useTranslation()

  return (
    <Box className="home-page">
      <Typography variant="h4">{t('app.title')}</Typography>
      <Typography variant="h6">{t('app.subtitle')}</Typography>
      <Typography variant="body1">{t('app.invalid_route')}</Typography>
      <Typography variant="body2">
        <DocsLink href="https://docs.decentraland.org/creator/worlds/cast/" target="_blank" rel="noopener noreferrer">
          <MenuBookIcon />
          {t('app.view_docs')}
        </DocsLink>
      </Typography>
      <div className="auth-demo">
        <Typography variant="h6">{t('app.auth_demo')}</Typography>
        <WalletButton />
      </div>
    </Box>
  )
}

const App = () => {
  return (
    <AuthProvider>
      <LiveKitProvider>
        <Router>
          <div className="app">
            <Routes>
              {/* Main routes for Cast 2.0 */}
              <Route path="/cast/s/:token" element={<StreamerView />} />
              <Route path="/cast/w/:roomId" element={<WatcherView />} />

              {/* Root redirects to home/invalid route handler */}
              <Route path="/" element={<HomePage />} />

              {/* 404 handler */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </LiveKitProvider>
    </AuthProvider>
  )
}

export { App }
