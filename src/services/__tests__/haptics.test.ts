jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: { Success: 'success', Warning: 'warning' },
}));

import * as Haptics from 'expo-haptics';
import { hapticSuccess, hapticWarning } from '../haptics';

const mockedHaptics = Haptics as jest.Mocked<typeof Haptics>;

describe('haptics', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('hapticSuccess dispara la notificación de éxito', async () => {
    mockedHaptics.notificationAsync.mockResolvedValue(undefined);

    await hapticSuccess();

    expect(mockedHaptics.notificationAsync).toHaveBeenCalledWith('success');
  });

  it('hapticWarning dispara la notificación de advertencia', async () => {
    mockedHaptics.notificationAsync.mockResolvedValue(undefined);

    await hapticWarning();

    expect(mockedHaptics.notificationAsync).toHaveBeenCalledWith('warning');
  });

  it('sin soporte háptico (la API rechaza) no lanza ni muestra error', async () => {
    mockedHaptics.notificationAsync.mockRejectedValue(new Error('unsupported'));

    await expect(hapticSuccess()).resolves.toBeUndefined();
    await expect(hapticWarning()).resolves.toBeUndefined();
  });
});
