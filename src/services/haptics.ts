import * as Haptics from 'expo-haptics';

async function notify(type: Haptics.NotificationFeedbackType): Promise<void> {
  try {
    await Haptics.notificationAsync(type);
  } catch {
    // Silencio: sin soporte háptico no debe pasar nada ni mostrarse error.
  }
}

export function hapticSuccess(): Promise<void> {
  return notify(Haptics.NotificationFeedbackType.Success);
}

export function hapticWarning(): Promise<void> {
  return notify(Haptics.NotificationFeedbackType.Warning);
}
