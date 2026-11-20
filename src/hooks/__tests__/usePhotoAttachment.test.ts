import { act, renderHook } from '@testing-library/react-native';
import { AppState } from 'react-native';
import type { PhotoPickResult } from '../../services/photoPicker';

jest.mock('../../services/photoPicker', () => ({
  takePhoto: jest.fn(),
  pickFromGallery: jest.fn(),
  getCameraPermissionStatus: jest.fn(),
}));

jest.mock('../../services/photoStorage', () => ({
  deletePhoto: jest.fn().mockResolvedValue(undefined),
}));

import { takePhoto, pickFromGallery, getCameraPermissionStatus } from '../../services/photoPicker';
import { deletePhoto } from '../../services/photoStorage';
import { usePhotoAttachment } from '../usePhotoAttachment';

const mockedTakePhoto = takePhoto as jest.MockedFunction<typeof takePhoto>;
const mockedPickFromGallery = pickFromGallery as jest.MockedFunction<typeof pickFromGallery>;
const mockedDeletePhoto = deletePhoto as jest.MockedFunction<typeof deletePhoto>;
const mockedGetCameraPermissionStatus = getCameraPermissionStatus as jest.MockedFunction<
  typeof getCameraPermissionStatus
>;

function ok(uri: string): PhotoPickResult {
  return { status: 'ok', uri };
}

describe('usePhotoAttachment', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('elegir una foto nueva actualiza photoUri', async () => {
    mockedTakePhoto.mockResolvedValue(ok('file:///new1.jpg'));
    const { result } = await renderHook(() => usePhotoAttachment(undefined));

    await act(async () => {
      await result.current.takePhoto();
    });

    expect(result.current.photoUri).toBe('file:///new1.jpg');
  });

  it('reemplazar la foto actualiza photoUri a la nueva copia', async () => {
    mockedTakePhoto.mockResolvedValueOnce(ok('file:///new1.jpg'));
    mockedTakePhoto.mockResolvedValueOnce(ok('file:///new2.jpg'));
    const { result } = await renderHook(() => usePhotoAttachment(undefined));

    await act(async () => {
      await result.current.takePhoto();
    });
    await act(async () => {
      await result.current.takePhoto();
    });

    expect(result.current.photoUri).toBe('file:///new2.jpg');
  });

  it('quitar la foto deja photoUri sin definir', async () => {
    mockedTakePhoto.mockResolvedValue(ok('file:///new1.jpg'));
    const { result } = await renderHook(() => usePhotoAttachment(undefined));

    await act(async () => {
      await result.current.takePhoto();
    });
    await act(async () => {
      result.current.removePhoto();
    });

    expect(result.current.photoUri).toBeUndefined();
  });

  it('cancelar el selector no cambia el estado', async () => {
    mockedPickFromGallery.mockResolvedValue({ status: 'canceled' });
    const { result } = await renderHook(() => usePhotoAttachment('file:///orig.jpg'));

    await act(async () => {
      await result.current.pickFromGallery();
    });

    expect(result.current.photoUri).toBe('file:///orig.jpg');
  });

  it('fallo al tomar/copiar la foto deja error = "photoError" sin cambiar photoUri', async () => {
    mockedTakePhoto.mockResolvedValue({ status: 'error' });
    const { result } = await renderHook(() => usePhotoAttachment(undefined));

    await act(async () => {
      await result.current.takePhoto();
    });

    expect(result.current.error).toBe('photoError');
    expect(result.current.photoUri).toBeUndefined();
  });

  it('fallo al elegir/copiar de la galería deja error = "photoError" sin cambiar photoUri', async () => {
    mockedPickFromGallery.mockResolvedValue({ status: 'error' });
    const { result } = await renderHook(() => usePhotoAttachment('file:///orig.jpg'));

    await act(async () => {
      await result.current.pickFromGallery();
    });

    expect(result.current.error).toBe('photoError');
    expect(result.current.photoUri).toBe('file:///orig.jpg');
  });

  it('commit borra el archivo original y las copias intermedias, conserva la final', async () => {
    mockedTakePhoto.mockResolvedValueOnce(ok('file:///new1.jpg'));
    mockedTakePhoto.mockResolvedValueOnce(ok('file:///new2.jpg'));
    const { result } = await renderHook(() => usePhotoAttachment('file:///orig.jpg'));

    await act(async () => {
      await result.current.takePhoto();
    });
    await act(async () => {
      await result.current.takePhoto();
    });
    await act(async () => {
      await result.current.commit('file:///new2.jpg');
    });

    expect(mockedDeletePhoto).toHaveBeenCalledWith('file:///orig.jpg');
    expect(mockedDeletePhoto).toHaveBeenCalledWith('file:///new1.jpg');
    expect(mockedDeletePhoto).not.toHaveBeenCalledWith('file:///new2.jpg');
  });

  it('discard borra solo las copias nuevas de la sesión y conserva la original', async () => {
    mockedTakePhoto.mockResolvedValue(ok('file:///new1.jpg'));
    const { result } = await renderHook(() => usePhotoAttachment('file:///orig.jpg'));

    await act(async () => {
      await result.current.takePhoto();
    });
    await act(async () => {
      result.current.discard();
    });

    expect(mockedDeletePhoto).toHaveBeenCalledWith('file:///new1.jpg');
    expect(mockedDeletePhoto).not.toHaveBeenCalledWith('file:///orig.jpg');
  });

  it('desmontar sin commit borra las copias nuevas de la sesión', async () => {
    mockedTakePhoto.mockResolvedValue(ok('file:///new1.jpg'));
    const { result, unmount } = await renderHook(() => usePhotoAttachment('file:///orig.jpg'));

    await act(async () => {
      await result.current.takePhoto();
    });
    await act(async () => {
      await unmount();
    });

    expect(mockedDeletePhoto).toHaveBeenCalledWith('file:///new1.jpg');
    expect(mockedDeletePhoto).not.toHaveBeenCalledWith('file:///orig.jpg');
  });

  it('permiso denegado o bloqueado nunca lanza ni bloquea el guardado', async () => {
    mockedTakePhoto.mockResolvedValue({ status: 'denied' });
    const { result } = await renderHook(() => usePhotoAttachment(undefined));

    await act(async () => {
      await result.current.takePhoto();
    });

    expect(result.current.permissionStatus).toBe('denied');
    expect(result.current.photoUri).toBeUndefined();
  });

  it('al volver a primer plano con el aviso visible, relee el permiso y lo actualiza', async () => {
    mockedTakePhoto.mockResolvedValue({ status: 'denied' });
    mockedGetCameraPermissionStatus.mockResolvedValue('granted');
    const addEventListenerSpy = jest.spyOn(AppState, 'addEventListener');
    const { result } = await renderHook(() => usePhotoAttachment(undefined));
    const onChange = addEventListenerSpy.mock.calls[0][1];

    await act(async () => {
      await result.current.takePhoto();
    });
    expect(result.current.permissionStatus).toBe('denied');

    await act(async () => {
      onChange('active');
    });

    expect(mockedGetCameraPermissionStatus).toHaveBeenCalledTimes(1);
    expect(result.current.permissionStatus).toBe('granted');
    addEventListenerSpy.mockRestore();
  });

  it('al volver a primer plano sin aviso de permiso visible, no relee el estado', async () => {
    mockedGetCameraPermissionStatus.mockResolvedValue('granted');
    const addEventListenerSpy = jest.spyOn(AppState, 'addEventListener');
    await renderHook(() => usePhotoAttachment(undefined));
    const onChange = addEventListenerSpy.mock.calls[0][1];

    await act(async () => {
      onChange('active');
    });

    expect(mockedGetCameraPermissionStatus).not.toHaveBeenCalled();
    addEventListenerSpy.mockRestore();
  });
});
