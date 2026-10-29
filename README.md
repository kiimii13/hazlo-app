# Hazlo

## Informe de desarrollo de aplicación móvil

| Dato | Información |
|---|---|
| Estudiante | Kimberly Sophia Cerda Castillo |
| Institución | Instituto Profesional San Sebastián |
| Asignatura | Aplicaciones Móviles |
| Sección | 51 |
| Docente | Boris Belmar |
| Fecha de entrega | [Completar] |

[Insertar captura de la pantalla principal de Hazlo]

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

El proyecto organiza la navegación, la lógica de tareas y el almacenamiento en distintas partes:

| Archivo o carpeta | Responsabilidad |
|---|---|
| `src/app/_layout.tsx` | Define la estructura de navegación de la aplicación. |
| `src/app/index.tsx` | Presenta la pantalla principal de Hazlo. |
| `src/hooks/use-tasks.ts` | Agrupa la lógica y el estado relacionados con las tareas. |
| `src/lib/tasks.ts` | Lee y guarda las tareas mediante AsyncStorage. |
| `docs/BRIEF.md` | Describe el objetivo y el alcance funcional del proyecto. |
| `docs/STACK.md` | Registra las tecnologías y decisiones técnicas del proyecto. |

La navegación se organiza con Expo Router. El código separa la presentación visual de la lógica de tareas y de las operaciones de almacenamiento, de modo que cada parte tenga una responsabilidad reconocible.

## 6. Patrones y principios de diseño utilizados

### Interfaz declarativa

La pantalla representa el estado actual de la aplicación. Cuando la lista cambia —por ejemplo, al agregar o eliminar una tarea—, React vuelve a representar la interfaz con los datos actualizados.

### Componentes reutilizables

La interfaz se construye combinando componentes para organizar áreas como el formulario, la lista y cada tarea. Esta composición permite separar partes de la pantalla y hacer más comprensible su estructura.

### Flujo de datos unidireccional

La información de las tareas se administra desde el estado de la aplicación y se entrega a los componentes que la necesitan. Las acciones, como guardar o eliminar, comunican los cambios para actualizar ese estado.

### Hook personalizado

`use-tasks.ts` encapsula la lógica de tareas, como cargar, agregar o eliminar elementos. Esto evita mezclar toda esa lógica con la presentación visual de la pantalla.

### Separación de responsabilidades

`tasks.ts` concentra el acceso a AsyncStorage, mientras que la pantalla y el hook coordinan la interacción y el estado. Esta organización permite localizar con mayor facilidad cada tipo de cambio.

## 7. Diseño de la interfaz y experiencia de usuario

La interfaz de Hazlo prioriza la tarea principal: registrar y consultar actividades. El título identifica la aplicación, el formulario agrupa los campos relacionados y la lista presenta cada tarea de forma consistente.

La propuesta visual utiliza una base clara llamada Paper, Plum como color principal y Pollen como acento. La tipografía del nombre de la aplicación ayuda a distinguir la marca del resto de la información.

Las decisiones de interfaz buscan:

- Mantener una jerarquía visual clara entre el título, el formulario y la lista.
- Agrupar el título y la descripción dentro del formulario.
- Usar colores y contraste para diferenciar áreas y acciones.
- Mantener un diseño adaptable a una pantalla móvil.
- Mostrar la acción de eliminar junto a la tarea correspondiente.

### Capturas de la aplicación

#### Pantalla principal y Formulario para crear una tarea en Expo Go

[Pantalla principal hazlo] (docs/capturas/pantalla-principal-formulario.png)


#### Lista con tareas guardadas

[Lista de tareas](docs/capturas/lista-tareas.png)

#### Confirmación o acción de eliminación

[Eliminación de una tarea] (docs/capturas/eliminar-tareas.png)


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

### Evidencia de pruebas funcionales

| Caso | Resultado |
|---|---|
| Crear una tarea con título y descripción | [Completar resultado y agregar evidencia] |
| Comprobar que el formulario queda limpio después de guardar | [Completar resultado y agregar evidencia] |
| Cerrar y reabrir la aplicación para comprobar la persistencia | [Completar resultado y agregar evidencia] |
| Eliminar una tarea específica | [Completar resultado y agregar evidencia] |
| Comprobar el comportamiento cuando faltan datos obligatorios | [Completar resultado y agregar evidencia] |

## 11. Conclusión

Hazlo cumple el objetivo de ofrecer una primera aplicación móvil para organizar tareas mediante una interfaz sencilla. React Native y Expo permiten desarrollar y probar la experiencia móvil, TypeScript ayuda a describir la información que utiliza la aplicación y AsyncStorage conserva las tareas localmente.

La separación entre pantalla, lógica de tareas y almacenamiento facilita comprender la estructura del proyecto. Como mejora futura, se podría agregar edición de tareas, filtros o sincronización remota, siempre que el alcance del curso lo requiera.

## 12. Referencias

Expo. (s. f.). *Expo SDK 57*. https://docs.expo.dev/versions/v57.0.0/

React. (s. f.). *Sharing state between components*. https://react.dev/learn/sharing-state-between-components

React Native. (s. f.). *Core components and APIs*. https://reactnative.dev/docs/components-and-apis

React Native. (s. f.). *Layout with Flexbox*. https://reactnative.dev/docs/flexbox

React Native Async Storage. (s. f.). *Async Storage*. https://github.com/react-native-async-storage/async-storage