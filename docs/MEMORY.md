# Memoria del proyecto Hazlo

## Forma de trabajo

- La interfaz y la comunicación con la persona usuaria deben mantenerse en español.
- Antes de modificar el proyecto, leer `docs/BRIEF.md`, `docs/STACK.md` y revisar la estructura existente.
- Respetar las versiones instaladas. El proyecto usa Expo SDK `~57.0.33`, React Native `0.86.3`, Expo Router `~57.0.31` y TypeScript `~6.0.3`.
- Antes de usar APIs de Expo o React Native que puedan haber cambiado, consultar la documentación correspondiente al SDK instalado.
- No agregar dependencias sin explicar el motivo. `expo-sqlite` se incorporó para la persistencia nativa, y `expo-crypto`/`expo-secure-store` para hash de contraseñas y sesión local.
- La autenticación actual es local; no agregar backend ni sincronización remota mientras el alcance no lo solicite.
- Mantener el código simple, mobile-first, multiplataforma y sin abstracciones innecesarias.
- Antes de considerar terminada una modificación relevante, ejecutar `npx expo lint` y `npx tsc --noEmit`.
- Para cambios visuales, comprobar la superficie web y considerar el comportamiento equivalente en Expo Go.
- Mantener el nombre visible de la aplicación como `Hazlo`; los identificadores técnicos como `slug`, `scheme`, claves de almacenamiento y nombre de paquete pueden permanecer en minúsculas.

## Alcance actual

- Hazlo es una aplicación móvil sencilla para crear, consultar, editar y eliminar tareas pendientes. Android e iOS persisten actualmente con SQLite y web mantiene AsyncStorage como respaldo compatible. Cada tarea tiene:

```ts
type Task = {
  id: string;
  userId: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  photoUri?: string;
  latitude?: number;
  longitude?: number;
};
```

La aplicación no incluye pantalla de detalle independiente, sincronización entre dispositivos, notificaciones, fechas, categorías ni estados de completado.

## Decisión de persistencia

- La persistencia nativa usa `expo-sqlite` versión `~57.0.5` en la base `hazlo.db`, con tabla `tasks`, tabla `users` y esquema versión 3.
- `src/lib/tasks.native.ts` define `Task`, filtra todas las operaciones por `userId`, valida el JSON heredado, migra `@hazlo/tasks` en una transacción y deja las tareas heredadas sin asignar hasta el primer registro.
- `src/lib/tasks.ts` mantiene la implementación web con AsyncStorage bajo `@hazlo/tasks` y asigna las tareas heredadas al primer usuario.
- `src/lib/auth.native.ts` guarda usuarios y hashes en SQLite y la sesión activa en `expo-secure-store`; `src/lib/auth.ts` mantiene el equivalente local para web.
- `src/hooks/use-tasks.ts` recibe el `userId`; `src/hooks/use-auth.ts` coordina registro, inicio y cierre de sesión.
- La persistencia es local al dispositivo y al origen de ejecución. Las cuentas y tareas no se sincronizan entre Expo Go, web ni otros dispositivos.
- El soporte web experimental de `expo-sqlite` rompe el bundle de este SDK al generar su worker; por eso no se importa SQLite en web.
- Las contraseñas no se guardan en texto plano. El hash local usa SHA-256 con salt; para cuentas remotas se necesitaría un KDF específico y un backend.

## Cambios implementados

### Flujo de tareas

- `src/app/index.tsx` reemplazó la pantalla del template por la pantalla principal de Hazlo.
- La pantalla incluye título, descripción, botón `Guardar tarea`, formulario de edición, contador, lista, estado vacío, errores y acciones `Editar` y `Eliminar`.
- Título y descripción son obligatorios.
- Al guardar correctamente, los campos se limpian.
- Eliminar requiere confirmación mediante un modal.
- Las tareas se muestran con título y descripción.
- Durante la edición se pueden reemplazar o quitar foto y ubicación; `updateTask` conserva `id` y `createdAt`, y actualiza los datos editables.

### Cámara y ubicación

- `src/components/task-capture.native.tsx` consulta el estado de permisos y solicita cámara o ubicación solo al pulsar sus acciones; si el sistema bloqueó el permiso, muestra el motivo y ofrece abrir ajustes.
- Las fotos se copian desde la caché temporal de `expo-camera` a `Paths.document` mediante `expo-file-system`.
- Las coordenadas de ubicación en primer plano se guardan junto a la tarea.
- `src/app/index.tsx` vuelve a mostrar la foto persistida y las coordenadas exactas al recargar la lista.
- `src/components/task-capture.tsx` deja la superficie web sin controles nativos.

### Navegación y template

- `src/app/_layout.tsx` usa un `Stack` de Expo Router sin header visible.
- La ruta principal es `src/app/index.tsx`.
- `src/app/explore.tsx` permanece como ruta del template, pero no forma parte del flujo visible de Hazlo.

### Documentación

- La Fase 1 alineó `docs/BRIEF.md`, `docs/MVP.md`, `docs/DOMAIN.md`, `docs/STACK.md` y `docs/DESIGN.md` con la implementación actual.
- La Fase 2 actualizó `README.md` para explicar la interfaz declarativa, `useTasks`, la separación entre pantalla, hook y persistencia, y el recorrido completo de creación de una tarea.
- `docs/MVP.md` separa el alcance implementado, incluida la autenticación local, los criterios de aceptación, los límites de persistencia local y las capacidades planificadas para la Evaluación 2.
- La migración a SQLite actualizó `package.json`, `package-lock.json`, `app.json`, `README.md`, `docs/BRIEF.md`, `docs/MVP.md`, `docs/DOMAIN.md`, `docs/STACK.md`, `docs/DESIGN.md`, `src/lib/tasks.native.ts`, `src/lib/tasks.ts` y `src/hooks/use-tasks.ts`; el ajuste de compatibilidad de Expo dejó `expo` en `~57.0.33`.
- La Evaluación 2 de cámara y ubicación actualizó `expo-camera`, `expo-location`, `expo-file-system`, `src/components/task-capture.native.tsx`, `src/components/task-capture.tsx`, `src/app/index.tsx` y los mensajes de permisos nativos en `app.json`.
- Se comprobó `npx expo lint`, `npx tsc --noEmit`, los bundles Android y web con `npx expo export --platform android` y `npx expo export --platform web`, y la superficie web con creación, edición, cancelación y eliminación de una tarea sin errores de consola. No se probó captura real en hardware; queda pendiente validar permisos, cámara, GPS y copia de archivos en un dispositivo.
- La autenticación local actualizó `expo-crypto`, `expo-secure-store`, `app.json`, `package.json`, `package-lock.json`, `src/lib/auth.ts`, `src/lib/auth.native.ts`, `src/lib/auth-utils.ts`, `src/hooks/use-auth.ts`, `src/components/auth-screen.tsx`, `src/lib/tasks.ts`, `src/lib/tasks.native.ts`, `src/hooks/use-tasks.ts` y `src/app/index.tsx`.
  - Se añadieron registro, inicio y cierre de sesión, aislamiento por usuario y migración de tareas heredadas al primer usuario.

- Se corrigió `src/lib/auth.native.ts`: la clave de sesión de SecureStore era `@hazlo/session`, inválida para SecureStore. La clave ahora es `hazloSession`; el usuario se inserta antes de guardar la sesión, por lo que ese error dejaba cuentas creadas sin sesión y los reintentos mostraban `Ese usuario ya existe.`.
- La prueba web registró un usuario temporal nuevo, rechazó el mismo usuario duplicado y limpió el almacenamiento de prueba sin exponer contraseñas ni hashes. La base nativa del dispositivo no está disponible en el repositorio para enumerar sus usuarios.
- Se añadió una suite automatizada con `jest-expo` y `@testing-library/react-native`: `jest.config.js`, `__tests__/auth.native.test.ts`, `__tests__/tasks.native.test.ts` y `__tests__/task-capture.native.test.tsx`. Simula SQLite, AsyncStorage, SecureStore, expo-camera, expo-location y expo-file-system; cubre registro, duplicados, credenciales incorrectas, logout, aislamiento por usuario, foto, permisos denegados y coordenadas. `npm test -- --runInBand` pasa con 10 pruebas.
- `npx expo install --fix` alineó `expo-glass-effect`, `expo-linking`, `expo-router` y `expo-splash-screen` con las versiones compatibles del SDK 57; `package.json` y `package-lock.json` quedaron actualizados.
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
- `npm test -- --runInBand` pasa: 3 suites y 10 pruebas automatizadas de autenticación nativa, aislamiento SQLite simulado, cámara y ubicación.
- Se ha comprobado en web el registro de dos usuarios, creación de una tarea para el primero, aislamiento del segundo, cierre de sesión, inicio posterior y recuperación de la tarea del primer usuario.
- `npx expo export --platform android` y `npx expo export --platform web` generan los bundles después de la autenticación.
- La validación física de cámara, GPS y SecureStore en hardware sigue pendiente; `adb` no está disponible en el entorno actual.
- Para arrancar el proyecto:

```bash
npm install
npx expo start
```

Si Expo conserva un bundle anterior:

```bash
npx expo start -c
```

## Auditoría de la rúbrica

- La implementación actual cubre creación, consulta, edición, eliminación, autenticación local, aislamiento por usuario, cámara y ubicación opcionales.
- `app.json` desactiva `recordAudioAndroid` y configura `locationWhenInUsePermission`; `npx expo config --type public` confirmó que ya no aparece `android.permission.RECORD_AUDIO`.
- `expo-secure-store` se usa para la sesión nativa; la web usa AsyncStorage como fallback local del mismo origen.
- `npx expo lint`, `npx tsc --noEmit` y `npm test -- --runInBand` pasan; la suite automatizada cubre módulos nativos simulados.
- La validación física de cámara, GPS y SecureStore sigue pendiente en un dispositivo; `adb` no está disponible en el entorno actual.
- Siguen pendientes la importación desde una API externa, la sincronización remota, la protección adicional de datos locales, la recuperación de migraciones fallidas, la limpieza completa de fotos huérfanas y la definición del trabajo sin conexión.

## Estado conocido y límites

- No prometer sincronización entre web, Expo Go ni dispositivos sin introducir un backend o servicio remoto; la autenticación implementada solo separa cuentas dentro del almacenamiento local de cada origen.
- No cambiar la paleta, el tema claro o la tipografía sin conservar la identidad visual existente y comprobar ambas superficies.
- No cambiar otras partes de la pantalla cuando la petición esté limitada a un control concreto.
- El icono y algunos assets heredados del template pueden conservar su arte original aunque sus fondos de configuración ya usen verde.
