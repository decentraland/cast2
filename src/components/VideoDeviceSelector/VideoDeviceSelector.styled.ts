import styled from '@emotion/styled'
import { FormControl, MenuItem, Typography } from 'decentraland-ui2'

const SelectorContainer = styled.div`
  margin: 8px 0;
  min-width: 200px;
`

const StyledFormControl = styled(FormControl)`
  && {
    width: 100%;

    .MuiInputLabel-root {
      color: rgba(255, 255, 255, 0.9);
      font-size: 12px;
      font-weight: 500;
    }

    .MuiSelect-select {
      color: #333;
      background: rgba(255, 255, 255, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 6px;
      font-size: 12px;
      padding: 8px 12px;
      font-weight: 500;
    }

    .MuiOutlinedInput-notchedOutline {
      border-color: rgba(255, 255, 255, 0.3);
    }

    &:hover .MuiOutlinedInput-notchedOutline {
      border-color: rgba(255, 255, 255, 0.5);
    }

    &.Mui-focused .MuiOutlinedInput-notchedOutline {
      border-color: var(--primary, #ff2d55);
      border-width: 2px;
    }
  }
`

const StyledMenuItem = styled(MenuItem)`
  && {
    color: #333;
    font-size: 12px;
    font-weight: 500;
    background: white;

    &:hover {
      background: #f5f5f5;
    }

    &.Mui-selected {
      background: var(--primary, #ff2d55);
      color: white;

      &:hover {
        background: var(--primary-dark, #e91e63);
      }
    }
  }
`

const LoadingText = styled(Typography)`
  && {
    color: rgba(255, 255, 255, 0.7);
    font-size: 12px;
  }
`

const NoDevicesText = styled(Typography)`
  && {
    color: rgba(255, 255, 255, 0.5);
    font-size: 12px;
  }
`

export { LoadingText, NoDevicesText, SelectorContainer, StyledFormControl, StyledMenuItem }
