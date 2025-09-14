# Lógica del Proyecto: Dashboards y Widgets

Este documento describe la arquitectura y el flujo de datos para la creación, renderizado y gestión de widgets dentro de los dashboards. Es la fuente de verdad canónica y debe ser consultada antes de realizar cualquier modificación en esta área.

## Arquitectura General

El sistema de widgets se compone de varios componentes clave que trabajan en conjunto para proporcionar una experiencia de usuario fluida desde la creación hasta la visualización.

El flujo de creación de un widget es un proceso guiado (asistente) que asegura que todos los datos necesarios sean recopilados antes de guardar el widget en la base de datos.

### Componentes Principales

1.  **`DashboardDetailPage.tsx` (Página de Visualización)**
    *   **Responsabilidad:** Es la página principal que renderiza un dashboard específico y su cuadrícula de widgets.
    *   **Carga de Datos:** Al montarse, llama a la función RPC `get_dashboard_details` para obtener toda la información del dashboard, incluyendo la lista de widgets existentes.
    *   **Punto de Entrada a la Creación:** Contiene el botón "Añadir Widget" que dispara la apertura del componente `AddWidgetDialog`.
    *   **Actualización:** Proporciona una función `onSave` al diálogo. Cuando esta función se invoca, la página se recarga por completo para mostrar el estado más reciente del dashboard, incluyendo el nuevo widget.

2.  **`AddWidgetDialog.tsx` (Asistente de Creación)**
    *   **Responsabilidad:** Orquesta el proceso de creación de un widget en un asistente de varios pasos.
    *   **Pasos:**
        1.  **Seleccionar Tipo:** El usuario elige el tipo de widget (KPI, Gráfico de Líneas, etc.).
        2.  **Asignar Nombre:** El usuario da un título al widget.
        3.  **Configurar:** Pasa el control al componente `AddWidget` para la configuración detallada.
    *   **Paso de Control:** Su única función es guiar al usuario. La lógica de configuración y guardado real reside en el siguiente componente.

3.  **`AddWidget.tsx` (Cerebro de la Configuración)**
    *   **Responsabilidad:** Es el componente central donde se define la lógica, la previsualización y el guardado de un nuevo widget.
    *   **Lógica:**
        1.  Carga metadatos necesarios (lista de tablas y columnas) usando las funciones RPC `get_user_tables` y `get_table_columns`.
        2.  Renderiza el formulario de configuración específico para el tipo de widget (e.g., `LineChartConfig`).
        3.  Muestra una previsualización en tiempo real usando el componente `WidgetPreview`.
        4.  Habilita el botón de guardado solo cuando la configuración es válida.
        5.  **Guardado:** Al hacer clic en "Guardar", construye la consulta SQL final con `buildWidgetQuery` y llama a la función RPC `insert_widget` para persistir el nuevo widget en la base de datos.

4.  **`WidgetPreview.tsx` (Previsualizador)**
    *   **Responsabilidad:** Muestra una vista previa del widget tal como se vería en el dashboard.
    *   **Funcionamiento:** Recibe el tipo de widget, la tabla, el título y la configuración en tiempo real desde `AddWidget`. Construye y ejecuta una consulta de previsualización para obtener los datos.
    *   **Aislamiento:** Este componente es de *solo lectura* y no participa en la lógica de guardado. Su propósito es puramente visual.
    *   **Punto de Fallo Histórico:** Los errores de `object is not extensible` se originan aquí cuando las librerías de gráficos (e.g., Recharts) intentan modificar los datos "congelados" que provienen de la base de datos.

5.  **`WidgetRenderer.tsx` (Renderizador en Dashboard)**
    *   **Responsabilidad:** Renderiza un widget individual ya guardado en la cuadrícula del `DashboardDetailPage`.
    *   **Funcionamiento:** Recibe la configuración completa de un widget desde la base de datos (incluida la consulta SQL pre-construida) y la utiliza para obtener y mostrar los datos.

## Flujo de Datos (Creación de Widget)

```mermaid
graph TD
    A[Usuario en DashboardDetailPage] -->|Click "Añadir Widget"| B(AddWidgetDialog: Paso 1)
    B -->|Selecciona Tipo| C(AddWidgetDialog: Paso 2)
    C -->|Define Título| D(AddWidgetDialog: Paso 3 -> AddWidget)

    subgraph AddWidget
        D1[Selecciona Tabla] --> D2(Carga Columnas)
        D2 --> D3(Renderiza ...Config.tsx)
        D3 -- Configuración --> D4(Estado 'config')
        D4 -- config, table, type --> D5(WidgetPreview)
        D5 -- Previsualización --> D6(Usuario ve el widget)
    end

    D -->|Click "Guardar Widget"| E{handleSave}
    E --> F[Llama a RPC 'insert_widget']
    F -- Éxito --> G[Llama a onSave()]
    G --> H[DashboardDetailPage recarga datos]
    H --> I[Nuevo widget aparece]
```
