jest.mock('../../services/photoStorage', () => ({
  photoExists: jest.fn().mockReturnValue(true),
}));
jest.mock('../../services/haptics', () => ({
  hapticWarning: jest.fn(),
  hapticSuccess: jest.fn(),
}));
jest.mock('../../services/maps', () => ({
  openInMaps: jest.fn(),
}));

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { hapticWarning } from '../../services/haptics';
import { openInMaps } from '../../services/maps';
import type { Task } from '../../types';
import TaskItem from '../TaskItem';

const baseTask: Task = { id: '1', title: 'Comprar pan', description: '', createdAt: 1 };

describe('TaskItem', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('confirmar la eliminación dispara la háptica de advertencia y elimina', async () => {
    const onDelete = jest.fn();
    const { getByLabelText, getByText } = await render(
      <TaskItem task={baseTask} onEdit={jest.fn()} onDelete={onDelete} />
    );

    await fireEvent.press(getByLabelText('Eliminar Comprar pan'));
    expect(hapticWarning).not.toHaveBeenCalled();
    await fireEvent.press(getByText('Sí, eliminar'));

    expect(hapticWarning).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith('1');
  });

  it('cancelar la eliminación no dispara háptica ni elimina', async () => {
    const onDelete = jest.fn();
    const { getByLabelText, getByText } = await render(
      <TaskItem task={baseTask} onEdit={jest.fn()} onDelete={onDelete} />
    );

    await fireEvent.press(getByLabelText('Eliminar Comprar pan'));
    await fireEvent.press(getByText('Cancelar'));

    expect(hapticWarning).not.toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('tarea sin ubicación: no muestra ubicación ni "Abrir en mapas"', async () => {
    const { queryByText } = await render(
      <TaskItem task={baseTask} onEdit={jest.fn()} onDelete={jest.fn()} />
    );

    expect(queryByText('Abrir en mapas')).toBeNull();
  });

  it('tarea con ubicación: muestra la dirección y la abre en mapas', async () => {
    const location = { latitude: -33.45, longitude: -70.66, accuracy: 12 };
    const { getByText } = await render(
      <TaskItem
        task={{ ...baseTask, location, address: 'Alameda 123, Santiago' }}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    );

    expect(getByText(/Alameda 123, Santiago/)).toBeTruthy();
    await fireEvent.press(getByText('Abrir en mapas'));
    expect(openInMaps).toHaveBeenCalledWith(location);
  });

  it('tarea con ubicación sin dirección: muestra las coordenadas', async () => {
    const { getByText } = await render(
      <TaskItem
        task={{ ...baseTask, location: { latitude: -33.45, longitude: -70.66 } }}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    );

    expect(getByText(/-33\.45000, -70\.66000/)).toBeTruthy();
  });
});
