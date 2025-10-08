import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { MediaSelector } from './MediaSelector'
import * as useMediaDevicesModule from '../../../hooks/useMediaDevices'

jest.mock('../../../hooks/useMediaDevices')
jest.mock('decentraland-ui2', () => ({
  CircularProgress: ({ size }: { size: number }) => <div data-testid="loading-spinner">{size}</div>
}))

jest.mock('../DeviceSelector', () => ({
  DeviceSelector: ({ label, devices, selectedDeviceId, onDeviceSelect, logPrefix }: any) => (
    <div data-testid={`device-selector-${logPrefix}`}>
      <span data-testid="label">{label}</span>
      <span data-testid="device-count">{devices.length}</span>
      <span data-testid="selected-id">{selectedDeviceId}</span>
      <button onClick={() => onDeviceSelect('new-device-id')}>Select Device</button>
    </div>
  )
}))

const mockUseMediaDevices = useMediaDevicesModule.useMediaDevices as jest.MockedFunction<typeof useMediaDevicesModule.useMediaDevices>

const mockChildComponents = {
  SelectorButton: (() => <div>Button</div>) as any,
  SelectorLabel: (() => <div>Label</div>) as any,
  DropdownList: (() => <div>List</div>) as any,
  DropdownItem: (() => <div>Item</div>) as any
}

describe('MediaSelector', () => {
  let mockOnDeviceSelect: jest.Mock

  beforeEach(() => {
    mockOnDeviceSelect = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('when the type is "microphone"', () => {
    describe('and devices are loading', () => {
      beforeEach(() => {
        mockUseMediaDevices.mockReturnValue({
          audioInputs: [],
          videoInputs: [],
          audioOutputs: [],
          isLoading: true,
          error: null,
          refetch: jest.fn()
        })
      })

      it('should display a loading spinner', () => {
        render(
          <MediaSelector type="microphone" selectedDeviceId="" onDeviceSelect={mockOnDeviceSelect} childComponents={mockChildComponents} />
        )

        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
      })
    })

    describe('and devices are loaded', () => {
      let audioInputs: Array<{ deviceId: string; label: string; kind: MediaDeviceKind }>

      beforeEach(() => {
        audioInputs = [
          { deviceId: 'default', label: 'Default Microphone', kind: 'audioinput' },
          { deviceId: 'mic-1', label: 'Microphone 1', kind: 'audioinput' },
          { deviceId: 'mic-2', label: 'Microphone 2', kind: 'audioinput' }
        ]

        mockUseMediaDevices.mockReturnValue({
          audioInputs,
          videoInputs: [],
          audioOutputs: [],
          isLoading: false,
          error: null,
          refetch: jest.fn()
        })
      })

      it('should render the DeviceSelector with correct label', () => {
        render(
          <MediaSelector
            type="microphone"
            selectedDeviceId="mic-1"
            onDeviceSelect={mockOnDeviceSelect}
            childComponents={mockChildComponents}
          />
        )

        expect(screen.getByTestId('label')).toHaveTextContent('Microphone')
      })

      it('should pass all available devices to DeviceSelector', () => {
        render(
          <MediaSelector
            type="microphone"
            selectedDeviceId="mic-1"
            onDeviceSelect={mockOnDeviceSelect}
            childComponents={mockChildComponents}
          />
        )

        expect(screen.getByTestId('device-count')).toHaveTextContent('3')
      })

      it('should auto-select the default device when no device is selected', async () => {
        render(
          <MediaSelector type="microphone" selectedDeviceId="" onDeviceSelect={mockOnDeviceSelect} childComponents={mockChildComponents} />
        )

        await waitFor(() => {
          expect(mockOnDeviceSelect).toHaveBeenCalledWith('default')
        })
      })

      it('should not auto-select when a valid device is already selected', async () => {
        render(
          <MediaSelector
            type="microphone"
            selectedDeviceId="mic-1"
            onDeviceSelect={mockOnDeviceSelect}
            childComponents={mockChildComponents}
          />
        )

        await waitFor(() => {
          expect(mockOnDeviceSelect).not.toHaveBeenCalled()
        })
      })
    })

    describe('and no devices are available', () => {
      beforeEach(() => {
        mockUseMediaDevices.mockReturnValue({
          audioInputs: [],
          videoInputs: [],
          audioOutputs: [],
          isLoading: false,
          error: null,
          refetch: jest.fn()
        })
      })

      it('should render nothing', () => {
        const { container } = render(
          <MediaSelector type="microphone" selectedDeviceId="" onDeviceSelect={mockOnDeviceSelect} childComponents={mockChildComponents} />
        )

        expect(container.firstChild).toBeNull()
      })
    })
  })

  describe('when the type is "camera"', () => {
    describe('and devices are loaded', () => {
      let videoInputs: Array<{ deviceId: string; label: string; kind: MediaDeviceKind }>

      beforeEach(() => {
        videoInputs = [
          { deviceId: 'camera-1', label: 'Front Camera', kind: 'videoinput' },
          { deviceId: 'camera-2', label: 'Back Camera', kind: 'videoinput' }
        ]

        mockUseMediaDevices.mockReturnValue({
          audioInputs: [],
          videoInputs,
          audioOutputs: [],
          isLoading: false,
          error: null,
          refetch: jest.fn()
        })
      })

      it('should render the DeviceSelector with "Camera" label', () => {
        render(
          <MediaSelector
            type="camera"
            selectedDeviceId="camera-1"
            onDeviceSelect={mockOnDeviceSelect}
            childComponents={mockChildComponents}
          />
        )

        expect(screen.getByTestId('label')).toHaveTextContent('Camera')
      })

      it('should pass video input devices to DeviceSelector', () => {
        render(
          <MediaSelector
            type="camera"
            selectedDeviceId="camera-1"
            onDeviceSelect={mockOnDeviceSelect}
            childComponents={mockChildComponents}
          />
        )

        expect(screen.getByTestId('device-count')).toHaveTextContent('2')
      })

      it('should auto-select the first device when no default is available', async () => {
        render(
          <MediaSelector type="camera" selectedDeviceId="" onDeviceSelect={mockOnDeviceSelect} childComponents={mockChildComponents} />
        )

        await waitFor(() => {
          expect(mockOnDeviceSelect).toHaveBeenCalledWith('camera-1')
        })
      })
    })
  })

  describe('when the type is "audioOutput"', () => {
    describe('and devices are loaded', () => {
      let audioOutputs: Array<{ deviceId: string; label: string; kind: MediaDeviceKind }>

      beforeEach(() => {
        audioOutputs = [
          { deviceId: 'default', label: 'Default Speaker', kind: 'audiooutput' },
          { deviceId: 'speaker-1', label: 'Speaker 1', kind: 'audiooutput' }
        ]

        mockUseMediaDevices.mockReturnValue({
          audioInputs: [],
          videoInputs: [],
          audioOutputs,
          isLoading: false,
          error: null,
          refetch: jest.fn()
        })
      })

      it('should render the DeviceSelector with "Audio" label', () => {
        render(
          <MediaSelector
            type="audioOutput"
            selectedDeviceId="speaker-1"
            onDeviceSelect={mockOnDeviceSelect}
            childComponents={mockChildComponents}
          />
        )

        expect(screen.getByTestId('label')).toHaveTextContent('Audio')
      })

      it('should pass audio output devices to DeviceSelector', () => {
        render(
          <MediaSelector
            type="audioOutput"
            selectedDeviceId="speaker-1"
            onDeviceSelect={mockOnDeviceSelect}
            childComponents={mockChildComponents}
          />
        )

        expect(screen.getByTestId('device-count')).toHaveTextContent('2')
      })
    })
  })

  describe('when the selected device becomes invalid', () => {
    let audioInputs: Array<{ deviceId: string; label: string; kind: MediaDeviceKind }>

    beforeEach(() => {
      audioInputs = [
        { deviceId: 'mic-1', label: 'Microphone 1', kind: 'audioinput' },
        { deviceId: 'mic-2', label: 'Microphone 2', kind: 'audioinput' }
      ]

      mockUseMediaDevices.mockReturnValue({
        audioInputs,
        videoInputs: [],
        audioOutputs: [],
        isLoading: false,
        error: null,
        refetch: jest.fn()
      })
    })

    it('should auto-select the first available device', async () => {
      render(
        <MediaSelector
          type="microphone"
          selectedDeviceId="invalid-device-id"
          onDeviceSelect={mockOnDeviceSelect}
          childComponents={mockChildComponents}
        />
      )

      await waitFor(() => {
        expect(mockOnDeviceSelect).toHaveBeenCalledWith('mic-1')
      })
    })
  })

  describe('when audio output devices are enumerated without permissions', () => {
    let audioOutputsWithDefault: Array<{ deviceId: string; label: string; kind: MediaDeviceKind }>

    beforeEach(() => {
      audioOutputsWithDefault = [{ deviceId: 'default', label: 'Default Audio Output', kind: 'audiooutput' }]

      mockUseMediaDevices.mockReturnValue({
        audioInputs: [],
        videoInputs: [],
        audioOutputs: audioOutputsWithDefault,
        isLoading: false,
        error: null,
        refetch: jest.fn()
      })
    })

    it('should render with default audio output device', () => {
      render(
        <MediaSelector type="audioOutput" selectedDeviceId="" onDeviceSelect={mockOnDeviceSelect} childComponents={mockChildComponents} />
      )

      expect(screen.getByTestId('label')).toHaveTextContent('Audio')
      expect(screen.getByTestId('device-count')).toHaveTextContent('1')
    })

    it('should auto-select the default device', async () => {
      render(
        <MediaSelector type="audioOutput" selectedDeviceId="" onDeviceSelect={mockOnDeviceSelect} childComponents={mockChildComponents} />
      )

      await waitFor(() => {
        expect(mockOnDeviceSelect).toHaveBeenCalledWith('default')
      })
    })
  })
})
