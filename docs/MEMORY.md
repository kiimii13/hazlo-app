# Memoria del proyecto Hazlo

## Forma de trabajo

- La interfaz y la comunicación con la persona usuaria deben mantenerse en español.
- Antes de modificar el proyecto, leer `docs/BRIEF.md`, `docs/STACK.md` y revisar la estructura existente.
- Respetar las versiones instaladas. El proyecto usa Expo SDK 57, React Native `0.86.3`, Expo Router `~57.0.29` y TypeScript `~6.0.3`.
- Antes de usar APIs de Expo o React Native que puedan haber cambiado, consultar la documentación correspondiente al SDK instalado.
- No agregar dependencias sin explicar el motivo. AsyncStorage ya está instalado y se usa para la persistencia local.
- No agregar backend, autenticación ni sincronización remota mientras el alcance de esta etapa no lo solicite.
- Mantener el código simple, mobile-first, multiplataforma y sin abstracciones innecesarias.
- Antes de considerar terminada una modificación relevante, ejecutar `npx expo lint` y `npx tsc --noEmit`.
- Para cambios visuales, comprobar la superficie web y considerar el comportamiento equivalente en Expo Go.
- Mantener el nombre visible de la aplicación como `Hazlo`; los identificadores técnicos como `slug`, `scheme`, claves de almacenamiento y nombre de paquete pueden permanecer en minúsculas.

## Alcance actual

Hazlo es una aplicación móvil sencilla para crear, consultar y eliminar tareas pendientes. Cada tarea tiene:

```ts
type Task = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};
```

La primera versión no incluye edición, pantalla de detalle independiente, cuentas, autenticación, sincronización entre dispositivos, notificaciones, fechas, categorías ni estados de completado.

## Decisión de persistencia

- La persistencia actual usa `@react-native-async-storage/async-storage` versión `2.2.0`.
- La colección se guarda como JSON bajo la clave `@hazlo/tasks`.
- `src/lib/tasks.ts` define `Task`, valida el JSON y ordena por `updatedAt`.
- `src/hooks/use-tasks.ts` carga, crea y elimina tareas, y expone errores accionables.
- AsyncStorage es local a cada instalación u origen. Las tareas creadas en Expo Go no aparecen en web, y viceversa.
- Esta separación es conocida y aceptada por el alcance actual porque no se agregará backend en esta etapa.
- AsyncStorage no cifra los datos ni ofrece sincronización o copias remotas.

## Cambios implementados

### Flujo de tareas

- `src/app/index.tsx` reemplazó la pantalla del template por la pantalla principal de Hazlo.
- La pantalla incluye título, descripción, botón `Guardar tarea`, contador, lista, estado vacío, errores y eliminación por tarea.
- Título y descripción son obligatorios.
- Al guardar correctamente, los campos se limpian.
- Eliminar requiere confirmación mediante un modal.
- Las tareas se muestran con título y descripción.

### Navegación y template

- `src/app/_layout.tsx` usa un `Stack` de Expo Router sin header visible.
- La ruta principal es `src/app/index.tsx`.
- `src/app/explore.tsx` permanece como ruta del template, pero no forma parte del flujo visible de Hazlo.

### Documentación

- La Fase 1 alineó `docs/BRIEF.md`, `docs/MVP.md`, `docs/DOMAIN.md`, `docs/STACK.md` y `docs/DESIGN.md` con la implementación actual.
- La Fase 2 actualizó `README.md` para explicar la interfaz declarativa, `useTasks`, la separación entre pantalla, hook y persistencia, y el recorrido completo de creación de una tarea.

### Nombre de la aplicación

- `app.json` usa `name: "Hazlo"`.
- El encabezado visible de `src/app/index.tsx` muestra `Hazlo`.
- `slug: "hazlo"`, `scheme: "hazlo"`, la clave `@hazlo/tasks` y el nombre del paquete permanecen en minúsculas por ser identificadores técnicos.

### Identidad visual

La interfaz usa una paleta verde y un tema claro común para web y Expo Go:

- Fondo: `#F1F7F2`.
- Texto principal: `#183B2B`.
- Verde oscuro de acción: `#1F5D42`.
- Verde de marca: `#2F7D5A`.
- Bordes: `#C9DED0`.
- Superficies verdes: `#E4F0E6`.
- Texto secundario: `#5B7467`.
- Fondo del splash: `#1F5D42`.
- Fondo adaptativo Android: `#DCEFE1`.

La configuración fuerza `userInterfaceStyle: "light"`. El layout usa `DefaultTheme` y `src/hooks/use-theme.ts` devuelve siempre `Colors.light` para evitar diferencias de tema entre web y Expo Go.

### Tipografía

- La app usa una sans-serif de sistema contemporánea, sin descargar fuentes externas:
  - Web: `system-ui`.
  - iOS: `System`.
  - Android: `sans-serif`.
- El nombre `Hazlo` usa una escala destacada, peso 800 y espaciado compacto.
- Los títulos de sección usan peso 800.
- Etiquetas, tareas, descripciones, botones y modales tienen tamaños y alturas de línea diferenciados para lectura rápida.
- La tipografía se define en `src/app/index.tsx` mediante `fontFamily` compartida.

### Tarjetas y eliminación

- Las tareas se muestran como tarjetas individuales con superficie blanca, borde y separación vertical.
- El título usa mayor tamaño y peso; la descripción conserva un estilo secundario.
- `Eliminar` usa una superficie de error con borde y área táctil mínima de 44 puntos.
- El botón mantiene el flujo existente: `confirmDelete` abre el modal y `handleDelete` confirma mediante `removeTask`.


### Botón principal

El botón `Guardar tarea` conserva tamaño, forma y ubicación, pero tiene estados claramente diferenciados:

- Habilitado: fondo `#187A4B`, texto blanco `#FFFFFF`.
- Deshabilitado: fondo `#D8E5DB`, texto `#5D7567`.
- El verde habilitado tiene un contraste calculado de `5.35:1` con el texto blanco.
- Continúa deshabilitado si faltan título o descripción, mientras se guarda o mientras otra acción bloquea la pantalla.

## Verificación conocida

- `npx expo lint` pasa.
- `npx tsc --noEmit` pasa.
- Se ha comprobado en web la creación de tareas, limpieza del formulario, persistencia, eliminación, paleta verde, tipografía y estados habilitado/deshabilitado del botón principal.
- Los estilos principales usan React Native sin condiciones de plataforma para que web y Expo Go compartan la misma identidad visual.
- En la Fase 2 se contrastaron los fragmentos y rutas del `README.md` con el código actual; no se ejecutaron comandos porque no hubo cambios de código.
- En la Fase 3 se verificaron en web la creación, la persistencia tras recargar, la cancelación de eliminación y la confirmación de eliminación.
- Para arrancar el proyecto:

```bash
npm install
npx expo start
```

Si Expo conserva un bundle anterior:

```bash
npx expo start -c
```

## Estado conocido y límites

- No prometer sincronización entre web y Expo Go sin introducir un backend o servicio remoto; la persona usuaria decidió posponerlo.
- No cambiar la paleta, el tema claro o la tipografía sin conservar la identidad visual existente y comprobar ambas superficies.
- No cambiar otras partes de la pantalla cuando la petición esté limitada a un control concreto.
- El icono y algunos assets heredados del template pueden conservar su arte original aunque sus fondos de configuración ya usen verde.
