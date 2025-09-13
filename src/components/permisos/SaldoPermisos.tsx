
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, AlertCircle, Loader2, CheckCircle, MinusCircle } from 'lucide-react';

const StatCard = ({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) => (
  <Card className="shadow-sm border-0">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-foreground">
        {value}
      </div>
    </CardContent>
  </Card>
);

interface SaldosState {
  asignados: number;
  solicitados: number;
}

export const SaldoPermisos = ({ key: refreshKey }: { key?: string | number }) => {
  const { user } = useAuth();
  const [saldos, setSaldos] = useState<SaldosState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSaldos = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);

      try {
        const saldoPromise = supabase
          .from('permisos_saldos')
          .select('dias_especiales_disponibles')
          .eq('user_id', user.id)
          .single();

        const solicitudesPromise = supabase
          .from('permisos_solicitudes')
          .select('total_dias')
          .eq('solicitante_user_id', user.id)
          .in('estado', ['pendiente', 'aprobado']);

        const [saldoResult, solicitudesResult] = await Promise.all([saldoPromise, solicitudesPromise]);

        if (saldoResult.error && saldoResult.error.code !== 'PGRST116') throw saldoResult.error;
        if (solicitudesResult.error) throw solicitudesResult.error;

        const diasAsignados = saldoResult.data?.dias_especiales_disponibles ?? null;

        if (diasAsignados === null) {
          setSaldos(null); // No hay registro de saldo
          return;
        }

        const diasSolicitados = solicitudesResult.data?.reduce((acc, curr) => acc + curr.total_dias, 0) ?? 0;

        setSaldos({
          asignados: diasAsignados,
          solicitados: diasSolicitados,
        });

      } catch (err: any) {
        console.error('Error fetching permission balance:', err);
        setError('No se pudo cargar el saldo de permisos.');
      } finally {
        setLoading(false);
      }
    };

    fetchSaldos();
  }, [user, refreshKey]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Disponibles" value="--" icon={<Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />} />
        <StatCard title="Asignados" value="--" icon={<CheckCircle className="h-5 w-5 text-muted-foreground" />} />
        <StatCard title="Solicitados" value="--" icon={<MinusCircle className="h-5 w-5 text-muted-foreground" />} />
      </div>
    );
  }

  if (error) {
    return <div className="p-6 bg-destructive/10 border-destructive/20 rounded-lg"><p className="text-destructive font-medium">{error}</p></div>;
  }

  if (!saldos) {
    return (
       <div className="p-6 bg-amber-500/10 border-amber-500/20 rounded-lg flex items-center">
        <AlertCircle className="h-5 w-5 mr-3 text-amber-600" />
        <p className="text-amber-700 font-medium">
          No tienes un saldo de permisos especiales. Contacta a RRHH para que te lo asignen.
        </p>
      </div>
    );
  }

  const diasDisponibles = saldos.asignados - saldos.solicitados;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard 
        title="Disponibles"
        value={diasDisponibles}
        icon={<Star className="h-5 w-5 text-yellow-500" />}
      />
      <StatCard 
        title="Asignados"
        value={saldos.asignados}
        icon={<CheckCircle className="h-5 w-5 text-green-500" />}
      />
      <StatCard 
        title="Solicitados"
        value={saldos.solicitados}
        icon={<MinusCircle className="h-5 w-5 text-destructive" />}
      />
    </div>
  );
};
