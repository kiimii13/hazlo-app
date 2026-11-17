
This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.


## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

# Instrucciones del proyecto

## Al iniciar una tarea
Antes de analizar o modificar el proyecto, lee `docs/MEMORY.md` para conocer el estado, las decisiones tomadas y los pendientes. Después, revisa los archivos actuales del proyecto y confirma que la memoria siga coincidiendo con el código.

## Al terminar una tarea
Si la tarea produjo cambios relevantes, actualiza `docs/MEMORY.md` con:
- qué se hizo;
- decisiones importantes;
- archivos modificados;
- comprobaciones realizadas y sus resultados;
- pendientes o próximos pasos.

Mantén la memoria clara y breve. No guardes contraseñas, claves ni otros datos sensibles.

## Forma de trabajar
- Respeta las decisiones vigentes que estén en `docs/MEMORY.md`.
- Si la memoria contradice el código actual, verifica el proyecto y actualiza la memoria con la información correcta.
- No sobrescribas cambios existentes sin revisarlos.
- Comunícate en español y escribe el código en inglés.