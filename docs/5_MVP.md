# MVP: Prioridades, estado y plan de pruebas

> Orden de lectura: este documento es el **5** de 5. Ver [`AGENTS.md`](../AGENTS.md) para el orden completo.

## Estado actual (verificado contra el código en la rama `feat/location`)

**Implementado:**
- CRUD de tareas, validaciones, ordenamiento, persistencia, accesibilidad base (Unidad 1).
- Modelo `Task` con `createdAt` (`src/types/index.ts`).
- Migración de tareas de la Unidad 1 (`src/utils/migrateTasks.ts` + test).
- `useSortedTasks` ordenando por `createdAt`.
- Configuración de Jest (`jest-expo`) con pruebas del reducer y de la migración.
- Tipo compartido `PermissionStatus` (`src/types/index.ts`).
- Servicio de permisos (`src/services/permissions.ts`) con pruebas.
- Componente `PermissionNotice` (`src/components/PermissionNotice.tsx`) con pruebas.
- **Foto adjunta (cámara y galería):** dependencias `expo-image-picker` y `expo-file-system` instaladas; plugin y textos de permiso en `app.json`; servicios `src/services/photoPicker.ts` y `src/services/photoStorage.ts` (API nueva `File`/`Directory`/`Paths`); hook `src/hooks/usePhotoAttachment.ts`; componentes `PhotoPicker` y `PhotoThumbnail`; integración en `TaskFormScreen.tsx`, `TaskItem.tsx` y `useTasks.ts` (borrado del archivo al eliminar la tarea); todo con pruebas.
- **Ubicación (GPS):** dependencia `expo-location` y plugin con texto de permiso en español en `app.json`; servicio `src/services/location.ts` (permiso solo en primer plano con la misma regla de bloqueado que la cámara, timeout con `LOCATION_TIMEOUT_MS`, `accuracy`, `reverseGeocodeAsync` con degradación a coordenadas); servicio `src/services/maps.ts` (`Linking`); hook `src/hooks/useLocationCapture.ts`; hook reutilizable `src/hooks/usePermissionRefresh.ts` (relee el permiso al volver a primer plano con el aviso visible; hoy lo usa solo `useLocationCapture`); componente `LocationField` (muestra dirección o coordenadas y precisión `± N m` si existe; solo lectura al editar y en la lista); integración en `TaskFormScreen.tsx` y `TaskItem.tsx`; todo con pruebas.
- **Háptica:** dependencia `expo-haptics`; servicio `src/services/haptics.ts` (fallos ignorados en silencio); vibración de éxito al guardar (`TaskFormScreen`) y de advertencia al confirmar la eliminación (`TaskItem`); con pruebas.

**Pendiente:**
- `usePhotoAttachment` aún tiene su propio `AppState` para releer el permiso de cámara; podría migrar a `usePermissionRefresh` (responsable: Cristóbal).
- README con capturas de la Unidad 2 (ver "Capturas necesarias para el README").

## Reparto y orden de entrega

| Responsable | Alcance | Orden de entrega |
|---|---|---|
| Cristóbal | Servicio de permisos (`src/services/permissions.ts`), `PermissionNotice` y el tipo compartido de estado de permiso; luego foto: cámara y galería (`expo-image-picker`), copia/borrado de archivo (`expo-file-system`), `PhotoPicker`, `usePhotoAttachment`. | 1 |
| Camilo | Ubicación (`expo-location`), abrir en mapas (`Linking`), háptica (`expo-haptics`), `LocationField`, `useLocationCapture`. | 2 |

Orden sugerido: piezas compartidas de permisos primero, luego foto y ubicación en paralelo (cada una toca archivos distintos salvo `TaskFormScreen.tsx` y `TaskItem.tsx`, ver más abajo), y al final integración conjunta en esas dos pantallas.

> Cristóbal abre primero un PR pequeño con `src/services/permissions.ts`, `PermissionNotice` y el tipo compartido de estado de permiso; Camilo parte de esa base. Esto evita conflictos de merge en `TaskFormScreen.tsx` y `TaskItem.tsx`, ya que ambos flujos (foto y ubicación) renderizan sus controles en esas mismas pantallas.

## Definición de terminado

Ver [`3_STACK.md`](./3_STACK.md#definición-de-terminado). Resumen: criterios de aceptación de [`1_BRIEF.md`](./1_BRIEF.md) cumplidos, sin errores de `tsc` ni consola, `npm test` en verde, dependencias justificadas en `3_STACK.md`, README con capturas de la Unidad 2.

## Plan de pruebas

### Automatizadas (mocks, `npm test`)

- `expo-image-picker`, `expo-file-system`, `expo-location`, `expo-haptics`, `Linking` y `AsyncStorage` simulados con `jest.mock`; ninguna prueba toca hardware ni red.
- Casos obligatorios (detalle en [`3_STACK.md`](./3_STACK.md#pruebas)): permiso concedido/rechazado, cancelación del selector, timeout de GPS (temporizadores falsos), fallo de `reverseGeocodeAsync`, guardar sin foto ni ubicación, copia y borrado del archivo de foto, migración sin `createdAt`, háptica al guardar/eliminar.

### Matriz manual (dispositivo real, Expo Go)

| Escenario | Qué verificar |
|---|---|
| Permiso de cámara/ubicación **denegado** | Mensaje inline + botón "Abrir ajustes"; la app no se bloquea; se puede guardar sin la foto/ubicación. |
| Permiso **bloqueado** (`canAskAgain: false`) | Al pulsar de nuevo se reintenta la llamada a la API de permisos; si sigue rechazado, aparece el mismo mensaje que denegado + "Abrir ajustes". |
| Cambiar el permiso de cámara a "Preguntar siempre" en los ajustes del sistema y volver a pulsar "Tomar foto" | El diálogo nativo vuelve a aparecer y, si se concede, se abre la cámara. |
| **GPS apagado** en el dispositivo | El servicio de ubicación informa error/timeout en vez de colgarse; se puede reintentar o continuar sin ubicación. |
| **Sin internet** | La app no depende de un backend propio; `reverseGeocodeAsync` usa el servicio de geocodificación del sistema operativo y puede fallar sin conexión, degradando a solo coordenadas. |
| **Reabrir la app** con una tarea que tiene foto guardada | La miniatura sigue visible y el archivo sigue existiendo en la carpeta de documentos tras cerrar y reabrir Expo Go. |

### Capturas necesarias para el README

- Formulario con foto adjunta (miniatura).
- Selector de cámara/galería en uso.
- Formulario con ubicación registrada (dirección legible).
- Mensaje de permiso rechazado + botón "Abrir ajustes".
- Tarea en la lista con miniatura de foto.
- Apertura de la ubicación en la app de mapas.

## Riesgos

- **Conflictos de merge** en `TaskFormScreen.tsx` y `TaskItem.tsx` si foto y ubicación se desarrollan sin la base de permisos compartida primero (ver asignación del PR de permisos en "Reparto y orden de entrega").
- **API nueva de `expo-file-system`** (`File`/`Directory`/`Paths`) es distinta a la legacy; usar la API incorrecta rompe la compatibilidad con el SDK instalado (`~58`).
- **Timeout de GPS:** `getCurrentPositionAsync` no tiene timeout propio; si el servicio no implementa el `Promise.race` con `LOCATION_TIMEOUT_MS`, la UI puede quedar colgada en estado `busy` indefinidamente.
- **Expo Go vs. development build:** cualquier dependencia o configuración que requiera development build (por ejemplo, módulos nativos no soportados por Expo Go) rompe el criterio de aceptación de compatibilidad.
