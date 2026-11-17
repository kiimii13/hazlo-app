# Hazlo — stack tecnológico actual

## Aplicación y ejecución

- **Expo SDK `~57.0.31`**: configuración y ejecución del proyecto React Native en Android, iOS y web.
- **React Native `0.86.3`**: componentes y estilos multiplataforma de la interfaz (`View`, `Text`, `TextInput`, `Pressable`, `ScrollView`, `Modal`).
- **React `19.2.3`**: componentes, estado y efectos de la pantalla.
- **Expo Router `~57.0.29`**: entrada de la aplicación y navegación basada en archivos. `src/app/_layout.tsx` configura un `Stack` sin header y `src/app/index.tsx` es la ruta principal.
- **TypeScript `~6.0.3`**: tipado estricto del modelo `Task`, hooks y funciones de persistencia.

## Persistencia

- **`@react-native-async-storage/async-storage` `2.2.0`**: almacenamiento persistente local. `src/lib/tasks.ts` guarda y carga el JSON de tareas bajo `@hazlo/tasks`.
- La persistencia no es remota ni cifrada y no comparte datos automáticamente entre Expo Go y la web.

## Soporte de plataforma

- **`react-native-safe-area-context` `~5.7.0`**: respeta las áreas seguras en la pantalla principal.
- **`react-native-web` `~0.21.0` y `react-dom` `19.2.3`**: ejecución web del mismo código de interfaz.
- **`react-native-gesture-handler`, `react-native-reanimated`, `react-native-screens` y `react-native-worklets`**: dependencias de soporte presentes en la configuración de Expo Router y React Native.
- **`expo-status-bar`**: configuración de la barra de estado en la pantalla principal.

## Configuración y comprobaciones

- `app.json` define el nombre visible `Hazlo`, orientación vertical, tema claro, plugins de Expo Router y splash screen.
- No existen carpetas `ios/` ni `android/`; la configuración nativa se mantiene en Expo.
- `npx expo lint` comprueba el lint y `npx tsc --noEmit` comprueba los tipos.
- No hay framework ni script de pruebas automatizadas declarado en `package.json`.
