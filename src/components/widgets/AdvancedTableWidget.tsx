
import React, { useState, useEffect, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css'; 
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, XCircle } from 'lucide-react';

interface AdvancedTableWidgetProps {
  config: {
    name?: string; // Título del widget
    schema: string;
    table: string;
    columns: string[];
  };
}

const AdvancedTableWidget: React.FC<AdvancedTableWidgetProps> = ({ config }) => {
  const [rowData, setRowData] = useState<any[]>([]);
  const [columnDefs, setColumnDefs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const gridRef = useRef<AgGridReact>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!config || !config.schema || !config.table || !config.columns || config.columns.length === 0) {
        setRowData([]);
        setColumnDefs([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const query = `SELECT ${config.columns.join(', ')} FROM "${config.schema}"."${config.table}"`;

      try {
        const { data, error } = await supabase.rpc('execute_query', { p_query: query });
        if (error) throw error;
        
        if (data) {
          setRowData(data);
          const dynamicColumnDefs = config.columns.map(colName => ({
            headerName: colName.charAt(0).toUpperCase() + colName.slice(1).replace(/_/g, ' '),
            field: colName,
            sortable: true,
            filter: true,
            resizable: true,
            floatingFilter: true,
          }));
          setColumnDefs(dynamicColumnDefs);
        }
      } catch (err) {
        console.error("Error fetching table data:", err);
        setRowData([]); // Limpiar datos en caso de error
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [config]);

  const clearFilters = () => {
    if (gridRef.current?.api) {
      gridRef.current.api.setFilterModel(null);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      );
    }

    if (rowData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
          <XCircle className="h-12 w-12 mb-2 text-gray-400" />
          <h3 className="text-lg font-semibold">No se encontraron resultados</h3>
          <p className="text-sm">La consulta no devolvió ningún dato.</p>
        </div>
      );
    }

    return (
      <div className="ag-theme-quartz h-full w-full">
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={{
            sortable: true,
            filter: true,
            resizable: true,
            floatingFilter: true,
          }}
          pagination={true}
          paginationPageSize={10}
          domLayout='autoHeight' // Se ajusta al contenido
        />
      </div>
    );
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold truncate">
          {config.name || 'Tabla de Datos'}
        </CardTitle>
        <Button onClick={clearFilters} variant="outline" size="sm" className="ml-auto">
          Limpiar Filtros
        </Button>
      </CardHeader>
      <CardContent className="flex-grow p-0">
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default AdvancedTableWidget;
