import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ConfigProps {
  config: any;
  setConfig: (config: any) => void;
  columns: { column_name: string; data_type: string }[];
}

export const BarChartConfig = ({ config, setConfig, columns }: ConfigProps) => {
  const numericTypes = [
    'smallint', 'integer', 'bigint', 'decimal', 'numeric', 
    'real', 'double precision', 
    'smallserial', 'serial', 'bigserial',
    'int', 'int2', 'int4', 'int8', 'float4', 'float8',
    'money'
  ];
  const numericColumns = columns.filter(c => numericTypes.includes(c.data_type));
  
  const categoricalColumns = columns.filter(c => 
    ['date', 'timestamp', 'timestamptz', 'text', 'character varying', 'varchar'].includes(c.data_type)
  );

  const aggregationOptions = ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX'];

  const handleAggregationChange = (value: string) => {
    const newConfig = { ...config, yAxisAggregation: value, yAxisColumn: null };
    setConfig(newConfig);
  };

  const handleYAxisColumnChange = (value: string) => {
    setConfig({ ...config, yAxisColumn: value });
  };

  return (
    <div className="space-y-4 pt-4 border-t">
       <p className="text-sm font-medium text-gray-700">Configuración de Datos</p>
      <div className="space-y-2">
        <Label>Eje X (Categoría)</Label>
        <p className="text-xs text-muted-foreground">La columna para agrupar los datos.</p>
        <Select
          value={config.xAxis}
          onValueChange={(value) => setConfig({ ...config, xAxis: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona el eje X" />
          </SelectTrigger>
          <SelectContent>
            {categoricalColumns.map(c => (
              <SelectItem key={c.column_name} value={c.column_name}>{c.column_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label>Eje Y (Medida)</Label>
        <p className="text-xs text-muted-foreground">La operación a realizar para calcular el valor.</p>
        <Select
          value={config.yAxisAggregation}
          onValueChange={handleAggregationChange}
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

      {config.yAxisAggregation && config.yAxisAggregation !== 'COUNT' && (
        <div className="space-y-2">
          <Label>Columna para el Eje Y</Label>
          <p className="text-xs text-muted-foreground">La columna sobre la que se calculará la agregación.</p>
          <Select
            value={config.yAxisColumn}
            onValueChange={handleYAxisColumnChange}
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
