jest.mock('../../services/photoPicker', () => ({
  takePhoto: jest.fn(),
  pickFromGallery: jest.fn(),
  getCameraPermissionStatus: jest.fn(),
}));
jest.mock('../../services/photoStorage', () => ({
  deletePhoto: jest.fn().mockResolvedValue(undefined),
  photoExists: jest.fn().mockReturnValue(true),
}));
jest.mock('../../services/location', () => ({
  captureLocation: jest.fn(),
  getLocationPermissionStatus: jest.fn(),
}));
jest.mock('../../services/haptics', () => ({
  hapticSuccess: jest.fn(),
  hapticWarning: jest.fn(),
}));

import React from 'react';
import { TextInput } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { captureLocation } from '../../services/location';
import { hapticSuccess } from '../../services/haptics';
import type { Task } from '../../types';
import TaskFormScreen from '../TaskFormScreen';

const mockedCaptureLocation = captureLocation as jest.MockedFunction<typeof captureLocation>;

type FormProps = React.ComponentProps<typeof TaskFormScreen>;

const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 360, height: 800 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

async function renderForm(task?: Task) {
  const goBack = jest.fn();
  const onSave = jest.fn();
  const props = {
    route: { params: task ? { task } : {} },
    navigation: { goBack },
    onSave,
  } as unknown as FormProps;
  const view = await render(
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <TaskFormScreen {...props} />
    </SafeAreaProvider>
  );
  return { onSave, goBack, ...view };
}

describe('TaskFormScreen: ubicación y háptica', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('"siguiente" en el título pasa el foco a la descripción', async () => {
    const focusSpy = jest.spyOn(TextInput.prototype, 'focus');
    const { getByLabelText } = await renderForm();
    focusSpy.mockClear();

    await fireEvent(getByLabelText('Título'), 'submitEditing');

    expect(focusSpy).toHaveBeenCalledTimes(1);
    focusSpy.mockRestore();
  });

  it('guardar dispara la háptica de éxito', async () => {
    const { getByLabelText, getByText, onSave } = await renderForm();

    await fireEvent.changeText(getByLabelText('Título'), 'Nueva');
    await fireEvent.press(getByText('Guardar'));

    expect(hapticSuccess).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('un título inválido no guarda ni dispara la háptica', async () => {
    const { getByText, onSave } = await renderForm();

    await fireEvent.press(getByText('Guardar'));

    expect(hapticSuccess).not.toHaveBeenCalled();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('se guarda sin ubicación cuando el usuario no la agrega', async () => {
    const { getByLabelText, getByText, onSave } = await renderForm();

    await fireEvent.changeText(getByLabelText('Título'), 'Sin ubicación');
    await fireEvent.press(getByText('Guardar'));

    const saved: Task = onSave.mock.calls[0][0];
    expect(saved.location).toBeUndefined();
    expect(saved.address).toBeUndefined();
  });

  it('un permiso rechazado muestra el aviso y no impide guardar', async () => {
    mockedCaptureLocation.mockResolvedValue({ status: 'denied' });
    const { getByLabelText, getByText, onSave } = await renderForm();

    await fireEvent.press(getByText('Agregar ubicación'));
    await waitFor(() => expect(getByText('Abrir ajustes')).toBeTruthy());
    await fireEvent.changeText(getByLabelText('Título'), 'Con permiso rechazado');
    await fireEvent.press(getByText('Guardar'));

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave.mock.calls[0][0].location).toBeUndefined();
  });

  it('agregar ubicación la guarda con su dirección en la tarea', async () => {
    const location = { latitude: -33.45, longitude: -70.66, accuracy: 9 };
    mockedCaptureLocation.mockResolvedValue({ status: 'ok', location, address: 'Alameda 123' });
    const { getByLabelText, getByText, onSave } = await renderForm();

    await fireEvent.press(getByText('Agregar ubicación'));
    await waitFor(() => expect(getByText('Abrir en mapas')).toBeTruthy());
    await fireEvent.changeText(getByLabelText('Título'), 'Con ubicación');
    await fireEvent.press(getByText('Guardar'));

    const saved: Task = onSave.mock.calls[0][0];
    expect(saved.location).toEqual(location);
    expect(saved.address).toBe('Alameda 123');
  });

  it('quitar la ubicación antes de guardar la omite de la tarea', async () => {
    mockedCaptureLocation.mockResolvedValue({
      status: 'ok',
      location: { latitude: 1, longitude: 2 },
      address: 'Calle 1',
    });
    const { getByLabelText, getByText, onSave } = await renderForm();

    await fireEvent.press(getByText('Agregar ubicación'));
    await waitFor(() => expect(getByText('Quitar ubicación')).toBeTruthy());
    await fireEvent.press(getByText('Quitar ubicación'));
    await fireEvent.changeText(getByLabelText('Título'), 'Sin ubicación');
    await fireEvent.press(getByText('Guardar'));

    const saved: Task = onSave.mock.calls[0][0];
    expect(saved.location).toBeUndefined();
    expect(saved.address).toBeUndefined();
  });

  it('al editar, la ubicación existente es de solo lectura y se conserva', async () => {
    const location = { latitude: 1, longitude: 2 };
    const task: Task = {
      id: '7',
      title: 'Existente',
      description: '',
      createdAt: 7,
      location,
      address: 'Calle 1',
    };
    const { getByText, queryByText, onSave } = await renderForm(task);

    expect(getByText('Abrir en mapas')).toBeTruthy();
    expect(queryByText('Quitar ubicación')).toBeNull();
    expect(queryByText('Agregar ubicación')).toBeNull();
    await fireEvent.press(getByText('Guardar'));

    const saved: Task = onSave.mock.calls[0][0];
    expect(saved.location).toEqual(location);
    expect(saved.address).toBe('Calle 1');
  });

  it('al editar una tarea sin ubicación no se ofrece agregarla', async () => {
    const task: Task = { id: '8', title: 'Vieja', description: '', createdAt: 8 };
    const { queryByText } = await renderForm(task);

    expect(queryByText('Agregar ubicación')).toBeNull();
  });
});
