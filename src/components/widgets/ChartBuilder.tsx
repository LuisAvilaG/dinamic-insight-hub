import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColumnSelector } from './ColumnSelector';

interface ChartBuilderProps {
  tableName: string;
  onQueryChange: (query: string) => void;
}

export function ChartBuilder({ tableName, onQueryChange }: ChartBuilderProps) {
  const [columns, setColumns] = useState<string[]>([]);
  const [xAxis, setXAxis] = useState<string>('');
  const [yAxes, setYAxes] = useState<string[]>([]);

  useEffect(() => {
    if (!tableName) return;

    const fetchColumns = async () => {
      const { data, error } = await supabase.rpc('get_table_columns', { p_table_name: tableName });
      if (error) {
        console.error('Error fetching columns:', error);
        setColumns([]);
      } else {
        setColumns(data.map((c: any) => c.column_name));
      }
    };

    fetchColumns();
    setXAxis('');
    setYAxes([]);
  }, [tableName]);

  useEffect(() => {
    if (xAxis && yAxes.length > 0 && tableName) {
      const query = `SELECT ${xAxis}, ${yAxes.join(', ')} FROM ${tableName} GROUP BY ${xAxis} ORDER BY ${xAxis} ASC`;
      onQueryChange(query);
    } else {
      onQueryChange('');
    }
  }, [xAxis, yAxes, tableName, onQueryChange]);

  const availableYAxes = columns.filter(c => c !== xAxis);

  return (
    <div className="space-y-4 pt-4">
      <div>
        <Label>Eje X (Categoría)</Label>
        <p className="text-xs text-slate-500 pb-2">La columna para agrupar los datos.</p>
        <Select value={xAxis} onValueChange={setXAxis}>
          <SelectTrigger><SelectValue placeholder="Seleccione una columna..." /></SelectTrigger>
          <SelectContent>
            {columns.map(col => <SelectItem key={col} value={col}>{col}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {xAxis && (
        <div>
          <Label>Eje Y (Valores)</Label>
          <p className="text-xs text-slate-500 pb-2">Las columnas numéricas a visualizar.</p>
          <ColumnSelector
            columns={availableYAxes}
            selectedColumns={yAxes}
            onSelectedColumnsChange={setYAxes}
          />
        </div>
      )}
    </div>
  );
}
