import { Linking } from 'react-native';
import { toPermissionStatus, isPermissionRejected, openAppSettings } from '../permissions';

describe('toPermissionStatus', () => {
  it('granted true -> granted', () => {
    expect(toPermissionStatus({ granted: true, canAskAgain: true })).toBe('granted');
  });

  it('status undetermined -> undetermined', () => {
    expect(toPermissionStatus({ granted: false, canAskAgain: true, status: 'undetermined' })).toBe(
      'undetermined'
    );
  });

  it('granted false y canAskAgain true -> denied', () => {
    expect(toPermissionStatus({ granted: false, canAskAgain: true })).toBe('denied');
  });

  it('granted false y canAskAgain false -> blocked', () => {
    expect(toPermissionStatus({ granted: false, canAskAgain: false })).toBe('blocked');
  });
});

describe('isPermissionRejected', () => {
  it('denied y blocked son true', () => {
    expect(isPermissionRejected('denied')).toBe(true);
    expect(isPermissionRejected('blocked')).toBe(true);
  });

  it('granted y undetermined son false', () => {
    expect(isPermissionRejected('granted')).toBe(false);
    expect(isPermissionRejected('undetermined')).toBe(false);
  });
});

describe('openAppSettings', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('llama a Linking.openSettings', async () => {
    const spy = jest.spyOn(Linking, 'openSettings').mockResolvedValue();
    await openAppSettings();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('no lanza si Linking.openSettings rechaza', async () => {
    jest.spyOn(Linking, 'openSettings').mockRejectedValue(new Error('fail'));
    await expect(openAppSettings()).resolves.toBeUndefined();
  });
});
