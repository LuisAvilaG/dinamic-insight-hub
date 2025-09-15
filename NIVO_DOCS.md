# Guía de Estructura de Datos para Nivo

Este documento define las estructuras de datos exactas requeridas por cada componente de gráfico de Nivo utilizado en este proyecto. Todas las funciones de transformación de datos deben adherirse estrictamente a estas especificaciones.

## 1. Gráfico de Líneas (`<ResponsiveLine />`)

Nivo requiere un **array que contenga al menos un objeto de "serie"**.

- Cada objeto de serie debe tener:
  - `id`: Un `string` o `number` que identifica la serie (por ejemplo, el nombre de la métrica).
  - `data`: Un **array de puntos de datos**.
- Cada punto de datos en el array `data` debe ser un objeto con:
  - `x`: El valor para el eje X (puede ser `string`, `number`, o `Date`).
  - `y`: El valor numérico para el eje Y.

**Ejemplo de Estructura Final:**
```json
[
  {
    "id": "Ventas Totales",
    "data": [
      { "x": "2023-01-01", "y": 150 },
      { "x": "2023-01-02", "y": 180 },
      { "x": "2023-01-03", "y": 210 }
    ]
  }
]
```

**Nota Importante:** Los valores `null` o `undefined` en las coordenadas `x` o `y` pueden causar que Nivo omita el punto, pero es más seguro filtrar estos puntos por completo para evitar crashes inesperados.

## 2. Gráfico de Barras (`<ResponsiveBar />`)

Nivo requiere un **array plano de objetos de datos**.

- Cada objeto en el array representa una categoría en el eje `indexBy`.
- Las propiedades `indexBy` y `keys` del componente `<ResponsiveBar>` son cruciales:
  - `indexBy`: Un `string` que le dice a Nivo qué propiedad usar para las etiquetas del eje X (ej: `"day"`).
  - `keys`: Un **array de `string`s** que le dice a Nivo qué propiedades dentro de cada objeto contienen los valores numéricos para las barras (ej: `["sales", "revenue"]`).

**Ejemplo de Estructura Final (para un `indexBy="country"` y `keys=["value"]`):
```json
[
  { "country": "USA", "value": 450 },
  { "country": "France", "value": 550 },
  { "country": "Japan", "value": 320 }
]
```
En nuestro caso, la consulta SQL renombrará la columna de agregación a `"value"`, por lo que `keys` será siempre `["value"]`.

## 3. Gráfico Circular/Donut (`<ResponsivePie />`)

Nivo requiere un **array plano de objetos de datos**.

- Cada objeto representa un segmento del gráfico.
- Cada objeto debe tener:
  - `id`: Un `string` o `number` que sirve como etiqueta para el segmento.
  - `value`: El valor numérico que determina el tamaño del segmento.

**Ejemplo de Estructura Final:**
```json
[
  { "id": "Electrónica", "value": 450 },
  { "id": "Ropa", "value": 320 },
  { "id": "Hogar", "value": 210 }
]
```
La consulta SQL debe devolver una columna de categoría y una columna de valor, que se mapearán a `id` y `value` respectivamente.
