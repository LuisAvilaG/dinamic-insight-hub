# Lógica y Arquitectura del Proyecto de Dashboards

Este documento detalla la arquitectura y el flujo de datos de la aplicación de dashboards, enfocándose en la interacción entre el frontend de React y la base de datos de Supabase.

## 1. Arquitectura General

La aplicación sigue un modelo cliente-servidor:

-   **Cliente (Frontend):** Una Single Page Application (SPA) construida con React (Vite) y TypeScript. Maneja la interfaz de usuario, el estado y la comunicación con Supabase.
-   **Servidor (Backend):** Supabase provee la base de datos PostgreSQL, una API REST y funciones RPC personalizadas, que son el método principal de interacción.

## 2. Entidades Principales de la Base de Datos

Todas las tablas residen en el esquema `be_exponential`.

-   `report_dashboards`: Almacena la información de cada dashboard (nombre, departamento, etc.).
-   `report_widgets`: Contiene la configuración de cada widget. Las columnas clave son:
    -   `widget_type`: Un `enum` (`kpi`, `bar_chart`, `line_chart`, `data_table`, `pivot_table`) que determina qué componente renderizar.
    -   `config`: Un campo `JSONB` flexible que almacena todas las selecciones del usuario (nombre del widget, tablas, columnas, ejes, etc.). **Crucialmente, la consulta SQL final (`query`) también se almacena aquí.**
    -   `layout`: Un objeto JSON que define la posición y tamaño del widget en la cuadrícula.
-   `calculated_fields`: Una tabla global que almacena los campos personalizados creados por los usuarios. Contiene el nombre del campo, su expresión SQL y las tablas que utiliza.

## 3. Flujo de Configuración de Widgets y Lógica de Consultas

El componente central para la creación y edición de widgets es `NewAddWidgetDialog.tsx`. Este diálogo actúa como un orquestador que gestiona el estado de configuración y es **responsable de construir la propiedad `query`** que se guardará en el `config` del widget.

El flujo es el siguiente:

1.  **Selección del Tipo de Widget:** El usuario elige un tipo de widget (KPI, Gráfico de Barras, etc.).
2.  **Renderizado del Configurador:** El diálogo renderiza el componente de configuración específico (ej: `BarChartConfig.tsx`, `DataTableConfig.tsx`).
3.  **Configuración del Usuario:**
    -   El usuario selecciona tablas, columnas y/o campos calculados.
    -   Cada vez que una opción cambia, el componente de configuración (`...Config.tsx`) notifica al diálogo principal (`NewAddWidgetDialog`) a través de la función `onConfigChange`.
4.  **Construcción de la Consulta (en `handleConfigChange`):**
    -   Esta función en `NewAddWidgetDialog.tsx` es el cerebro del sistema. Recibe la nueva configuración y, basándose en el `selectedWidgetType` y las opciones elegidas, construye la consulta SQL final.
    -   Si la configuración es válida, la `query` se almacena en el estado `widgetConfig`. Si no, la `query` se establece en `null`.
5.  **Vista Previa en Tiempo Real:**
    -   El componente del widget (ej: `BarChartWidget.tsx`) se renderiza en la sección de vista previa.
    -   Este componente recibe el `widgetConfig` completo. Es un componente "tonto": su única responsabilidad es tomar la `query` del `config`, ejecutarla a través de la RPC `execute_query`, y mostrar los resultados (o un mensaje de error/carga).
6.  **Guardado:** Al hacer clic en "Guardar", se guarda el `widgetConfig` completo (incluida la `query`) en la base de datos.

### 3.1. Campos Calculados

La funcionalidad de campos calculados se maneja de la siguiente manera:

-   **Creación:** El modal de creación, disponible en todos los configuradores, utiliza la RPC `create_calculated_field` para guardar el nuevo campo en la tabla global `calculated_fields`.
-   **Disponibilidad:** Cada configurador obtiene las columnas de las tablas seleccionadas (`get_columns_from_tables`) y los campos calculados (`get_calculated_fields`) y los presenta al usuario como una lista unificada.
-   **Sanitización de Expresiones:** Para que las expresiones de los campos calculados (que se guardan con nombres completos como `COUNT("schema"."table"."column")`) funcionen en las consultas, `NewAddWidgetDialog.tsx` utiliza una función auxiliar `sanitizeExpression` para limpiarlas y convertirlas a un formato simple (ej: `COUNT("column")`).

### 3.2. Lógica de Consulta por Tipo de Widget

#### a) Gráfico de Barras y Gráfico de Líneas

-   **Requisitos:** `xAxis`, `yAxis`.
-   **Lógica:**
    -   **Si el `yAxis` es un Campo Calculado:** La consulta se construye usando una **única tabla de origen**, que se determina a partir de la columna seleccionada en el `xAxis`. Esto es crucial para la coherencia del `GROUP BY`.
        -   *Consulta Ejemplo:* `SELECT "status" as "...", (COUNT(*)) as value FROM "be_exponential"."tasks" GROUP BY "status"`
        -   Para el `line_chart`, se añade un `ORDER BY` en la columna del `xAxis`.
    -   **Si el `yAxis` es una Columna Normal:** La consulta se construye usando `UNION ALL` para permitir datos de múltiples tablas. Se aplica la `aggregation` seleccionada.

#### b) Tabla de Datos (DataTable)

-   **Requisitos:** `columns`.
-   **Lógica:**
    -   **Detección de Agregación:** El sistema revisa si alguno de los campos calculados seleccionados contiene una función de agregación (`COUNT`, `SUM`, `AVG`).
    -   **Si hay Agregaciones:** Se activa un modo de "agregación". La consulta se construye a partir de una **única tabla de origen** (la primera seleccionada). Se genera automáticamente una cláusula `GROUP BY` que incluye todas las columnas normales seleccionadas.
        -   *Consulta Ejemplo:* `SELECT "name", COUNT(*) as "Conteo" FROM "be_exponential"."tasks" GROUP BY "name"`
    -   **Si NO hay Agregaciones:** La tabla funciona en modo "plano". Se utiliza `UNION ALL` para mostrar las filas de todas las tablas seleccionadas.

#### c) KPI

-   **Requisitos:** `column`.
-   **Lógica:**
    -   **Si `column` es un Campo Calculado:** La consulta se construye usando la expresión del campo directamente. Se utiliza la primera tabla de las dependencias del campo como `FROM`.
        -   *Consulta Ejemplo:* `SELECT (COUNT(*)) as value FROM "be_exponential"."tasks"`
    -   **Si `column` es `*` (Recuento Total):** Se construye una consulta con `UNION ALL` y `SUM` para contar filas de todas las tablas seleccionadas.
    -   **Si `column` es una Columna Normal:** Se usa `UNION ALL` para recopilar los valores de la columna en todas las tablas y luego se aplica la `aggregation` seleccionada.
