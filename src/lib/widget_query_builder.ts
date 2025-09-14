export const buildWidgetQuery = (widgetType: string, table: string, config: any): string => {
  const schema = 'be_exponential';
  const fullTableName = `\"${schema}\".\"${table}\"`;

  switch (widgetType) {
    case 'kpi': {
      if (!config.column || !config.aggregation) return '';
      return `SELECT ${config.aggregation}(\"${config.column}\") FROM ${fullTableName}`;
    }

    case 'line_chart':
    case 'bar_chart': {
      if (!config.xAxis || !config.yAxisAggregation) {
        return '';
      }

      let yAxisSelection;
      // The result of the aggregation will be consistently aliased to "value"
      if (config.yAxisAggregation === 'COUNT') {
        yAxisSelection = `COUNT(*) AS \"value\"`;
      } else {
        if (!config.yAxisColumn) {
          return '';
        }
        yAxisSelection = `${config.yAxisAggregation}(\"${config.yAxisColumn}\") AS \"value\"`;
      }

      return `SELECT \"${config.xAxis}\", ${yAxisSelection} FROM ${fullTableName} GROUP BY \"${config.xAxis}\" ORDER BY \"${config.xAxis}\" ASC`;
    }

    case 'donut_chart': {
      if (!config.category || !config.value) return '';
       // TODO: Allow different aggregations for value
      const valueAggregation = `SUM(\"${config.value}\") as \"${config.value}\"`;
      return `SELECT \"${config.category}\", ${valueAggregation} FROM ${fullTableName} GROUP BY \"${config.category}\"`;
    }

    case 'data_table': {
      if (!config.columns || config.columns.length === 0) return '';
      const selectedColumns = config.columns.map((c: string) => `\"${c}\"`).join(', ');
      return `SELECT ${selectedColumns} FROM ${fullTableName}`;
    }

    default:
      return '';
  }
};
