# hazlo — brief de producto

## 1. Visión

`hazlo` es una aplicación móvil sencilla para capturar y revisar tareas pendientes sin convertir la organización personal en otra tarea. Su propósito principal es ofrecer un espacio rápido, claro y agradable donde una persona pueda escribir qué necesita hacer, añadir el contexto suficiente y mantener su lista al día.

La aplicación se construirá con Expo, React Native y Expo Router, priorizando una experiencia mobile-first, fluida y compatible con iOS, Android y web cuando sea posible.

## 2. Objetivo del MVP

Permitir que una persona:

- Vea todas sus tareas pendientes.
- Cree una tarea con `title` y `description`.
- Edite una tarea existente.
- Elimine una tarea.
- Abra una tarea para leer su contenido completo.

El MVP no incluirá cuentas de usuario, sincronización en la nube, recordatorios, fechas de vencimiento, categorías ni estados de completado. Esas capacidades podrán evaluarse después de validar el flujo básico.

## 3. Modelo de datos

Cada tarea tendrá una estructura mínima:

```ts
type Task = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};
```

### Reglas de contenido

- `title` es obligatorio y debe ser breve y reconocible.
- `description` es obligatoria en el MVP, aunque puede ser corta.
- `title` y `description` deben conservar el texto introducido por la persona.
- `id` debe ser estable para permitir edición y eliminación.
- `createdAt` y `updatedAt` preparan el modelo para ordenar y persistir cambios.

## 4. Experiencia principal

La experiencia se organizará alrededor de una lista viva de tareas:

1. La persona llega a `TaskListScreen` y entiende inmediatamente cuántas tareas tiene.
2. Pulsa `AddTaskButton` para abrir `TaskFormScreen`.
3. Introduce un título y una descripción.
4. Pulsa `SaveTaskButton` y vuelve a la lista con la nueva tarea visible.
5. Pulsa una tarea para abrir `TaskDetailScreen`.
6. Desde el detalle puede editarla mediante `EditTaskButton` o eliminarla mediante `DeleteTaskButton`.

Las acciones destructivas deberán requerir confirmación explícita. Los estados vacíos y los errores deben indicar el siguiente paso, no limitarse a mostrar un mensaje técnico.

## 5. Pantallas y componentes

### `TaskListScreen`

Pantalla inicial de la aplicación.

- Encabezado con el nombre `hazlo` y una frase breve de orientación.
- Contador de tareas pendientes.
- Lista de tareas ordenada por `updatedAt`, mostrando primero la más reciente.
- Cada fila muestra `title` y una previsualización de `description`.
- `AddTaskButton` siempre accesible, especialmente cuando la lista está vacía.
- `EmptyTaskState` con una invitación clara para crear la primera tarea.

### `TaskFormScreen`

Pantalla compartida para crear y editar.

- Campo `title` con etiqueta visible.
- Campo multilinea `description` con etiqueta visible.
- `SaveTaskButton` deshabilitado mientras falte contenido requerido.
- Acción de cancelar que no pierda cambios sin confirmación.
- Validación legible y cercana al campo que necesita atención.

### `TaskDetailScreen`

Pantalla de lectura de una tarea.

- Muestra el `title` como elemento principal.
- Presenta la `description` con una medida cómoda para leer.
- Incluye acciones de editar y eliminar.
- Muestra información secundaria de actualización solo si aporta valor.

### Componentes compartidos

- `TaskCard`
- `TaskInput`
- `PrimaryButton`
- `SecondaryButton`
- `ConfirmDeleteModal`
- `EmptyTaskState`

Las rutas vivirán en `src/app/` siguiendo Expo Router. Los componentes reutilizables, hooks y funciones de almacenamiento permanecerán fuera de `src/app/`.

## 6. Dirección visual — frontend-design

### Concepto

**Una libreta de trabajo digital, no un panel de productividad.** La interfaz debe sentirse directa y táctil: como abrir una hoja limpia para sacar algo de la cabeza. La personalidad se concentrará en un encabezado tipográfico fuerte y en una lista con ritmo editorial, evitando el kit genérico de tarjetas SaaS.

### Sistema de diseño inicial

#### Color

- `Ink` — `#252127`: texto principal y contraste.
- `Paper` — `#F7F3ED`: fondo cálido y silencioso.
- `Plum` — `#5A3153`: acción principal y foco visual.
- `Pollen` — `#EBCB68`: acento para estados destacados y pequeños detalles.
- `Mist` — `#E4DDD5`: divisores, superficies secundarias y campos.
- `White` — `#FFFFFF`: superficies de lectura y formularios.

El fondo `Paper` y el acento `Pollen` conectan con la idea de una libreta de trabajo; `Plum` aporta una señal reconocible para las acciones sin convertir toda la interfaz en una superficie saturada.

#### Tipografía

- Display: `Georgia` o una serif equivalente disponible en la plataforma para el nombre de la app y títulos de pantalla.
- UI y contenido: `System` / `System UI` para controles, formularios y descripciones.
- No se usarán etiquetas en mayúsculas como decoración. La jerarquía dependerá del tamaño, peso, contraste y espacio.

#### Forma y espaciado

- Bordes suaves y contenidos, con radios moderados solo donde indiquen una superficie interactiva.
- Las filas de tareas serán más parecidas a entradas de una libreta que a tarjetas independientes con sombras.
- Separadores finos y espacios generosos distinguirán tareas sin crear una cuadrícula pesada.
- El área táctil mínima de botones y filas será de aproximadamente `44` puntos.

### Wireframe de alto nivel

```text
┌──────────────────────────────┐
│ hazlo                 ⋯      │
│ 3 cosas para sacar adelante  │
│                              │
│ ───────────────────────────  │
│ Preparar propuesta            │
│ Revisar el alcance...        │
│                              │
│ ───────────────────────────  │
│ Llamar a Marta                │
│ Confirmar horario del jueves │
│                              │
│ ───────────────────────────  │
│                              │
│                         [ + ]│
└──────────────────────────────┘
```

En el formulario, el título debe ocupar el primer plano y la descripción debe ofrecer un área amplia de escritura. El detalle debe reducir el ruido visual y favorecer la lectura antes de mostrar acciones secundarias.

### Principios de interfaz

1. **Una acción principal por contexto:** crear en la lista, guardar en el formulario y editar o eliminar en el detalle.
2. **Contenido antes que decoración:** el título y la descripción son el centro; los metadatos nunca competirán con ellos.
3. **Estado vacío con dirección:** la ausencia de tareas debe explicar qué hacer a continuación.
4. **Feedback visible y sobrio:** guardar, editar y eliminar deben producir una respuesta clara sin animaciones dispersas.
5. **Accesibilidad desde el diseño:** contraste suficiente, labels para lectores de pantalla, focus states visibles y soporte para `reduce motion`.
6. **Responsive por defecto:** una columna en móvil; en pantallas más anchas se limitará la medida de lectura en lugar de estirar el contenido.

## 7. Arquitectura técnica de alto nivel

- `src/app/` contendrá las rutas de Expo Router: lista, formulario y detalle.
- `src/components/` contendrá componentes de interfaz reutilizables.
- `src/hooks/` contendrá la lógica de lectura y mutación de tareas.
- `src/lib/` contendrá tipos, validación y persistencia.
- La primera versión puede usar almacenamiento local; la elección concreta del paquete debe validarse contra el SDK de Expo instalado antes de añadir dependencias.
- El estado de la lista debe actualizarse de forma optimista solo cuando el comportamiento de persistencia esté definido y probado.

## 8. Criterios de éxito del MVP

- Una persona nueva puede crear su primera tarea sin instrucciones externas.
- Una tarea creada aparece en la lista con título y descripción identificables.
- Editar una tarea conserva su `id` y actualiza `updatedAt`.
- Eliminar una tarea requiere confirmación y la retira de la lista.
- La lista vacía, los formularios inválidos y los errores de persistencia tienen mensajes accionables.
- La experiencia es usable con teclado y lector de pantalla donde la plataforma lo permita.
- `npx expo lint` y `npx tsc --noEmit` pasan antes de considerar terminada la implementación.

## 9. Fuera de alcance inicial

- Autenticación y perfiles.
- Sincronización entre dispositivos.
- Notificaciones push.
- Tareas recurrentes.
- Prioridades, etiquetas y filtros avanzados.
- Colaboración o asignación a otras personas.
- Analítica de productividad.

Estas funciones podrán incorporarse después de observar cómo se usa el flujo mínimo de crear, revisar, editar y eliminar.
