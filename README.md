# To-Do List — EVU1 Desarrollo de Aplicaciones Móviles

Aplicación móvil de lista de tareas desarrollada con **React Native + Expo** y **TypeScript**. Permite agregar, editar y eliminar tareas con título y descripción.

**Integrantes:** Camilo Meriño · Cristóbal Bustos

## ¿Por qué React Native + Expo?

Elegimos React Native con Expo principalmente porque el equipo ya tenía experiencia con React. Esto nos permitió concentrarnos en la funcionalidad y la calidad de la app en lugar de aprender una tecnología nueva desde cero. A diferencia de Ionic, que muestra la interfaz dentro de un WebView, React Native genera componentes nativos reales para Android e iOS desde un solo código. Expo, además, nos permitió probar la app directamente en el celular con Expo Go, sin configurar Android Studio ni Xcode. Por último, es una tecnología muy usada en la industria, por lo que lo aprendido nos sirve más allá del ramo.

## Funcionalidades

- Agregar, editar y eliminar tareas (con confirmación antes de borrar).
- Validación del título obligatorio y contadores de caracteres (título 80, descripción 300).
- "Ver más / Ver menos" en tareas con texto largo.
- Menú para ordenar: más recientes, más antiguas o alfabético.
- Persistencia local con AsyncStorage: las tareas se mantienen al cerrar la app.

## Capturas

| Estado vacío | Nueva tarea | Validación | Lista |
|:---:|:---:|:---:|:---:|
| <img src="docs/screenshots/01-vacia.png" width="180"> | <img src="docs/screenshots/02-formulario.png" width="180"> | <img src="docs/screenshots/03-error.png" width="180"> | <img src="docs/screenshots/04-lista.png" width="180"> |
| **Menú ordenar** | **Más antiguas primero** | **Editar** | **Confirmar eliminación** |
| <img src="docs/screenshots/05-menu-ordenar.png" width="180"> | <img src="docs/screenshots/06-lista-antiguas.png" width="180"> | <img src="docs/screenshots/07-editar.png" width="180"> | <img src="docs/screenshots/08-modal-eliminar.png" width="180"> |

## Instalación y ejecución

Requisitos: [Node.js](https://nodejs.org/) LTS (v20 o superior) y la app **Expo Go** en el celular.

```bash
git clone https://github.com/CrisBustosE/EVU1_MERINO_CAMILO_BUSTOS_CRISTOBAL.git
cd EVU1_MERINO_CAMILO_BUSTOS_CRISTOBAL
npm install
npx expo start
```

Escanear el código QR con Expo Go (Android) o con la cámara (iOS), con el celular y el computador en la misma red Wi-Fi. Si no están en la misma red, usar `npx expo start --tunnel`.

## Proceso de desarrollo

1. **Entorno:** instalación de Node.js, Git, VS Code y Expo Go. No requiere una CLI global: Expo se ejecuta con `npx`.
2. **Creación del proyecto:** `npx create-expo-app --template blank-typescript`, y luego se instalaron React Navigation y AsyncStorage con `npx expo install`.
3. **Especificación:** antes de programar definimos los requisitos y criterios de aceptación en [`docs/BRIEF.md`](docs/BRIEF.md) y las convenciones en [`docs/STACK.md`](docs/STACK.md).
4. **Desarrollo:** trabajo en ramas y Pull Requests en GitHub, con commits según Conventional Commits.
5. **Verificación:** `npx tsc --noEmit` sin errores y pruebas en un dispositivo con Expo Go.

## Estructura del proyecto

```
App.tsx                  Navegación (stack) y carga inicial
src/
├── components/          TaskItem (tarjeta de tarea), SortMenu (menú de orden)
├── screens/             TaskListScreen (lista), TaskFormScreen (formulario)
├── reducers/            taskReducer: acciones LOAD, ADD, EDIT, DELETE
├── hooks/               useTasks (estado + persistencia), useSortedTasks
├── types/               Task, SortOrder, tipos de navegación
└── constants/           Colores, espaciados, límites y textos
docs/                    BRIEF.md, STACK.md y capturas
```

## Componentes principales

| Pauta (Ionic) | En este proyecto |
|---|---|
| `ion-header` | Header del `Stack.Navigator` (React Navigation) |
| `ion-content` + `ion-list` | `FlatList` en `TaskListScreen` |
| `ion-item` | `TaskItem`: título, descripción y botones Editar/Eliminar |
| `ion-input` | `TextInput` en `TaskFormScreen` |
| `ion-button` | `TouchableOpacity` (Guardar, Eliminar y botón flotante "+") |

El estado se maneja con `useReducer` dentro del hook `useTasks`. Las pantallas reciben solo las funciones `saveTask` y `deleteTask`, sin saber cómo se guardan los datos.

## Uso de agentes de IA

Usamos agentes de IA como apoyo al desarrollo. Las reglas del proyecto quedaron definidas antes de generar código: [`AGENTS.md`](AGENTS.md) obliga a seguir `BRIEF.md` y `STACK.md`. Revisamos cada cambio, lo verificamos con TypeScript y en el dispositivo, y lo integramos mediante Pull Requests.
