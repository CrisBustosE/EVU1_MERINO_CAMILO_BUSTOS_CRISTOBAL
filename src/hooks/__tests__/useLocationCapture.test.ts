import { act, renderHook } from '@testing-library/react-native';
import { AppState } from 'react-native';
import type { LocationCaptureResult } from '../../services/location';

jest.mock('../../services/location', () => ({
  captureLocation: jest.fn(),
  getLocationPermissionStatus: jest.fn(),
}));

import { captureLocation, getLocationPermissionStatus } from '../../services/location';
import { useLocationCapture } from '../useLocationCapture';

const mockedCapture = captureLocation as jest.MockedFunction<typeof captureLocation>;
const mockedGetStatus = getLocationPermissionStatus as jest.MockedFunction<
  typeof getLocationPermissionStatus
>;

const okResult: LocationCaptureResult = {
  status: 'ok',
  location: { latitude: 1, longitude: 2, accuracy: 10 },
  address: 'Calle 1',
};

describe('useLocationCapture', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('capturar con éxito guarda ubicación y dirección y marca el permiso concedido', async () => {
    mockedCapture.mockResolvedValue(okResult);
    const { result } = await renderHook(() => useLocationCapture());

    await act(async () => {
      await result.current.capture();
    });

    expect(result.current.location).toEqual({ latitude: 1, longitude: 2, accuracy: 10 });
    expect(result.current.address).toBe('Calle 1');
    expect(result.current.permissionStatus).toBe('granted');
    expect(result.current.error).toBeUndefined();
  });

  it('busy es true mientras se obtiene la ubicación y vuelve a false al terminar', async () => {
    let resolve: (value: LocationCaptureResult) => void = () => {};
    mockedCapture.mockReturnValue(new Promise((r) => (resolve = r)));
    const { result } = await renderHook(() => useLocationCapture());

    let pending: Promise<void> = Promise.resolve();
    await act(async () => {
      pending = result.current.capture();
    });
    expect(result.current.busy).toBe(true);

    await act(async () => {
      resolve(okResult);
      await pending;
    });
    expect(result.current.busy).toBe(false);
  });

  it('permiso denegado deja el estado y no cambia la ubicación', async () => {
    mockedCapture.mockResolvedValue({ status: 'denied' });
    const { result } = await renderHook(() => useLocationCapture());

    await act(async () => {
      await result.current.capture();
    });

    expect(result.current.permissionStatus).toBe('denied');
    expect(result.current.location).toBeUndefined();
    expect(result.current.error).toBeUndefined();
  });

  it('permiso bloqueado deja el estado blocked', async () => {
    mockedCapture.mockResolvedValue({ status: 'blocked' });
    const { result } = await renderHook(() => useLocationCapture());

    await act(async () => {
      await result.current.capture();
    });

    expect(result.current.permissionStatus).toBe('blocked');
  });

  it('timeout deja error = "locationTimeout" y permite reintentar con éxito', async () => {
    mockedCapture.mockResolvedValueOnce({ status: 'timeout' });
    mockedCapture.mockResolvedValueOnce(okResult);
    const { result } = await renderHook(() => useLocationCapture());

    await act(async () => {
      await result.current.capture();
    });
    expect(result.current.error).toBe('locationTimeout');
    expect(result.current.location).toBeUndefined();

    await act(async () => {
      await result.current.capture();
    });
    expect(result.current.error).toBeUndefined();
    expect(result.current.location).toBeDefined();
  });

  it('error del GPS deja error = "locationError"', async () => {
    mockedCapture.mockResolvedValue({ status: 'error' });
    const { result } = await renderHook(() => useLocationCapture());

    await act(async () => {
      await result.current.capture();
    });

    expect(result.current.error).toBe('locationError');
  });

  it('geocodificación fallida: conserva coordenadas con address sin definir', async () => {
    mockedCapture.mockResolvedValue({ status: 'ok', location: { latitude: 1, longitude: 2 } });
    const { result } = await renderHook(() => useLocationCapture());

    await act(async () => {
      await result.current.capture();
    });

    expect(result.current.location).toEqual({ latitude: 1, longitude: 2 });
    expect(result.current.address).toBeUndefined();
  });

  it('quitar limpia ubicación y dirección', async () => {
    const { result } = await renderHook(() =>
      useLocationCapture({ location: { latitude: 1, longitude: 2 }, address: 'Calle 1' })
    );

    await act(async () => {
      result.current.remove();
    });

    expect(result.current.location).toBeUndefined();
    expect(result.current.address).toBeUndefined();
  });

  it('parte de la ubicación inicial recibida (edición)', async () => {
    const { result } = await renderHook(() =>
      useLocationCapture({ location: { latitude: 1, longitude: 2 }, address: 'Calle 1' })
    );

    expect(result.current.location).toEqual({ latitude: 1, longitude: 2 });
    expect(result.current.address).toBe('Calle 1');
  });

  it('al volver a primer plano con el aviso visible, relee el permiso del sistema', async () => {
    mockedCapture.mockResolvedValue({ status: 'denied' });
    mockedGetStatus.mockResolvedValue('granted');
    const spy = jest.spyOn(AppState, 'addEventListener');
    spy.mockClear(); // el mock global de RN acumula llamadas entre pruebas
    const { result } = await renderHook(() => useLocationCapture());
    const onChange = spy.mock.calls[0][1];

    await act(async () => {
      await result.current.capture();
    });
    await act(async () => {
      onChange('active');
    });

    expect(result.current.permissionStatus).toBe('granted');
  });
});
