import React from 'react';
import { Linking } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import PermissionNotice from '../PermissionNotice';

describe('PermissionNotice', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('no renderiza nada en granted', async () => {
    const { toJSON } = await render(<PermissionNotice status="granted" message="msg" />);
    expect(toJSON()).toBeNull();
  });

  it('no renderiza nada en undetermined', async () => {
    const { toJSON } = await render(<PermissionNotice status="undetermined" message="msg" />);
    expect(toJSON()).toBeNull();
  });

  it('renderiza mensaje y botón en denied', async () => {
    const { getByText } = await render(<PermissionNotice status="denied" message="Permiso rechazado" />);
    expect(getByText('Permiso rechazado')).toBeTruthy();
    expect(getByText('Abrir ajustes')).toBeTruthy();
  });

  it('renderiza mensaje y botón en blocked', async () => {
    const { getByText } = await render(<PermissionNotice status="blocked" message="Permiso bloqueado" />);
    expect(getByText('Permiso bloqueado')).toBeTruthy();
    expect(getByText('Abrir ajustes')).toBeTruthy();
  });

  it('al pulsar el botón llama a Linking.openSettings', async () => {
    const spy = jest.spyOn(Linking, 'openSettings').mockResolvedValue();
    const { getByText } = await render(<PermissionNotice status="denied" message="msg" />);
    fireEvent.press(getByText('Abrir ajustes'));
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
