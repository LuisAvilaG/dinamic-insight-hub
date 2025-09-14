import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface KpiBuilderProps {
  tableName: string | null;
  onQueryChange: (query: string) => void;
}

const AGGREGATION_FUNCTIONS = [
  { value: 'COUNT', label: 'Contar filas (*)' },
  { value: 'COUNT_DISTINCT', label: 'Contar valores únicos' },
  { value: 'SUM', label: 'Sumar valores' },
  { value: 'AVG', label: 'Promedio de valores' },
];

interface TableColumn {
  column_name: string;
  data_type: string;
}

export function KpiBuilder({ tableName, onQueryChange }: KpiBuilderProps) {
  const [columns, setColumns] = useState<TableColumn[]>([]);
  const [selectedFunction, setSelectedFunction] = useState<string | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tableName) {
      setColumns([]);
      setSelectedColumn(null);
      setSelectedFunction(null);
      return;
    }

    const fetchColumns = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase.rpc('get_table_columns', { p_table_name: tableName });
        if (error) throw error;
        if (Array.isArray(data)) {
          const validColumns = data.filter(item => item && typeof item.column_name === 'string');
          setColumns(validColumns);
        } else {
          setColumns([]);
        }
      } catch (err: any) {
        setError(`Error al cargar columnas: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchColumns();
  }, [tableName]);

  useEffect(() => {
    if (!selectedFunction || !tableName) {
      onQueryChange('');
      return;
    }

    let query = '';
    // CORRECCIÓN: Añadir el esquema 'be_exponential' a la tabla en la consulta
    const fullTableName = `be_exponential.${tableName}`;

    if (selectedFunction === 'COUNT') {
      query = `SELECT COUNT(*) FROM ${fullTableName}`;
    } else if (selectedColumn) {
      if (selectedFunction === 'COUNT_DISTINCT') {
        query = `SELECT COUNT(DISTINCT ${selectedColumn}) FROM ${fullTableName}`;
      } else { // SUM, AVG
        query = `SELECT ${selectedFunction}(${selectedColumn}) FROM ${fullTableName}`;
      }
    }

    onQueryChange(query);
  }, [selectedFunction, selectedColumn, tableName, onQueryChange]);
  
  const handleFunctionChange = (value: string) => {
    setSelectedFunction(value);
    if (value === 'COUNT') {
      setSelectedColumn(null);
    }
  }

  const numericColumns = columns.filter(c => ['integer', 'bigint', 'numeric', 'double precision', 'real'].some(type => c.data_type.includes(type)));

  return (
    <div className="space-y-4 pt-4">
      <div>
        <Label>Función de Agregación</Label>
        <Select onValueChange={handleFunctionChange} value={selectedFunction || undefined}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una función" />
          </SelectTrigger>
          <SelectContent>
            {AGGREGATION_FUNCTIONS.map(func => (
              <SelectItem key={func.value} value={func.value}>{func.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedFunction && selectedFunction !== 'COUNT' && (
        <div>
          <Label>Columna</Label>
          <Select onValueChange={setSelectedColumn} value={selectedColumn || undefined} disabled={isLoading}>
            <SelectTrigger>
              <SelectValue placeholder={isLoading ? 'Cargando...' : 'Selecciona una columna'} />
            </SelectTrigger>
            <SelectContent>
              {(selectedFunction === 'SUM' || selectedFunction === 'AVG' ? numericColumns : columns).map(col => (
                <SelectItem key={col.column_name} value={col.column_name}>
                  {col.column_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
      )}
    </div>
  );
}
