import * as Location from 'expo-location';
import { toPermissionStatus } from './permissions';
import { LOCATION_TIMEOUT_MS } from '../constants';
import type { PermissionStatus, TaskLocation } from '../types';

export type LocationCaptureResult =
  | { status: 'ok'; location: TaskLocation; address?: string }
  | { status: 'denied' | 'blocked' }
  | { status: 'timeout' }
  | { status: 'error' };

class TimeoutError extends Error {}

function withTimeout<T>(promise: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new TimeoutError()), LOCATION_TIMEOUT_MS);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function formatAddress(place?: Location.LocationGeocodedAddress): string | undefined {
  if (!place) return undefined;
  if (place.formattedAddress) return place.formattedAddress;
  const street = [place.street, place.streetNumber].filter(Boolean).join(' ');
  const text = [street, place.city, place.region, place.country].filter(Boolean).join(', ');
  return text || undefined;
}

/** Degrada a undefined si la geocodificación falla o no responde: se conservan las coordenadas. */
async function resolveAddress({ latitude, longitude }: TaskLocation): Promise<string | undefined> {
  try {
    const places = await withTimeout(Location.reverseGeocodeAsync({ latitude, longitude }));
    return formatAddress(places[0]);
  } catch {
    return undefined;
  }
}

/** Lee el estado actual del permiso de ubicación sin pedirlo. */
export async function getLocationPermissionStatus(): Promise<PermissionStatus> {
  return toPermissionStatus(await Location.getForegroundPermissionsAsync());
}

/** Pide permiso en primer plano solo al pulsar y obtiene la posición actual con su dirección. */
export async function captureLocation(): Promise<LocationCaptureResult> {
  try {
    const current = await getLocationPermissionStatus();

    // Misma regla que la cámara: si no está concedido siempre se reintenta el request;
    // si el sistema no puede mostrar el diálogo, resuelve al instante.
    const status =
      current === 'granted'
        ? current
        : toPermissionStatus(await Location.requestForegroundPermissionsAsync());
    if (status !== 'granted') {
      return { status: status === 'blocked' ? 'blocked' : 'denied' };
    }

    const { coords } = await withTimeout(
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
    );
    const location: TaskLocation = { latitude: coords.latitude, longitude: coords.longitude };
    if (coords.accuracy !== null) location.accuracy = coords.accuracy;

    const address = await resolveAddress(location);
    return address === undefined ? { status: 'ok', location } : { status: 'ok', location, address };
  } catch (error) {
    return { status: error instanceof TimeoutError ? 'timeout' : 'error' };
  }
}
