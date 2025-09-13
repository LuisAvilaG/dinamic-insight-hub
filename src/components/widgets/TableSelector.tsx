import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface TableSelectorProps {
  onTableSelect: (tableName: string) => void;
  selectedTable: string | null;
}

export function TableSelector({ onTableSelect, selectedTable }: TableSelectorProps) {
  const [tables, setTables] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTables = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.rpc('get_schema_tables', { 
          p_schema_name: 'be_exponential' 
        });

        if (error) {
          throw new Error('No se pudieron cargar las tablas.');
        }

        if (data) {
          setTables(data.map((t: { table_name: string }) => t.table_name));
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTables();
  }, []);

  if (error) {
    return <p className="text-red-500 text-sm">{error}</p>;
  }

  return (
    <div>
      <Label>Fuente de Datos</Label>
      <Select
        value={selectedTable || undefined}
        onValueChange={onTableSelect}
        disabled={isLoading}
      >
        <SelectTrigger>
          <SelectValue placeholder={isLoading ? 'Cargando tablas...' : 'Selecciona una tabla'} />
        </SelectTrigger>
        <SelectContent>
          {tables.map(table => (
            <SelectItem key={table} value={table}>
              {table}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
