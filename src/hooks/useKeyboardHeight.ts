import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

/**
 * Altura del teclado visible, solo en Android: en edge-to-edge el sistema no redimensiona
 * la ventana ni aplica `automaticallyAdjustKeyboardInsets` (solo iOS), así que esta altura
 * se usa en `TaskFormScreen` para calcular el `paddingBottom` del pie fijo (`FormActions`)
 * y que quede justo encima del teclado en vez de detrás. En iOS siempre devuelve 0
 * (comportamiento sin cambios).
 */
export function useKeyboardHeight() {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => setHeight(e.endCoordinates.height));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setHeight(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return height;
}
