
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

const PAGE_SIZE = 50;

const SyncDataViewerPage = () => {
  const [syncConfigs, setSyncConfigs] = useState([]);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = useMemo(() => Math.ceil(totalCount / PAGE_SIZE), [totalCount]);

  useEffect(() => {
    const fetchSyncConfigs = async () => {
      const { data, error } = await supabase.rpc('get_all_sync_configs');
      if (error) {
        setError('Failed to fetch sync configurations.');
        console.error(error);
      } else {
        setSyncConfigs(data);
      }
    };
    fetchSyncConfigs();
  }, []);

  const fetchTableData = async (tableName, page = 1) => {
    if (!tableName) return;

    setLoading(true);
    setError(null);
    setTableData([]);
    setColumns([]);
    
    const { data, error } = await supabase.rpc('get_synced_table_data', {
      p_table_name: tableName,
      p_page_size: PAGE_SIZE,
      p_page_number: page,
    });

    setLoading(false);

    if (error) {
      setError(`Failed to fetch data for table: ${tableName}.`);
      console.error(error);
      setTotalCount(0);
    } else {
      const result = data; // The whole object { data, total_count } is in 'data'
      const tableRows = result.data || [];
      
      if (tableRows.length > 0) {
        setColumns(Object.keys(tableRows[0]));
      }
      setTableData(tableRows);
      setTotalCount(result.total_count || 0);
      setCurrentPage(page);
    }
  };

  const handleConfigChange = (configId) => {
    const config = syncConfigs.find(c => c.id === configId);
    if (config) {
      setSelectedConfig(config);
      setTotalCount(0); // Reset count on new selection
      fetchTableData(config.target_table, 1);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchTableData(selectedConfig.target_table, newPage);
    }
  };

  const renderPagination = () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }} disabled={currentPage === 1} />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink>
            Page {currentPage} of {totalPages}
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }} disabled={currentPage === totalPages} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Sync Data Viewer</CardTitle>
          <div className="flex items-center space-x-2 pt-4">
            <Select onValueChange={handleConfigChange}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Select a sync to view..." />
              </SelectTrigger>
              <SelectContent>
                {syncConfigs.map((config) => (
                  <SelectItem key={config.id} value={config.id}>{config.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => fetchTableData(selectedConfig?.target_table, 1)} disabled={!selectedConfig || loading}>
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500">{error}</p>}
          {!selectedConfig && <p>Please select a sync configuration to view its data.</p>}
          {selectedConfig && loading && <p>Loading data...</p>}
          
          {selectedConfig && !loading && tableData.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>{columns.map((col) => <TableHead key={col}>{col}</TableHead>)}</TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableData.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {columns.map((col) => (
                          <TableCell key={col}>
                            {typeof row[col] === 'object' ? JSON.stringify(row[col]) : String(row[col])}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Showing up to {PAGE_SIZE} of {totalCount} records.</p>
                {totalPages > 1 && renderPagination()}
              </div>
            </>
          )}

          {selectedConfig && !loading && totalCount === 0 && <p>No data available for this table.</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default SyncDataViewerPage;
