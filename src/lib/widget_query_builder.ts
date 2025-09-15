
export const buildWidgetQuery = (widgetType: string, table: string, config: any): string => {
  // Validaciones iniciales de seguridad
  if (!table || !config || typeof config !== 'object') return '';

  const schema = 'be_exponential';
  const fullTableName = `\"${schema}\".\"${table}\"`;

  try {
    switch (widgetType) {
      case 'kpi': {
        const { aggregation, column } = config;
        if (!aggregation) return '';
        if (aggregation !== 'COUNT' && !column) return '';
        
        const aggregationStatement = aggregation === 'COUNT' 
          ? 'COUNT(*)'
          : `${aggregation}(\"" + column + "\")`;
        
        return `SELECT ${aggregationStatement} AS \"value\" FROM ${fullTableName}`;
      }

      case 'line_chart':
      case 'bar_chart': {
        const xAxisKey = config.axes?.xAxis?.key;
        const yAxisAgg = config.axes?.yAxis?.aggregation;
        const yAxisKey = config.axes?.yAxis?.key;

        if (!xAxisKey || !yAxisAgg) return '';
        if (yAxisAgg !== 'COUNT' && !yAxisKey) return '';

        const yAxisSelection = yAxisAgg === 'COUNT'
          ? `COUNT(*) AS \"value\"`
          : `${yAxisAgg}(\"" + yAxisKey + "\") AS \"value\"`;

        // Lógica corregida y robusta:
        // 1. Selecciona la columna del eje X tal cual (Recharts la buscará por su nombre original).
        // 2. Agrega la columna del eje Y y la renombra a "value" (convención para Recharts).
        // 3. Agrupa por la columna del eje X.
        // 4. Ordena por la primera columna seleccionada (la del eje X) para mantener un orden lógico.
        return `SELECT \"${xAxisKey}\", ${yAxisSelection} FROM ${fullTableName} GROUP BY 1 ORDER BY 1 ASC`;
      }

      case 'donut_chart': {
        const categoryKey = config.series?.category?.key;
        const metricAgg = config.series?.metric?.aggregation;
        const metricKey = config.series?.metric?.key;

        if (!categoryKey || !metricAgg) return '';
        if (metricAgg !== 'COUNT' && !metricKey) return '';

        const valueAggregation = metricAgg === 'COUNT'
          ? `COUNT(*) AS \"value\"`
          : `${metricAgg}(\"" + metricKey + "\") AS \"value\"`;
        
        // Lógica corregida y robusta:
        // 1. Selecciona la columna de categoría y la renombra a "name" (requerido por Recharts Pie/Donut).
        // 2. Agrega la métrica y la renombra a "value" (requerido por Recharts Pie/Donut).
        // 3. Agrupa por la columna de categoría.
        return `SELECT \"${categoryKey}\" AS \"name\", ${valueAggregation} FROM ${fullTableName} GROUP BY 1`;
      }

      case 'data_table': {
        const { columns } = config;
        if (!columns || !Array.isArray(columns) || columns.length === 0) return '';
        const selectedColumns = columns.map((c: string) => `\"${c}\"`).join(', ');
        return `SELECT ${selectedColumns} FROM ${fullTableName}`;
      }

      default:
        return ''; // Retorna vacío para tipos de widget no soportados.
    }
  } catch (error) {
    console.error("Error building widget query:", error);
    return ''; // Previene que un error interno genere SQL malformado.
  }
};
