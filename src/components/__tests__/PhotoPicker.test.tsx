jest.mock('../../services/photoStorage', () => ({
  photoExists: jest.fn().mockReturnValue(true),
}));

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PhotoPicker from '../PhotoPicker';

describe('PhotoPicker', () => {
  it('muestra los botones de tomar foto y elegir de galería', async () => {
    const { getByText } = await render(
      <PhotoPicker
        permissionStatus="undetermined"
        busy={false}
        hasError={false}
        onTakePhoto={jest.fn()}
        onPickFromGallery={jest.fn()}
        onRemovePhoto={jest.fn()}
      />
    );
    expect(getByText('Tomar foto')).toBeTruthy();
    expect(getByText('Elegir de galería')).toBeTruthy();
  });

  it('no muestra PermissionNotice cuando el permiso está concedido', async () => {
    const { queryByText } = await render(
      <PhotoPicker
        permissionStatus="granted"
        busy={false}
        hasError={false}
        onTakePhoto={jest.fn()}
        onPickFromGallery={jest.fn()}
        onRemovePhoto={jest.fn()}
      />
    );
    expect(queryByText('Abrir ajustes')).toBeNull();
  });

  it('muestra PermissionNotice cuando el permiso está denegado', async () => {
    const { getByText } = await render(
      <PhotoPicker
        permissionStatus="denied"
        busy={false}
        hasError={false}
        onTakePhoto={jest.fn()}
        onPickFromGallery={jest.fn()}
        onRemovePhoto={jest.fn()}
      />
    );
    expect(getByText('Abrir ajustes')).toBeTruthy();
  });

  it('muestra PermissionNotice cuando el permiso está bloqueado', async () => {
    const { getByText } = await render(
      <PhotoPicker
        permissionStatus="blocked"
        busy={false}
        hasError={false}
        onTakePhoto={jest.fn()}
        onPickFromGallery={jest.fn()}
        onRemovePhoto={jest.fn()}
      />
    );
    expect(getByText('Abrir ajustes')).toBeTruthy();
  });

  it('muestra miniatura y botón "Quitar foto" cuando hay foto', async () => {
    const onRemovePhoto = jest.fn();
    const { getByText, getByLabelText } = await render(
      <PhotoPicker
        photoUri="file:///a.jpg"
        permissionStatus="granted"
        busy={false}
        hasError={false}
        onTakePhoto={jest.fn()}
        onPickFromGallery={jest.fn()}
        onRemovePhoto={onRemovePhoto}
      />
    );
    expect(getByLabelText('Foto adjunta de la tarea')).toBeTruthy();
    fireEvent.press(getByText('Quitar foto'));
    expect(onRemovePhoto).toHaveBeenCalledTimes(1);
  });

  it('no muestra miniatura ni "Quitar foto" cuando no hay foto', async () => {
    const { queryByText } = await render(
      <PhotoPicker
        permissionStatus="granted"
        busy={false}
        hasError={false}
        onTakePhoto={jest.fn()}
        onPickFromGallery={jest.fn()}
        onRemovePhoto={jest.fn()}
      />
    );
    expect(queryByText('Quitar foto')).toBeNull();
  });

  it('deshabilita los botones mientras busy es true', async () => {
    const onTakePhoto = jest.fn();
    const { getByText } = await render(
      <PhotoPicker
        permissionStatus="undetermined"
        busy
        hasError={false}
        onTakePhoto={onTakePhoto}
        onPickFromGallery={jest.fn()}
        onRemovePhoto={jest.fn()}
      />
    );
    fireEvent.press(getByText('Tomar foto'));
    expect(onTakePhoto).not.toHaveBeenCalled();
  });

  it('muestra el mensaje de error cuando hasError es true', async () => {
    const { getByText } = await render(
      <PhotoPicker
        permissionStatus="undetermined"
        busy={false}
        hasError
        onTakePhoto={jest.fn()}
        onPickFromGallery={jest.fn()}
        onRemovePhoto={jest.fn()}
      />
    );
    expect(getByText('No se pudo adjuntar la foto. Inténtalo de nuevo.')).toBeTruthy();
  });

  it('no muestra el mensaje de error cuando hasError es false', async () => {
    const { queryByText } = await render(
      <PhotoPicker
        permissionStatus="undetermined"
        busy={false}
        hasError={false}
        onTakePhoto={jest.fn()}
        onPickFromGallery={jest.fn()}
        onRemovePhoto={jest.fn()}
      />
    );
    expect(queryByText('No se pudo adjuntar la foto. Inténtalo de nuevo.')).toBeNull();
  });
});
