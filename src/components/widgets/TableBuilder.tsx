import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Label } from '@/components/ui/label';
import { ColumnSelector } from './ColumnSelector';

interface TableBuilderProps {
  tableName: string;
  onQueryChange: (query: string) => void;
}

export function TableBuilder({ tableName, onQueryChange }: TableBuilderProps) {
  const [columns, setColumns] = useState<string[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

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
    setSelectedColumns([]); // Reset on table change
  }, [tableName]);

  useEffect(() => {
    if (selectedColumns.length > 0 && tableName) {
      const query = `SELECT ${selectedColumns.join(', ')} FROM ${tableName}`;
      onQueryChange(query);
    } else {
      onQueryChange('');
    }
  }, [selectedColumns, tableName, onQueryChange]);

  return (
    <div className="space-y-4 pt-4">
      <div>
        <Label>Columnas a mostrar</Label>
        <p className="text-xs text-slate-500 pb-2">Seleccione las columnas que quiere incluir en la tabla. El orden de selección importa.</p>
        <ColumnSelector
          columns={columns}
          selectedColumns={selectedColumns}
          onSelectedColumnsChange={setSelectedColumns}
        />
      </div>
    </div>
  );
}
