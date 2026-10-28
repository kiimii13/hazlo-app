# hazlo — stack tecnológico

## Resumen

`hazlo` es una aplicación móvil de creación y gestión de tareas pendientes. El proyecto existente está configurado con Expo, React Native, TypeScript y Expo Router. Este documento separa lo que ya está instalado y verificado de las decisiones que todavía deben tomarse.

## Tecnologías principales

### React Native — `0.86.3`

React Native es la base de la interfaz móvil de `hazlo`.

Se eligió porque:

- Permite compartir la mayor parte de la interfaz y la lógica entre iOS y Android.
- Proporciona componentes nativos como `View`, `Text`, `Pressable`, `TextInput` y `ScrollView`.
- Encaja con la necesidad de una aplicación mobile-first y con el soporte web ya incluido en el proyecto.
- Permite mantener una sola base de código sin crear una aplicación nativa separada para cada plataforma.

### Expo — `~57.0.31`

El proyecto utiliza Expo SDK 57. La versión declarada en `package.json` es `~57.0.31`; el símbolo `~` permite actualizaciones compatibles dentro de la serie `57.0.x` según el gestor de paquetes.

Se eligió porque:

- Simplifica el desarrollo y la ejecución en Android, iOS y web.
- Proporciona módulos mantenidos para capacidades habituales del dispositivo.
- Incluye herramientas de desarrollo y comandos coherentes con el ecosistema React Native.
- Permite posponer la gestión manual de proyectos nativos mientras no sea necesaria.

El proyecto no contiene actualmente carpetas `ios/` ni `android/`, por lo que la configuración nativa debe mantenerse en Expo y sus plugins, no mediante edición manual de código generado.

Módulos Expo relevantes actualmente declarados:

- `@expo/ui` — `~57.0.26`
- `expo-constants` — `~57.0.22`
- `expo-device` — `~57.0.2`
- `expo-font` — `~57.0.4`
- `expo-glass-effect` — `~57.0.4`
- `expo-image` — `~57.0.5`
- `expo-linking` — `~57.0.13`
- `expo-splash-screen` — `~57.0.10`
- `expo-status-bar` — `~57.0.1`
- `expo-symbols` — `~57.0.3`
- `expo-system-ui` — `~57.0.4`
- `expo-web-browser` — `~57.0.3`

### TypeScript — `~6.0.3`

TypeScript se utiliza para tipar la aplicación y está declarado como dependencia de desarrollo.

Se eligió porque:

- Permite modelar `Task` y validar sus propiedades durante el desarrollo.
- Detecta errores de tipos antes de ejecutar la aplicación.
- Facilita contratos claros entre pantallas, componentes, hooks y persistencia.
- Mejora la seguridad de futuras modificaciones del modelo de tareas.

Los tipos de React están declarados mediante `@types/react` — `~19.2.2`.

### React — `19.2.3`

React proporciona el modelo de componentes y estado sobre el que se construye React Native. La versión declarada es `19.2.3`.

También está declarado `react-dom` — `19.2.3`, necesario para el objetivo web configurado por Expo.

## Navegación existente

El proyecto ya tiene una solución de navegación basada en Expo Router y no se añadirá otra por defecto.

### Configuración verificada

- `package.json` usa `"main": "expo-router/entry"`.
- `expo-router` está declarado en la versión `~57.0.29`.
- `app.json` incluye el plugin `"expo-router"`.
- `app.json` activa `experiments.typedRoutes`.
- Las rutas actuales están en `src/app/`.
- `src/app/_layout.tsx` configura el layout raíz y monta un `Stack` de Expo Router sin header.
- `src/app/index.tsx` es la ruta principal y contiene el flujo inicial de tareas.
- `src/app/explore.tsx` permanece como ruta del template, pero no forma parte del flujo de `hazlo`.

Las rutas futuras de `hazlo` deben integrarse en esta estructura. Antes de modificar APIs de navegación de Expo Router se debe consultar la documentación correspondiente al SDK 57 instalado.

## Persistencia de tareas

### Implementación actual: almacenamiento local con AsyncStorage

La primera versión de `hazlo` guarda las tareas localmente en el dispositivo usando AsyncStorage. La aplicación serializa la colección de tareas como JSON bajo la clave estable `@hazlo/tasks`.

El flujo implementado es:

1. Leer el valor almacenado cuando se inicializa el estado de tareas.
2. Convertir el JSON a una colección validada de `Task`.
3. Actualizar el estado local después de crear o eliminar.
4. Persistir la colección actualizada de forma explícita.
5. Gestionar valores ausentes o JSON inválido con una lista vacía y un error accionable.

La dependencia `@react-native-async-storage/async-storage` ya está registrada en `package.json` y `package-lock.json` en la versión `2.2.0`. La persistencia está encapsulada en `src/lib/tasks.ts` y el estado de la lista en `src/hooks/use-tasks.ts`.

La edición de tareas queda fuera de esta primera versión porque la instrucción actual solo solicita crear, ver y eliminar.

### Límites de seguridad y sincronización

AsyncStorage es un almacenamiento persistente local, no una base de datos segura:

- No cifra los datos por defecto.
- No debe usarse para secretos, tokens o información sensible sin una estrategia adicional de almacenamiento seguro.
- No sincroniza los datos entre dispositivos.
- No ofrece por sí mismo copias de seguridad, cuentas de usuario ni resolución de conflictos.

Si `hazlo` necesita sincronización o datos sensibles, habrá que tomar una decisión tecnológica separada. No se elige ninguna solución de backend, autenticación o almacenamiento seguro en este documento.

## Librerías de soporte verificadas

Las siguientes versiones aparecen actualmente en `package.json` y complementan el stack:

- `react-native-gesture-handler` — `~2.32.0`
- `react-native-reanimated` — `4.5.1`
- `react-native-safe-area-context` — `~5.7.0`
- `react-native-screens` — `~4.26.0`
- `react-native-web` — `~0.21.0`
- `react-native-worklets` — `0.10.1`

Estas dependencias ya forman parte del template del proyecto. No se debe asumir que una nueva funcionalidad necesita otra librería antes de comprobar si puede resolverse con las APIs existentes.

## Pruebas y validación

### Estado verificado

No hay un framework de pruebas unitarias o de integración instalado en `package.json`. Tampoco se encontraron archivos `*.test.*`, `*.spec.*`, configuración de Jest, configuración de Vitest ni un script `test`.

Por eso, Jest, Vitest y cualquier otra herramienta de tests quedan pendientes; no forman parte todavía del stack oficial de `hazlo`.

Sí están disponibles estas validaciones:

- `npx expo lint`, definido por el script `lint` de `package.json`.
- `npx tsc --noEmit`, posible porque TypeScript está instalado y es el comando de comprobación indicado por las reglas del proyecto.

Antes de considerar una implementación terminada se deben ejecutar ambas validaciones. Añadir pruebas automatizadas requerirá primero elegir un framework, instalar sus dependencias compatibles y documentar el comando resultante.

## Ejecución del proyecto

Las instrucciones siguientes están verificadas en los archivos existentes:

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Iniciar el servidor de desarrollo:

   ```bash
   npx expo start
   ```

3. Abrir directamente en Android:

   ```bash
   npm run android
   ```

4. Abrir directamente en iOS:

   ```bash
   npm run ios
   ```

5. Abrir la versión web:

   ```bash
   npm run web
   ```

6. Ejecutar lint:

   ```bash
   npm run lint
   ```

7. Comprobar tipos:

   ```bash
   npx tsc --noEmit
   ```

El README también confirma `npm install`, `npx expo start` y `npm run reset-project`. `reset-project` es una utilidad del template que mueve el código inicial a `app-example` y crea una carpeta `app` vacía; no debe ejecutarse como parte del flujo normal de desarrollo sin revisar antes sus efectos sobre la estructura actual de `src/`.

## Decisiones pendientes

- Instalar y encapsular `@react-native-async-storage/async-storage`.
- Definir la estrategia de validación y migración del JSON persistido.
- Elegir un framework de pruebas automatizadas.
- Definir si habrá sincronización remota y autenticación en una fase posterior.
- Confirmar las rutas finales de tareas dentro de la navegación existente.
- Sustituir progresivamente el contenido de ejemplo del template por las pantallas de `hazlo`.
