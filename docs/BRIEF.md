# Hazlo — brief de producto

## Problema

Las tareas pendientes pueden quedar dispersas o perderse entre otras actividades. Hazlo concentra esas tareas en una lista local sencilla, con un formulario breve para registrarlas y una acción explícita para retirarlas cuando ya no se necesiten.

## Usuarios

Personas que necesitan anotar y consultar tareas personales desde un dispositivo móvil. La versión actual no usa cuentas: cada instalación mantiene su propia información.

## Objetivo actual

Permitir que una persona:

- cree una tarea con título y descripción;
- consulte sus tareas pendientes en la pantalla principal;
- conserve la lista al cerrar y volver a abrir la aplicación en el mismo entorno;
- elimine una tarea después de confirmar la acción.

## Alcance de esta entrega

La primera entrega contiene una única pantalla principal en `src/app/index.tsx`. Incluye formulario, contador, lista, estado vacío, mensajes de carga y error, persistencia local y confirmación antes de eliminar.

No incluye edición, pantalla de detalle independiente, cuentas, autenticación, sincronización entre dispositivos, notificaciones, fechas, categorías ni estados de completado. La ruta `src/app/explore.tsx` pertenece al template de Expo y no forma parte del flujo visible de Hazlo.
