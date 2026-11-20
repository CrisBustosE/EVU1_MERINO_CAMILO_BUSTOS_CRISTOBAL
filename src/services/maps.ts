import { Linking, Platform } from 'react-native';
import type { TaskLocation } from '../types';

function mapsUrl({ latitude, longitude }: TaskLocation): string {
  const point = `${latitude},${longitude}`;
  return Platform.OS === 'ios' ? `maps:?q=${point}` : `geo:${point}?q=${point}`;
}

/** Entrega las coordenadas a la app de mapas del dispositivo. */
export async function openInMaps(location: TaskLocation): Promise<void> {
  try {
    await Linking.openURL(mapsUrl(location));
  } catch {
    // Silencio: sin app de mapas disponible la UI no debe bloquearse.
  }
}
