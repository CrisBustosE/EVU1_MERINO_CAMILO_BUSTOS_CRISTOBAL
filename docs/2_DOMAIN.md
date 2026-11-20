# Dominio: Modelo de datos y reglas

> Orden de lectura: este documento es el **2** de 5. Ver [`AGENTS.md`](../AGENTS.md) para el orden completo.

## Modelo `Task`

| Campo         | Tipo     | Descripción                                                 |
|---------------|----------|-------------------------------------------------------------|
| `id`          | string   | Identificador único de la tarea |
| `title`       | string   | Título breve de la tarea (obligatorio, máx. 80 caracteres) |
| `description` | string   | Descripción de la tarea (opcional, máx. 300 caracteres; puede ser cadena vacía) |
| `createdAt`   | number   | Marca de tiempo de creación en milisegundos (`Date.now()`); la usa el ordenamiento por fecha |
| `photoUri`    | string   | Opcional. URI local de la copia de la foto dentro de la carpeta de la app |
| `location`    | `{ latitude: number; longitude: number; accuracy?: number }` | Opcional. Coordenadas donde se creó la tarea; `accuracy` es la precisión en metros y se omite si el dispositivo no la informa |
| `address`     | string   | Opcional. Dirección legible obtenida con `reverseGeocodeAsync`; solo puede existir si hay `location` |

## Reglas de validación y límites

- `title`: obligatorio tras aplicar `trim()`; máximo 80 caracteres.
- `description`: opcional; máximo 300 caracteres; puede ser cadena vacía.
- Los campos opcionales (`photoUri`, `location`, `address`) **se omiten** (no se guardan como `null` ni cadena vacía) cuando no tienen valor.
- `address` solo puede existir si existe `location`.
- `location.accuracy` se omite si el dispositivo no la informa (`coords.accuracy === null`).

## Estados de permiso

Modelo conceptual usado por cámara y ubicación (independiente de la API nativa concreta):

| Estado | Significado |
|---|---|
| **Sin decidir** | El usuario nunca respondió al diálogo de permiso del sistema. |
| **Concedido** | El usuario autorizó el acceso; la función puede usarse. |
| **Denegado** | El usuario rechazó el permiso; se puede volver a pedir. |
| **Bloqueado** | El usuario rechazó el permiso y el sistema informó que ya no permite volver a pedirlo (`canAskAgain: false`). Se trata igual que **denegado** en la UI: al pulsar de nuevo el botón, se vuelve a llamar a la API de permisos; si el sistema no puede mostrar el diálogo, devuelve el resultado al instante y se muestra el mensaje y el botón "Abrir ajustes". Esto permite que el permiso funcione si el usuario lo cambia en los ajustes del sistema (p. ej. a "Preguntar siempre"). |

## Migración de datos de la Unidad 1

Las tareas guardadas en la Unidad 1 no tienen `createdAt`. Al cargarlas desde `AsyncStorage` (`src/utils/migrateTasks.ts`, aplicada en `useTasks` antes del `LOAD`):

- Toda tarea sin `createdAt` recibe `Number(id)` (los IDs de la Unidad 1 se generaban con `Date.now()`).
- Si `Number(id)` no es finito, `createdAt = 0`.
- Se descartan las entradas sin `id` de tipo `string` o sin `title` de tipo `string`.

`useSortedTasks` ordena por `createdAt`; esto preserva la cronología original de las tareas migradas sin perder datos.

## Ciclo de vida de la foto

1. El usuario toma una foto o la elige de la galería (`expo-image-picker`).
2. La imagen seleccionada se copia a la carpeta de documentos de la app (`expo-file-system`); la tarea guarda únicamente la **URI de la copia**, nunca la URI temporal del selector.
3. La copia persiste aunque el archivo original (cámara o galería) se borre.
4. La copia se borra del disco cuando: el usuario quita la foto, el usuario la reemplaza por otra, o la tarea se elimina. Al quitar la foto, `handleSave` debe guardar la tarea con `photoUri: undefined` de forma explícita (no basta con dejar de pasarlo), porque la tarea existente se arma con spread (`{ ...existing, ... }`) y un `photoUri` ausente en el objeto nuevo conservaría el valor anterior en vez de limpiarlo.
5. El borrado es tolerante a archivo inexistente (no lanza error si ya no está).
6. En la práctica (`usePhotoAttachment`), el archivo anterior de la tarea se borra recién al guardar (`commit`), no al elegir la nueva foto; si se sale sin guardar (`discard`, o desmontar sin commit), se borran las copias nuevas creadas en esa sesión y se conserva el archivo original.

## Privacidad

- `location` y `address` solo se piden y registran cuando el usuario pulsa explícitamente "Agregar ubicación"; nunca en segundo plano ni al iniciar la app (ver justificación en [`1_BRIEF.md`](./1_BRIEF.md)).
- `location`, `address` y `photoUri` se guardan solo en el dispositivo; la app no tiene backend ni envía estos datos a servicios propios.
- La dirección la resuelve `reverseGeocodeAsync` mediante el servicio de geocodificación del sistema operativo, que puede requerir conexión; si no está disponible se conservan solo las coordenadas.
