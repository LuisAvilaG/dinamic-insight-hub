
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import AddSyncWizard from '@/components/admin/AddSyncWizard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { RefreshCw, Trash2, AlertTriangle, Briefcase, Clock } from 'lucide-react';

const SyncHubPage = () => {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [syncs, setSyncs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [syncToDelete, setSyncToDelete] = useState(null);
  const { toast } = useToast();

  const fetchSyncConfigs = async () => {
    setIsLoading(true);
    // Use the new, dedicated function for the Sync Hub
    const { data, error } = await supabase.rpc('get_sync_hub_details');
    if (error) {
      toast({ title: "Error al cargar las sincronizaciones", description: error.message, variant: "destructive" });
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
    if (wasSaved) {
      fetchSyncConfigs();
    }
  };

  const handleRetrySync = async (sync) => {
    const functionToInvoke = sync.sync_type === 'tasks' ? 'import-clickup-full-be' : 'import-clickup-time-entries';
    
    toast({ title: "Iniciando sincronización manual...", description: `La sincronización ${sync.id} ha sido puesta en cola.` });
    setSyncs(prevSyncs => prevSyncs.map(s => s.id === sync.id ? { ...s, status: 'running' } : s));
    
    try {
      const { error } = await supabase.functions.invoke(functionToInvoke, { body: { sync_id: sync.id } });
      if (error) throw error;
      toast({ title: "Sincronización manual exitosa", description: "La sincronización se ha completado correctamente." });
    } catch (error) {
      toast({ title: "Error en la sincronización", description: error.message, variant: "destructive" });
    } finally {
      fetchSyncConfigs();
    }
  };

  const openDeleteConfirmation = (sync) => {
    setSyncToDelete(sync);
    setIsConfirmDeleteDialogOpen(true);
  };

  const handleDeleteSync = async () => {
    if (!syncToDelete) return;
    try {
      const { error } = await supabase.functions.invoke('delete-sync', { body: { sync_id: syncToDelete.id } });
      if (error) throw error;
      toast({ title: "Sincronización Eliminada", description: `La sincronización "${syncToDelete.name}" y sus datos asociados han sido eliminados.` });
      fetchSyncConfigs();
    } catch (error) {
      toast({ title: "Error al Eliminar", description: error.message, variant: "destructive" });
    } finally {
      setIsConfirmDeleteDialogOpen(false);
      setSyncToDelete(null);
    }
  };

  const handleForceReset = async (syncId) => {
    toast({ title: "Forzando Detención...", description: "Intentando resetear la sincronización atascada." });
    try {
        const { error } = await supabase.rpc('force_reset_sync_status', { sync_id_to_reset: syncId });
        if (error) throw error;
        toast({ title: "Sincronización Reseteada", description: "El estado ha sido cambiado a 'failed'. Ahora puedes reintentar.", variant: "default" });
        fetchSyncConfigs();
    } catch(error) {
        toast({ title: "Error al Resetear", description: error.message, variant: "destructive"});
    }
  };

  const renderSkeleton = () => (
    Array.from({ length: 3 }).map((_, index) => (
      <TableRow key={index}>
        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
        <TableCell><Skeleton className="h-4 w-52" /></TableCell>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
        <TableCell><Skeleton className="h-8 w-12" /></TableCell>
        <TableCell className="space-x-2"><Skeleton className="h-8 w-24 inline-block" /></TableCell>
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
                  <TableHead>Tipo</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Fuente (ClickUp)</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Última Ejecución</TableHead>
                  <TableHead>Próxima Ejecución</TableHead>
                  <TableHead>Activa</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? renderSkeleton() : (
                  syncs.length > 0 ? syncs.map((sync) => (
                    <TableRow key={sync.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                           {sync.sync_type === 'tasks' ? <Briefcase className="h-4 w-4 text-muted-foreground" /> : <Clock className="h-4 w-4 text-muted-foreground" />}
                           <span className="capitalize">{sync.sync_type === 'tasks' ? 'Tareas' : 'Tiempo'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{sync.name}</TableCell>
                      <TableCell className="text-muted-foreground">{`${sync.clickup_workspace_name || ''} / ${sync.clickup_space_name || ''}`}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          sync.status === 'active' ? 'bg-green-100 text-green-800' :
                          sync.status === 'running' ? 'bg-blue-100 text-blue-800' :
                          sync.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {sync.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{sync.last_run_at ? format(new Date(sync.last_run_at), 'Pp') : 'N/A'}</TableCell>
                      <TableCell className="text-muted-foreground">{sync.next_run_at ? format(new Date(sync.next_run_at), 'Pp') : 'N/A'}</TableCell>
                      <TableCell><Switch checked={sync.is_active} /></TableCell>
                      <TableCell className="space-x-2">
                        {sync.status !== 'running' && <Button variant="outline" size="sm" onClick={() => handleRetrySync(sync)}><RefreshCw className="h-4 w-4 mr-2" />Reintentar</Button>}
                        {sync.status === 'running' && <Button variant="destructive" size="sm" onClick={() => handleForceReset(sync.id)}><AlertTriangle className="h-4 w-4 mr-2" />Forzar Detención</Button>}
                        <Button variant="destructive" size="sm" onClick={() => openDeleteConfirmation(sync)}><Trash2 className="h-4 w-4 mr-2" />Eliminar</Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow><TableCell colSpan={8} className="h-24 text-center">No se encontraron sincronizaciones.</TableCell></TableRow>
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
      
      <Dialog open={isConfirmDeleteDialogOpen} onOpenChange={setIsConfirmDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Estás seguro?</DialogTitle>
            <DialogDescription>
              Esta acción es irreversible. Se eliminará la configuración de sincronización, el cron job asociado y la tabla de datos '{syncToDelete?.target_table}' con todos sus registros.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsConfirmDeleteDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteSync}>Sí, Eliminar Todo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SyncHubPage;
