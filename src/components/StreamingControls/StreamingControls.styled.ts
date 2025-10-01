import styled from '@emotion/styled'

const ControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 8px;
`

const ControlsRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
`

const ControlGroup = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`

const DeviceSelectorWrapper = styled.div`
  min-width: 200px;
`

export { ControlGroup, ControlsContainer, ControlsRow, DeviceSelectorWrapper }
