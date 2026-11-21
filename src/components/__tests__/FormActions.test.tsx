import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import FormActions from '../FormActions';

describe('FormActions', () => {
  it('dispara onCancel y onSave al presionar cada botón', async () => {
    const onCancel = jest.fn();
    const onSave = jest.fn();
    const { getByText } = await render(<FormActions onCancel={onCancel} onSave={onSave} />);

    await fireEvent.press(getByText('Cancelar'));
    await fireEvent.press(getByText('Guardar'));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledTimes(1);
  });
});
