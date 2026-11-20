# Hazlo — stack tecnológico actual

## Aplicación y ejecución

- **Expo SDK `~57.0.33`**: configuración y ejecución del proyecto React Native en Android, iOS y web.
- **React Native `0.86.3`**: componentes y estilos multiplataforma de la interfaz (`View`, `Text`, `TextInput`, `Pressable`, `ScrollView`, `Modal`).
- **React `19.2.3`**: componentes, estado y efectos de la pantalla.
- **Expo Router `~57.0.31`**: entrada de la aplicación y navegación basada en archivos. `src/app/_layout.tsx` configura un `Stack` sin header y `src/app/index.tsx` es la ruta principal.
- **TypeScript `~6.0.3`**: tipado estricto del modelo `Task`, hooks y funciones de persistencia.

## Persistencia

- **`expo-sqlite` `~57.0.5`**: base de datos SQLite persistente para Android e iOS. `src/lib/tasks.native.ts` guarda usuarios y tareas en `hazlo.db`; el esquema de tareas es versión 3.
- **`@react-native-async-storage/async-storage` `2.2.0`**: respaldo de persistencia para web y fuente de migración de las instalaciones native existentes. Las tareas usan `@hazlo/tasks` y las cuentas web usan una clave separada.
- En Android e iOS, la primera apertura crea el esquema y migra el JSON heredado antes de eliminarlo. Las tareas migradas quedan sin usuario hasta el primer registro.
- La persistencia sigue siendo local, no remota ni sincronizada. SQLite web no se usa porque el soporte web experimental del SDK rompe el bundle actual.

## Autenticación local

- **`expo-crypto` `~57.0.4`**: genera identificadores, salts y hashes SHA-256 de contraseñas.
- **`expo-secure-store` `~57.0.4`**: guarda la sesión activa en Android/iOS; el plugin está declarado en `app.json`.
- `src/lib/auth.native.ts` usa SQLite para usuarios y SecureStore para la sesión; `src/lib/auth.ts` usa AsyncStorage como fallback web.
- `src/hooks/use-auth.ts` coordina registro, inicio y cierre de sesión; `src/components/auth-screen.tsx` presenta el formulario en español.

## Periféricos

- **`expo-camera` `~57.0.6`**: solicita permiso bajo demanda, muestra `CameraView` y captura la foto.
- **`expo-location` `~57.0.23`**: solicita permiso de ubicación en primer plano bajo demanda y obtiene las coordenadas actuales.
- **`expo-file-system` `~57.0.7`**: copia la foto desde la caché temporal de la cámara a `Paths.document` antes de persistir su URI.

## Soporte de plataforma

- **`react-native-safe-area-context` `~5.7.0`**: respeta las áreas seguras en la pantalla principal.
- **`react-native-web` `~0.21.0` y `react-dom` `19.2.3`**: ejecución web del mismo código de interfaz.
- **`react-native-gesture-handler`, `react-native-reanimated`, `react-native-screens` y `react-native-worklets`**: dependencias de soporte presentes en la configuración de Expo Router y React Native.
- **`expo-status-bar`**: configuración de la barra de estado en la pantalla principal.

## Configuración y comprobaciones

- `app.json` define el nombre visible `Hazlo`, orientación vertical, tema claro y los plugins de Expo Router, splash screen, SQLite, cámara y ubicación.
- No existen carpetas `ios/` ni `android/`; la configuración nativa se mantiene en Expo.
- `npx expo lint` comprueba el lint y `npx tsc --noEmit` comprueba los tipos.
- El proyecto declara Jest, `jest-expo` y `@testing-library/react-native` en `package.json`; `npm test -- --runInBand` ejecuta las 3 suites automatizadas. Estas pruebas simulan los módulos nativos y se complementan con la validación física pendiente en un dispositivo.
