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

interface ColumnSelectorProps {
  label: string;
  dataSource: string | null;
  selectedColumn: string | null;
  onColumnSelect: (columnName: string | null) => void;
  // Opcional: filtrar columnas por tipo (ej: 'numeric', 'text', 'timestamp with time zone')
  allowedColumnType?: string;
}

interface TableColumn {
  column_name: string;
  data_type: string;
}

export function ColumnSelector({ 
  label, 
  dataSource, 
  selectedColumn, 
  onColumnSelect, 
  allowedColumnType 
}: ColumnSelectorProps) {
  const [columns, setColumns] = useState<TableColumn[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Si no hay una tabla seleccionada, limpiar las columnas y salir.
    if (!dataSource) {
      setColumns([]);
      onColumnSelect(null);
      return;
    }

    const fetchColumns = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase.rpc('get_table_columns', { 
          p_table_name: dataSource 
        });

        if (error) {
          throw new Error(`No se pudieron cargar las columnas para ${dataSource}.`);
        }

        if (data) {
          // Filtrar columnas si se especifica un tipo permitido
          const filteredData = allowedColumnType 
            ? data.filter((c: TableColumn) => c.data_type.includes(allowedColumnType)) 
            : data;
          setColumns(filteredData);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchColumns();
    // La dependencia de onColumnSelect es para satisfacer al linter de React, 
    // pero la lógica principal depende de dataSource.
  }, [dataSource, allowedColumnType, onColumnSelect]);

  const isDisabled = !dataSource || isLoading;

  return (
    <div>
      <Label>{label}</Label>
      <Select
        value={selectedColumn || undefined}
        onValueChange={onColumnSelect}
        disabled={isDisabled}
      >
        <SelectTrigger>
          <SelectValue placeholder={
            isLoading ? 'Cargando...' : (dataSource ? 'Selecciona una columna' : 'Primero elige una tabla')
          } />
        </SelectTrigger>
        <SelectContent>
          {columns.map(col => (
            <SelectItem key={col.column_name} value={col.column_name}>
              {col.column_name} ({col.data_type})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
