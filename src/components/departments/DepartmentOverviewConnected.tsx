import { useState, useEffect, useMemo } from "react";
import Fuse from "fuse.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Filter, 
  Calendar, 
  Eye,
  ArrowRight,
  Clock,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Report {
  id: string;
  name: string;
  description: string | null;
  department: string;
  created_at: string;
  updated_at: string;
}

interface DepartmentOverviewConnectedProps {
  departmentName: string;
  departmentDescription: string;
  departmentIcon: any;
  gradientColor: string;
}

const departmentGradients: { [key: string]: string[] } = {
  blue: [
    'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
    'linear-gradient(135deg, #818cf8 0%, #3b82f6 100%)',
    'linear-gradient(135deg, #60a5fa 0%, #22d3ee 100%)',
    'linear-gradient(135deg, #3b82f6 0%, #a78bfa 100%)',
  ],
  green: [
    'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
    'linear-gradient(135deg, #a3e635 0%, #22c55e 100%)',
    'linear-gradient(135deg, #4ade80 0%, #34d399 100%)',
    'linear-gradient(135deg, #22c55e 0%, #2dd4bf 100%)',
  ],
  purple: [
    'linear-gradient(135deg, #c084fc 0%, #a855f7 100%)',
    'linear-gradient(135deg, #f0abfc 0%, #a855f7 100%)',
    'linear-gradient(135deg, #c084fc 0%, #f472b6 100%)',
    'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
  ],
  default: ['linear-gradient(135deg, #9ca3af, #6b7280)'],
};

const generateCardGradient = (reportName: string, gradientColor: string) => {
  const colorName = gradientColor.split(' ')[0].replace('from-', '').split('-')[0];
  const availableGradients = departmentGradients[colorName] || departmentGradients.default;
  let hash = 0;
  for (let i = 0; i < reportName.length; i++) {
    hash = reportName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash % availableGradients.length);
  return availableGradients[index];
};


export const DepartmentOverviewConnected = ({
  departmentName,
  departmentDescription,
  departmentIcon: DepartmentIcon,
  gradientColor
}: DepartmentOverviewConnectedProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("updated_at");

  useEffect(() => {
    document.title = `${departmentName} | Dinamic Software`;
  }, [departmentName]);

  useEffect(() => {
    fetchReports();
  }, [departmentName]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_dashboards_by_department', { p_department: departmentName });
      if (error) throw error;
      setReports(data || []);
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Error al cargar reportes",
        description: `No se pudieron cargar los reportes del departamento: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fuse = useMemo(() => new Fuse(reports, { keys: ['name', 'description'], includeScore: true, threshold: 0.5 }), [reports]);

  const filteredAndSortedReports = useMemo(() => {
    let filtered = searchQuery ? fuse.search(searchQuery).map(result => result.item) : reports;
    return [...filtered].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return new Date(b[sortBy as keyof Report] as string).getTime() - new Date(a[sortBy as keyof Report] as string).getTime();
    });
  }, [reports, searchQuery, sortBy, fuse]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)}h`;
    const days = Math.floor(diffInMinutes / 1440);
    return `Hace ${days} día${days > 1 ? 's' : ''}`;
  };

  return (
    <div className="space-y-8">
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradientColor} p-8 text-white shadow-dinamic`}>
        <div className="absolute inset-0 pattern-dinamic opacity-20"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <DepartmentIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">{departmentName}</h1>
              <div className="flex items-center space-x-4 text-white/80 text-sm mt-2">
                <span className="flex items-center"><BarChart3 className="mr-2 h-4 w-4" />{reports.length} reportes disponibles</span>
                <span className="flex items-center"><Calendar className="mr-2 h-4 w-4" />{new Date().toLocaleDateString('es-ES')}</span>
              </div>
            </div>
          </div>
          <p className="text-white/90 text-lg max-w-3xl">{departmentDescription}</p>
        </div>
      </div>

      {!loading && reports.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="card-professional"><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Total Reportes</p><p className="text-2xl font-bold text-foreground">{reports.length}</p></div><div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center"><BarChart3 className="h-5 w-5 text-white" /></div></div></CardContent></Card>
          <Card className="card-professional"><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Actualizado Hoy</p><p className="text-2xl font-bold text-foreground">{reports.filter(r => new Date(r.updated_at).toDateString() === new Date().toDateString()).length}</p></div><div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center"><Calendar className="h-5 w-5 text-white" /></div></div></CardContent></Card>
          <Card className="card-professional"><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Resultados</p><p className="text-2xl font-bold text-foreground">{filteredAndSortedReports.length}</p></div><div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center"><Search className="h-5 w-5 text-white" /></div></div></CardContent></Card>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar reportes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div>
        <div className="flex items-center gap-2"><Filter className="h-4 w-4 text-muted-foreground" /><Select value={sortBy} onValueChange={setSortBy}><SelectTrigger className="w-48"><SelectValue placeholder="Ordenar por..." /></SelectTrigger><SelectContent><SelectItem value="updated_at">Última actualización</SelectItem><SelectItem value="created_at">Fecha de creación</SelectItem><SelectItem value="name">Nombre A-Z</SelectItem></SelectContent></Select></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <Card key={i}><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3 mt-2" /></CardContent></Card>)
        ) : filteredAndSortedReports.length > 0 ? (
          filteredAndSortedReports.map((report) => (
            <Card key={report.id} className="card-interactive group border-0 shadow-md hover:shadow-lg text-white flex flex-col justify-between" style={{ backgroundImage: generateCardGradient(report.name, gradientColor) }}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between"><div className="flex-1"><CardTitle className="text-xl font-bold line-clamp-2">{report.name}</CardTitle>{report.description && (<CardDescription className="text-sm text-white/80 mt-2 line-clamp-2">{report.description}</CardDescription>)}</div><Badge variant="secondary" className="ml-2 bg-white/20 text-white backdrop-blur-sm border-0"><TrendingUp className="w-3 h-3 mr-1" />Activo</Badge></div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm text-white/90 mb-4"><div className="flex items-center"><Clock className="mr-2 h-4 w-4" />{formatDate(report.updated_at)}</div></div>
                <div className="flex items-center justify-between"><div className="text-xs text-white/80">Creado: {new Date(report.created_at).toLocaleDateString('es-ES')}</div><Button variant="ghost" size="sm" onClick={() => navigate(`/admin/dashboards/${report.id}`)} className="bg-white/20 hover:bg-white/30 text-white rounded-full">Ver reporte<ArrowRight className="ml-2 h-4 w-4" /></Button></div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full"><Card className="text-center py-12"><CardContent><DepartmentIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" /><h3 className="text-lg font-semibold mb-2">{searchQuery ? 'No se encontraron reportes' : 'No hay reportes disponibles'}</h3><p className="text-muted-foreground">{searchQuery ? `Tu búsqueda "${searchQuery}" no coincidió con ningún reporte.` : `Actualmente no hay reportes para ${departmentName}.`}</p>{searchQuery && (<Button variant="outline" onClick={() => setSearchQuery("")} className="mt-4">Limpiar búsqueda</Button>)}</CardContent></Card></div>
        )}
      </div>
    </div>
  );
};
