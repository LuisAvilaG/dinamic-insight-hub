import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Plus, UserPlus, Star, Users, ArrowRight } from 'lucide-react';

const MilestoneCard = ({ icon: Icon, title, description, time, onClick }: any) => (
  <div 
    className={`flex items-start space-x-4 p-4 rounded-xl transition-all group ${
      onClick ? 'cursor-pointer hover:bg-muted/50' : ''
    }`}>
    <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
      <Icon className="h-5 w-5 text-primary" />
    </div>
    <div className="flex-1">
      <p className="font-semibold text-foreground text-sm">{title}</p>
      {description && <p className="text-muted-foreground text-sm">{description}</p>}
    </div>
    <div className="flex items-center space-x-2">
        <span className="text-xs text-muted-foreground whitespace-nowrap">{time}</span>
        {onClick && <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />}
    </div>
  </div>
);

const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
    if (diffInDays < 1) return 'Hoy';
    if (diffInDays < 2) return 'Ayer';
    return `Hace ${diffInDays} días`;
};

export const RelevantMilestones = () => {
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMilestones = async () => {
      setLoading(true);
      try {
        // 1. Get last created report
        const { data: lastReport } = await supabase
          .from('reportes')
          .select('nombre, created_at')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // 2. Get last joined user
        const { data: lastUser } = await supabase
          .from('profiles')
          .select('nombre, created_at')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // 3. Get featured report
        const { data: featuredReportData } = await supabase.rpc('get_most_viewed_report').single();

        // 4. Get record usage day
        const { data: recordDayData } = await supabase.rpc('get_peak_user_day').single();

        let fetchedMilestones = [];

        if (lastReport) {
          fetchedMilestones.push({
            icon: Plus,
            title: 'Nuevo Reporte Creado',
            description: `Se añadió "${lastReport.nombre}" a la plataforma.`,
            time: formatDate(lastReport.created_at),
          });
        }

        if (lastUser) {
          fetchedMilestones.push({
            icon: UserPlus,
            title: 'Nuevo Miembro',
            description: `${lastUser.nombre} se ha unido al equipo.`,
            time: formatDate(lastUser.created_at),
          });
        }
        
        if (featuredReportData && featuredReportData.nombre_reporte) {
          fetchedMilestones.push({
              icon: Star,
              title: 'Reporte Destacado del Mes',
              description: `"${featuredReportData.nombre_reporte}" de ${featuredReportData.departamento_reporte} fue el más consultado.`,
              time: `Con ${featuredReportData.view_count} vistas`
          });
        }

        if (recordDayData && recordDayData.login_day) {
          fetchedMilestones.push({
              icon: Users,
              title: 'Récord de Uso',
              description: `Se alcanzó un récord de ${recordDayData.user_count} usuarios conectados.`,
              time: new Date(recordDayData.login_day).toLocaleDateString('es-ES', { month: 'long', day: 'numeric' })
          });
        }

        setMilestones(fetchedMilestones);

      } catch (error) {
        console.error("Error fetching milestones:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMilestones();
  }, []);

  return (
    <div>
        <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center">
          <Activity className="mr-3 h-6 w-6 text-primary" />
          Hitos Relevantes
        </h2>
        <Card className="card-professional border-0 shadow-md">
          <CardContent className="p-2">
            {loading ? (
              <div className='p-4 text-center text-muted-foreground'>Cargando hitos...</div>
            ) : milestones.length > 0 ? (
              <div className="space-y-1">
                {milestones.map((milestone, index) => (
                  <MilestoneCard key={index} {...milestone} />
                ))}
              </div>
            ) : (
                <div className='p-4 text-center text-muted-foreground'>No hay hitos relevantes aún.</div>
            )}
          </CardContent>
        </Card>
    </div>
  );
};