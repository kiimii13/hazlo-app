# Hazlo — organización y recorrido

## Organización actual

- `src/app/_layout.tsx`: layout raíz de Expo Router; monta el `Stack` sin header.
- `src/app/index.tsx`: pantalla raíz. Recupera la sesión y decide entre autenticación y tareas.
- `src/components/auth-screen.tsx`: formulario de registro e inicio de sesión local.
- `src/hooks/use-auth.ts`: carga, crea y cierra la sesión local.
- `src/hooks/use-tasks.ts`: hook personalizado que carga, crea, edita y elimina tareas; mantiene `tasks`, `isLoading` y `error`.
- `src/lib/auth.ts` y `src/lib/auth.native.ts`: persistencia de usuarios y sesión según la plataforma.
- `src/lib/tasks.ts` y `src/lib/tasks.native.ts`: tipo `Task`, validación y persistencia específica por plataforma.
- `src/components/task-capture.native.tsx`: interfaz nativa para permisos, cámara, ubicación y copia permanente de fotos. `task-capture.tsx` deja el flujo web sin controles nativos.

La interfaz es declarativa: `HomeScreen` representa con JSX el estado actual. Cuando el hook actualiza `tasks`, React vuelve a representar el contador y la lista.

## Recorrido de autenticación

1. `HomeScreen` recupera la sesión mediante `useAuth`.
2. Sin sesión, `AuthScreen` permite registrar una cuenta o iniciar sesión.
3. La contraseña se guarda como hash con salt; la sesión native usa SecureStore y la web usa AsyncStorage.
4. Con una sesión válida, `useTasks(userId)` carga únicamente las tareas de esa cuenta.

## Recorrido al crear una tarea

1. **Formulario — `src/app/index.tsx`.** `HomeScreen` guarda `title`, `description` y los adjuntos opcionales con `useState`. Solo permite pulsar `Guardar tarea` cuando título y descripción tienen contenido.
2. **Captura opcional — `TaskCapture`.** En Android e iOS, `task-capture.native.tsx` solicita permisos solo al pulsar cada acción. La foto se copia desde la caché temporal a `Paths.document`; la ubicación obtiene coordenadas de primer plano.
3. **Acción — `handleSave`.** La pantalla evita guardar mientras ya guarda o elimina. Llama a `addTask(title, description, attachments)` y limpia el formulario y los adjuntos solo si la operación devuelve `true`.
4. **Lógica — `src/hooks/use-tasks.ts`.** `addTask` crea `id`, `createdAt` y `updatedAt`, combina los datos opcionales y espera a que se persista antes de actualizar el estado local.
5. **Almacenamiento.** En Android e iOS, `src/lib/tasks.native.ts` inserta la fila en SQLite. En web, `src/lib/tasks.ts` mantiene el arreglo JSON en AsyncStorage.
6. **Visualización.** Después de `setTasks(nextTasks)`, `HomeScreen` recibe el nuevo arreglo desde `useTasks` y lo recorre con `tasks.map`, mostrando título, descripción y los indicadores de foto y ubicación.

## Recorrido al editar

1. `Editar` carga título, descripción, foto y ubicación en el formulario. La captura opcional permanece visible para reemplazar o quitar los adjuntos.
2. `Guardar cambios` llama a `editTask`; la persistencia actualiza título, descripción, adjuntos y `updatedAt`, conservando la identidad y la fecha de creación.
3. `Cancelar edición` limpia el formulario y descarta los cambios sin tocar la tarea persistida.


## Permisos opcionales

- La cámara se solicita únicamente al pulsar `Adjuntar foto`; cancelar, denegar o fallar permite guardar sin foto.
- La ubicación en primer plano se solicita únicamente al pulsar `Registrar ubicación`; cancelar, denegar o fallar permite guardar sin coordenadas.
- La vista web no muestra controles de cámara o ubicación y conserva el fallback de AsyncStorage.

## Recorrido al abrir la aplicación

- Al montar `useTasks`, `useEffect` llama a `loadTasks`. En Android e iOS, la primera lectura inicializa `hazlo.db`, crea la tabla `tasks` y migra el JSON heredado de `@hazlo/tasks` dentro de una transacción. En web, lee y valida directamente la clave de AsyncStorage.

## Recorrido al eliminar

- `Cancelar` limpia esa selección sin modificar los datos. `Eliminar` llama a `deleteTask(id)`; la implementación native elimina la fila SQLite y la web filtra el arreglo persistido, luego el hook actualiza el estado que vuelve a renderizar la lista.
