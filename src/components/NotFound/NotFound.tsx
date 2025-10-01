// React 18 JSX Transform - React import not needed
import { useNavigate } from 'react-router-dom'
import HomeIcon from '@mui/icons-material/Home'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
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

  return (
    <NotFoundContainer>
      <NotFoundIcon>
        <SportsEsportsIcon style={{ fontSize: '64px' }} />
      </NotFoundIcon>
      <NotFoundTitle>404 - Page Not Found</NotFoundTitle>
      <NotFoundDescription>
        This Cast 2.0 stream doesn't exist. Stream links are generated on-demand by the Admin Smart Item in Decentraland scenes. If you
        followed a valid link and still see this error, the stream may have ended.
      </NotFoundDescription>
      <ButtonWrapper>
        <NotFoundButton onClick={() => navigate('/')} variant="contained" startIcon={<HomeIcon />}>
          Go Home
        </NotFoundButton>
        <NotFoundLink href="https://docs.decentraland.org/creator/worlds/cast/" target="_blank" rel="noopener noreferrer">
          <MenuBookIcon />
          View Documentation
        </NotFoundLink>
      </ButtonWrapper>
    </NotFoundContainer>
  )
}
