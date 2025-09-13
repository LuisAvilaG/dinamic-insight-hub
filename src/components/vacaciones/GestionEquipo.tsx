
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Loader2, Inbox, Check, X, Calendar, ClipboardList, BarChart, Users, Building } from 'lucide-react';
import { ResumenGraficoEquipo } from '../equipo/ResumenGraficoEquipo';
import { CalendarioEquipo } from '../equipo/CalendarioEquipo';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const parseDate = (dateString: string) => new Date(dateString + 'T00:00:00');

const SolicitudesPendientesTabla = ({ solicitudes, onProcesar, procesandoId, miembros }) => {
  const pendientes = solicitudes.filter(s => s.estado === 'pendiente');

  if (pendientes.length === 0) {
    return (
      <div className="text-center py-10"><Inbox className="h-12 w-12 mx-auto text-muted-foreground/50" /><p className="mt-4 font-medium text-muted-foreground">No hay solicitudes pendientes.</p></div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Empleado</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Fechas Solicitadas</TableHead>
          <TableHead className="text-center">Días Solicitados</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pendientes.map((solicitud) => {
          const miembro = miembros.find(m => m.user_id === solicitud.solicitante_user_id);
          const tipo = solicitud.motivo ? 'Permiso' : 'Vacaciones';
          const startDate = parseDate(solicitud.fecha_inicio);
          const endDate = parseDate(solicitud.fecha_fin);
          const diasSolicitados = differenceInDays(endDate, startDate) + 1;

          return (
            <TableRow key={solicitud.id}>
              <TableCell className="font-medium">{miembro?.Nombre || 'N/A'}</TableCell>
              <TableCell>{tipo === 'Permiso' ? `Permiso (${solicitud.motivo})` : 'Vacaciones'}</TableCell>
              <TableCell>{`${format(startDate, 'dd/MM/yy')} - ${format(endDate, 'dd/MM/yy')}`}</TableCell>
              <TableCell className="text-center">{solicitud.total_dias || diasSolicitados}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button size="icon" variant="outline" onClick={() => onProcesar(solicitud, 'aprobado')} disabled={procesandoId === solicitud.id}><Check className="h-4 w-4 text-green-500" /></Button>
                <Button size="icon" variant="outline" onClick={() => onProcesar(solicitud, 'rechazado')} disabled={procesandoId === solicitud.id}><X className="h-4 w-4 text-red-500" /></Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export const GestionEquipo = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [procesandoId, setProcesandoId] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const [allCompanyMembers, setAllCompanyMembers] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [resumenSaldos, setResumenSaldos] = useState<any[]>([]);
  
  const [selectedMemberId, setSelectedMemberId] = useState('all');
  const [adminView, setAdminView] = useState<'team' | 'company'>('team');
  const isAdmin = profile?.role?.toLowerCase() === 'admin';

  const fetchDatos = useCallback(async () => {
    if (!user || !user.id || !profile) return;
    setLoading(true);
    setError(null);

    try {
      let userIds: string[] = [];
      let miembrosParaMostrar: any[] = [];

      const { data: aprobadorData, error: aprobadorError } = await supabase.from('vacaciones_aprobadores').select('empleado_user_id').eq('aprobador_user_id', user.id);
      if (aprobadorError) throw aprobadorError;
      const teamMemberIds = aprobadorData.map(a => a.empleado_user_id);

      if (isAdmin) {
        const { data: todosLosPerfiles, error: todosPerfilesError } = await supabase.from('Cuentas').select('user_id, Nombre, Rol');
        if (todosPerfilesError) throw todosPerfilesError;
        setAllCompanyMembers(todosLosPerfiles || []);

        const equipoDirecto = (todosLosPerfiles || []).filter(p => teamMemberIds.includes(p.user_id));
        setTeamMembers(equipoDirecto);

        miembrosParaMostrar = adminView === 'company' ? (todosLosPerfiles || []) : equipoDirecto;
      } else {
        if (teamMemberIds.length > 0) {
          const { data: perfilesEquipo, error: perfilesError } = await supabase.from('Cuentas').select('user_id, Nombre').in('user_id', teamMemberIds);
          if (perfilesError) throw perfilesError;
          miembrosParaMostrar = perfilesEquipo || [];
          setTeamMembers(perfilesEquipo || []);
        }
      }
      
      if (miembrosParaMostrar.length === 0) {
        setSolicitudes([]);
        setResumenSaldos([]);
        setLoading(false);
        return;
      }

      userIds = miembrosParaMostrar.map(m => m.user_id);

      const [vacacionesRes, permisosRes, saldosVacacionesRes, saldosPermisosRes] = await Promise.all([
        supabase.from('vacaciones_solicitudes').select('*').in('solicitante_user_id', userIds),
        supabase.from('permisos_solicitudes').select('*').in('solicitante_user_id', userIds),
        supabase.from('vacaciones_saldos').select('*').in('user_id', userIds),
        supabase.from('permisos_saldos').select('*').in('user_id', userIds),
      ]);

      if (vacacionesRes.error || permisosRes.error || saldosVacacionesRes.error || saldosPermisosRes.error) {
        const errorMsg = vacacionesRes.error?.message || permisosRes.error?.message || saldosVacacionesRes.error?.message || saldosPermisosRes.error?.message;
        throw new Error(`Error al cargar datos: ${errorMsg}`);
      }

      setSolicitudes([...(vacacionesRes.data || []), ...(permisosRes.data || [])]);

      const resumenConsolidado = miembrosParaMostrar.map(miembro => {
        const saldoVacaciones = saldosVacacionesRes.data.find(s => s.user_id === miembro.user_id);
        const saldoPermisos = saldosPermisosRes.data.find(s => s.user_id === miembro.user_id);
        const permisosUsados = (permisosRes.data || []).filter(s => s.solicitante_user_id === miembro.user_id && ['aprobado', 'pendiente'].includes(s.estado)).reduce((acc, curr) => acc + curr.total_dias, 0);
        const vacacionesTomadas = saldoVacaciones?.dias_tomados ?? 0;

        return {
          id: miembro.user_id,
          nombre: miembro.Nombre,
          vacaciones_asignadas: saldoVacaciones?.dias_asignados ?? 0,
          vacaciones_disponibles: (saldoVacaciones?.dias_asignados ?? 0) - vacacionesTomadas,
          permisos_asignados: saldoPermisos?.dias_especiales_disponibles ?? 0,
          permisos_disponibles: (saldoPermisos?.dias_especiales_disponibles ?? 0) - permisosUsados,
        };
      });

      setResumenSaldos(resumenConsolidado);

    } catch (err: any) {
      console.error("Error en fetchDatos:", err);
      setError("No se pudieron cargar los datos. Revisa la configuración y las políticas de RLS.");
    } finally {
      setLoading(false);
    }
  }, [user, profile, adminView]);

  useEffect(() => { fetchDatos(); }, [fetchDatos, refreshCounter]);

  const handleProcesarSolicitud = async (solicitud, nuevoEstado: 'aprobado' | 'rechazado') => {
    setProcesandoId(solicitud.id);
    const tipo = solicitud.motivo ? 'permisos' : 'vacaciones';
    try {
      const { error } = await supabase.from(`${tipo}_solicitudes`).update({ estado: nuevoEstado, aprobador_user_id: user.id, fecha_decision: new Date().toISOString() }).eq('id', solicitud.id);
      if (error) throw error;
      toast({ title: `✅ Solicitud ${nuevoEstado}`, description: `La solicitud ha sido actualizada.` });
      setRefreshCounter(prev => prev + 1);
    } catch (err: any) {
      toast({ variant: "destructive", title: "❌ Error", description: err.message });
    } finally {
      setProcesandoId(null);
    }
  };
  
  const currentMemberList = isAdmin ? (adminView === 'company' ? allCompanyMembers : teamMembers) : teamMembers;

  const filteredData = useMemo(() => {
    const membersToDisplay = selectedMemberId === 'all' 
      ? currentMemberList 
      : currentMemberList.filter(m => m.user_id === selectedMemberId);
    
    const memberIdsToDisplay = membersToDisplay.map(m => m.user_id);

    return {
      solicitudes: solicitudes.filter(s => memberIdsToDisplay.includes(s.solicitante_user_id)),
      resumen: resumenSaldos.filter(r => memberIdsToDisplay.includes(r.id)),
      miembros: membersToDisplay,
    };
  }, [selectedMemberId, solicitudes, resumenSaldos, currentMemberList]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className='flex-1'>
                <CardTitle>Hub de Equipo</CardTitle>
                <CardDescription>Gestiona las ausencias y saldos.</CardDescription>
            </div>
            <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-4">
                {isAdmin && (
                    <div className="flex items-center space-x-2">
                        <Users className="h-5 w-5"/>
                        <Label htmlFor="admin-view">Mi Equipo</Label>
                        <Switch id="admin-view" checked={adminView === 'company'} onCheckedChange={(checked) => setAdminView(checked ? 'company' : 'team')} />
                        <Label htmlFor="admin-view">Empresa</Label>
                        <Building className="h-5 w-5"/>
                    </div>
                )}
                <Select onValueChange={setSelectedMemberId} defaultValue="all">
                    <SelectTrigger className="min-w-[200px]"><SelectValue placeholder="Filtrar por miembro..." /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {currentMemberList.map(m => <SelectItem key={m.user_id} value={m.user_id}>{m.Nombre}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
        </CardHeader>
      </Card>

      {error && <div className="p-4 bg-destructive/10 text-destructive font-medium rounded-lg">{error}</div>}
      
      <Tabs defaultValue="resumen" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="resumen"><BarChart className="mr-2 h-4 w-4"/>Resumen de Saldos</TabsTrigger>
          <TabsTrigger value="calendario"><Calendar className="mr-2 h-4 w-4"/>Calendario</TabsTrigger>
          <TabsTrigger value="solicitudes"><ClipboardList className="mr-2 h-4 w-4"/>Solicitudes Pendientes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="resumen" className="mt-4">
            <ResumenGraficoEquipo resumen={filteredData.resumen} loading={loading} />
        </TabsContent>

        <TabsContent value="calendario" className="mt-4">
            <CalendarioEquipo solicitudes={filteredData.solicitudes} miembros={currentMemberList} />
        </TabsContent>

        <TabsContent value="solicitudes" className="mt-4">
             <Card>
                <CardHeader><CardTitle>Acciones Requeridas</CardTitle></CardHeader>
                <CardContent>
                    <SolicitudesPendientesTabla solicitudes={filteredData.solicitudes} onProcesar={handleProcesarSolicitud} procesandoId={procesandoId} miembros={currentMemberList} />
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
