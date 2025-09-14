import { useState, useEffect } from 'react';
import { ColumnSelector, ColumnType } from './ColumnSelector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface TimeSeriesBuilderProps {
  tableName: string;
  onConfigChange: (config: object) => void;
  onQueryChange: (query: string) => void;
}

export function TimeSeriesBuilder({ tableName, onConfigChange, onQueryChange }: TimeSeriesBuilderProps) {
  const [timeColumn, setTimeColumn] = useState<string | null>(null);
  const [metricColumn, setMetricColumn] = useState<string | null>(null);
  const [timeGrain, setTimeGrain] = useState('day');

  useEffect(() => {
    if (timeColumn && metricColumn) {
      const query = `
        SELECT 
          DATE_TRUNC('${timeGrain}', "${timeColumn}") as "time_period",
          SUM("${metricColumn}") as "value"
        FROM be_exponential."${tableName}"
        GROUP BY 1
        ORDER BY 1 ASC
      `;
      onQueryChange(query);
      onConfigChange({ timeColumn, metricColumn, timeGrain });
    } else {
      onQueryChange('');
    }
  }, [tableName, timeColumn, metricColumn, timeGrain, onQueryChange, onConfigChange]);

  return (
    <div className="space-y-4 pt-4">
      <div>
        <Label>Columna de Fecha/Tiempo</Label>
        <p className="text-xs text-slate-500 pb-2">Selecciona la columna que contiene la fecha o el tiempo.</p>
        <ColumnSelector 
          tableName={tableName} 
          selectedColumns={timeColumn ? [timeColumn] : []}
          onSelectionChange={(cols) => setTimeColumn(cols[0] || null)}
          maxSelection={1}
          allowedColumnTypes={['timestamp', 'timestamptz', 'date']}
        />
      </div>
      
      <div>
        <Label>Columna de Métrica</Label>
        <p className="text-xs text-slate-500 pb-2">Selecciona la columna numérica que quieres analizar.</p>
        <ColumnSelector 
          tableName={tableName} 
          selectedColumns={metricColumn ? [metricColumn] : []}
          onSelectionChange={(cols) => setMetricColumn(cols[0] || null)}
          maxSelection={1}
          allowedColumnTypes={['int', 'int2', 'int4', 'int8', 'float4', 'float8', 'numeric']}
        />
      </div>

      <div>
        <Label>Agrupación de Tiempo</Label>
         <Select onValueChange={setTimeGrain} value={timeGrain}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Día</SelectItem>
            <SelectItem value="week">Semana</SelectItem>
            <SelectItem value="month">Mes</SelectItem>
            <SelectItem value="quarter">Trimestre</SelectItem>
            <SelectItem value="year">Año</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
