# Brief: Aplicación de Lista de Tareas (To-Do List)

## Descripción general

Aplicación móvil desarrollada en React Native con Expo que permite a los usuarios gestionar sus tareas pendientes de forma sencilla e intuitiva.

## Funcionalidades requeridas

- **Agregar tarea:** el usuario puede crear una nueva tarea con título y descripción.
- **Editar tarea:** el usuario puede modificar el título y/o la descripción de una tarea existente.
- **Eliminar tarea:** el usuario puede borrar una tarea de la lista; se solicita confirmación antes de eliminar.
- **Visualizar lista:** todas las tareas se muestran en una lista con su título y descripción.

## Modelo de datos

Cada tarea contiene:

| Campo         | Tipo     | Descripción                        |
|---------------|----------|------------------------------------|
| `id`          | string   | Identificador único de la tarea    |
| `title`       | string   | Título breve de la tarea           |
| `description` | string   | Descripción o detalle de la tarea  |

## Requerimientos técnicos

- **Framework:** React Native con Expo (managed workflow).
- **Lenguaje:** TypeScript.
- **Navegación:** React Navigation (stack o tab, según diseño).
- **Estado:** gestión local con `useState` / `useReducer`; sin backend externo.
- **Persistencia:** `AsyncStorage` para conservar las tareas entre sesiones.
- **Compatibilidad:** Android e iOS.

## Criterios de aceptación

1. La app arranca sin errores en Expo Go.
2. Se puede agregar una tarea con título y descripción; aparece en la lista inmediatamente.
3. Se puede editar cualquier tarea existente y los cambios se reflejan en la lista.
4. Al pulsar "Eliminar", aparece un modal de confirmación; solo se borra la tarea si el usuario confirma.
5. Las tareas persisten al cerrar y reabrir la aplicación.
6. La interfaz es responsive y usable en dispositivos de distintos tamaños.
7. Los elementos flotantes (FAB) no quedan ocultos por el notch, Dynamic Island ni la barra de navegación del sistema.
