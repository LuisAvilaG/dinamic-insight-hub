# Documentación de la Lógica del Proyecto

Este documento describe la arquitectura y el flujo de datos de alto nivel de la aplicación de dashboards, con un enfoque en la interacción entre el frontend en React y la base de datos en Supabase.

## 1. Arquitectura General

La aplicación sigue un modelo cliente-servidor donde:

-   **Cliente (Frontend):** Una Single Page Application (SPA) construida con React (Vite) y TypeScript. Se encarga de la renderización de la interfaz de usuario, la gestión del estado local y la comunicación con la API de Supabase.
-   **Servidor (Backend):** Supabase actúa como el backend, proveyendo:
    -   Una base de datos PostgreSQL para la persistencia de datos.
    -   Una API REST auto-generada para operaciones CRUD básicas.
    -   Un sistema para crear y exponer funciones personalizadas de PostgreSQL como endpoints RPC (Remote Procedure Call), que es el método principal para las interacciones con la base de datos.

## 2. Lógica de Datos y Flujo

El núcleo de la aplicación es la capacidad de crear, visualizar y gestionar dashboards y widgets. Toda la lógica de negocio y las operaciones complejas de la base de datos están encapsuladas en funciones de PostgreSQL (RPC), manteniendo el código del cliente limpio y centrado en la UI.

### 2.1. Entidades Principales

-   `report_dashboards`: Almacena la información de cada dashboard (nombre, descripción, etc.).
-   `report_widgets`: Almacena la configuración de cada widget, incluyendo su tipo (`widget_type`), la configuración específica (`config`), su layout (`layout`), y una clave foránea a `dashboard_id`.

**IMPORTANTE: Esquemas de Base de Datos**

Todas las tablas de la aplicación residen en el esquema `be_exponential`, no en el esquema `public` por defecto esto aplica solamente para el modulo de dashboards. Esto es crucial, ya que **todas las interacciones con la base de datos deben especificar este esquema**. Las funciones RPC lo hacen en su código SQL interno. El código del cliente debe hacerlo en las raras ocasiones en que interactúa directamente con las tablas (aunque el patrón preferido es usar siempre RPC).

### 2.2. Flujo de Creación y Configuración de Widgets

El proceso de añadir un nuevo widget es el más complejo e ilustra la arquitectura de la aplicación:

1.  **Obtención de Metadatos:**
    -   El diálogo de configuración de widgets (`NewAddWidgetDialog`) llama a la función RPC `get_schema_tables()` para obtener una lista de todas las tablas visibles (de los esquemas `public` y `be_exponential`).
    -   El resultado ahora incluye tanto el `table_schema` como el `table_name`.
    -   El desplegable de selección de tabla muestra esta información combinada (ej: `be_exponential.tasks_action_items`) para evitar ambigüedades.

2.  **Selección de Columnas:**
    -   Una vez que el usuario selecciona una tabla (y por lo tanto, un esquema y un nombre de tabla), el estado de configuración del widget almacena `{ schema: 'be_exponential', table: 'tasks_action_items', ... }`.
    -   Se llama a la función RPC `get_table_columns({ p_schema_name, p_table_name })` para obtener las columnas *solo* de esa tabla específica.

3.  **Lógica de Agregación Unificada (KPIs y Gráficos):**
    -   Para una experiencia de usuario consistente, los formularios de configuración (KPI, Gráfico de Barras, etc.) piden al usuario que seleccione la **agregación** (`SUM`, `COUNT`, etc.) *antes* de la columna de valor/eje Y.
    -   Si la agregación es `count`, el desplegable de columnas se puebla con **todas** las columnas de la tabla, además de una opción especial `*` para `COUNT(*)`.
    -   Si la agregación es otra (ej: `sum`, `avg`), el desplegable solo muestra las columnas numéricas, filtradas en el frontend.
    -   Esta lógica se aplica tanto en la configuración de KPIs como en la del eje Y de los gráficos de barras.

4.  **Vista Previa Dinámica:**
    -   A medida que el usuario completa la configuración, el componente de vista previa construye una consulta `SELECT` dinámica.
    -   Esta consulta utiliza la sintaxis correcta que incluye el esquema: `SELECT ... FROM "${config.schema}"."${config.table}" ...`.
    -   La consulta se envía a la función RPC `execute_query({ p_query })`, que la ejecuta de forma segura en la base de datos y devuelve el resultado.

5.  **Guardado del Widget:**
    -   Anteriormente, se intentaba guardar con `supabase.from('report_widgets').insert(...)`, lo cual fallaba por no especificar el esquema `be_exponential` y por sintaxis incorrecta de la librería.
    -   La solución fue **centralizar la lógica de creación en una función RPC dedicada**.
    -   Ahora, el cliente llama a la nueva función `supabase.rpc('create_widget', { ... })`, pasando los datos del nuevo widget.
    -   Esta función `create_widget` contiene la sentencia `INSERT` correcta que apunta a `be_exponential.report_widgets` y maneja el casteo de tipos (`text` a `enum`), abstrayendo completamente la estructura del esquema del código del cliente y estableciendo un patrón de diseño consistente para todas las mutaciones de la base de datos.

### 2.3. Visualización de Widgets

-   Al cargar un dashboard, el componente `ReportViewer` llama a `get_dashboard_details({ p_dashboard_id })`.
-   Esta función devuelve un objeto JSON con los detalles del dashboard y un array anidado de todos sus widgets.
-   El frontend itera sobre este array y renderiza el componente de widget apropiado (`KpiWidget`, `BarChartWidget`, etc.) para cada uno, pasándole su objeto de configuración.
-   Cada componente de widget es responsable de usar su configuración para obtener sus propios datos, siguiendo la misma lógica de construcción de consultas (`FROM "schema"."table"`, manejo de `COUNT(*)`, etc.) y uso de `execute_query` que la vista previa.
