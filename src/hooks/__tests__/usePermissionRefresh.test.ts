import { act, renderHook } from '@testing-library/react-native';
import { AppState } from 'react-native';
import type { PermissionStatus } from '../../types';
import { usePermissionRefresh } from '../usePermissionRefresh';

type ChangeListener = (state: 'active' | 'background') => void;

async function setup(status: PermissionStatus, readStatus: () => Promise<PermissionStatus>) {
  const onStatus = jest.fn();
  const spy = jest.spyOn(AppState, 'addEventListener');
  spy.mockClear(); // el mock global de RN acumula llamadas entre pruebas
  const hook = await renderHook(
    (props: { status: PermissionStatus }) => usePermissionRefresh(props.status, readStatus, onStatus),
    { initialProps: { status } }
  );
  const listener = spy.mock.calls[0][1] as ChangeListener;
  return { ...hook, onStatus, listener };
}

describe('usePermissionRefresh', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('al volver a primer plano con permiso denegado, relee y notifica el nuevo estado', async () => {
    const read = jest.fn().mockResolvedValue('granted');
    const { onStatus, listener } = await setup('denied', read);

    await act(async () => {
      listener('active');
    });

    expect(read).toHaveBeenCalledTimes(1);
    expect(onStatus).toHaveBeenCalledWith('granted');
  });

  it('con permiso bloqueado también relee', async () => {
    const read = jest.fn().mockResolvedValue('granted');
    const { listener } = await setup('blocked', read);

    await act(async () => {
      listener('active');
    });

    expect(read).toHaveBeenCalledTimes(1);
  });

  it('usa el estado más reciente: tras pasar a denegado relee, antes no', async () => {
    const read = jest.fn().mockResolvedValue('granted');
    const { rerender, listener } = await setup('undetermined', read);

    await act(async () => {
      listener('active');
    });
    expect(read).not.toHaveBeenCalled();

    await rerender({ status: 'denied' });
    await act(async () => {
      listener('active');
    });
    expect(read).toHaveBeenCalledTimes(1);
  });

  it('sin aviso visible (concedido o sin decidir) no relee', async () => {
    const read = jest.fn().mockResolvedValue('granted');
    const { listener } = await setup('granted', read);

    await act(async () => {
      listener('active');
    });

    expect(read).not.toHaveBeenCalled();
  });

  it('al pasar a segundo plano no relee', async () => {
    const read = jest.fn().mockResolvedValue('granted');
    const { listener } = await setup('denied', read);

    await act(async () => {
      listener('background');
    });

    expect(read).not.toHaveBeenCalled();
  });

  it('al desmontar elimina la suscripción', async () => {
    const remove = jest.fn();
    jest.spyOn(AppState, 'addEventListener').mockReturnValue({ remove });
    const { unmount } = await renderHook(() =>
      usePermissionRefresh('denied', jest.fn(), jest.fn())
    );

    await unmount();

    expect(remove).toHaveBeenCalledTimes(1);
  });
});
