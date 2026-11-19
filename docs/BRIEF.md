# Brief: Aplicación de Lista de Tareas (To-Do List)

## Descripción general

Aplicación móvil desarrollada en React Native con Expo que permite a los usuarios gestionar sus tareas pendientes de forma sencilla e intuitiva.

## Alcance por unidad

- **Unidad 1:** gestión local de tareas (CRUD, validaciones, ordenamiento, persistencia).
- **Unidad 2:** integración con APIs internas del dispositivo (cámara, galería, GPS, háptica y permisos). **Quedan fuera** servicios web, APIs externas y backend. Todo debe funcionar en Expo Go, sin development build.

## Funcionalidades requeridas

- **Agregar tarea:** el usuario puede crear una nueva tarea con título (obligatorio con `trim()`, máximo 80 caracteres) y descripción opcional (máximo 300 caracteres), ambos con contador de caracteres en tiempo real.
- **Editar tarea:** el usuario puede modificar el título y/o la descripción de una tarea existente con las mismas validaciones y límites.
- **Eliminar tarea:** el usuario puede borrar una tarea de la lista; se solicita confirmación previa mediante modal interactivo que muestra el nombre de la tarea en negrita (limitado a 2 líneas).
- **Visualizar lista:** todas las tareas se muestran en una lista con su título (hasta 2 líneas con puntos suspensivos) y descripción (hasta 3 líneas con puntos suspensivos).
- **Expansión inline:** control interactivo "Ver más" / "Ver menos" que aparece únicamente cuando el texto de una tarea se encuentra truncado, permitiendo expandir y colapsar su contenido sin salir de la lista.
- **Ordenar tareas:** menú accesible desde el header (botón "Ordenar", visible con 2 o más tareas) con tres criterios: más recientes primero (por defecto), más antiguas primero y alfabético (A-Z).
- **Estado vacío:** cuando no existen tareas registradas, se presenta un mensaje descriptivo indicando "No hay tareas. ¡Agrega una!".

### Unidad 2: APIs del dispositivo

- **Foto adjunta (cámara y galería):** al crear o editar una tarea, el usuario puede adjuntar una foto tomada con la cámara o elegida de la galería (`expo-image-picker`). La imagen se copia a la carpeta de documentos de la app (`expo-file-system`) para que persista aunque el original se borre; la tarea guarda la URI de esa copia. La foto puede reemplazarse o quitarse. Al quitarla, reemplazarla o eliminar la tarea, se borra el archivo copiado. En la lista se muestra una miniatura.
- **Ubicación (GPS):** al crear una tarea, el usuario puede registrar su ubicación actual (`expo-location`, solo permiso en primer plano). Se obtiene una dirección legible con `reverseGeocodeAsync`; si la geocodificación falla, se conservan las coordenadas y se omite la dirección. La ubicación se puede quitar antes de guardar y es de solo lectura al editar. Desde la lista y el formulario se puede abrir en la app de mapas del dispositivo mediante `Linking`. Si el GPS no responde dentro de un tiempo límite (timeout), se informa el error y el usuario puede reintentar o guardar sin ubicación.
- **Retroalimentación háptica:** vibración de éxito al guardar una tarea y de advertencia al confirmar su eliminación (`expo-haptics`). En dispositivos sin soporte háptico no ocurre nada ni se muestra error.
- **Permisos:** se solicitan solo en el momento de usar la función (cámara al abrir la cámara, ubicación al registrar la ubicación), nunca al iniciar la app. Los textos explicativos se declaran en `app.json`. Si el usuario rechaza un permiso, se muestra un mensaje claro bajo el control correspondiente (sin diálogos bloqueantes) y un botón "Abrir ajustes" (`Linking.openSettings()`). La galería se usa con el selector del sistema, que no requiere permiso de lectura.
- **Guardado siempre posible:** la tarea se puede guardar sin foto ni ubicación; un permiso rechazado, una cancelación o un fallo de GPS nunca bloquean el guardado.

## Modelo de datos

Cada tarea contiene:

| Campo         | Tipo     | Descripción                                                 |
|---------------|----------|-------------------------------------------------------------|
| `id`          | string   | Identificador único de la tarea                             |
| `title`       | string   | Título breve de la tarea (obligatorio, máx. 80 caracteres)   |
| `description` | string   | Descripción de la tarea (opcional, máx. 300 caracteres; puede ser cadena vacía) |
| `createdAt`   | number   | Marca de tiempo de creación en milisegundos (`Date.now()`); la usa el ordenamiento por fecha |
| `photoUri`    | string   | Opcional. URI local de la copia de la foto dentro de la carpeta de la app |
| `location`    | `{ latitude: number; longitude: number; accuracy?: number }` | Opcional. Coordenadas donde se creó la tarea; `accuracy` es la precisión en metros y se omite si el dispositivo no la informa |
| `address`     | string   | Opcional. Dirección legible obtenida con `reverseGeocodeAsync`; solo puede existir si hay `location` |

Las tareas guardadas en la Unidad 1 no tienen `createdAt`: al cargarlas desde `AsyncStorage` se completa con `Number(id)` (los IDs se generaban con `Date.now()`), sin perder datos. Los campos opcionales se omiten (no se guardan como `null` ni cadena vacía) cuando no hay valor.

## Requerimientos técnicos

- **Framework:** React Native con Expo (managed workflow).
- **Lenguaje:** TypeScript.
- **Navegación:** React Navigation (native stack).
- **Estado:** gestión local con `useReducer` encapsulado en custom hook `useTasks`; sin backend externo.
- **Persistencia:** `AsyncStorage` para conservar las tareas entre sesiones.
- **Compatibilidad:** Android e iOS.
- **APIs del dispositivo (Unidad 2):** `expo-image-picker`, `expo-file-system`, `expo-location`, `expo-haptics` y `Linking` de React Native, todas compatibles con Expo Go.
- **Pruebas:** `jest-expo` con `@testing-library/react-native`; los módulos nativos se simulan (mocks).
- **Sin servicios externos:** ninguna llamada de red propia ni API de terceros.

## Criterios de aceptación

1. La app arranca sin errores en Expo Go.
2. Se puede agregar una tarea con título y, opcionalmente, descripción; aparece en la lista inmediatamente.
3. Se puede editar cualquier tarea existente y los cambios se reflejan en la lista.
4. Al pulsar "Eliminar", aparece un modal de confirmación; solo se borra la tarea si el usuario confirma.
5. Las tareas persisten al cerrar y reabrir la aplicación con `AsyncStorage`.
6. La interfaz es responsive y usable en dispositivos de distintos tamaños.
7. Los elementos flotantes (FAB) no quedan ocultos por el notch, Dynamic Island ni la barra de navegación del sistema.
8. Validación y límites: el título no puede estar vacío tras aplicar `trim()` (se muestra un mensaje de error bajo el campo, sin diálogos); se respetan los límites de 80 caracteres en título y 300 en descripción con contador visible.
9. Truncado y expansión: en la lista, textos largos se truncan con `numberOfLines` y `ellipsizeMode="tail"`, mostrando "Ver más" / "Ver menos" solo si el texto está truncado.
10. Accesibilidad y contraste: contraste de texto mínimo de 4.5:1 (WCAG AA) y áreas táctiles de al menos 44 × 44 dp con roles y estados accesibles.
11. Foto adjunta: se puede adjuntar una foto desde la cámara o la galería; se copia a la carpeta de la app, se muestra en la lista y sigue disponible tras cerrar y reabrir la app. Al quitarla, reemplazarla o eliminar la tarea, el archivo copiado se borra.
12. Ubicación: se puede registrar la ubicación actual al crear una tarea; se muestra la dirección legible (o las coordenadas si la geocodificación falla) y se puede abrir en la app de mapas.
13. Háptica: se produce retroalimentación háptica al guardar y al confirmar la eliminación de una tarea.
14. Permisos: se piden solo al usar la función, con textos explicativos en `app.json`. Si se rechazan, se muestra un mensaje claro y el botón "Abrir ajustes"; la app no falla ni se bloquea.
15. Tolerancia a fallos: guardar una tarea sin foto ni ubicación siempre es posible; cancelar el selector o la cámara no cambia la tarea; un timeout o error del GPS muestra un mensaje y permite reintentar o continuar sin ubicación.
16. Compatibilidad: todo funciona en Expo Go en Android e iOS, sin development build, y las tareas de la Unidad 1 se siguen cargando correctamente.
17. Pruebas: `npm test` pasa e incluye los casos de permiso concedido, permiso rechazado, cancelación y timeout del GPS con los módulos nativos simulados.
18. Documentación: el `README.md` documenta la Unidad 2 con capturas de pantalla, ya que es el informe de entrega.
