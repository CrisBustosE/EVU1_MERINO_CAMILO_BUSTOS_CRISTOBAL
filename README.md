# To-Do List — EVU1 Desarrollo de Aplicaciones Móviles

Aplicación móvil de lista de tareas desarrollada con **React Native + Expo** y **TypeScript**.

**Integrantes:** Camilo Meriño · Cristóbal Bustos

## Funcionalidades

- Agregar, editar y eliminar tareas (con modal de confirmación antes de borrar).
- Validación del título (obligatorio) con mensaje de error en el formulario.
- Contadores de caracteres en tiempo real (título 80, descripción 300).
- "Ver más / Ver menos" en tareas con texto largo.
- Menú para ordenar tareas: más recientes, más antiguas o alfabético.
- Persistencia local con AsyncStorage (las tareas se mantienen al cerrar la app).

## Requisitos

- [Node.js](https://nodejs.org/) LTS (v20 o superior)
- App **Expo Go** en el celular (Android o iOS), actualizada

## Instalación y ejecución

```bash
git clone https://github.com/CrisBustosE/EVU1_MERINO_CAMILO_BUSTOS_CRISTOBAL.git
cd EVU1_MERINO_CAMILO_BUSTOS_CRISTOBAL
npm install
npx expo start
```

Escanear el código QR con Expo Go (Android) o con la cámara (iOS). El celular y el computador deben estar en la misma red Wi-Fi; si no, usar `npx expo start --tunnel`.

## Estructura

```
App.tsx                  Navegación (stack) y carga inicial
src/
├── components/          TaskItem, SortMenu
├── screens/             TaskListScreen, TaskFormScreen
├── reducers/            taskReducer (LOAD, ADD, EDIT, DELETE)
├── hooks/               useTasks (estado + persistencia), useSortedTasks
├── types/               Task, SortOrder, tipos de navegación
└── constants/           Colores, espaciados, límites y textos
docs/                    BRIEF.md (requisitos) y STACK.md (convenciones)
```
