# Hazlo — MVP de la primera entrega

## Funciones implementadas

1. **Crear una tarea.** El formulario solicita título y descripción. El botón permanece deshabilitado si alguno está vacío o contiene solo espacios.
2. **Mostrar tareas.** La pantalla presenta el contador y una lista con título, descripción y acción `Eliminar`.
3. **Persistir localmente.** Las tareas se guardan como JSON en AsyncStorage y se recuperan al iniciar la pantalla.
4. **Eliminar con confirmación.** La acción `Eliminar` abre un modal con `Cancelar` y `Eliminar`.
5. **Estados de interfaz.** La pantalla muestra carga, lista vacía y errores de almacenamiento. Después de guardar correctamente, limpia el formulario.

## Cómo comprobarlo

Desde la raíz del proyecto:

```bash
npm install
npx expo start
```

En Expo Go, abrir la ruta principal y comprobar:

1. Escribir título y descripción; verificar que `Guardar tarea` se habilita.
2. Guardar; verificar que la tarea aparece en `Tus tareas` y que los campos quedan vacíos.
3. Cerrar y volver a abrir la aplicación en el mismo entorno; verificar que la tarea sigue visible.
4. Pulsar `Eliminar`; pulsar `Cancelar`; verificar que la tarea permanece.
5. Repetir `Eliminar` y confirmar; verificar que la tarea desaparece y el estado vacío vuelve a mostrarse si no quedan tareas.

Las comprobaciones estáticas disponibles son `npx expo lint` y `npx tsc --noEmit`. El proyecto no declara un framework de pruebas automatizadas.

## Fuera de alcance

No forman parte de esta entrega la edición, el detalle independiente, la sincronización web-móvil o entre dispositivos, el backend, la autenticación, las notificaciones, las fechas, las categorías y el completado de tareas.
