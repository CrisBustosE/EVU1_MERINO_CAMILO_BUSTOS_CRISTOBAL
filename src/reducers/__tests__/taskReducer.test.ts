import { taskReducer } from '../taskReducer';
import type { Task } from '../../types';

const a: Task = { id: '1', title: 'A', description: '', createdAt: 1 };
const b: Task = { id: '2', title: 'B', description: 'desc', createdAt: 2 };

describe('taskReducer', () => {
  it('LOAD reemplaza el estado', () => {
    expect(taskReducer([a], { type: 'LOAD', payload: [b] })).toEqual([b]);
  });

  it('ADD agrega al final sin mutar el estado previo', () => {
    const state = [a];
    expect(taskReducer(state, { type: 'ADD', payload: b })).toEqual([a, b]);
    expect(state).toEqual([a]);
  });

  it('EDIT reemplaza solo la tarea con ese id y conserva el orden', () => {
    const edited: Task = { ...a, title: 'A editada', photoUri: 'file:///foto.jpg' };
    expect(taskReducer([a, b], { type: 'EDIT', payload: edited })).toEqual([edited, b]);
  });

  it('EDIT con id inexistente no cambia nada', () => {
    expect(taskReducer([a], { type: 'EDIT', payload: b })).toEqual([a]);
  });

  it('DELETE quita la tarea con ese id', () => {
    expect(taskReducer([a, b], { type: 'DELETE', payload: '1' })).toEqual([b]);
  });

  it('DELETE con id inexistente no cambia nada', () => {
    expect(taskReducer([a, b], { type: 'DELETE', payload: '99' })).toEqual([a, b]);
  });
});
