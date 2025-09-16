
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MultiSelect } from '@/components/ui/multi-select';

// Interfaces para la data que recibimos de Supabase
interface Table {
  table_schema: string;
  table_name: string;
}

interface Column {
  column_name: string;
}

// Props que recibirá el componente de configuración
interface AdvancedTableConfigProps {
  // El estado inicial de la configuración, si existe
  initialConfig: {
    schema?: string;
    table?: string;
    columns?: string[];
  };
  // Callback para notificar al componente padre (el diálogo) de los cambios
  onChange: (config: { schema: string; table: string; columns: string[] }) => void;
}

const AdvancedTableConfig: React.FC<AdvancedTableConfigProps> = ({ initialConfig, onChange }) => {
  // Estados para manejar las tablas, columnas y la selección del usuario
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>(initialConfig.schema && initialConfig.table ? `${initialConfig.schema}.${initialConfig.table}` : '');
  const [columns, setColumns] = useState<string[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(initialConfig.columns || []);

  // Efecto para obtener la lista de tablas al cargar el componente
  useEffect(() => {
    const fetchTables = async () => {
      const { data, error } = await supabase.rpc('get_schema_tables');
      if (error) {
        console.error("Error fetching tables:", error);
      } else {
        setTables(data || []);
      }
    };
    fetchTables();
  }, []);

  // Efecto para obtener las columnas cuando el usuario selecciona una tabla
  useEffect(() => {
    if (selectedTable) {
      const [schema, table] = selectedTable.split('.');
      const fetchColumns = async () => {
        const { data, error } = await supabase.rpc('get_table_columns', {
          p_schema_name: schema,
          p_table_name: table,
        });
        if (error) {
          console.error("Error fetching columns:", error);
          setColumns([]);
        } else {
          setColumns(data.map((c: Column) => c.column_name) || []);
        }
      };
      fetchColumns();
    } else {
      setColumns([]);
    }
  }, [selectedTable]);

  // Handler para cuando cambia la tabla seleccionada
  const handleTableChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedTable(value);
    // Reiniciamos las columnas seleccionadas
    setSelectedColumns([]); 
    // Notificamos al padre que la configuración está incompleta
    const [schema, table] = value.split('.');
    onChange({ schema, table, columns: [] });
  };

  // Handler para cuando cambian las columnas seleccionadas
  const handleColumnsChange = (selected: string[]) => {
    setSelectedColumns(selected);
    const [schema, table] = selectedTable.split('.');
    // Notificamos al padre la configuración completa y actualizada
    onChange({ schema, table, columns: selected });
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="table-select" className="block text-sm font-medium text-gray-700 mb-1">
          Tabla de Origen
        </label>
        <select
          id="table-select"
          value={selectedTable}
          onChange={handleTableChange}
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="" disabled>Seleccione una tabla</option>
          {tables.map(t => (
            <option key={`${t.table_schema}.${t.table_name}`} value={`${t.table_schema}.${t.table_name}`}>
              {`${t.table_schema}.${t.table_name}`}
            </option>
          ))}
        </select>
      </div>

      {selectedTable && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Columnas a Mostrar
          </label>
          <MultiSelect
            options={columns.map(c => ({ value: c, label: c }))}
            selected={selectedColumns}
            onChange={handleColumnsChange}
            className="w-full"
            placeholder="Seleccione columnas..."
          />
        </div>
      )}
    </div>
  );
};

export default AdvancedTableConfig;
