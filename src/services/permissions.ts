import { Linking } from 'react-native';
import type { PermissionStatus } from '../types';

/** Resultado mínimo común a expo-image-picker y expo-location, sin importar esos módulos. */
export interface NativePermissionResponse {
  granted: boolean;
  canAskAgain: boolean;
  status?: string;
}

export function toPermissionStatus(response: NativePermissionResponse): PermissionStatus {
  if (response.granted) return 'granted';
  if (response.status === 'undetermined') return 'undetermined';
  return response.canAskAgain ? 'denied' : 'blocked';
}

export function isPermissionRejected(status: PermissionStatus): boolean {
  return status === 'denied' || status === 'blocked';
}

export async function openAppSettings(): Promise<void> {
  try {
    await Linking.openSettings();
  } catch {
    // Silencio: la UI no debe bloquearse si no se puede abrir ajustes.
  }
}
