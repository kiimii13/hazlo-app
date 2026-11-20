# Hazlo — dominio de tareas

## Entidad `Task`

- El tipo se define en `src/lib/tasks.ts` para web y en `src/lib/tasks.native.ts` para Android e iOS:

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

## Reglas actuales

- `title` y `description` son obligatorios para guardar; la pantalla valida que, después de quitar espacios en los extremos, ambos tengan contenido.
- El texto se guarda tal como lo entrega el formulario; la validación no lo recorta antes de persistirlo.
- `id` se genera al crear la tarea con una combinación de tiempo y valor aleatorio.
- `createdAt` y `updatedAt` se crean con la misma fecha y hora en formato ISO.
- Una tarea se elimina por su `id` y `userId`; las operaciones no actúan sobre tareas de otra cuenta.
- Las tareas se ordenan por `updatedAt` descendente al cargarse; las nuevas se colocan al inicio.
- `photoUri`, `latitude` y `longitude` son opcionales. Su ausencia no impide guardar la tarea.

## Persistencia y validación

- En Android e iOS, `src/lib/tasks.native.ts` usa `expo-sqlite` y guarda las tareas en `hazlo.db`, tabla `tasks`.
- La tabla usa `photoUri TEXT`, `latitude REAL` y `longitude REAL` como columnas anulables.
- La versión de esquema native actual es 3. Las instalaciones con esquema 1 reciben foto, ubicación y `userId` mediante migración; las instalaciones con esquema 2 reciben `userId`.
- En web, `src/lib/tasks.ts` conserva AsyncStorage bajo la clave `@hazlo/tasks` porque el soporte web de SQLite del SDK actual es experimental y rompe el bundle.
- La primera apertura native crea el esquema y migra, dentro de una transacción, las tareas válidas del JSON heredado. Las tareas quedan sin `userId` hasta el primer registro y la clave antigua se elimina solo después de una migración correcta.
- Si no existe información guardada, se devuelve una lista vacía.
- Al leer, cada elemento debe ser un objeto con las propiedades base de tipo `string`; `userId` es obligatorio para las tareas autenticadas y los campos opcionales deben tener el tipo correspondiente. Un JSON inválido o con otra forma produce un error.
- La persistencia es local al dispositivo y al origen de ejecución. La sesión native se guarda en `expo-secure-store`; la web conserva la sesión en AsyncStorage.

## Entidad `User`

- `src/lib/auth.native.ts` guarda usuarios en SQLite y `src/lib/auth.ts` mantiene el registro local web.
- Cada usuario tiene `id`, `username`, `passwordSalt`, `passwordHash` y `createdAt`.
- El usuario se normaliza a minúsculas y la contraseña nunca se guarda en texto plano.
- El primer usuario registrado reclama las tareas heredadas sin `userId`; los siguientes usuarios no pueden verlas.

La primera entrega implementa crear, consultar, editar y eliminar en la lista. La ampliación actual de la Evaluación 2 añade autenticación local, aislamiento por `userId`, foto y ubicación opcionales al crear o editar una tarea. No hay detalle independiente, estado de completado ni sincronización remota.
