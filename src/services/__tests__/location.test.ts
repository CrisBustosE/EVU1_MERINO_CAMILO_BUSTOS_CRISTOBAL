import { PermissionStatus, type PermissionResponse } from 'expo-modules-core';
import { LOCATION_TIMEOUT_MS } from '../../constants';

jest.mock('expo-location', () => ({
  Accuracy: { Balanced: 3 },
  getForegroundPermissionsAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  reverseGeocodeAsync: jest.fn(),
}));

import * as Location from 'expo-location';
import { captureLocation } from '../location';

const mockedLocation = Location as jest.Mocked<typeof Location>;

function permissionResponse(granted: boolean, canAskAgain: boolean): PermissionResponse {
  return {
    granted,
    canAskAgain,
    expires: 'never',
    status: granted ? PermissionStatus.GRANTED : PermissionStatus.DENIED,
  };
}

function position(accuracy: number | null) {
  return {
    coords: {
      latitude: -33.45,
      longitude: -70.66,
      accuracy,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
    },
    timestamp: 0,
  };
}

function place(overrides: Partial<Location.LocationGeocodedAddress>): Location.LocationGeocodedAddress {
  return {
    city: null,
    district: null,
    street: null,
    streetNumber: null,
    region: null,
    subregion: null,
    country: null,
    postalCode: null,
    name: null,
    isoCountryCode: null,
    timezone: null,
    formattedAddress: null,
    ...overrides,
  };
}

describe('location.captureLocation', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('permiso ya concedido: no vuelve a pedir y devuelve coordenadas, precisión y dirección', async () => {
    mockedLocation.getForegroundPermissionsAsync.mockResolvedValue(permissionResponse(true, true));
    mockedLocation.getCurrentPositionAsync.mockResolvedValue(position(12.4));
    mockedLocation.reverseGeocodeAsync.mockResolvedValue([place({ formattedAddress: 'Alameda 123, Santiago' })]);

    const result = await captureLocation();

    expect(mockedLocation.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
    expect(result).toEqual({
      status: 'ok',
      location: { latitude: -33.45, longitude: -70.66, accuracy: 12.4 },
      address: 'Alameda 123, Santiago',
    });
  });

  it('compone la dirección desde sus partes si no hay formattedAddress', async () => {
    mockedLocation.getForegroundPermissionsAsync.mockResolvedValue(permissionResponse(true, true));
    mockedLocation.getCurrentPositionAsync.mockResolvedValue(position(5));
    mockedLocation.reverseGeocodeAsync.mockResolvedValue([
      place({ street: 'Alameda', streetNumber: '123', city: 'Santiago', country: 'Chile' }),
    ]);

    const result = await captureLocation();

    expect(result).toMatchObject({ status: 'ok', address: 'Alameda 123, Santiago, Chile' });
  });

  it('accuracy null: la precisión se omite del objeto', async () => {
    mockedLocation.getForegroundPermissionsAsync.mockResolvedValue(permissionResponse(true, true));
    mockedLocation.getCurrentPositionAsync.mockResolvedValue(position(null));
    mockedLocation.reverseGeocodeAsync.mockResolvedValue([place({ formattedAddress: 'X' })]);

    const result = await captureLocation();

    expect(result).toEqual({
      status: 'ok',
      location: { latitude: -33.45, longitude: -70.66 },
      address: 'X',
    });
  });

  it('estado inicial denegado: reintenta el request; si lo concede, obtiene la posición', async () => {
    mockedLocation.getForegroundPermissionsAsync.mockResolvedValue(permissionResponse(false, true));
    mockedLocation.requestForegroundPermissionsAsync.mockResolvedValue(permissionResponse(true, true));
    mockedLocation.getCurrentPositionAsync.mockResolvedValue(position(3));
    mockedLocation.reverseGeocodeAsync.mockResolvedValue([]);

    const result = await captureLocation();

    expect(mockedLocation.requestForegroundPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(result.status).toBe('ok');
  });

  it('permiso rechazado (canAskAgain true): devuelve denied sin pedir la posición', async () => {
    mockedLocation.getForegroundPermissionsAsync.mockResolvedValue(permissionResponse(false, true));
    mockedLocation.requestForegroundPermissionsAsync.mockResolvedValue(permissionResponse(false, true));

    const result = await captureLocation();

    expect(result).toEqual({ status: 'denied' });
    expect(mockedLocation.getCurrentPositionAsync).not.toHaveBeenCalled();
  });

  it('estado inicial bloqueado: igual reintenta el request; si lo concede, obtiene la posición', async () => {
    mockedLocation.getForegroundPermissionsAsync.mockResolvedValue(permissionResponse(false, false));
    mockedLocation.requestForegroundPermissionsAsync.mockResolvedValue(permissionResponse(true, true));
    mockedLocation.getCurrentPositionAsync.mockResolvedValue(position(3));
    mockedLocation.reverseGeocodeAsync.mockResolvedValue([]);

    const result = await captureLocation();

    expect(mockedLocation.requestForegroundPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(result.status).toBe('ok');
  });

  it('permiso bloqueado (canAskAgain false tras el request): devuelve blocked', async () => {
    mockedLocation.getForegroundPermissionsAsync.mockResolvedValue(permissionResponse(false, false));
    mockedLocation.requestForegroundPermissionsAsync.mockResolvedValue(permissionResponse(false, false));

    const result = await captureLocation();

    expect(mockedLocation.requestForegroundPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ status: 'blocked' });
    expect(mockedLocation.getCurrentPositionAsync).not.toHaveBeenCalled();
  });

  it('GPS que no responde: devuelve timeout al cumplirse LOCATION_TIMEOUT_MS', async () => {
    jest.useFakeTimers();
    mockedLocation.getForegroundPermissionsAsync.mockResolvedValue(permissionResponse(true, true));
    mockedLocation.getCurrentPositionAsync.mockReturnValue(new Promise(() => {}));

    const pending = captureLocation();
    await jest.advanceTimersByTimeAsync(LOCATION_TIMEOUT_MS);

    await expect(pending).resolves.toEqual({ status: 'timeout' });
  });

  it('error del GPS: devuelve error', async () => {
    mockedLocation.getForegroundPermissionsAsync.mockResolvedValue(permissionResponse(true, true));
    mockedLocation.getCurrentPositionAsync.mockRejectedValue(new Error('location unavailable'));

    const result = await captureLocation();

    expect(result).toEqual({ status: 'error' });
  });

  it('fallo de reverseGeocodeAsync: conserva las coordenadas y omite address', async () => {
    mockedLocation.getForegroundPermissionsAsync.mockResolvedValue(permissionResponse(true, true));
    mockedLocation.getCurrentPositionAsync.mockResolvedValue(position(8));
    mockedLocation.reverseGeocodeAsync.mockRejectedValue(new Error('no network'));

    const result = await captureLocation();

    expect(result).toEqual({
      status: 'ok',
      location: { latitude: -33.45, longitude: -70.66, accuracy: 8 },
    });
    expect(result).not.toHaveProperty('address');
  });

  it('geocodificación que no responde: degrada a coordenadas tras el timeout', async () => {
    jest.useFakeTimers();
    mockedLocation.getForegroundPermissionsAsync.mockResolvedValue(permissionResponse(true, true));
    mockedLocation.getCurrentPositionAsync.mockResolvedValue(position(8));
    mockedLocation.reverseGeocodeAsync.mockReturnValue(new Promise(() => {}));

    const pending = captureLocation();
    await jest.advanceTimersByTimeAsync(LOCATION_TIMEOUT_MS);

    await expect(pending).resolves.toMatchObject({ status: 'ok' });
  });
});
