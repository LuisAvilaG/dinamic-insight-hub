# Lógica y Arquitectura del Proyecto de Dashboard

*Última actualización: 2025-10-05*

## Propósito

Este documento describe la arquitectura técnica, el flujo de datos y las decisiones clave detrás de la implementación del dashboard dinámico. Sirve como una guía de referencia para el desarrollo y mantenimiento continuo.

## Arquitectura General

El sistema se compone de tres partes principales:

1.  **Frontend (React/Vite)**: Una aplicación de una sola página (SPA) que proporciona la interfaz de usuario. Se encarga de la visualización, la interacción y la comunicación con el backend.
2.  **Backend (Supabase)**: Utiliza Supabase para la base de datos PostgreSQL, la autenticación y, fundamentalmente, las **Funciones de Base de Datos (RPC)**.
3.  **Base de Datos del Cliente**: Esquemas de datos de producción (como `be_exponential`) a los que las funciones RPC acceden de forma segura.

## Flujo de Datos: Creación y Visualización de Widgets

Este flujo es crítico y debe seguirse para asegurar la consistencia de los datos y el comportamiento esperado de la interfaz.

1.  **Carga del Dashboard**: Al entrar a una página de dashboard, el frontend debe hacer una **única llamada** a la función RPC `get_dashboard_details(dashboard_id)`.
    *   Esta función es la **única fuente de verdad**. Devuelve un objeto JSON que contiene los detalles del dashboard y un array anidado `widgets` con la configuración completa de cada widget, incluyendo su `id`, `type`, `config` y, crucialmente, su `layout`.

2.  **Renderizado del Grid**: El frontend utiliza los datos de `dashboard.widgets` para renderizar la parrilla de widgets, posicionando cada uno según su objeto `layout` (`{x, y, w, h}`).

3.  **Añadir un Nuevo Widget**: Cuando el usuario hace clic en "Añadir Widget":
    *   Se abre un diálogo que guía al usuario para configurar el nuevo widget (título, tipo, consulta, etc.).
    *   **Cálculo de Posición**: Antes de guardar, el frontend **debe** calcular la siguiente posición disponible en la parrilla. Utiliza el array `widgets` (obtenido en el paso 1) para determinar los espacios ya ocupados y encontrar un lugar para el nuevo widget.
    *   **Llamada de Inserción**: El frontend llama a la función RPC `insert_widget`.
    *   Se le pasan los parámetros `p_dashboard_id`, `p_widget_type`, el objeto `p_config` (con el título, la query, etc.) y, más importante, el objeto `p_layout` calculado en el paso anterior.

4.  **Actualización de la UI**: Después de que la llamada `insert_widget` se completa con éxito, el componente frontend simplemente vuelve a ejecutar la función `fetchData` (que a su vez vuelve a llamar a `get_dashboard_details`), obteniendo la lista fresca y actualizada de widgets, que ahora incluye el nuevo. El ciclo vuelve a empezar desde el paso 1.

## Estructura de la Base de Datos (Esquema `be_exponential`)

La persistencia del dashboard se maneja con dos tablas principales:

- **`report_dashboards`**: Almacena la información de cada dashboard.
- **`report_widgets`**: Tabla central que almacena la configuración de cada widget. Las columnas clave son:
    - `dashboard_id`: Vincula el widget a un dashboard.
    - `widget_type`: Un tipo `enum` (`kpi`, `table`, etc.) que define el tipo de visualización.
    - `config`: Un objeto JSONB que contiene toda la configuración de la consulta del widget (`title`, `query`, `options`).
    - `layout`: Un objeto JSONB que almacena la posición y el tamaño en la parrilla (`{x, y, w, h}`).

---
*Este documento se actualizará a medida que el proyecto evolucione.*