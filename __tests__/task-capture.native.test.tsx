import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import type { Ref } from 'react';

let mockCameraPermission = { granted: true, canAskAgain: true };
let mockLocationPermission = { granted: true, canAskAgain: true };
const mockRequestCameraPermission = jest.fn();
const mockRequestLocationPermission = jest.fn();
const mockUseForegroundPermissions = jest.fn();
const mockTakePictureAsync = jest.fn();
const mockCopy = jest.fn();
const mockCreateDirectory = jest.fn();
const mockGetCurrentPositionAsync = jest.fn();
let mockOnCameraReady: (() => void) | undefined;

jest.mock('expo-camera', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    CameraView: React.forwardRef(
      (props: { onCameraReady?: () => void }, ref: Ref<{ takePictureAsync: typeof mockTakePictureAsync }>) => {
      mockOnCameraReady = props.onCameraReady;
      React.useImperativeHandle(ref, () => ({ takePictureAsync: mockTakePictureAsync }));
      return React.createElement(View, { testID: 'camera-view' });
    }),
    useCameraPermissions: () => [mockCameraPermission, mockRequestCameraPermission],
  };
});

jest.mock('expo-location', () => ({
  useForegroundPermissions: () => mockUseForegroundPermissions(),
  getCurrentPositionAsync: (...args: unknown[]) => mockGetCurrentPositionAsync(...args),
}));

jest.mock('expo-file-system', () => ({
  Directory: class {
    create = mockCreateDirectory;
    base: string;
    name: string;

    constructor(...args: string[]) {
      this.base = args[0] ?? '';
      this.name = args[1] ?? '';
    }
  },
  File: class {
    uri: string;
    copy = mockCopy;

    constructor(parentOrUri: { name?: string } | string, name?: string) {
      this.uri =
        typeof parentOrUri === 'string'
          ? parentOrUri
          : `file:///documents/${parentOrUri.name ?? 'task-images'}/${name}`;
    }
  },
  Paths: { document: 'file:///documents' },
}));

jest.mock('expo-image', () => ({
  Image: () => null,
}));

import { TaskCapture } from '@/components/task-capture.native';

describe('captura de periféricos', () => {
  beforeEach(() => {
    mockCameraPermission = { granted: true, canAskAgain: true };
    mockLocationPermission = { granted: true, canAskAgain: true };
    mockRequestCameraPermission.mockReset();
    mockRequestLocationPermission.mockReset();
    mockTakePictureAsync.mockReset();
    mockCopy.mockReset();
    mockCreateDirectory.mockReset();
    mockOnCameraReady = undefined;
    mockGetCurrentPositionAsync.mockReset();
    mockUseForegroundPermissions.mockReturnValue([
      mockLocationPermission,
      mockRequestLocationPermission,
    ]);
  });

  test('asocia una foto después de capturarla', async () => {
    mockTakePictureAsync.mockResolvedValue({ uri: 'cache://photo.jpg' });
    const onChange = jest.fn();

    const view = await render(<TaskCapture disabled={false} value={{}} onChange={onChange} />);
    await act(async () => {
      fireEvent.press(view.getByText('Adjuntar foto'));
    });
    await waitFor(() => expect(mockOnCameraReady).toEqual(expect.any(Function)));
    await act(async () => {
      mockOnCameraReady?.();
    });
    const captureButton = await view.findByText('Tomar foto');
    await act(async () => {
      fireEvent.press(captureButton);
    });

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith({
        photoUri: expect.stringContaining('task-images'),
      });
    });
    expect(mockCopy).toHaveBeenCalled();
  });

  test('informa una denegación de cámara sin crear una foto', async () => {
    mockCameraPermission = { granted: false, canAskAgain: true };
    mockRequestCameraPermission.mockResolvedValue(mockCameraPermission);
    const onChange = jest.fn();

    const view = await render(<TaskCapture disabled={false} value={{}} onChange={onChange} />);
    await act(async () => {
      fireEvent.press(view.getByText('Adjuntar foto'));
    });
    expect(await view.findByText(/No se concedió permiso para usar la cámara/)).toBeTruthy();
    expect(onChange).not.toHaveBeenCalled();
  });

  test('asocia las coordenadas obtenidas', async () => {
    mockUseForegroundPermissions.mockReturnValue([
      { granted: true, canAskAgain: true },
      mockRequestLocationPermission,
    ]);
    mockGetCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: -33.4489, longitude: -70.6693, accuracy: 12 },
    });
    const onChange = jest.fn();

    const view = await render(<TaskCapture disabled={false} value={{}} onChange={onChange} />);
    await act(async () => {
      fireEvent.press(view.getByText('Registrar ubicación'));
    });
    await waitFor(() => expect(mockGetCurrentPositionAsync).toHaveBeenCalled());
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith({
        latitude: -33.4489,
        longitude: -70.6693,
      });
    });
  });

  test('informa una denegación de ubicación sin crear coordenadas', async () => {
    mockLocationPermission = { granted: false, canAskAgain: true };
    mockUseForegroundPermissions.mockReturnValue([
      { granted: false, canAskAgain: true },
      mockRequestLocationPermission,
    ]);
    mockRequestLocationPermission.mockResolvedValue(mockLocationPermission);
    const onChange = jest.fn();

    const view = await render(<TaskCapture disabled={false} value={{}} onChange={onChange} />);
    await act(async () => {
      fireEvent.press(view.getByText('Registrar ubicación'));
    });
    expect(await view.findByText(/No se concedió permiso para usar la ubicación/)).toBeTruthy();
    expect(onChange).not.toHaveBeenCalled();
  });
});
