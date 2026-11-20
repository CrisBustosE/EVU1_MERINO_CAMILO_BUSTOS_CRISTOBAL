jest.mock('../../services/photoStorage', () => ({
  photoExists: jest.fn(),
}));

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PhotoThumbnail from '../PhotoThumbnail';
import { photoExists } from '../../services/photoStorage';

const mockedPhotoExists = photoExists as jest.MockedFunction<typeof photoExists>;

describe('PhotoThumbnail', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('muestra la imagen cuando el archivo existe', async () => {
    mockedPhotoExists.mockReturnValue(true);
    const { getByLabelText } = await render(
      <PhotoThumbnail uri="file:///a.jpg" accessibilityLabel="Foto adjunta" />
    );
    expect(getByLabelText('Foto adjunta')).toBeTruthy();
  });

  it('muestra un placeholder si el archivo no existe en disco', async () => {
    mockedPhotoExists.mockReturnValue(false);
    const { getByLabelText } = await render(
      <PhotoThumbnail uri="file:///missing.jpg" accessibilityLabel="Foto adjunta" />
    );
    expect(getByLabelText('Foto adjunta')).toBeTruthy();
  });

  it('cambia a placeholder cuando la imagen falla al cargar (onError)', async () => {
    mockedPhotoExists.mockReturnValue(true);
    const { getByLabelText } = await render(
      <PhotoThumbnail uri="file:///a.jpg" accessibilityLabel="Foto adjunta" />
    );
    fireEvent(getByLabelText('Foto adjunta'), 'error');
    expect(getByLabelText('Foto adjunta')).toBeTruthy();
  });

  it('recalcula el estado al cambiar la uri (placeholder -> imagen existente)', async () => {
    mockedPhotoExists.mockReturnValueOnce(false);
    const { getByLabelText, rerender } = await render(
      <PhotoThumbnail uri="file:///missing.jpg" accessibilityLabel="Foto adjunta" />
    );
    expect(getByLabelText('Foto adjunta')).toBeTruthy();

    mockedPhotoExists.mockReturnValueOnce(true);
    await rerender(<PhotoThumbnail uri="file:///existing.jpg" accessibilityLabel="Foto adjunta" />);

    const image = getByLabelText('Foto adjunta');
    expect(image.props.source).toEqual({ uri: 'file:///existing.jpg' });
  });
});
