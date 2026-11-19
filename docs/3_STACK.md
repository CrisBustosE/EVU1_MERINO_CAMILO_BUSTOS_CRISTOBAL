# Stack y Arquitectura

> Orden de lectura: este documento es el **3** de 5. Ver [`AGENTS.md`](../AGENTS.md) para el orden completo.
> Modelo de datos y estados de permiso en [`2_DOMAIN.md`](./2_DOMAIN.md).

## Plataforma

- **Framework:** React Native con Expo (managed workflow).
- **Lenguaje:** TypeScript en modo estricto — `strict: true`, prohibido el uso de `any`.
- **Plataformas objetivo:** Android e iOS; validación en Expo Go (sin development build).

## Dependencias

El proyecto utiliza un conjunto mínimo y controlado de dependencias estándar del ecosistema Expo y React Native:

- `@react-navigation/native` y `@react-navigation/native-stack` — infraestructura y gestor de navegación nativa basada en pila.
- `react-native-screens` — optimización del ciclo de vida y vistas nativas para React Navigation.
- `react-native-safe-area-context` — dependencia directa para el manejo de insets seguros (notch, Dynamic Island y barra del sistema).
- `@react-native-async-storage/async-storage` — persistencia asíncrona local entre sesiones.
- Zustand u otras librerías de estado global **no son necesarias**.

### Unidad 2: APIs del dispositivo

Todas se instalan con `npx expo install <paquete>` (nunca `npm install`) para obtener la versión compatible con el SDK de Expo y con Expo Go:

- `expo-image-picker` — captura con la cámara y selección desde la galería mediante los selectores del sistema. Plugin configurado en `app.json` con `microphonePermission: false` (la app no graba video con audio, se bloquea el permiso `RECORD_AUDIO` en Android que el plugin agrega por defecto).
- `expo-file-system` — copia de la foto elegida a la carpeta de documentos de la app (para que persista) y borrado de la copia cuando deja de usarse. Se usa la API vigente del SDK instalado (`File`, `Directory`, `Paths` de `expo-file-system`), no la API `legacy` (`expo-file-system/legacy`).
- `expo-location` — ubicación actual (solo permiso en primer plano) y `reverseGeocodeAsync` para la dirección legible.
- `expo-haptics` — retroalimentación háptica al guardar y eliminar.
- `Linking` (de `react-native`, no requiere instalación) — abrir la ubicación en la app de mapas y los ajustes del sistema (`Linking.openSettings()`).

Dependencias de desarrollo (instalar con `npx expo install` y luego verificar que queden en `devDependencies` de `package.json`; si no, moverlas a mano):

- `jest` y `jest-expo` — ejecutor de pruebas con el preset oficial de Expo.
- `@testing-library/react-native` — pruebas de componentes y hooks centradas en el comportamiento visible (y las peer dependencies que exija la versión instalada).
- `@types/jest` — tipos para TypeScript estricto.

### Reglas

- **No agregar ninguna dependencia sin justificación explícita** en esta sección.
- Prohibido `expo-camera`, `expo-media-library`, `expo-av`, mapas embebidos (`react-native-maps`) y cualquier SDK de terceros: no son necesarios y varios exigen development build.
- Sin servicios web, APIs externas ni backend.

## Navegación

Navegación en pila gestionada por `@react-navigation/native-stack` con dos pantallas principales:
- `TaskList` (`TaskListScreen`): pantalla principal que lista las tareas, maneja el estado vacío, eliminación con confirmación y el botón flotante (FAB) para agregar tareas.
- `TaskForm` (`TaskFormScreen`): pantalla de formulario para crear o editar una tarea existente, con validaciones y contadores en tiempo real, adjuntar foto y registrar ubicación.

## Estado y Persistencia

- Gestión local con `useReducer`; un reducer por dominio de datos, encapsulado en hooks (`useTasks`).
- Persistencia con AsyncStorage: inicialización con acción `LOAD` tras parsear `STORAGE_KEY` y aplicar la migración (ver [`2_DOMAIN.md`](./2_DOMAIN.md)), protección con flag `isLoaded` para evitar sobrescrituras de estado inicial vacío.
- Solo se persiste la **URI** de la foto en AsyncStorage; el archivo vive en la carpeta de documentos de la app.
- Sin backend ni APIs externas.
- IDs generados con `Date.now().toString()` o `Math.random()`; sin `uuid` ni similares.

## APIs del dispositivo y permisos

- **Capa de servicios:** el acceso a módulos nativos vive en `src/services/` (fotos, ubicación, háptica, mapas, permisos). Las pantallas y componentes nunca importan `expo-*` directamente: usan hooks (`usePhotoAttachment`, `useLocationCapture`) que dependen de esos servicios (Dependency Inversion) y que a su vez se pueden simular en pruebas.
- **Permisos bajo demanda:** se piden dentro de la acción del usuario (pulsar "Tomar foto" o "Agregar ubicación"), nunca al iniciar la app. Si el permiso ya fue rechazado y no se puede volver a pedir, se muestra el mensaje y el botón "Abrir ajustes" (`Linking.openSettings()`) sin intentar pedirlo de nuevo.
- **Resultado tipado:** los servicios devuelven un resultado explícito (p. ej. `granted`, `denied`, `canceled`, `timeout`, `error`) en lugar de lanzar excepciones hacia la UI. La UI traduce cada estado a un mensaje de `STRINGS`.
- **Textos de permisos en `app.json`:** configurar los plugins `expo-image-picker` (`cameraPermission`, `photosPermission`, `microphonePermission: false`) y `expo-location` (`locationWhenInUsePermission`), con texto explicativo en español. Expo Go muestra sus propios textos de sistema; los de `app.json` rigen en builds.
- **Galería:** `launchImageLibraryAsync` usa el selector del sistema y no requiere permiso de lectura; solo la cámara pide permiso (`requestCameraPermissionsAsync`).
- **Ubicación:** solo primer plano (`requestForegroundPermissionsAsync`); prohibido `requestBackgroundPermissionsAsync`. `getCurrentPositionAsync` no tiene timeout propio, por lo que el servicio lo impone (`Promise.race`) con una constante `LOCATION_TIMEOUT_MS` en `constants`. `accuracy` se toma de `coords.accuracy` (metros); si el dispositivo devuelve `null`, el campo se omite. `reverseGeocodeAsync` resuelve la dirección mediante el servicio de geocodificación del sistema operativo, que puede requerir conexión; si falla, se conservan las coordenadas y `address` queda sin definir.
- **Mapas:** URL por plataforma (`geo:` en Android, `maps:` en iOS) abierta con `Linking.openURL`; es solo una entrega a la app de mapas, sin llamadas de red propias.
- **Háptica:** `Haptics.notificationAsync` con `Success` al guardar y `Warning` al confirmar la eliminación. Fallos o falta de soporte se ignoran en silencio.
- **Archivos:** la foto se copia a un nombre único dentro de la carpeta de documentos de la app; el borrado es tolerante a archivo inexistente.

## Estructura de carpetas

```
src/
├── components/         # Componentes reutilizables (UI puro: TaskItem, SortMenu, PhotoPicker, LocationField, PermissionNotice)
├── screens/            # Una pantalla por archivo (TaskListScreen, TaskFormScreen)
├── reducers/           # Reducers y tipos de acción
├── hooks/              # Custom hooks de lógica y estado (useTasks, useSortedTasks, usePhotoAttachment, useLocationCapture)
├── services/            # Acceso a módulos nativos del dispositivo (photoStorage, location, haptics, maps, permissions)
├── types/              # Interfaces y tipos compartidos (index.ts, navigation.ts)
├── constants/          # Colores, tamaños, límites, timeouts y textos literales (STRINGS)
└── utils/              # Funciones puras sin dependencias de React (migrateTasks)
```

Las pruebas viven junto al código que prueban, en carpetas `__tests__/` (`*.test.ts` / `*.test.tsx`). Los mocks compartidos de módulos nativos van en un archivo de setup referenciado desde la configuración de Jest.

## Convenciones de código

- **Componentes:** funcionales, un componente por archivo, nombre en PascalCase, en inglés.
- **Props:** tipadas con `interface`; sin `type` para props de componente.
- **Estilos:** exclusivamente `StyleSheet.create`; estilos inline solo en casos puntuales y justificados.
- **Comentarios:** breves, solo donde aporten contexto no obvio, en español.
- **Exportaciones:** `export default` para componentes y pantallas; exportaciones nombradas para tipos y utilidades.
- **Idioma del código:** todo identificador (variables, funciones, tipos, archivos) en inglés.
- **Idioma de la UI:** todos los textos visibles para el usuario (labels, placeholders, mensajes de error, botones, mensajes de permisos) en español y centralizados en `constants` (`STRINGS`).

## Principios de diseño

- **SOLID:**
  - *Single Responsibility* — cada componente, hook o función tiene una única razón para cambiar.
  - *Open/Closed* — las piezas se extienden por composición, no modificando el original.
  - *Liskov Substitution* — los componentes hijos respetan el contrato de sus padres; no rompen la interfaz esperada.
  - *Interface Segregation* — las props e interfaces son específicas; ningún componente recibe props que no usa.
  - *Dependency Inversion* — la lógica depende de abstracciones (tipos e interfaces), no de implementaciones concretas.
- **DRY (Don't Repeat Yourself):** cualquier fragmento de lógica o UI repetido dos o más veces se extrae a una función, hook o componente reutilizable (p. ej. el flujo "pedir permiso → mensaje + Abrir ajustes" compartido por cámara y GPS).
- **Modularidad:** cada módulo (componente, pantalla, reducer) es autocontenido — expone una interfaz clara y no asume nada del contexto externo; los cambios internos no deben afectar al resto de la aplicación.

## Pruebas

- **Herramientas:** `jest-expo` (preset) y `@testing-library/react-native`; se ejecutan con `npm test`.
- **Módulos nativos simulados:** `expo-image-picker`, `expo-file-system`, `expo-location`, `expo-haptics`, `Linking` y AsyncStorage se simulan con `jest.mock`; ninguna prueba toca hardware ni red.
- **Casos obligatorios:** para cámara y ubicación, permiso concedido, permiso rechazado (mensaje + "Abrir ajustes"), cancelación del selector y, en GPS, timeout (con temporizadores falsos de Jest) y fallo de `reverseGeocodeAsync`. Además: guardar sin foto ni ubicación, copia y borrado del archivo de la foto, migración de tareas sin `createdAt`, y háptica al guardar y eliminar.
- Se prueba comportamiento visible (textos, botones, estado resultante), no detalles de implementación. Pruebas deterministas e independientes entre sí.

Plan de pruebas (matriz manual, mocks por caso) en [`5_MVP.md`](./5_MVP.md).

## Definición de terminado

- Todos los criterios de aceptación de [`1_BRIEF.md`](./1_BRIEF.md) están cumplidos.
- Sin errores ni warnings en consola durante el uso normal.
- Sin errores de TypeScript (`tsc --noEmit` pasa limpio).
- `npm test` pasa sin pruebas omitidas ni warnings.
- El código supera una revisión de legibilidad: nombres descriptivos, sin código comentado ni archivos huérfanos.
- Las dependencias nuevas están justificadas en este documento y se instalaron con `npx expo install`.
- El `README.md` documenta la Unidad 2 con capturas de pantalla (foto, ubicación, permisos rechazados, háptica/flujo de guardado) y las instrucciones de instalación, ejecución y pruebas; el README es el informe de entrega.
