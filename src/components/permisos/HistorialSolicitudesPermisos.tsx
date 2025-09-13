
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Loader2, Inbox, AlertCircle, MessageSquare } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

const parseDate = (dateString: string) => new Date(dateString + 'T00:00:00');

const getBadgeVariant = (estado: string): 'success' | 'destructive' | 'secondary' | 'outline' | 'default' => {
  const lowerCaseEstado = estado.toLowerCase();
  switch (lowerCaseEstado) {
    case 'aprobado': return 'success';
    case 'rechazado': return 'destructive';
    case 'pendiente': return 'secondary';
    default: return 'default';
  }
};

export const HistorialSolicitudesPermisos = ({ key: refreshKey, onSolicitudUpdated }: { key?: string | number, onSolicitudUpdated?: () => void }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState<string | null>(null);

  const fetchSolicitudes = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('permisos_solicitudes')
        .select('*')
        .eq('solicitante_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSolicitudes(data || []);
    } catch (err: any) {
      console.error("Error fetching permission requests:", err);
      setError("No se pudo cargar el historial de solicitudes de permisos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolicitudes();
  }, [user, refreshKey]);

  const handleCancelarSolicitud = async (solicitudId: string) => {
    setIsCancelling(solicitudId);
    try {
      const { error } = await supabase
        .from('permisos_solicitudes')
        .update({ estado: 'rechazado' }) // O el estado que corresponda
        .eq('id', solicitudId)
        .eq('estado', 'pendiente');

      if (error) throw error;

      toast({ title: "✅ Solicitud Cancelada", description: "Tu solicitud de permiso ha sido cancelada." });
      fetchSolicitudes();
      if (onSolicitudUpdated) onSolicitudUpdated();

    } catch (err: any) {
      toast({ variant: "destructive", title: "❌ Error", description: err.message || "No se pudo cancelar la solicitud." });
    } finally {
      setIsCancelling(null);
    }
  };

  const renderContent = () => {
    if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
    if (error) return <div className="p-6 bg-destructive/10 border-destructive/20 rounded-lg"><AlertCircle className="h-5 w-5 mr-3 text-destructive" /><p>{error}</p></div>;
    if (solicitudes.length === 0) return <div className="text-center py-10"><Inbox className="h-12 w-12 mx-auto text-muted-foreground/50" /><p className="mt-4 text-muted-foreground">Aún no tienes solicitudes de permisos.</p></div>;

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Estado</TableHead>
            <TableHead>Motivo</TableHead>
            <TableHead className="text-center">Fechas</TableHead>
            <TableHead className="text-center">Días</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {solicitudes.map((s) => (
            <TableRow key={s.id}>
              <TableCell><Badge variant={getBadgeVariant(s.estado)}>{s.estado}</Badge></TableCell>
              <TableCell className="font-medium">
                {s.motivo}
                {s.comentarios_solicitante && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 ml-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <p className="text-sm">{s.comentarios_solicitante}</p>
                    </PopoverContent>
                  </Popover>
                )}
              </TableCell>
              <TableCell className="text-center text-sm">
                {`${format(parseDate(s.fecha_inicio), 'dd/MM/yy')} - ${format(parseDate(s.fecha_fin), 'dd/MM/yy')}`}
              </TableCell>
              <TableCell className="text-center">{s.total_dias}</TableCell>
              <TableCell className="text-right">
                {s.estado.toLowerCase() === 'pendiente' && (
                  <Button variant="destructive" size="sm" onClick={() => handleCancelarSolicitud(s.id)} disabled={isCancelling === s.id}>
                    {isCancelling === s.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Cancelar'}
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <Card className="shadow-sm border-0 mt-6">
      <CardHeader>
        <CardTitle>Historial de Permisos</CardTitle>
        <CardDescription>Aquí puedes ver el estado de todas tus solicitudes de permisos.</CardDescription>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
};
