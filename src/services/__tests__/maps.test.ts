import { Linking, Platform } from 'react-native';
import { openInMaps } from '../maps';

const location = { latitude: -33.45, longitude: -70.66 };

describe('openInMaps', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Android: abre una URL geo: con las coordenadas', async () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    const spy = jest.spyOn(Linking, 'openURL').mockResolvedValue();

    await openInMaps(location);

    expect(spy).toHaveBeenCalledWith('geo:-33.45,-70.66?q=-33.45,-70.66');
  });

  it('iOS: abre una URL maps: con las coordenadas', async () => {
    jest.replaceProperty(Platform, 'OS', 'ios');
    const spy = jest.spyOn(Linking, 'openURL').mockResolvedValue();

    await openInMaps(location);

    expect(spy).toHaveBeenCalledWith('maps:?q=-33.45,-70.66');
  });

  it('no lanza si no hay app de mapas (openURL rechaza)', async () => {
    jest.spyOn(Linking, 'openURL').mockRejectedValue(new Error('no handler'));

    await expect(openInMaps(location)).resolves.toBeUndefined();
  });
});
