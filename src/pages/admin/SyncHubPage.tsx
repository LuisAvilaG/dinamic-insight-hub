
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AddSyncWizard from '@/components/admin/AddSyncWizard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

const SyncHubPage = () => {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [syncs, setSyncs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchSyncConfigs = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.rpc('get_all_sync_configs');
    if (error) {
      toast({
        title: "Error al cargar las sincronizaciones",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setSyncs(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSyncConfigs();
  }, []);
  
  const handleCloseWizard = (wasSaved) => {
    setIsWizardOpen(false);
    // If a new sync was saved in the wizard, refresh the list
    if (wasSaved) {
        fetchSyncConfigs();
    }
  };

  const renderSkeleton = () => (
    Array.from({ length: 3 }).map((_, index) => (
      <TableRow key={index}>
        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
        <TableCell><Skeleton className="h-4 w-52" /></TableCell>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
        <TableCell><Skeleton className="h-8 w-12" /></TableCell>
        <TableCell className="space-x-2">
            <Skeleton className="h-8 w-16 inline-block" />
            <Skeleton className="h-8 w-16 inline-block" />
        </TableCell>
      </TableRow>
    ))
  );

  return (
    <>
      <div className="p-4 md:p-8">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle>Sync Hub - Centro de Control de Sincronizaciones</CardTitle>
              <CardDescription>Gestiona todas tus sincronizaciones de datos con ClickUp desde un solo lugar.</CardDescription>
            </div>
            <Button onClick={() => setIsWizardOpen(true)}>+ Agregar Nueva Sincronización</Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Fuente (ClickUp)</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Última Ejecución</TableHead>
                  <TableHead>Próxima Ejecución</TableHead>
                  <TableHead>Control</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? renderSkeleton() : (
                  syncs.length > 0 ? syncs.map((sync) => (
                    <TableRow key={sync.id}>
                      <TableCell className="font-medium">{sync.name}</TableCell>
                      <TableCell className="text-muted-foreground">{`${sync.clickup_workspace_id} / ${sync.clickup_space_id}`}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${sync.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {sync.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{sync.last_run_at ? format(new Date(sync.last_run_at), 'Pp') : 'N/A'}</TableCell>
                      <TableCell className="text-muted-foreground">{sync.next_run_at ? format(new Date(sync.next_run_at), 'Pp') : 'N/A'}</TableCell>
                      <TableCell>
                        <Switch checked={sync.is_active} />
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" className="mr-2">
                          Editar
                        </Button>
                        <Button variant="destructive" size="sm">
                          Eliminar
                        </Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                            No se encontraron sincronizaciones. ¡Agrega la primera!
                        </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Asistente de Nueva Sincronización</DialogTitle>
          </DialogHeader>
          <AddSyncWizard onCancel={handleCloseWizard} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SyncHubPage;
