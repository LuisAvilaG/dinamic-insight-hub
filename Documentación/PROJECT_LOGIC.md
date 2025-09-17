# Lógica y Arquitectura del Proyecto de Dashboards

Este documento detalla la arquitectura y el flujo de datos de la aplicación de dashboards, enfocándose en la interacción entre el frontend de React y la base de datos de Supabase.

## 1. Arquitectura General

La aplicación sigue un modelo cliente-servidor:

-   **Cliente (Frontend):** Una Single Page Application (SPA) construida con React (Vite) y TypeScript. Maneja la interfaz de usuario, el estado y la comunicación con Supabase.
-   **Servidor (Backend):** Supabase provee la base de datos PostgreSQL, una API REST y funciones RPC personalizadas, que son el método principal de interacción.

## 2. Lógica de Datos y Flujo

El núcleo de la aplicación es la gestión de dashboards y widgets. La lógica de negocio está encapsulada en funciones de PostgreSQL (RPC) para mantener el cliente ligero y centrado en la UI.

### 2.1. Entidades Principales

-   `report_dashboards`: Almacena la información de cada dashboard.
-   `report_widgets`: Contiene la configuración de cada widget, incluyendo su tipo (`widget_type`), configuración (`config`), layout (`layout`) y el `dashboard_id` al que pertenece.

**Nota sobre Esquemas:** Todas las tablas residen en el esquema `be_exponential`, no en el `public`. Las funciones RPC gestionan esto internamente, simplificando el código del cliente.

### 2.2. Flujo de Creación y Configuración de Widgets

1.  **Obtención de Metadatos:** El diálogo de configuración (`NewAddWidgetDialog`) obtiene las tablas y esquemas disponibles a través de la función RPC `get_schema_tables()`.
2.  **Selección de Columnas:** Al seleccionar una tabla, se utiliza la RPC `get_table_columns()` para obtener sus columnas específicas.
3.  **Configuración de la Consulta:** El usuario selecciona agregaciones y columnas para construir dinámicamente una consulta SQL. La interfaz diferencia entre columnas numéricas y de texto según la agregación seleccionada.
4.  **Vista Previa Dinámica:** La consulta generada se envía a la RPC `execute_query()`, que la ejecuta y devuelve los datos para una vista previa en tiempo real.
5.  **Guardado del Widget:** Se utiliza la RPC `create_widget()` para guardar el nuevo widget. Esta función maneja la inserción en el esquema correcto (`be_exponential`) y abstrae la lógica de la base de datos del cliente.

### 2.3. Visualización y Diseño de Widgets

-   **Carga de Datos:** Al cargar un dashboard, la RPC `get_dashboard_details()` devuelve toda la información necesaria, incluyendo un array anidado con la configuración de cada widget.
-   **Renderizado de Widgets:** El frontend itera sobre los widgets y renderiza el componente adecuado (`KpiWidget`, `BarChartWidget`, etc.) basándose en el `widget_type`.
-   **Diseño Unificado sin Títulos Externos:**
    -   Para maximizar el espacio y mantener una apariencia limpia y moderna, **se ha eliminado la barra de título externa de todos los widgets**.
    -   El título de cada widget ahora se muestra **dentro** del propio componente, utilizando el nombre definido en su objeto de `config`.
    -   Esta decisión de diseño se aplica de manera consistente a todos los tipos de widgets, incluyendo KPI, gráficos de barras y cualquier otro que se desarrolle en el futuro.
-   **Funcionalidad en Modo Edición:**
    -   Los controles para editar y eliminar un widget siguen estando disponibles en la esquina superior derecha, apareciendo únicamente cuando el modo de edición del dashboard está activo. Esto mantiene la interfaz limpia en el modo de visualización.
-   **Responsividad y Escalado:**
    -   Los componentes de widget están diseñados para ser responsivos. Los gráficos (como el de barras) utilizan contenedores flexibles para ajustarse al tamaño del widget.
    -   Para componentes de texto como el KPI, se utiliza un SVG con un `viewBox` dinámico para asegurar que el texto escale correctamente y sea visible incluso en tamaños de widget muy pequeños.
