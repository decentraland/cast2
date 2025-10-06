import { Link, styled } from 'decentraland-ui2'

const StyledLink = styled(Link)({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  color: 'inherit',
  textDecoration: 'none',
  '&:hover': {
    textDecoration: 'underline'
  },
  '& svg': {
    fontSize: 16
  }
})

const AuthDemoBox = styled('div')({
  marginTop: 24,
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  alignItems: 'center'
})

const AppContainer = styled('div')({
  minHeight: '100vh'
})

export { AppContainer, AuthDemoBox, StyledLink }
