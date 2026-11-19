import { migrateTasks } from '../migrateTasks';

describe('migrateTasks', () => {
  it('completa createdAt con Number(id) en tareas de la Unidad 1 sin perder datos', () => {
    expect(migrateTasks([{ id: '1700000000000', title: 'Vieja', description: 'texto' }])).toEqual([
      { id: '1700000000000', title: 'Vieja', description: 'texto', createdAt: 1700000000000 },
    ]);
  });

  it('no modifica tareas que ya tienen createdAt', () => {
    const task = { id: '5', title: 'Nueva', description: '', createdAt: 99, address: 'Calle 1' };
    expect(migrateTasks([task])).toEqual([task]);
  });

  it('usa createdAt = 0 si Number(id) no es finito', () => {
    const [nan, inf] = migrateTasks([
      { id: 'abc', title: 'x', description: '' },
      { id: 'Infinity', title: 'y', description: '' },
    ]);
    expect(nan.createdAt).toBe(0);
    expect(inf.createdAt).toBe(0);
  });

  it('descarta entradas sin id o title de tipo string', () => {
    const valid = { id: '1', title: 'ok', description: '', createdAt: 1 };
    const result = migrateTasks([
      valid,
      { title: 'sin id', description: '' },
      { id: 2, title: 'id numérico', description: '' },
      { id: '3', description: 'sin título' },
      { id: '4', title: 7 },
      null,
      'texto',
    ]);
    expect(result).toEqual([valid]);
  });

  it('devuelve [] si el dato no es un arreglo', () => {
    expect(migrateTasks({ id: '1' })).toEqual([]);
    expect(migrateTasks(null)).toEqual([]);
  });
});
