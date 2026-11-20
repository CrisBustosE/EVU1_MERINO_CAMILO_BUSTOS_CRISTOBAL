jest.mock('../../services/maps', () => ({
  openInMaps: jest.fn(),
}));

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { openInMaps } from '../../services/maps';
import LocationField from '../LocationField';

const coords = { latitude: -33.45, longitude: -70.66 };

describe('LocationField', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('sin ubicación: muestra "Agregar ubicación" con su texto de apoyo y la dispara', async () => {
    const onAdd = jest.fn();
    const { getByText, queryByText } = await render(<LocationField onAdd={onAdd} />);

    expect(getByText('Se usará solo para registrar dónde se creó esta tarea.')).toBeTruthy();
    expect(queryByText('Abrir en mapas')).toBeNull();
    await fireEvent.press(getByText('Agregar ubicación'));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it('busy deshabilita el botón de agregar', async () => {
    const onAdd = jest.fn();
    const { getByText } = await render(<LocationField busy onAdd={onAdd} />);

    await fireEvent.press(getByText('Agregar ubicación'));

    expect(onAdd).not.toHaveBeenCalled();
  });

  it('con dirección: la muestra en lugar de las coordenadas', async () => {
    const { getByText, queryByText } = await render(
      <LocationField location={coords} address="Alameda 123, Santiago" />
    );

    expect(getByText(/Alameda 123, Santiago/)).toBeTruthy();
    expect(queryByText(/-33.45000/)).toBeNull();
  });

  it('sin dirección: degrada a coordenadas', async () => {
    const { getByText } = await render(<LocationField location={coords} />);

    expect(getByText(/-33\.45000, -70\.66000/)).toBeTruthy();
  });

  it('muestra la precisión redondeada a metros', async () => {
    const { getByText } = await render(
      <LocationField location={{ ...coords, accuracy: 12.4 }} address="Calle 1" />
    );

    expect(getByText(/± 12 m/)).toBeTruthy();
  });

  it('sin accuracy no muestra precisión', async () => {
    const { queryByText } = await render(<LocationField location={coords} address="Calle 1" />);

    expect(queryByText(/±/)).toBeNull();
  });

  it('"Abrir en mapas" entrega la ubicación al servicio de mapas', async () => {
    const { getByText } = await render(<LocationField location={coords} />);

    await fireEvent.press(getByText('Abrir en mapas'));

    expect(openInMaps).toHaveBeenCalledWith(coords);
  });

  it('"Quitar ubicación" llama a onRemove y el botón de agregar no se muestra con ubicación', async () => {
    const onRemove = jest.fn();
    const { getByText, queryByText } = await render(
      <LocationField location={coords} onRemove={onRemove} />
    );

    await fireEvent.press(getByText('Quitar ubicación'));

    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(queryByText('Agregar ubicación')).toBeNull();
  });

  it('permiso denegado: mensaje + "Abrir ajustes"; bloqueado, igual', async () => {
    const denied = await render(<LocationField permissionStatus="denied" />);
    expect(denied.getByText('Abrir ajustes')).toBeTruthy();
    expect(denied.getByText(/No se puede acceder a la ubicación/)).toBeTruthy();

    const blocked = await render(<LocationField permissionStatus="blocked" />);
    expect(blocked.getAllByText('Abrir ajustes').length).toBeGreaterThan(0);
  });

  it('permiso concedido: sin aviso de permiso', async () => {
    const { queryByText } = await render(<LocationField permissionStatus="granted" />);

    expect(queryByText('Abrir ajustes')).toBeNull();
  });

  it('muestra el error de timeout y el de GPS, con el botón de agregar disponible para reintentar', async () => {
    const timeout = await render(<LocationField error="locationTimeout" />);
    expect(timeout.getByText(/El GPS no respondió a tiempo/)).toBeTruthy();
    expect(timeout.getByText('Agregar ubicación')).toBeTruthy();

    const failure = await render(<LocationField error="locationError" />);
    expect(failure.getByText(/No se pudo obtener la ubicación/)).toBeTruthy();
  });

  it('readOnly con ubicación: muestra mapas, sin agregar ni quitar', async () => {
    const { getByText, queryByText } = await render(
      <LocationField readOnly location={coords} address="Calle 1" />
    );

    expect(getByText('Abrir en mapas')).toBeTruthy();
    expect(queryByText('Quitar ubicación')).toBeNull();
    expect(queryByText('Agregar ubicación')).toBeNull();
  });

  it('readOnly sin ubicación: no renderiza nada', async () => {
    const { queryByText } = await render(<LocationField readOnly permissionStatus="denied" />);

    expect(queryByText('Agregar ubicación')).toBeNull();
    expect(queryByText('Abrir ajustes')).toBeNull();
  });
});
