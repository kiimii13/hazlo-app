# Hazlo

## Informe de desarrollo de aplicación móvil

| Dato | Información |
|---|---|
| Estudiante | Kimberly Sophia Cerda Castillo |
| Institución | Instituto Profesional San Sebastián |
| Asignatura | Aplicaciones Móviles |
| Sección | 51 |
| Docente | Boris Belmar |
| Fecha de entrega | [01/10/2026] |


## 1. Introducción

Hazlo es una aplicación móvil para organizar tareas personales. Permite registrar tareas con un título y una descripción, consultar la lista y eliminar una tarea cuando ya no se necesita.

El proyecto se desarrolló con React Native, Expo y TypeScript. Las tareas se guardan localmente mediante AsyncStorage, por lo que se conservan al cerrar y volver a abrir la aplicación en el mismo entorno.

## 2. Problema y objetivo

Las tareas y recordatorios pueden quedar repartidos en distintos lugares o perderse entre otras actividades. Hazlo busca ofrecer una forma sencilla de anotarlos y consultarlos desde una interfaz móvil.

### Objetivo general

Desarrollar una aplicación móvil que permita registrar, visualizar y eliminar tareas de forma clara y accesible.

### Objetivos específicos

- Crear una tarea con título y descripción.
- Mostrar las tareas guardadas en una lista.
- Limpiar el formulario después de guardar una tarea.
- Eliminar una tarea seleccionada.
- Mantener las tareas guardadas localmente entre usos de la aplicación.

## 3. Alcance de la primera versión

La primera versión incluye creación, listado, almacenamiento local y eliminación de tareas. No incluye cuentas de usuario, servidor remoto ni sincronización entre dispositivos.

AsyncStorage mantiene los datos en el almacenamiento local de cada plataforma. Por eso, las tareas guardadas desde Expo Go en el teléfono no aparecen automáticamente en la vista web del navegador. Para sincronizar datos entre dispositivos se necesitaría una fuente compartida, como un servicio de backend, que no forma parte del alcance actual.

## 4. Tecnologías seleccionadas

### React Native

React Native permite construir interfaces móviles utilizando componentes reutilizables. Se seleccionó porque el proyecto requiere una aplicación para dispositivos móviles y permite trabajar con una estructura compartida para las plataformas compatibles.

### Expo

Expo facilita la configuración, ejecución y prueba de un proyecto React Native. Se utiliza Expo SDK 57 y Expo Go para visualizar la aplicación durante el desarrollo.

### TypeScript

TypeScript agrega tipos a JavaScript. En Hazlo permite describir con claridad la estructura de una tarea y detectar algunos errores relacionados con el uso de los datos durante el desarrollo.

### AsyncStorage

AsyncStorage es una biblioteca de almacenamiento local persistente para aplicaciones React Native. Hazlo la utiliza para guardar la lista de tareas y recuperarla cuando se vuelve a abrir la aplicación.

El almacenamiento es local, no se cifra y no sincroniza información entre el teléfono y el navegador.

## 5. Arquitectura y organización

La aplicación mantiene tres responsabilidades principales:

| Archivo o carpeta | Responsabilidad |
|---|---|
| `src/app/_layout.tsx` | Configura el `Stack` raíz de Expo Router sin header visible. |
| `src/app/index.tsx` | Presenta la pantalla principal, el formulario, la lista y el modal de confirmación. |
| `src/hooks/use-tasks.ts` | Agrupa el estado y las operaciones de cargar, crear y eliminar tareas. |
| `src/lib/tasks.ts` | Define `Task`, valida los datos leídos y encapsula AsyncStorage. |
| `src/components/` | Conserva componentes del template; la primera entrega no separa el formulario ni cada tarea en componentes propios. |

La navegación usa Expo Router, pero el flujo actual de Hazlo se concentra en `src/app/index.tsx`. La pantalla gestiona la interacción visual; `useTasks` coordina el estado y las operaciones; `tasks.ts` se ocupa del modelo y la persistencia. Esta separación evita que la pantalla conozca la clave o el formato JSON de AsyncStorage.

## 6. Patrones y flujo de una tarea

### Interfaz declarativa

`HomeScreen` describe qué debe mostrarse según el estado actual. Si no está cargando y `tasks` está vacío, muestra el estado vacío; en otro caso recorre la lista. Este fragmento real de `src/app/index.tsx` representa cada tarea con sus datos y su acción:

```tsx
<View style={styles.taskList}>
  {tasks.map((task) => (
    <View key={task.id} style={styles.task}>
      <Text style={styles.taskTitle}>{task.title}</Text>
      <Text style={styles.taskDescription}>{task.description}</Text>
      <Pressable
        accessibilityLabel={`Eliminar tarea ${task.title}`}
        accessibilityRole="button"
        accessibilityState={{
          disabled: Boolean(deletingTaskId) || isSaving,
        }}
        disabled={Boolean(deletingTaskId) || isSaving}
        hitSlop={8}
        onPress={() => confirmDelete(task)}
        style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}>
        <Text style={styles.deleteText}>
          {deletingTaskId === task.id ? 'Eliminando…' : 'Eliminar'}
        </Text>
      </Pressable>
    </View>
  ))}
</View>
```

Cuando `tasks` cambia, React vuelve a representar esta parte de la pantalla. No se modifica manualmente el contenido de la lista: el resultado se deriva del estado.

### Hook personalizado

La pantalla obtiene el estado y las acciones desde `useTasks`:

```tsx
const { tasks, isLoading, error, addTask, removeTask } = useTasks();
```

El hook, en `src/hooks/use-tasks.ts`, carga las tareas al montarse y expone `tasks`, `isLoading`, `error`, `addTask` y `removeTask`. También maneja los errores de almacenamiento para que la pantalla solo tenga que mostrar el mensaje recibido.

### Separación de responsabilidades

La pantalla coordina la interacción del formulario. `handleSave` llama al hook y limpia los campos únicamente cuando el guardado termina correctamente:

```tsx
async function handleSave() {
  if (!canSave || isSaving || deletingTaskId) return;

  setIsSaving(true);
  try {
    if (await addTask(title, description)) {
      setTitle('');
      setDescription('');
    }
  } finally {
    setIsSaving(false);
  }
}
```

El hook crea los metadatos de la tarea y persiste antes de actualizar la interfaz:

```ts
const nextTasks = [task, ...tasks];

try {
  await saveTasks(nextTasks);
  setTasks(nextTasks);
  setError(null);
  return true;
} catch {
  setError('No se pudo guardar la tarea. Revisa el almacenamiento del dispositivo.');
  return false;
}
```

El acceso a AsyncStorage queda en `src/lib/tasks.ts`:

```ts
export function saveTasks(tasks: Task[]) {
  return AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
}
```

Así, la pantalla no guarda JSON directamente y el hook no necesita conocer la implementación concreta del almacenamiento.

### Creación de una tarea paso a paso

1. **Entrada:** los `TextInput` de `src/app/index.tsx` actualizan `title` y `description` mediante `useState`. `canSave` comprueba que ambos tengan contenido.
2. **Acción:** `handleSave` llama a `addTask(title, description)`. Si la operación tiene éxito, limpia el formulario.
3. **Lógica:** `addTask` crea `id`, `createdAt` y `updatedAt`, agrega la nueva tarea al inicio y llama a `saveTasks`.
4. **Persistencia:** `saveTasks` serializa el arreglo completo y lo guarda bajo la clave `@hazlo/tasks`.
5. **Visualización:** después de `setTasks(nextTasks)`, `HomeScreen` recibe el nuevo estado y `tasks.map` muestra el título y la descripción.

Al volver a abrir la pantalla, el mismo hook llama a `loadTasks`. `src/lib/tasks.ts` lee la clave, analiza y valida el JSON, ordena por `updatedAt` y devuelve las tareas para que la interfaz las represente.

La eliminación sigue el mismo límite entre capas: la pantalla abre el modal y confirma la acción; `removeTask` filtra por `id`, usa `saveTasks` y actualiza `tasks`.

## 7. Diseño de la interfaz y experiencia de usuario

La interfaz de Hazlo prioriza la tarea principal: registrar y consultar actividades. El título identifica la aplicación, el formulario agrupa los campos relacionados y la lista presenta cada tarea de forma consistente.

La implementación actual utiliza una paleta verde y un tema claro compartidos entre web y Expo Go. La tipografía del nombre de la aplicación ayuda a distinguir la marca del resto de la información.

Las decisiones de interfaz buscan:

- Mantener una jerarquía visual clara entre el título, el formulario y la lista.
- Agrupar el título y la descripción dentro del formulario.
- Usar colores y contraste para diferenciar áreas y acciones.
- Mantener un diseño adaptable a una pantalla móvil.
- Mostrar la acción de eliminar junto a la tarea correspondiente.

### Capturas de la aplicación

#### Pantalla principal y Formulario para crear una tarea en Expo Go

[Pantalla principal hazlo](docs/capturas/pantalla-principal-formulario.png)


#### Lista con tareas guardadas

[Lista de tareas](docs/capturas/lista-tareas.png)


#### Confirmación o acción de eliminación

[Eliminación de una tarea](docs/capturas/eliminar-tareas.png)


#### Vista web local

[Vista web local de Hazlo](docs/capturas/vista-web.png)


## 8. Componentes e interacciones

| Función | Comportamiento |
|---|---|
| Campo de título | Permite ingresar el nombre breve de la tarea. |
| Campo de descripción | Permite ingresar detalles adicionales. |
| Botón de guardar | Agrega una tarea cuando los datos requeridos son válidos. |
| Limpieza del formulario | Deja los campos vacíos después de guardar correctamente. |
| Lista de tareas | Muestra las tareas registradas. |
| Botón de eliminar | Permite eliminar una tarea específica. |
| Persistencia local | Guarda y recupera las tareas con AsyncStorage. |

## 9. Ejecución del proyecto

Desde la carpeta del proyecto, instalar las dependencias y ejecutar Expo:

```bash
npm install
npx expo start
```

Para iniciar la vista web en el puerto 8100:

```bash
npx expo start --web --port 8100
```

Luego se puede abrir `http://localhost:8100` en el navegador. Para probar en un teléfono, iniciar Expo, escanear el código QR con Expo Go y mantener ambos dispositivos conectados a la misma red.

## 10. Verificación

Durante el desarrollo se ejecutaron las siguientes comprobaciones:

| Comprobación | Resultado |
|---|---|
| `npx tsc --noEmit` | Aprobada, según la ejecución del agente OMP. |
| `npx expo lint` | Aprobada, según la ejecución del agente OMP. |
| Vista web local | La aplicación se abrió en `http://localhost:8100`. |
| Expo Go | La aplicación se abrió en el teléfono. |

### Pruebas funcionales realizadas

| Caso | Resultado |
|---|---|
| Crear una tarea con título y descripción | [OK] |
| Comprobar que el formulario queda limpio después de guardar | [OK] |
| Cerrar y reabrir la aplicación para comprobar la persistencia | [OK] |
| Eliminar una tarea específica | [OK] |


## 11. Conclusión

Hazlo cumple el objetivo de ofrecer una primera aplicación móvil para organizar tareas mediante una interfaz sencilla. React Native y Expo permiten desarrollar y probar la experiencia móvil, TypeScript ayuda a describir la información que utiliza la aplicación y AsyncStorage conserva las tareas localmente.

La separación entre pantalla, lógica de tareas y almacenamiento facilita comprender la estructura del proyecto. Como mejora futura, se podría agregar edición de tareas, filtros o sincronización remota.

## 12. Referencias

Expo. (s. f.). *Expo SDK 57*. https://docs.expo.dev/versions/v57.0.0/

React. (s. f.). *Sharing state between components*. https://react.dev/learn/sharing-state-between-components

React Native. (s. f.). *Core components and APIs*. https://reactnative.dev/docs/components-and-apis

React Native. (s. f.). *Layout with Flexbox*. https://reactnative.dev/docs/flexbox

React Native Async Storage. (s. f.). *Async Storage*. https://github.com/react-native-async-storage/async-storage