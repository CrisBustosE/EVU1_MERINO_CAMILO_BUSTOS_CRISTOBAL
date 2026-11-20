import * as ImagePicker from 'expo-image-picker';
import { toPermissionStatus } from './permissions';
import { persistPhoto } from './photoStorage';
import type { PermissionStatus } from '../types';

export type PhotoPickResult =
  | { status: 'ok'; uri: string }
  | { status: 'canceled' }
  | { status: 'denied' | 'blocked' }
  | { status: 'error' };

async function finalize(sourceUri: string): Promise<PhotoPickResult> {
  try {
    const uri = await persistPhoto(sourceUri);
    return { status: 'ok', uri };
  } catch {
    return { status: 'error' };
  }
}

/** Lee el estado actual del permiso de cámara sin pedirlo. */
export async function getCameraPermissionStatus(): Promise<PermissionStatus> {
  return toPermissionStatus(await ImagePicker.getCameraPermissionsAsync());
}

/** Pide permiso de cámara solo al pulsar, abre la cámara y copia la foto resultante. */
export async function takePhoto(): Promise<PhotoPickResult> {
  try {
    const current = toPermissionStatus(await ImagePicker.getCameraPermissionsAsync());

    // Siempre se reintenta el request si no está concedido: el sistema puede devolver
    // canAskAgain:false aunque el usuario haya cambiado el permiso en los ajustes
    // (p. ej. a "Preguntar siempre"). Si no puede mostrar el diálogo, el request
    // resuelve de inmediato sin molestar al usuario.
    const status =
      current === 'granted'
        ? current
        : toPermissionStatus(await ImagePicker.requestCameraPermissionsAsync());
    if (status !== 'granted') {
      return { status: status === 'blocked' ? 'blocked' : 'denied' };
    }

    const result = await ImagePicker.launchCameraAsync({ mediaTypes: 'images', quality: 0.8 });
    if (result.canceled) return { status: 'canceled' };
    return finalize(result.assets[0].uri);
  } catch {
    return { status: 'error' };
  }
}

/** Galería: usa el selector del sistema, no requiere permiso de lectura. */
export async function pickFromGallery(): Promise<PhotoPickResult> {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      quality: 0.8,
      allowsMultipleSelection: false,
    });
    if (result.canceled) return { status: 'canceled' };
    return finalize(result.assets[0].uri);
  } catch {
    return { status: 'error' };
  }
}
