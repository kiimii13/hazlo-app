# Hazlo — brief de producto (Evaluación 2)

## 1. Resumen

Hazlo es una aplicación móvil para que personas que organizan actividades personales puedan crear, consultar, editar y eliminar tareas pendientes de forma sencilla. La primera entrega funciona con una lista local de título y descripción; la Evaluación 2 amplía la aplicación con autenticación local, foto adjunta y lugar de creación, y mantiene planificadas la importación desde una API externa y la sincronización entre sesiones. El código actual comprobado implementa la primera entrega, la edición local, las cuentas locales y la captura opcional de foto y ubicación en Android e iOS.

## 2. Problema y oportunidad

Las tareas y recordatorios pueden quedar dispersos, perder contexto o no estar disponibles en el dispositivo donde la persona los necesita. Hazlo concentra esa información en una lista personal y la Evaluación 2 agrega contexto y continuidad:

- **Editar** permite corregir el título o la descripción sin volver a crear la tarea ni perder su identidad.
- **Adjuntar una foto** conserva una referencia visual útil para identificar un objeto, documento o lugar relacionado.
- **Registrar el lugar de creación** añade contexto espacial a la tarea sin obligar a escribirlo manualmente.
- **Sincronizar** permite consultar los cambios de la misma cuenta desde otra sesión, en vez de depender del almacenamiento aislado de cada instalación.

## 3. Objetivos del producto

- Crear, consultar y eliminar una tarea con título y descripción, conservándola al cerrar y abrir la aplicación en el mismo entorno. **Implementado.**
- Editar el título y la descripción de una tarea y conservar su identidad y datos opcionales. **Implementado localmente; la sincronización entre sesiones sigue planificada.**
- Adjuntar una foto y registrar el lugar de creación cuando la persona lo solicita, sin impedir el guardado si cualquiera de esos datos no está disponible. **Implementado en Android e iOS; no disponible en web.**
- Iniciar sesión y acceder únicamente a las tareas y adjuntos de la propia cuenta. **Implementado localmente; no hay cuentas compartidas entre dispositivos.**
- Importar tareas desde una fuente externa sin crear duplicados al repetir la operación. **Planificado para la Evaluación 2.**
- Consultar un dato externo adicional por tarea y mostrarlo junto con la tarea; el dato concreto queda pendiente de definición. **Planificado para la Evaluación 2.**
- Continuar usando las funciones locales actuales si no hay conexión; el comportamiento de las operaciones remotas sin conexión queda pendiente. **Parcialmente definido.**

## 4. Usuarios y roles

No se ha definido un rol administrativo ni otro rol distinto de la persona propietaria de sus tareas.

| Rol | Descripción | Qué puede hacer |
|---|---|---|
| Usuario de Hazlo | La aplicación actual usa una cuenta local propia dentro del dispositivo u origen actual. | **Actual:** registrarse, iniciar y cerrar sesión; crear, consultar, editar y eliminar tareas locales; y adjuntar opcionalmente foto y ubicación en Android e iOS. **Planificado:** importar datos, consultar el dato externo adicional y sincronizar únicamente las tareas y adjuntos de una cuenta mediante un servicio remoto. |

## 5. Funcionalidades

### 5.1 Gestión de tareas

| Acción de la persona usuaria | Resultado esperado | Si falla o se cancela |
|---|---|---|
| Escribir título y descripción y pulsar `Guardar tarea`. **Actual.** | Se crea la tarea, aparece en la lista y el formulario se limpia después de persistirla. | Si falla el almacenamiento, se muestra un error y el formulario no se limpia. |
| Consultar la pantalla principal. **Actual.** | Se muestra el contador, la lista ordenada y un estado vacío si no hay tareas. | Si falla la lectura, se muestra un error y se puede intentar crear una tarea. |
| Editar el título o la descripción de una tarea. **Actual.** | Se actualiza la misma tarea, conserva su `id`, fecha de creación, foto y ubicación, y el cambio queda guardado localmente. | Cancelar descarta los cambios y conserva los valores anteriores. Si falla el guardado, se informa y no se presenta el cambio como confirmado. |
| Pulsar `Eliminar` y confirmar. **Actual.** | La tarea se elimina de la lista después de la confirmación. | Cancelar conserva la tarea. Si falla el guardado, se informa y la tarea no se considera eliminada. |

### 5.2 Cámara y ubicación

| Acción de la persona usuaria | Resultado esperado | Si falla o se cancela |
|---|---|---|
| Solicitar adjuntar una foto y capturarla con la cámara. **Implementado en Android e iOS.** | La foto se copia a un almacenamiento persistente de la aplicación y queda asociada a la tarea nueva. | Si cancela, deniega el permiso o falla la captura, puede guardar la tarea sin foto y recibe una indicación clara. |
| Solicitar registrar el lugar de creación. **Implementado en Android e iOS.** | Se solicitan permisos de ubicación en primer plano y se asocian latitud y longitud a la tarea nueva. | Si cancela, deniega el permiso o falla la ubicación, puede guardar la tarea sin coordenadas y recibe una indicación clara. |

### 5.3 Autenticación

| Acción de la persona usuaria | Resultado esperado | Si falla o se cancela |
|---|---|---|
| Crear una cuenta local. **Implementado.** | Se valida el usuario y la contraseña, se guarda un hash local y se inicia la sesión en el dispositivo/origen actual. | Si el usuario ya existe o la contraseña no cumple la regla mínima, se muestra un error y no se crea la cuenta. |
| Iniciar sesión con su cuenta. **Implementado.** | La aplicación recupera la sesión local y carga únicamente las tareas asignadas a ese usuario. | Si las credenciales no coinciden, no se muestran tareas y se informa el error. |
| Cerrar sesión. **Implementado.** | Se elimina la sesión activa y se ocultan las tareas hasta iniciar sesión nuevamente. | Si la eliminación de la sesión falla, se conserva el estado autenticado y se muestra un error. |

- La autenticación es local y permite varias cuentas dentro del mismo dispositivo y origen. No hay backend, sincronización ni cuentas compartidas entre dispositivos.

### 5.4 Importación desde una API externa

| Acción de la persona usuaria | Resultado esperado | Si falla o se cancela |
|---|---|---|
| Iniciar la importación desde la API externa. **Planificado para la Evaluación 2.** | Los datos válidos se convierten en tareas de la cuenta y se informa el resultado. Repetir la importación no crea duplicados. | Si la persona cancela o la API falla, se conservan las tareas existentes, no se confirma una importación incompleta y se muestra el motivo o la posibilidad de reintentar. |
| Consultar una tarea importada. **Planificado para la Evaluación 2.** | Se consulta además un dato externo por tarea y se muestra junto con ella. El dato concreto está pendiente de definir. | Si la consulta adicional falla, la tarea sigue disponible y se indica que ese dato no pudo cargarse. |

El proveedor, el contrato de la API, el mapeo de campos y la clave para detectar duplicados siguen abiertos.

### 5.5 Sincronización

| Acción de la persona usuaria | Resultado esperado | Si falla o se cancela |
|---|---|---|
| Abrir la misma cuenta en otra sesión o dispositivo. **Planificado para la Evaluación 2.** | Las tareas, ediciones, fotos y ubicaciones propias aparecen sincronizadas; una edición puede verse en otra sesión sin recargar manualmente. | Si la conexión se pierde, no se deben borrar los datos locales disponibles; se informa el estado y se permite reintentar. La cola de cambios y la resolución de conflictos están pendientes de decisión. |

- En Android e iOS la persistencia actual usa SQLite local; en web usa AsyncStorage. Una tarea guardada en Expo Go no aparece automáticamente en la web, ni al revés.

## 6. Reglas de negocio clave

| Regla | Definición |
|---|---|
| Editar conserva la identidad de la tarea | Editar cambia el título y la descripción y puede reemplazar o quitar la foto y la ubicación; conserva el `id` y la fecha de creación. |
| Cancelar una edición no modifica la tarea | Cancelar una edición descarta los cambios no guardados y mantiene título, descripción y adjuntos anteriores. |
| Eliminar requiere confirmación | La tarea solo se elimina después de una confirmación explícita; cancelar la confirmación no cambia los datos. |
| Foto y ubicación son opcionales para guardar | Si la persona cancela la cámara, deniega un permiso o falla la captura o la ubicación, puede guardar la tarea sin ese dato. |
| Aislamiento por cuenta | Cada cuenta accede únicamente a sus propias tareas y adjuntos. |
| Importación idempotente | Repetir la importación no crea duplicados de una misma tarea externa. |
| Datos mínimos de una tarea | El título y la descripción son obligatorios para guardar. Esta validación ya existe en la primera entrega. |
| Persistencia antes de confirmar | Una operación no se presenta como exitosa hasta que sus datos se hayan persistido correctamente. |

## 7. Permisos, privacidad y conexión

- La cámara se solicita solo cuando la persona elige adjuntar una foto; no se solicita al abrir la aplicación.
- La ubicación se solicita solo cuando la persona elige registrar el lugar de creación; no se solicita para crear o consultar una tarea básica.
- La interfaz muestra si cada permiso está concedido, pendiente de solicitud o bloqueado; cuando el sistema no permite volver a preguntar, ofrece abrir los ajustes del dispositivo.
- La cámara se usa para el adjunto de la tarea y la ubicación en primer plano para guardar su lugar original. Actualmente se conservan la URI local persistente de la foto y las coordenadas de latitud y longitud, y se muestran al volver a cargar la tarea; la precisión y el tiempo de conservación siguen pendientes.
- Si se deniega un permiso, se cancela la acción o falla el dispositivo, la persona puede guardar y gestionar la tarea sin el dato opcional correspondiente.
- La Evaluación 2 debe proteger las tareas y adjuntos por cuenta. La versión actual lo hace localmente mediante `userId`, hashes de contraseña y sesión nativa en `expo-secure-store`; la web usa un fallback local.
- La primera entrega no necesita conexión para crear, consultar o eliminar tareas dentro del mismo dispositivo y origen. Android e iOS usan SQLite local y web usa AsyncStorage; las tareas no se sincronizan entre Expo Go y web.
- La sincronización remota, las operaciones que pueden continuar sin conexión, la cola de reintentos y los conflictos entre sesiones quedan pendientes de definir.

## 8. Fuera de alcance

Para una entrega posterior quedan:

- marcar tareas como completadas;
- consultar el historial de cambios o estados de una tarea.

## 9. Decisiones pendientes y documentos relacionados

### Decisiones pendientes

| Decisión | Por qué importa |
|---|---|
| Proveedor remoto y servicio de autenticación | Define cuentas, sesiones, protección de datos y sincronización. |
| API externa de importación | Define el contrato, la autenticación, los límites y el tratamiento de errores. |
| Dato externo adicional por tarea | El requisito existe, pero el dato concreto todavía no está definido. |
| Modelo de importación y deduplicación | Debe establecer qué identificador externo evita duplicados y cómo se actualizan los registros importados. |
| Almacenamiento y tamaño de fotos | Define si el adjunto se guarda localmente, en el proveedor remoto o en ambos lugares. |
| Precisión y representación de la ubicación | Define qué coordenadas o texto se conserva y cómo se muestra. |
| Trabajo sin conexión y conflictos | Define si se encolan cambios, cómo se reintentan y qué versión prevalece entre sesiones. |

### Documentos relacionados

- [DOMAIN.md](DOMAIN.md): detalle del modelo de datos y las reglas actuales de las tareas.
- [STACK.md](STACK.md): tecnologías y persistencia implementadas.
- [DESIGN.md](DESIGN.md): arquitectura actual y recorridos de creación, carga y eliminación.
- [MVP.md](MVP.md): criterios de aceptación y límites de la primera entrega.

Estos documentos describen la primera entrega, la autenticación local y las capacidades de cámara y ubicación implementadas en la Evaluación 2; deberán alinearse con la implementación cuando se desarrollen las demás capacidades planificadas.
