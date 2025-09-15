
# Dinamic Insight Hub - Arquitectura de Dashboards

Este documento describe la arquitectura técnica detrás de la funcionalidad de dashboards dinámicos en la aplicación, con un enfoque en el flujo de datos y la interacción entre el frontend, el backend y la base de datos.

## 1. Modelo de Datos Core

La funcionalidad de dashboards se sustenta en tres tablas principales en la base de datos de Supabase (PostgreSQL) dentro del esquema `be_exponential`:

- **`reports`**: Almacena la información de cada dashboard, como su nombre, descripción y a qué proyecto pertenece.
- **`report_widgets`**: El corazón de la arquitectura. Cada fila representa un widget específico dentro de un dashboard. Almacena:
    - `id`: Identificador único del widget.
    - `report_id`: FK que lo asocia a un `reports`.
    - `type`: El tipo de widget (e.g., `kpi`, `line_chart`, `data_table`).
    - `title`: Título del widget que se muestra en el UI.
    - `config`: Un campo `jsonb` que contiene la configuración específica del widget (qué tabla consultar, qué columnas usar, qué agregaciones aplicar, etc.).
    - `query`: Un campo de texto que almacena la **consulta SQL completa y pre-generada** que el widget ejecutará para obtener sus datos.
- **Tablas de Datos del Usuario**: Son las tablas que el usuario crea y sobre las cuales se construyen los widgets (e.g., `sales_data`, `user_signups`).

## 2. Flujo de Creación y Actualización de Widgets

Este flujo es crucial para entender cómo se desacopla la configuración de la visualización.

1.  **Interacción del Usuario**: El usuario abre el `AddWidgetDialog` o edita un widget existente.

2.  **Configuración en el Frontend**: A través de los controles de la interfaz (selects para tabla, columna, agregación), el usuario define la visualización deseada. Esta configuración se mantiene en un estado de React (`config`).

3.  **Generación de Vista Previa (Live Preview)**:
    - Mientras el usuario modifica la configuración, el componente `WidgetPreview.tsx` reacciona a los cambios.
    - En cada cambio, invoca a la función `buildWidgetQuery(type, table, config)` ubicada en `src/lib/widget_query_builder.ts`.
    - `buildWidgetQuery` genera una consulta SQL **temporal** basada en la configuración actual.
    - El frontend ejecuta esta consulta SQL temporal contra una función RPC de Supabase llamada `execute_query` para obtener datos de muestra.
    - Los datos se pasan al componente de vista previa correspondiente (`/previews/*.tsx`), que utiliza la librería `Recharts` para renderizar un gráfico de ejemplo.

4.  **Guardado del Widget**:
    - Cuando el usuario guarda el widget, ocurre la acción principal.
    - Se vuelve a llamar a `buildWidgetQuery` con la **configuración final** para generar la **consulta SQL definitiva**.
    - El frontend envía una petición a la base de datos (usando el cliente de Supabase) para crear o actualizar una fila en la tabla `report_widgets`.
    - En esta petición se guardan tanto el objeto `config` como la `query` SQL generada.

## 3. Flujo de Visualización en el Dashboard

Este flujo es mucho más simple y eficiente gracias a la arquitectura de consulta pre-generada.

1.  **Carga del Dashboard**: El usuario navega a una página de dashboard.

2.  **Fetch de Widgets**: El frontend obtiene todas las filas de `report_widgets` asociadas a ese dashboard.

3.  **Renderizado de Widgets**:
    - La aplicación itera sobre los datos de los widgets obtenidos.
    - Por cada widget, el componente correspondiente (e.g., `LineChartWidget.tsx`) es renderizado.
    - El componente **NO** conoce la `config`. Su única responsabilidad es tomar el campo `query` del widget.
    - Utiliza `useQuery` (TanStack Query) para invocar la función `execute_query` de Supabase, pasándole la `query` pre-generada.
    - La función `execute_query({ p_query: string })` es una función RPC (Remote Procedure Call) en PostgreSQL, definida en Supabase. Su única función es ejecutar la cadena de texto que se le pasa como una consulta SQL y devolver el resultado como JSON.

    ```sql
    -- Ejemplo de la definición de la función en SQL
    create or replace function execute_query(p_query text)
    returns json
    language plpgsql
    as $$
    begin
      return (select array_to_json(array_agg(row_to_json(t))) from (execute p_query) t);
    end; $$;
    ```

4.  **Visualización con Recharts**: El widget recibe los datos en formato JSON desde Supabase y los pasa directamente a los componentes de `Recharts` para su visualización. La estructura de los datos devueltos por la consulta está diseñada para coincidir exactamente con lo que Recharts espera (`name`, `value`, etc.).

## 4. Principios de Diseño y Ventajas

- **Desacoplamiento**: El frontend que *visualiza* un widget no sabe nada sobre cómo se construyó. Solo necesita ejecutar una consulta SQL que se le proporciona. Esto simplifica enormemente los componentes del dashboard.
- **Eficiencia**: La lógica compleja de construcción de SQL solo se ejecuta en el momento de la creación/edición, no cada vez que se carga un dashboard. La carga del dashboard es muy rápida, ya que solo implica ejecutar consultas ya preparadas.
- **Seguridad**: Al usar una función `execute_query` y no permitir que el frontend construya SQL sobre la marcha para visualizar, se reduce la superficie de ataque para inyecciones SQL (aunque se debe sanitizar la entrada en el `query_builder`).
- **Centralización de la Lógica**: Toda la lógica de construcción de SQL está centralizada en `widget_query_builder.ts`, lo que lo convierte en el único punto que necesita ser modificado si la lógica de datos cambia.
