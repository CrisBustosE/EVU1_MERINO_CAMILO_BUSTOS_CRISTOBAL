# Stack y Arquitectura

## Plataforma

- **Framework:** React Native con Expo (managed workflow).
- **Lenguaje:** TypeScript en modo estricto — `strict: true`, prohibido el uso de `any`.
- **Plataformas objetivo:** Android e iOS; validación en Expo Go.

## Dependencias

- Sin librerías externas de terceros salvo las ya instaladas por Expo.
- `AsyncStorage` (`@react-native-async-storage/async-storage`) — persistencia entre sesiones.
- `react-native-safe-area-context` — respeta notch, Dynamic Island y barra de navegación en Android/iOS. Incluida como dependencia transitiva de React Navigation; ya disponible en el proyecto.
- `react-native-screens` — optimización de navegación; requerida por React Navigation.
- Zustand u otras librerías de estado global **no son necesarias**.
- **Regla:** no agregar ninguna dependencia sin justificación explícita.

## Estado y Persistencia

- Gestión local con `useReducer`; un reducer por dominio de datos, encapsulado en hooks (`useTasks`).
- Persistencia con AsyncStorage: inicialización con acción `LOAD` tras parsear `STORAGE_KEY`, protección con flag `isLoaded` para evitar sobrescrituras de estado inicial vacío.
- Sin backend ni APIs externas.
- IDs generados con `Date.now().toString()` o `Math.random()`; sin `uuid` ni similares.
## Estructura de carpetas

src/
├── components/     # Componentes reutilizables (UI puro)
├── screens/        # Una pantalla por archivo
├── reducers/       # Reducers y tipos de acción
├── hooks/          # Custom hooks de lógica y estado (e.g., useTasks)
├── types/          # Interfaces y tipos compartidos
└── constants/      # Colores, tamaños, textos literales

## Convenciones de código

- **Componentes:** funcionales, un componente por archivo, nombre en PascalCase, en inglés.
- **Props:** tipadas con `interface`; sin `type` para props de componente.
- **Estilos:** exclusivamente `StyleSheet.create`; estilos inline solo en casos puntuales y justificados.
- **Comentarios:** breves, solo donde aporten contexto no obvio, en español.
- **Exportaciones:** `export default` para componentes y pantallas; exportaciones nombradas para tipos y utilidades.
- **Idioma del código:** todo identificador (variables, funciones, tipos, archivos) en inglés.
- **Idioma de la UI:** todos los textos visibles para el usuario (labels, placeholders, mensajes de error, botones) en español.

## Principios de diseño

- **SOLID:**
  - *Single Responsibility* — cada componente, hook o función tiene una única razón para cambiar.
  - *Open/Closed* — las piezas se extienden por composición, no modificando el original.
  - *Liskov Substitution* — los componentes hijos respetan el contrato de sus padres; no rompen la interfaz esperada.
  - *Interface Segregation* — las props e interfaces son específicas; ningún componente recibe props que no usa.
  - *Dependency Inversion* — la lógica depende de abstracciones (tipos e interfaces), no de implementaciones concretas.
- **DRY (Don't Repeat Yourself):** cualquier fragmento de lógica o UI repetido dos o más veces se extrae a una función, hook o componente reutilizable.
- **Modularidad:** cada módulo (componente, pantalla, reducer) es autocontenido — expone una interfaz clara y no asume nada del contexto externo; los cambios internos no deben afectar al resto de la aplicación.

## UI y Accesibilidad

- Contraste de texto mínimo **4.5:1** (WCAG AA).
- Áreas táctiles de al menos **44 × 44 dp**.
- **Safe area:** toda pantalla que renderice contenido propio (no delegado al header de React Navigation) debe respetar los insets del dispositivo. Usar `useSafeAreaInsets()` para elementos flotantes (FAB, overlays) y `SafeAreaView` o `edges` de `SafeAreaProvider` en pantallas de contenido. `SafeAreaProvider` se monta una sola vez en `App.tsx`.
- Seguir las [Human Interface Guidelines de Apple](https://developer.apple.com/design/human-interface-guidelines/) y las [Material Design Guidelines de Google](https://m3.material.io/) según plataforma.

## Definición de terminado

- Todos los criterios de aceptación del `BRIEF.md` están cumplidos.
- Sin errores ni warnings en consola durante el uso normal.
- Sin errores de TypeScript (`tsc --noEmit` pasa limpio).
- El código supera una revisión de legibilidad: nombres descriptivos, sin código comentado ni archivos huérfanos.
