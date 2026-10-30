export const COLORS = {
  primary: '#2B6CB0',
  danger: '#C53030',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textMuted: '#6B6B6B',
  border: '#E0E0E0',
} as const;

export const SPACING = {
  sm: 8,
  md: 16,
  lg: 24,
} as const;

export const LIMITS = {
  titleMaxLength: 80,
  descMaxLength: 300,
} as const;

export const STORAGE_KEYS = {
  tasks: '@tasks_storage_key',
} as const;

export const STRINGS = {
  appTitle: 'Mis Tareas',
  addTask: 'Nueva tarea',
  editTask: 'Editar tarea',
  titleLabel: 'Título',
  descLabel: 'Descripción',
  save: 'Guardar',
  cancel: 'Cancelar',
  delete: 'Eliminar',
  edit: 'Editar',
  titlePlaceholder: 'Título de la tarea',
  descPlaceholder: 'Descripción (opcional)',
  emptyList: 'No hay tareas. ¡Agrega una!',
  titleRequired: 'El título es obligatorio.',
  deleteConfirmTitle: '¿Eliminar tarea?',
  deleteConfirmPrefix: 'Se eliminará «',
  deleteConfirmSuffix: '». Esta acción no se puede deshacer.',
  deleteConfirm: 'Sí, eliminar',
  seeMore: 'Ver más',
  seeLess: 'Ver menos',
  sort: 'Ordenar',
  sortMenuTitle: 'Ordenar tareas',
  sortNewest: 'Más recientes primero',
  sortOldest: 'Más antiguas primero',
  sortAlphabetical: 'Alfabético (A-Z)',
} as const;
