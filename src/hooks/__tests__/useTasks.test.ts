jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../services/photoStorage', () => ({
  deletePhoto: jest.fn().mockResolvedValue(undefined),
}));

import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useTasks } from '../useTasks';
import { deletePhoto } from '../../services/photoStorage';

const mockedDeletePhoto = deletePhoto as jest.MockedFunction<typeof deletePhoto>;

describe('useTasks.deleteTask', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('borra el archivo de la foto de la tarea eliminada', async () => {
    const { result } = await renderHook(() => useTasks());
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    await act(async () => {
      result.current.saveTask({
        id: '1',
        title: 'Con foto',
        description: '',
        createdAt: 1,
        photoUri: 'file:///document/photos/a.jpg',
      });
    });

    await act(async () => {
      result.current.deleteTask('1');
    });

    expect(mockedDeletePhoto).toHaveBeenCalledWith('file:///document/photos/a.jpg');
  });

  it('eliminar una tarea sin foto no falla', async () => {
    const { result } = await renderHook(() => useTasks());
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    await act(async () => {
      result.current.saveTask({ id: '2', title: 'Sin foto', description: '', createdAt: 1 });
    });

    await act(async () => {
      result.current.deleteTask('2');
    });

    expect(mockedDeletePhoto).toHaveBeenCalledWith(undefined);
  });
});
