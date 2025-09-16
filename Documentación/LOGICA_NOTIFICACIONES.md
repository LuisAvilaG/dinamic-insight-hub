# Lógica del Sistema de Notificaciones

Este documento describe la arquitectura y el flujo de trabajo del sistema de notificaciones de la aplicación. El sistema está diseñado para ser **proactivo y centrado en el backend**, garantizando que las notificaciones se generen de manera robusta y eficiente.

---

## Arquitectura en Tres Capas

El sistema se compone de tres capas interconectadas que manejan los datos, la lógica y la presentación.

### 1. Capa de Datos: Tablas en Supabase

La base del sistema reside en la estructura de la base de datos, principalmente en la tabla `notifications` y las tablas que originan los eventos.

-   **Tabla de Destino (`public.notifications`):**
    Es la "bandeja de entrada" central para todos los usuarios. Cada fila representa una notificación individual con la siguiente estructura clave:
    -   `user_id`: Identifica a quién va dirigida la notificación.
    -   `message`: El texto que se mostrará al usuario.
    -   `is_read`: Un booleano (`true`/`false`) para saber si el usuario ya ha visto la notificación.
    -   `link`: Una URL opcional para redirigir al usuario a una página relevante (ej. `/recursos-humanos?tab=mi-equipo`).

-   **Tablas de Origen (Ej: `public.announcements`, `public.vacaciones_solicitudes`):**
    Son las tablas donde ocurren las acciones que queremos notificar. El sistema reacciona a los cambios (como la inserción de una nueva fila) en estas tablas.

### 2. Capa de Lógica: Triggers y Funciones en la Base de Datos (El "Cerebro")

Esta es la parte más importante del sistema. En lugar de que el frontend sea responsable de crear notificaciones, la base de datos **reacciona automáticamente** a los eventos.

-   **Triggers (Disparadores):**
    Son "escuchadores" que hemos configurado en las tablas de origen. Por ejemplo, el trigger `on_new_announcement` se activa `AFTER INSERT` en la tabla `announcements`.

-   **Funciones de PostgreSQL:**
    Cuando un trigger se activa, ejecuta una función específica. Por ejemplo, la función `handle_new_announcement()`:
    1.  Se activa justo después de que se crea un nuevo anuncio.
    2.  Toma el título del anuncio recién creado.
    3.  Busca en la tabla `public."Cuentas"` la lista de todos los `user_id` válidos.
    4.  Inserta una nueva fila en la tabla `notifications` para **cada uno de esos usuarios**.

La gran ventaja de este enfoque es que es **atómico y garantizado**. Si la creación del anuncio tiene éxito, la base de datos se encarga de que las notificaciones también se creen, independientemente de la interfaz de usuario.

### 3. Capa de Presentación: El Frontend en React (La "Interfaz")

El frontend es responsable de mostrar las notificaciones al usuario y permitir la interacción.

-   **El Hook `useNotifications`:**
    -   **Consulta Inicial:** Al cargar la aplicación, este hook consulta la tabla `notifications` para obtener las notificaciones más recientes del usuario que ha iniciado sesión.
    -   **Suscripción en Tiempo Real:** El hook abre un canal de comunicación directo con Supabase y se suscribe a los cambios en la tabla `notifications`. Cuando un trigger en el backend inserta una nueva notificación para el usuario, Supabase la "empuja" instantáneamente a través de este canal. El hook la recibe, muestra un `Toast` de "Nueva Notificación" y actualiza la lista en la interfaz sin necesidad de recargar la página.

-   **El Componente `Notifications.tsx`:**
    -   **Visualización:** Es el componente de la "campana" en el header. Utiliza el `hook` para obtener el número de notificaciones no leídas y lo muestra en el indicador rojo.
    -   **Interacción:** Al hacer clic en una notificación, se invoca la función `markAsRead` del `hook`, que envía un comando `UPDATE` a Supabase para cambiar el estado de `is_read` a `true` para esa notificación específica.

---

## Flujo de Trabajo Resumido

El flujo completo, desde la acción hasta la visualización, es el siguiente:

1.  **Acción del Usuario:** Un administrador crea un nuevo anuncio.
2.  **Activación del Trigger:** La inserción en la tabla `announcements` activa el trigger `on_new_announcement`.
3.  **Ejecución de la Función:** El trigger ejecuta la función `handle_new_announcement()` en la base de datos.
4.  **Creación de Notificaciones:** La función crea una notificación en la tabla `notifications` para cada usuario del sistema.
5.  **Notificación en Tiempo Real:** Supabase Realtime detecta las nuevas inserciones y las "empuja" a los clientes suscritos.
6.  **Actualización de la UI:** El `hook` `useNotifications` en el frontend recibe las nuevas notificaciones y actualiza el estado, lo que hace que la campana y la lista se actualicen instantáneamente.
