import { act, renderHook } from '@testing-library/react-native';
import { EmitterSubscription, Keyboard, Platform } from 'react-native';
import { useKeyboardHeight } from '../useKeyboardHeight';

type ShowListener = (e: { endCoordinates: { height: number } }) => void;
type HideListener = () => void;

describe('useKeyboardHeight', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('en Android: reporta la altura al mostrarse el teclado y vuelve a 0 al ocultarse', async () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    const spy = jest.spyOn(Keyboard, 'addListener');
    const { result } = await renderHook(() => useKeyboardHeight());

    const showListener = spy.mock.calls.find((c) => c[0] === 'keyboardDidShow')![1] as ShowListener;
    const hideListener = spy.mock.calls.find((c) => c[0] === 'keyboardDidHide')![1] as HideListener;

    expect(result.current).toBe(0);

    await act(async () => {
      showListener({ endCoordinates: { height: 260 } });
    });
    expect(result.current).toBe(260);

    await act(async () => {
      hideListener();
    });
    expect(result.current).toBe(0);
  });

  it('en iOS: no se suscribe y siempre devuelve 0', async () => {
    jest.replaceProperty(Platform, 'OS', 'ios');
    const spy = jest.spyOn(Keyboard, 'addListener');
    const { result } = await renderHook(() => useKeyboardHeight());

    expect(spy).not.toHaveBeenCalled();
    expect(result.current).toBe(0);
  });

  it('al desmontar elimina las suscripciones', async () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    const remove = jest.fn();
    jest.spyOn(Keyboard, 'addListener').mockReturnValue({ remove } as unknown as EmitterSubscription);
    const { unmount } = await renderHook(() => useKeyboardHeight());

    await unmount();

    expect(remove).toHaveBeenCalledTimes(2);
  });
});
