import { useNavigate } from 'react-router-dom'
import HomeIcon from '@mui/icons-material/Home'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import { useTranslation } from '../../modules/translation'
import {
  ButtonWrapper,
  NotFoundButton,
  NotFoundContainer,
  NotFoundDescription,
  NotFoundIcon,
  NotFoundLink,
  NotFoundTitle
} from './NotFound.styled'

export function NotFound() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <NotFoundContainer>
      <NotFoundIcon>
        <SportsEsportsIcon style={{ fontSize: '64px' }} />
      </NotFoundIcon>
      <NotFoundTitle>{t('not_found.title')}</NotFoundTitle>
      <NotFoundDescription>{t('not_found.description')}</NotFoundDescription>
      <ButtonWrapper>
        <NotFoundButton onClick={() => navigate('/')} variant="contained" startIcon={<HomeIcon />}>
          {t('not_found.go_home')}
        </NotFoundButton>
        <NotFoundLink href="https://docs.decentraland.org/creator/worlds/cast/" target="_blank" rel="noopener noreferrer">
          <MenuBookIcon />
          {t('app.view_docs')}
        </NotFoundLink>
      </ButtonWrapper>
    </NotFoundContainer>
  )
}
