import { PermissionStatus, type PermissionResponse } from 'expo-modules-core';
import type { ImagePickerResult } from 'expo-image-picker';

jest.mock('expo-image-picker', () => ({
  getCameraPermissionsAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

jest.mock('../photoStorage', () => ({
  persistPhoto: jest.fn(),
}));

import * as ImagePicker from 'expo-image-picker';
import { persistPhoto } from '../photoStorage';
import { takePhoto, pickFromGallery } from '../photoPicker';

const mockedPicker = ImagePicker as jest.Mocked<typeof ImagePicker>;
const mockedPersistPhoto = persistPhoto as jest.MockedFunction<typeof persistPhoto>;

function permissionResponse(granted: boolean, canAskAgain: boolean): PermissionResponse {
  return {
    granted,
    canAskAgain,
    expires: 'never',
    status: granted ? PermissionStatus.GRANTED : PermissionStatus.DENIED,
  };
}

function successResult(uri: string): ImagePickerResult {
  return {
    canceled: false,
    assets: [{ uri, width: 100, height: 100 }],
  };
}

function canceledResult(): ImagePickerResult {
  return { canceled: true, assets: null };
}

describe('photoPicker.takePhoto', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('permiso ya concedido: abre la cámara sin volver a pedir permiso', async () => {
    mockedPicker.getCameraPermissionsAsync.mockResolvedValue(permissionResponse(true, true));
    mockedPicker.launchCameraAsync.mockResolvedValue(successResult('tmp://a'));
    mockedPersistPhoto.mockResolvedValue('file:///document/photos/a.jpg');

    const result = await takePhoto();

    expect(mockedPicker.requestCameraPermissionsAsync).not.toHaveBeenCalled();
    expect(result).toEqual({ status: 'ok', uri: 'file:///document/photos/a.jpg' });
  });

  it('estado inicial denegado: siempre reintenta el request; si lo concede, abre la cámara', async () => {
    mockedPicker.getCameraPermissionsAsync.mockResolvedValue(permissionResponse(false, true));
    mockedPicker.requestCameraPermissionsAsync.mockResolvedValue(permissionResponse(true, true));
    mockedPicker.launchCameraAsync.mockResolvedValue(successResult('tmp://a'));
    mockedPersistPhoto.mockResolvedValue('file:///document/photos/a.jpg');

    const result = await takePhoto();

    expect(mockedPicker.requestCameraPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ status: 'ok', uri: 'file:///document/photos/a.jpg' });
  });

  it('estado inicial denegado: si el request sigue denegado (canAskAgain true), devuelve denied', async () => {
    mockedPicker.getCameraPermissionsAsync.mockResolvedValue(permissionResponse(false, true));
    mockedPicker.requestCameraPermissionsAsync.mockResolvedValue(permissionResponse(false, true));

    const result = await takePhoto();

    expect(mockedPicker.requestCameraPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(mockedPicker.launchCameraAsync).not.toHaveBeenCalled();
    expect(result).toEqual({ status: 'denied' });
  });

  it('estado inicial bloqueado: igual se reintenta el request; si lo concede, abre la cámara', async () => {
    mockedPicker.getCameraPermissionsAsync.mockResolvedValue(permissionResponse(false, false));
    mockedPicker.requestCameraPermissionsAsync.mockResolvedValue(permissionResponse(true, true));
    mockedPicker.launchCameraAsync.mockResolvedValue(successResult('tmp://a'));
    mockedPersistPhoto.mockResolvedValue('file:///document/photos/a.jpg');

    const result = await takePhoto();

    expect(mockedPicker.requestCameraPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ status: 'ok', uri: 'file:///document/photos/a.jpg' });
  });

  it('estado inicial bloqueado: si el request sigue sin permitir preguntar, devuelve blocked', async () => {
    mockedPicker.getCameraPermissionsAsync.mockResolvedValue(permissionResponse(false, false));
    mockedPicker.requestCameraPermissionsAsync.mockResolvedValue(permissionResponse(false, false));

    const result = await takePhoto();

    expect(mockedPicker.requestCameraPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(mockedPicker.launchCameraAsync).not.toHaveBeenCalled();
    expect(result).toEqual({ status: 'blocked' });
  });

  it('cancelación del selector de cámara', async () => {
    mockedPicker.getCameraPermissionsAsync.mockResolvedValue(permissionResponse(true, true));
    mockedPicker.launchCameraAsync.mockResolvedValue(canceledResult());

    const result = await takePhoto();

    expect(result).toEqual({ status: 'canceled' });
    expect(mockedPersistPhoto).not.toHaveBeenCalled();
  });

  it('fallo al copiar la foto tomada: devuelve error', async () => {
    mockedPicker.getCameraPermissionsAsync.mockResolvedValue(permissionResponse(true, true));
    mockedPicker.launchCameraAsync.mockResolvedValue(successResult('tmp://a'));
    mockedPersistPhoto.mockRejectedValue(new Error('disk full'));

    const result = await takePhoto();

    expect(result).toEqual({ status: 'error' });
  });
});

describe('photoPicker.pickFromGallery', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('abre la galería sin pedir ningún permiso', async () => {
    mockedPicker.launchImageLibraryAsync.mockResolvedValue(successResult('tmp://g'));
    mockedPersistPhoto.mockResolvedValue('file:///document/photos/g.jpg');

    const result = await pickFromGallery();

    expect(mockedPicker.getCameraPermissionsAsync).not.toHaveBeenCalled();
    expect(mockedPicker.requestCameraPermissionsAsync).not.toHaveBeenCalled();
    expect(result).toEqual({ status: 'ok', uri: 'file:///document/photos/g.jpg' });
  });

  it('cancelación del selector de galería', async () => {
    mockedPicker.launchImageLibraryAsync.mockResolvedValue(canceledResult());

    const result = await pickFromGallery();

    expect(result).toEqual({ status: 'canceled' });
  });

  it('fallo al copiar la foto elegida: devuelve error', async () => {
    mockedPicker.launchImageLibraryAsync.mockResolvedValue(successResult('tmp://g'));
    mockedPersistPhoto.mockRejectedValue(new Error('disk full'));

    const result = await pickFromGallery();

    expect(result).toEqual({ status: 'error' });
  });
});
