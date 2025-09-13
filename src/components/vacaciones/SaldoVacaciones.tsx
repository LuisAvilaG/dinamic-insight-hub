import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, CheckCircle, MinusCircle, AlertCircle } from 'lucide-react';

// Helper component for individual stat cards
const StatCard = ({ title, value, icon }) => (
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

export const SaldoVacaciones = ({ key: refreshKey }) => {
  const { user } = useAuth();
  const [saldo, setSaldo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSaldo = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      // CORREGIDO: Se leen las columnas correctas de la base de datos.
      const { data, error } = await supabase
        .from('vacaciones_saldos')
        .select('dias_disponibles_anual, dias_tomados')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no se encontraron filas
        throw error;
      }
      setSaldo(data);

    } catch (err) {
      console.error('Error fetching vacation balance:', err);
      setError('No se pudo cargar el saldo de vacaciones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaldo();
  }, [user, refreshKey]); // Se añade refreshKey para forzar la recarga cuando sea necesario

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Disponibles" value="--" icon={<Calendar className="h-5 w-5 text-muted-foreground" />} />
        <StatCard title="Asignados" value="--" icon={<CheckCircle className="h-5 w-5 text-muted-foreground" />} />
        <StatCard title="Tomados" value="--" icon={<MinusCircle className="h-5 w-5 text-muted-foreground" />} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-destructive/10 border-destructive/20 rounded-lg">
        <p className="text-destructive font-medium">{error}</p>
      </div>
    );
  }

  if (!saldo) {
    return (
       <div className="p-6 bg-amber-500/10 border-amber-500/20 rounded-lg flex items-center">
        <AlertCircle className="h-5 w-5 mr-3 text-amber-600" />
        <p className="text-amber-700 font-medium">
          No tienes un saldo de vacaciones. Contacta a RRHH para que te asignen tus días.
        </p>
      </div>
    )
  }

  // LÓGICA CORREGIDA: Se usan los campos correctos y se manejan valores nulos.
  const diasAsignados = saldo.dias_disponibles_anual ?? 0;
  const diasTomados = saldo.dias_tomados ?? 0;
  const diasDisponibles = diasAsignados - diasTomados;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard 
        title="Disponibles"
        value={diasDisponibles}
        icon={<Calendar className="h-5 w-5 text-primary" />}
      />
      <StatCard 
        title="Asignados"
        value={diasAsignados} // Muestra el valor correcto
        icon={<CheckCircle className="h-5 w-5 text-green-500" />}
      />
      <StatCard 
        title="Tomados"
        value={diasTomados}
        icon={<MinusCircle className="h-5 w-5 text-destructive" />}
      />
    </div>
  );
};