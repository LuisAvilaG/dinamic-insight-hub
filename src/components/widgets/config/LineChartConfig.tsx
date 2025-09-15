
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ConfigProps {
  config: any;
  setConfig: (config: any) => void;
  columns: { column_name: string; data_type: string }[];
}

export const LineChartConfig = ({ config, setConfig, columns }: ConfigProps) => {
  const numericTypes = [
    'smallint', 'integer', 'bigint', 'decimal', 'numeric', 
    'real', 'double precision', 
    'smallserial', 'serial', 'bigserial',
    'int', 'int2', 'int4', 'int8', 'float4', 'float8',
    'money'
  ];
  const numericColumns = columns.filter(c => numericTypes.includes(c.data_type));
  
  const xAxisColumns = columns.filter(c => 
    ['date', 'timestamp', 'timestamptz', 'text', 'character varying', 'varchar'].includes(c.data_type)
  );

  const aggregationOptions = ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX'];

  const handleXAxisChange = (value: string) => {
    setConfig({
      ...config,
      axes: {
        ...config.axes,
        xAxis: { key: value }
      }
    });
  };

  const handleYAggregationChange = (value: string) => {
    const newYAxis = { ...config.axes?.yAxis, aggregation: value };
    if (value === 'COUNT') {
      delete newYAxis.key; // No column needed for COUNT
    }
    setConfig({
      ...config,
      axes: {
        ...config.axes,
        yAxis: newYAxis
      }
    });
  };

  const handleYColumnChange = (value: string) => {
    setConfig({
      ...config,
      axes: {
        ...config.axes,
        yAxis: {
          ...config.axes?.yAxis,
          key: value
        }
      }
    });
  };

  return (
    <div className="space-y-4 pt-4 border-t">
       <p className="text-sm font-medium text-gray-700">Configuración de Ejes</p>
      
      <div className="space-y-2">
        <Label>Eje X (Categoría)</Label>
        <p className="text-xs text-muted-foreground">Suele ser una fecha o una categoría de texto.</p>
        <Select
          value={config.axes?.xAxis?.key || ""}
          onValueChange={handleXAxisChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona el eje X" />
          </SelectTrigger>
          <SelectContent>
            {xAxisColumns.map(c => (
              <SelectItem key={c.column_name} value={c.column_name}>{c.column_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label>Eje Y (Agregación)</Label>
        <p className="text-xs text-muted-foreground">Operación para calcular el valor.</p>
        <Select
          value={config.axes?.yAxis?.aggregation || ""}
          onValueChange={handleYAggregationChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una agregación" />
          </SelectTrigger>
          <SelectContent>
            {aggregationOptions.map(agg => (
              <SelectItem key={agg} value={agg}>{agg}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {config.axes?.yAxis?.aggregation && config.axes.yAxis.aggregation !== 'COUNT' && (
        <div className="space-y-2">
          <Label>Columna para el Eje Y</Label>
          <p className="text-xs text-muted-foreground">Columna sobre la que se calculará la agregación.</p>
          <Select
            value={config.axes?.yAxis?.key || ""}
            onValueChange={handleYColumnChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una columna" />
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
