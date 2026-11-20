# Hazlo

## Informe de desarrollo de aplicación móvil

| Dato | Información |
|---|---|
| Estudiante | Kimberly Sophia Cerda Castillo |
| Institución | Instituto Profesional San Sebastián |
| Asignatura | Aplicaciones Móviles |
| Sección | 51 |
| Docente | Boris Belmar |
| Fecha de entrega Evaluacion 2 | [22/11/2026] |


## 1. Introducción

Hazlo es una aplicación móvil para organizar tareas personales. Permite registrar, consultar, editar y eliminar tareas con un título y una descripción. En Android e iOS también permite adjuntar una foto y registrar la ubicación al crearla. La aplicación usa cuentas locales para separar las tareas por usuario dentro del mismo dispositivo u origen.

El proyecto se desarrolló con React Native, Expo y TypeScript. En Android e iOS las tareas se guardan localmente con SQLite; en web se conserva AsyncStorage para mantener la compatibilidad de la superficie actual. No hay servidor ni sincronización entre dispositivos.

## 2. Problema y objetivo

Las tareas y recordatorios pueden quedar repartidos en distintos lugares o perderse entre otras actividades. Hazlo busca ofrecer una forma sencilla de anotarlos y consultarlos desde una interfaz móvil.

### Objetivo general

Desarrollar una aplicación móvil que permita registrar, visualizar y eliminar tareas de forma clara y accesible.

### Objetivos específicos

- Crear una tarea con título y descripción.
- Mostrar las tareas guardadas en una lista.
- Limpiar el formulario después de guardar una tarea.
- Eliminar una tarea seleccionada.
- Editar el título y la descripción de una tarea conservando sus datos opcionales.
- Mantener las tareas guardadas localmente entre usos de la aplicación.
- Adjuntar opcionalmente una foto y registrar la ubicación de creación en Android e iOS.

## 3. Alcance de la primera versión

La primera versión funcional incluye creación, edición, listado, almacenamiento local y eliminación de tareas. La implementación actual añade autenticación local, separación de tareas por usuario y captura opcional de foto y ubicación; no incluye servidor remoto ni sincronización entre dispositivos.

En Android e iOS las tareas se guardan en SQLite local; en web se mantienen en AsyncStorage. Por eso, las tareas guardadas desde Expo Go en el teléfono no aparecen automáticamente en la vista web del navegador. Para sincronizar datos entre dispositivos se necesitaría una fuente compartida, como un servicio de backend, que no forma parte del alcance actual.

La foto y la ubicación son opcionales. La cámara y la ubicación solo solicitan permiso cuando la persona pulsa la acción correspondiente; cancelar o denegar cualquiera de los permisos no impide guardar la tarea.

## 4. Tecnologías seleccionadas

### React Native

React Native permite construir interfaces móviles utilizando componentes reutilizables. Se seleccionó porque el proyecto requiere una aplicación para dispositivos móviles y permite trabajar con una estructura compartida para las plataformas compatibles.

### Expo

Expo facilita la configuración, ejecución y prueba de un proyecto React Native. Se utiliza Expo SDK 57 y Expo Go para visualizar la aplicación durante el desarrollo.

### TypeScript

TypeScript agrega tipos a JavaScript. En Hazlo permite describir con claridad la estructura de una tarea y detectar algunos errores relacionados con el uso de los datos durante el desarrollo.

### Persistencia local

En Android e iOS, `expo-sqlite` guarda las tareas en la base local `hazlo.db`, tabla `tasks`. En web, `src/lib/tasks.ts` conserva el arreglo JSON en AsyncStorage bajo `@hazlo/tasks`.

Las instalaciones native existentes migran su JSON heredado a SQLite en la primera apertura. Las tareas heredadas se asignan al primer usuario local que se registra; la clave antigua solo se elimina después de completar correctamente la migración. La sesión native usa SecureStore y la web usa un fallback local. No hay sincronización entre el teléfono y el navegador.

## 5. Arquitectura y organización

La aplicación mantiene estas responsabilidades principales:

| Archivo o carpeta | Responsabilidad |
|---|---|
| `src/app/_layout.tsx` | Configura el `Stack` raíz de Expo Router sin header visible. |
| `src/app/index.tsx` | Decide entre autenticación y pantalla de tareas; presenta formulario, lista y modal de confirmación. |
| `src/components/auth-screen.tsx` | Presenta registro e inicio de sesión local. |
| `src/hooks/use-auth.ts` | Recupera, crea y cierra la sesión local. |
| `src/hooks/use-tasks.ts` | Agrupa el estado y las operaciones de tareas para el `userId` activo. |
| `src/lib/auth.ts` y `src/lib/auth.native.ts` | Guardan usuarios, hashes y sesión según la plataforma. |
| `src/lib/auth-utils.ts` | Normaliza credenciales, valida la regla mínima y genera salts, hashes e identificadores locales. |
| `src/lib/tasks.ts` y `src/lib/tasks.native.ts` | Definen `Task`, validan datos, filtran por usuario y encapsulan la persistencia específica. |
| `src/components/` | Conserva componentes del template y contiene `TaskCapture` para cámara, ubicación y copia permanente de fotos. |

La pantalla raíz no monta el flujo de tareas mientras no exista una sesión. Una vez autenticado, `useTasks` recibe el `userId`, carga solo sus tareas y conserva el mismo límite entre pantalla, hook y persistencia.

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
const { tasks, isLoading, error, addTask, editTask, removeTask } = useTasks(userId);

```

El hook, en `src/hooks/use-tasks.ts`, carga las tareas al montarse y expone `tasks`, `isLoading`, `error`, `addTask`, `editTask` y `removeTask`. También maneja los errores de almacenamiento para que la pantalla solo tenga que mostrar el mensaje recibido.

### Separación de responsabilidades

La pantalla coordina la interacción del formulario. `handleSave` llama al hook y limpia los campos únicamente cuando el guardado termina correctamente:

async function handleSave() {
  if (!canSave || isSaving || deletingTaskId) return;

  setIsSaving(true);
  try {
    const saved = editingTaskId
      ? await editTask(editingTaskId, title, description, attachments)
      : await addTask(title, description, attachments);
    if (saved) {
      setTitle('');
      setDescription('');
      setEditingTaskId(null);
      setAttachments({});
    }
  } finally {
    setIsSaving(false);
  }
}
```

El hook crea los metadatos de la tarea y persiste antes de actualizar la interfaz:

```ts
try {
  await insertTask(task);
  setTasks(nextTasks);
  setError(null);
  return true;
} catch {
  setError('No se pudo guardar la tarea. Revisa el almacenamiento del dispositivo.');
  return false;
}
```

`insertTask`, `updateTask` y `deleteTask` se importan desde `src/lib/tasks`. En Android e iOS, Expo Router resuelve `tasks.native.ts`, que usa SQLite; en web resuelve `tasks.ts`, que usa AsyncStorage. El hook conserva la misma interfaz en ambas plataformas.

Así, la pantalla no guarda JSON ni ejecuta SQL directamente y el hook no necesita conocer la implementación concreta del almacenamiento.
### Autenticación local

1. `HomeScreen` recupera la sesión mediante `useAuth`.
2. Sin sesión, `AuthScreen` permite crear una cuenta o iniciar sesión; la contraseña solo se transforma en hash con salt.
3. En Android/iOS, `expo-secure-store` conserva el identificador de sesión. En web, AsyncStorage conserva el fallback local.
4. Al registrar el primer usuario, las tareas heredadas sin `userId` se asignan a esa cuenta.
5. `useTasks(userId)` filtra lectura, alta, edición y eliminación por el usuario autenticado.


### Creación de una tarea paso a paso

1. **Entrada:** los `TextInput` de `src/app/index.tsx` actualizan `title` y `description` mediante `useState`. `canSave` comprueba que ambos tengan contenido.
2. **Datos opcionales:** `TaskCapture` permite capturar una foto y obtener latitud y longitud en Android e iOS. Los permisos se solicitan solo al elegir cada acción.
3. **Acción:** `handleSave` llama a `addTask(title, description, attachments)`. Si la operación tiene éxito, limpia el formulario y los adjuntos.
4. **Lógica:** `addTask` crea `id`, `createdAt` y `updatedAt`, combina los datos opcionales y llama a `insertTask`.
5. **Persistencia native:** `tasks.native.ts` inicializa `hazlo.db`, migra la clave heredada si es necesario y ejecuta un `INSERT` en la tabla `tasks`.
6. **Persistencia web:** `tasks.ts` lee el arreglo de `@hazlo/tasks`, agrega la tarea y vuelve a serializarlo.
7. **Visualización:** después de `setTasks(nextTasks)`, `HomeScreen` recibe el nuevo estado y `tasks.map` muestra el título, la descripción y los indicadores disponibles.

Al volver a abrir la pantalla, el mismo hook llama a `loadTasks`. La implementación native consulta SQLite y la web lee y valida el JSON de AsyncStorage; ambas ordenan por `updatedAt`.

La eliminación sigue el mismo límite entre capas: la pantalla abre el modal y confirma la acción; `removeTask` llama a `deleteTask`, que elimina la fila SQLite en native o filtra el arreglo web.
La edición sigue el mismo límite entre capas: `startEditing` carga título, descripción y adjuntos; `editTask` conserva `id` y `createdAt`, actualiza `updatedAt` y llama a `updateTask`, que modifica todos los campos editables en SQLite o el elemento JSON correspondiente.

La URI de la foto se guarda en `photoUri`, y las coordenadas en `latitude` y `longitude`. La imagen no se guarda como base64 en SQLite: se copia al almacenamiento persistente de la aplicación y solo se conserva su URI.

## 7. Diseño de la interfaz y experiencia de usuario

La interfaz de Hazlo prioriza la tarea principal: registrar y consultar actividades. El título identifica la aplicación, el formulario agrupa los campos relacionados y la lista presenta cada tarea de forma consistente.

La implementación actual utiliza una paleta verde y un tema claro compartidos entre web y Expo Go. La tipografía del nombre de la aplicación ayuda a distinguir la marca del resto de la información.

Las decisiones de interfaz buscan:

- Mantener una jerarquía visual clara entre el título, el formulario y la lista.
- Agrupar el título y la descripción dentro del formulario.
- Usar colores y contraste para diferenciar áreas y acciones.
- Mantener un diseño adaptable a una pantalla móvil.
- Mostrar la acción de eliminar junto a la tarea correspondiente.

### Capturas de la aplicación entrega 1, Evaluacion 1

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
| Autenticación local | Permite registrar cuentas, iniciar y cerrar sesión en el dispositivo u origen actual. |
| Datos opcionales | Permite adjuntar una foto y registrar coordenadas en Android e iOS; no muestra controles nativos en web. |
| Botón de guardar | Agrega o actualiza una tarea cuando los datos requeridos son válidos. |
| Limpieza del formulario | Deja los campos vacíos después de guardar correctamente. |
| Lista de tareas | Muestra las tareas registradas para la cuenta activa. |
| Botón de eliminar | Permite eliminar una tarea específica después de confirmar. |
| Persistencia local | Guarda y recupera las tareas con SQLite en Android/iOS y AsyncStorage en web. |

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
| `npx tsc --noEmit` | Aprobada en esta revisión. |
| `npx expo lint` | Aprobada en esta revisión. |
| `npm test -- --runInBand` | Aprobada: 3 suites y 10 pruebas. |
| Vista web local | La aplicación se abrió en `http://localhost:8100`. |
| Expo Go | La aplicación se abrió en el teléfono. |

### Pruebas funcionales realizadas

| Caso | Resultado |
|---|---|
| Crear una tarea con título y descripción | [OK] |
| Comprobar que el formulario queda limpio después de guardar | [OK] |
| Cerrar y reabrir la aplicación para comprobar la persistencia | [OK] |
| Editar una tarea y cancelar la edición | [OK] |
| Eliminar una tarea específica | [OK] |



## Evidencias de la Evaluación 2

### Capturas del 20/11/2026

Estas nueve capturas corresponden a **pruebas manuales realizadas en Android con Expo Go**. La persistencia se comprobó manualmente al cerrar y volver a abrir Hazlo; las capturas anteriores se conservan sin cambios.

| Captura | Descripción | Enlace relativo |
|---|---|---|
| Permiso de cámara | Se muestra la solicitud de acceso a la cámara para adjuntar una foto. | [Ver captura](docs/capturas/permiso-camara.png) |
| Permiso de ubicación | Se muestra la solicitud de acceso a la ubicación para registrar coordenadas. | [Ver captura](docs/capturas/permiso-ubicacion.png) |
| Cámara denegada | Se muestra el estado posterior a denegar el permiso de cámara. | [Ver captura](docs/capturas/camara-denegada.png) |
| Ubicación denegada | Se muestra el estado posterior a denegar el permiso de ubicación. | [Ver captura](docs/capturas/gps-denegado.png) |
| Tarea guardada | Se muestra una tarea guardada correctamente después del flujo de captura. | [Ver captura](docs/capturas/tarea-guardada.png) |
| Edición de una tarea | Se muestra una tarea existente en proceso de edición. | [Ver captura](docs/capturas/editar-tarea.png) |
| Confirmación antes de eliminar | Se muestra el diálogo que solicita confirmar la eliminación antes de borrar la tarea. | [Ver captura](docs/capturas/confirmacion-eliminacion.png) |
| Pantalla de inicio de sesión | Se muestra la pantalla para ingresar las credenciales de la cuenta local. | [Ver captura](docs/capturas/login-usuario.png) |
| Intento de ingreso rechazado | Se muestra el rechazo de un inicio de sesión con credenciales incorrectas. | [Ver captura](docs/capturas/ingreso-errado.png) |


## 11. Conclusión

Hazlo cumple el objetivo de ofrecer una primera aplicación móvil para organizar tareas mediante una interfaz sencilla. React Native y Expo permiten desarrollar y probar la experiencia móvil, TypeScript ayuda a describir la información y SQLite conserva las tareas localmente en Android e iOS; web mantiene AsyncStorage como respaldo compatible.

La separación entre pantalla, lógica de tareas y almacenamiento facilita comprender la estructura del proyecto. Como mejora futura, se podrían agregar filtros o sincronización remota.

## 12. Referencias

Expo. (s. f.). *Expo SDK 57*. https://docs.expo.dev/versions/v57.0.0/

React. (s. f.). *Sharing state between components*. https://react.dev/learn/sharing-state-between-components

React Native. (s. f.). *Core components and APIs*. https://reactnative.dev/docs/components-and-apis

React Native. (s. f.). *Layout with Flexbox*. https://reactnative.dev/docs/flexbox

React Native Async Storage. (s. f.). *Async Storage*. https://github.com/react-native-async-storage/async-storage

Expo SQLite. (s. f.). *Expo SQLite*. https://docs.expo.dev/versions/v57.0.0/sdk/sqlite/