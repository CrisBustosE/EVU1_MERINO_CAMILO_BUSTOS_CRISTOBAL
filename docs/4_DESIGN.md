# Diseño y Accesibilidad

> Orden de lectura: este documento es el **4** de 5. Ver [`AGENTS.md`](../AGENTS.md) para el orden completo.

## Tokens (`src/constants/index.ts`)

- **Colores (`COLORS`):** `primary: #2B6CB0`, `danger: #C53030`, `background: #F5F5F5`, `surface: #FFFFFF`, `text: #1A1A1A`, `textMuted: #6B6B6B`, `border: #E0E0E0`.
- **Espaciado (`SPACING`):** `sm: 8`, `md: 16`, `lg: 24`.
- **Límites (`LIMITS`):** `titleMaxLength: 80`, `descMaxLength: 300`.
- **Textos (`STRINGS`):** todos los textos visibles de la UI, centralizados aquí (ver [`3_STACK.md`](./3_STACK.md) — idioma de la UI).

## Contraste y áreas táctiles

- Contraste de texto mínimo **4.5:1** (WCAG AA). `primary` (`#2B6CB0`) y `danger` (`#C53030`) sobre blanco dan 5,42:1 y 5,47:1 respectivamente (verificado; ver proceso en el README).
- Áreas táctiles de al menos **44 × 44 dp** en todos los controles interactivos.
- Los botones de foto, ubicación y "Abrir ajustes" tienen `accessibilityRole`, etiqueta descriptiva y estado (`busy` mientras se obtiene la ubicación); la miniatura de la foto tiene texto alternativo.
- **Miniatura de foto:** 56 × 56 dp, esquinas redondeadas (`borderRadius`), tanto en `TaskItem` como en el formulario. Si `photoUri` existe pero el archivo ya no está en disco, se muestra un placeholder (ícono o silueta neutra del tamaño de la miniatura) en vez de un espacio roto o vacío.

## Mensajes inline

- Los mensajes de permiso y error se muestran **inline** junto al control, no con diálogos bloqueantes (`Alert`), consistente con la validación del formulario de la Unidad 1.
- Todos los mensajes van en español y centralizados en `STRINGS`.
- **Texto de apoyo junto a cada botón que pide permiso:** antes de que el usuario pulse "Tomar foto" o "Agregar ubicación", se muestra un texto breve bajo el botón explicando para qué se usa el permiso (p. ej. "Se usará solo para adjuntar la foto a esta tarea" / "Se usará solo para registrar dónde se creó esta tarea"), reforzando el texto nativo del sistema sin duplicar diálogos.

## Safe area

- Toda pantalla que renderice contenido propio (no delegado al header de React Navigation) debe respetar los insets del dispositivo.
- `useSafeAreaInsets()` para elementos flotantes (FAB, overlays).
- `SafeAreaView` o `edges` de `SafeAreaProvider` en pantallas de contenido.
- `SafeAreaProvider` se monta una sola vez en `App.tsx`.

## Componentes nuevos (Unidad 2)

| Componente | Responsabilidad |
|---|---|
| `PhotoPicker` | Botones "Tomar foto" / "Elegir de galería", miniatura y opción de quitar/reemplazar. |
| `LocationField` | Botón "Agregar ubicación", muestra dirección o coordenadas, estado `busy`, botón para abrir en mapas y para quitar (antes de guardar). |
| `PermissionNotice` | Mensaje inline + botón "Abrir ajustes" compartido por cámara y ubicación cuando el permiso está denegado o bloqueado. |

## Referencias

- [Human Interface Guidelines de Apple](https://developer.apple.com/design/human-interface-guidelines/).
- [Material Design Guidelines de Google](https://m3.material.io/).

Seguir la guía de la plataforma correspondiente para detalles no cubiertos aquí (tamaños de ícono, animaciones del sistema, etc.).
