
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ConfigProps {
  config: any;
  setConfig: (config: any) => void;
  columns: { column_name: string; data_type: string }[];
}

export const DonutChartConfig = ({ config, setConfig, columns }: ConfigProps) => {
  const numericTypes = [
    'smallint', 'integer', 'bigint', 'decimal', 'numeric', 
    'real', 'double precision', 
    'smallserial', 'serial', 'bigserial',
    'int', 'int2', 'int4', 'int8', 'float4', 'float8',
    'money'
  ];
  const numericColumns = columns.filter(c => numericTypes.includes(c.data_type));
  
  const categoricalColumns = columns.filter(c => 
    ['date', 'timestamp', 'timestamptz', 'text', 'character varying', 'varchar', 'boolean'].includes(c.data_type)
  );

  const aggregationOptions = ['COUNT', 'SUM', 'AVG'];

  const handleCategoryChange = (value: string) => {
    setConfig({
      ...config,
      series: {
        ...config.series,
        category: { key: value }
      }
    });
  };

  const handleMetricAggregationChange = (value: string) => {
    const newMetric = { ...config.series?.metric, aggregation: value };
    if (value === 'COUNT') {
      delete newMetric.key; // No column needed for COUNT
    }
    setConfig({
      ...config,
      series: {
        ...config.series,
        metric: newMetric
      }
    });
  };

  const handleMetricColumnChange = (value: string) => {
    setConfig({
      ...config,
      series: {
        ...config.series,
        metric: {
          ...config.series?.metric,
          key: value
        }
      }
    });
  };

  return (
    <div className="space-y-4 pt-4 border-t">
      <p className="text-sm font-medium text-gray-700">Configuración de Series</p>

      <div className="space-y-2">
        <Label>Categoría (Segmentos)</Label>
        <p className="text-xs text-muted-foreground">Columna para agrupar los datos en segmentos.</p>
        <Select
          value={config.series?.category?.key || ""}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una categoría" />
          </SelectTrigger>
          <SelectContent>
            {categoricalColumns.map(c => (
              <SelectItem key={c.column_name} value={c.column_name}>{c.column_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Métrica (Valor)</Label>
        <p className="text-xs text-muted-foreground">Operación para calcular el tamaño de cada segmento.</p>
        <Select
          value={config.series?.metric?.aggregation || ""}
          onValueChange={handleMetricAggregationChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una métrica" />
          </SelectTrigger>
          <SelectContent>
            {aggregationOptions.map(agg => (
              <SelectItem key={agg} value={agg}>{agg}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {config.series?.metric?.aggregation && config.series.metric.aggregation !== 'COUNT' && (
        <div className="space-y-2">
          <Label>Columna para la Métrica</Label>
           <p className="text-xs text-muted-foreground">Columna numérica para calcular la suma o el promedio.</p>
          <Select
            value={config.series?.metric?.key || ""}
            onValueChange={handleMetricColumnChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una columna numérica" />
            </SelectTrigger>
            <SelectContent>
              {numericColumns.map(c => (
                <SelectItem key={c.column_name} value={c.column_name}>{c.column_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};
