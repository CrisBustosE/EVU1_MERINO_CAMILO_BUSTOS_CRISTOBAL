# Brief: Aplicación de Lista de Tareas (To-Do List)

## Descripción general

Aplicación móvil desarrollada en React Native con Expo que permite a los usuarios gestionar sus tareas pendientes de forma sencilla e intuitiva.

## Funcionalidades requeridas

- **Agregar tarea:** el usuario puede crear una nueva tarea con título (obligatorio con `trim()`, máximo 80 caracteres) y descripción opcional (máximo 300 caracteres), ambos con contador de caracteres en tiempo real.
- **Editar tarea:** el usuario puede modificar el título y/o la descripción de una tarea existente con las mismas validaciones y límites.
- **Eliminar tarea:** el usuario puede borrar una tarea de la lista; se solicita confirmación previa mediante modal interactivo que muestra el nombre de la tarea en negrita (limitado a 2 líneas).
- **Visualizar lista:** todas las tareas se muestran en una lista con su título (hasta 2 líneas con puntos suspensivos) y descripción (hasta 3 líneas con puntos suspensivos).
- **Expansión inline:** control interactivo "Ver más" / "Ver menos" que aparece únicamente cuando el texto de una tarea se encuentra truncado, permitiendo expandir y colapsar su contenido sin salir de la lista.
- **Estado vacío:** cuando no existen tareas registradas, se presenta un mensaje descriptivo indicando "No hay tareas. ¡Agrega una!".

## Modelo de datos

Cada tarea contiene:

| Campo         | Tipo     | Descripción                                                 |
|---------------|----------|-------------------------------------------------------------|
| `id`          | string   | Identificador único de la tarea                             |
| `title`       | string   | Título breve de la tarea (obligatorio, máx. 80 caracteres)   |
| `description` | string   | Descripción de la tarea (opcional, máx. 300 caracteres; puede ser cadena vacía) |

## Requerimientos técnicos

- **Framework:** React Native con Expo (managed workflow).
- **Lenguaje:** TypeScript.
- **Navegación:** React Navigation (native stack).
- **Estado:** gestión local con `useReducer` encapsulado en custom hook `useTasks`; sin backend externo.
- **Persistencia:** `AsyncStorage` para conservar las tareas entre sesiones.
- **Compatibilidad:** Android e iOS.

## Criterios de aceptación

1. La app arranca sin errores en Expo Go.
2. Se puede agregar una tarea con título y, opcionalmente, descripción; aparece en la lista inmediatamente.
3. Se puede editar cualquier tarea existente y los cambios se reflejan en la lista.
4. Al pulsar "Eliminar", aparece un modal de confirmación; solo se borra la tarea si el usuario confirma.
5. Las tareas persisten al cerrar y reabrir la aplicación con `AsyncStorage`.
6. La interfaz es responsive y usable en dispositivos de distintos tamaños.
7. Los elementos flotantes (FAB) no quedan ocultos por el notch, Dynamic Island ni la barra de navegación del sistema.
8. Validación y límites: el título no puede estar vacío tras aplicar `trim()`; se respetan los límites de 80 caracteres en título y 300 en descripción con contador visible.
9. Truncado y expansión: en la lista, textos largos se truncan con `numberOfLines` y `ellipsizeMode="tail"`, mostrando "Ver más" / "Ver menos" solo si el texto está truncado.
10. Accesibilidad y contraste: contraste de texto mínimo de 4.5:1 (WCAG AA) y áreas táctiles de al menos 44 × 44 dp con roles y estados accesibles.
