# Hazlo — organización y recorrido

## Organización actual

- `src/app/_layout.tsx`: layout raíz de Expo Router; monta el `Stack` sin header.
- `src/app/index.tsx`: pantalla principal. Contiene el formulario, la lista, los estados visuales y el modal de confirmación.
- `src/hooks/use-tasks.ts`: hook personalizado que carga, crea y elimina tareas; mantiene `tasks`, `isLoading` y `error`.
- `src/lib/tasks.ts`: tipo `Task`, validación del JSON y operaciones de lectura y escritura en AsyncStorage.
- `src/components/`: componentes heredados del template. La primera entrega no separa la tarjeta de tarea ni el formulario en componentes propios.

La interfaz es declarativa: `HomeScreen` representa con JSX el estado actual. Cuando el hook actualiza `tasks`, React vuelve a representar el contador y la lista.

## Recorrido al crear una tarea

1. **Formulario — `src/app/index.tsx`.** `HomeScreen` guarda `title` y `description` con `useState`. Solo permite pulsar `Guardar tarea` cuando ambos valores tienen contenido después de quitar espacios para la comprobación.
2. **Acción — `handleSave`.** La pantalla evita guardar mientras ya guarda o elimina. Llama a `addTask(title, description)` y limpia los campos solo si la operación devuelve `true`.
3. **Lógica — `src/hooks/use-tasks.ts`.** `addTask` crea `id`, `createdAt` y `updatedAt`, construye el siguiente arreglo y espera a que se guarde antes de actualizar el estado local.
4. **Almacenamiento — `src/lib/tasks.ts`.** `saveTasks` convierte el arreglo completo a JSON y lo escribe en AsyncStorage con la clave `@hazlo/tasks`.
5. **Visualización.** Después de `setTasks(nextTasks)`, `HomeScreen` recibe el nuevo arreglo desde `useTasks` y lo recorre con `tasks.map`, mostrando título, descripción y el botón de eliminación.

## Recorrido al abrir la aplicación

Al montar `useTasks`, `useEffect` llama a `loadTasks`. La función lee `@hazlo/tasks`, analiza el JSON, valida que cada objeto tenga la forma de `Task` y ordena por `updatedAt`. El hook coloca el resultado en `tasks`; si falla, expone un error visible en la pantalla.

## Recorrido al eliminar

El botón de cada tarea llama a `confirmDelete`, que guarda la tarea seleccionada y abre el `Modal`. `Cancelar` limpia esa selección sin modificar los datos. `Eliminar` llama a `removeTask(id)`; el hook filtra la tarea, persiste el arreglo restante y luego actualiza el estado que vuelve a renderizar la lista.
