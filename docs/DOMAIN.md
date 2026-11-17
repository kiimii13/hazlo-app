# Hazlo — dominio de tareas

## Entidad `Task`

El tipo se define en `src/lib/tasks.ts`:

```ts
type Task = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};
```

## Reglas actuales

- `title` y `description` son obligatorios para guardar; la pantalla valida que, después de quitar espacios en los extremos, ambos tengan contenido.
- El texto se guarda tal como lo entrega el formulario; la validación no lo recorta antes de persistirlo.
- `id` se genera al crear la tarea con una combinación de tiempo y valor aleatorio.
- `createdAt` y `updatedAt` se crean con la misma fecha y hora en formato ISO.
- Una tarea se elimina por su `id`.
- Las tareas se ordenan por `updatedAt` descendente al cargarse; las nuevas se colocan al inicio.

## Persistencia y validación

- `src/lib/tasks.ts` usa `@react-native-async-storage/async-storage`.
- La colección se serializa como JSON bajo la clave `@hazlo/tasks`.
- Si no existe información guardada, se devuelve una lista vacía.
- Al leer, cada elemento debe ser un objeto con las cinco propiedades de tipo `string`. Un JSON inválido o con otra forma produce un error.
- AsyncStorage es local al dispositivo y al origen de ejecución. No cifra, sincroniza ni ofrece copias remotas.

## Operaciones disponibles

La primera entrega solo implementa crear, consultar en la lista y eliminar. No hay edición, detalle independiente ni estado de completado.
