# Hazlo — MVP de la primera entrega

## Alcance implementado

1. **Crear una tarea.** El formulario solicita título y descripción. El botón permanece deshabilitado si alguno está vacío o contiene solo espacios.
2. **Consultar y editar tareas.** La pantalla presenta el contador y una lista ordenada con título, descripción y acciones `Editar` y `Eliminar`. Editar carga título, descripción, foto y ubicación en el formulario; permite cambiar o quitar los datos opcionales sin alterar la identidad.
3. **Persistir localmente.** En Android e iOS las tareas se guardan en SQLite; en web se mantienen como JSON en AsyncStorage. Se recuperan al iniciar la pantalla.
4. **Eliminar con confirmación.** La acción `Eliminar` abre un modal con `Cancelar` y `Eliminar`.
5. **Estados de interfaz.** La pantalla muestra carga, lista vacía y errores de almacenamiento. Después de guardar correctamente, limpia el formulario.

## Extensión de la Evaluación 2 implementada

- **Autenticación local.** La aplicación permite crear cuentas, iniciar sesión y cerrar sesión sin conexión a Internet.
- **Protección por usuario.** Cada tarea incluye `userId`; SQLite y AsyncStorage filtran carga, edición y eliminación por la sesión activa.
- **Sesión nativa protegida.** Android/iOS usa `expo-secure-store`; las contraseñas se guardan como hash con salt.
- **Migración de tareas existentes.** Las tareas sin usuario se asignan al primer usuario que se registra o inicia sesión.
- **Adjuntar una foto.** En Android e iOS, `Adjuntar foto` consulta el estado y solicita permiso bajo demanda, captura la imagen y la copia a un almacenamiento persistente de la aplicación.
- **Registrar ubicación.** `Registrar ubicación` consulta el estado y solicita permiso de ubicación en primer plano bajo demanda y guarda latitud y longitud.
- **Permisos bloqueados.** Si el sistema no permite volver a solicitar un permiso, la interfaz informa la causa y ofrece abrir los ajustes del dispositivo.
- **Datos opcionales.** Cancelar, denegar permisos o fallar una captura no bloquea el guardado de la tarea; al recargar, la tarjeta muestra la foto y las coordenadas persistidas.
- La web conserva su fallback local y no muestra controles de cámara o ubicación.


## Criterios de aceptación

Desde la raíz del proyecto:

```bash
npm install
npx expo start
```

En la ruta principal, mediante Expo Go o web, comprobar:

1. Escribir título y descripción; verificar que `Guardar tarea` se habilita solo cuando ambos campos tienen contenido.
2. Guardar; verificar que la tarea aparece en `Tus tareas` y que los campos quedan vacíos.
3. Cerrar y volver a abrir la aplicación en el mismo dispositivo y origen; verificar que la tarea sigue visible.
4. Pulsar `Editar`, cambiar título o descripción y, en Android/iOS, reemplazar o quitar foto/ubicación; pulsar `Guardar cambios` y verificar que la misma tarea muestra los nuevos valores.
5. Pulsar `Editar`, cambiar los campos y pulsar `Cancelar edición`; verificar que se conservan los valores anteriores y los adjuntos.
6. Pulsar `Eliminar` y después `Cancelar`; verificar que la tarea permanece.
7. Repetir `Eliminar` y confirmar; verificar que la tarea desaparece y que el estado vacío vuelve a mostrarse si no quedan tareas.

8. En Android/iOS, adjuntar una foto o registrar ubicación debe solicitar el permiso solo al ejecutar la acción, mostrar el resultado guardado al volver a cargar la lista y ofrecer ajustes si el sistema bloqueó nuevas solicitudes.
9. Crear dos cuentas locales; verificar que una cuenta no muestra las tareas de la otra.
10. Cerrar sesión; verificar que las tareas dejan de mostrarse y que el formulario de autenticación vuelve a aparecer.
11. Iniciar sesión de nuevo con la primera cuenta; verificar que recupera únicamente sus tareas.

Las comprobaciones disponibles son `npx expo lint`, `npx tsc --noEmit` y `npm test -- --runInBand`. La suite declarada usa Jest, `jest-expo` y `@testing-library/react-native`; cubre los módulos nativos mediante mocks y no sustituye la validación física en un dispositivo.

## Límites de esta entrega

- En Android e iOS, las tareas se guardan en la base SQLite local `hazlo.db` y se filtran por `userId`.
- En web, las tareas y cuentas se guardan localmente en AsyncStorage bajo claves separadas.
- Las instalaciones native existentes migran su JSON heredado de AsyncStorage a SQLite en la primera apertura; las tareas quedan sin usuario hasta el primer registro.
- La persistencia depende del dispositivo y del origen de ejecución: una tarea creada en Expo Go no aparece automáticamente en web, ni al revés.
- No hay backend, sincronización entre dispositivos ni recuperación remota de contraseñas.
- En Android e iOS los permisos de cámara y ubicación solo se solicitan al elegir la acción correspondiente; en web no se muestran esos controles.

## Capacidades restantes de la Evaluación 2

El `BRIEF.md` mantiene como alcance planificado:

- importar tareas desde una API externa sin duplicarlas al repetir la operación;
- consultar y mostrar un dato externo adicional por tarea;
- sincronizar tareas, ediciones, fotos y ubicaciones entre sesiones.

El proveedor de la API de importación, el dato externo, el trabajo sin conexión y la resolución de conflictos siguen pendientes de decisión.


## Fuera de alcance actual

No forman parte de esta entrega el detalle independiente, la importación desde una API externa, la sincronización web-móvil o entre dispositivos, las notificaciones, las fechas visibles, las categorías, el completado y el historial de cambios de tareas.
