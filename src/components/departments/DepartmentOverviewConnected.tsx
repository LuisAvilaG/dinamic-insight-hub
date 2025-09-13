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
  BarChart3
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Report {
  id: string;
  nombre: string;
  descripcion: string | null;
  departamento: string;
  created_at: string;
  updated_at: string;
  iframe_code: string;
}

interface DepartmentOverviewConnectedProps {
  departmentName: string;
  departmentDescription: string;
  departmentIcon: any;
  gradientColor: string;
}

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
      const { data, error } = await (supabase as any)
        .from('reportes')
        .select('*')
        .eq('departamento', departmentName)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching reports:', error);
        toast({
          title: "Error al cargar reportes",
          description: "No se pudieron cargar los reportes del departamento",
          variant: "destructive",
        });
      } else {
        setReports(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con la base de datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fuse = useMemo(() => {
    const options = {
      keys: ['nombre', 'descripcion'],
      includeScore: true,
      threshold: 0.5, 
    };
    return new Fuse(reports, options);
  }, [reports]);

  const filteredAndSortedReports = useMemo(() => {
    const trimmedQuery = searchQuery.trim();
    let filtered = reports;

    if (trimmedQuery) {
      if (trimmedQuery.length < 3) {
        // Use simple includes for short queries
        const lowerCaseQuery = trimmedQuery.toLowerCase();
        filtered = reports.filter(report =>
          report.nombre.toLowerCase().includes(lowerCaseQuery) ||
          (report.descripcion && report.descripcion.toLowerCase().includes(lowerCaseQuery))
        );
      } else {
        // Use Fuse.js for longer, more complex queries
        const searchResult = fuse.search(trimmedQuery);
        filtered = searchResult.map(result => result.item);
      }
    }

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'nombre':
          return a.nombre.localeCompare(b.nombre);
        case 'created_at':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'updated_at':
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });
  }, [reports, searchQuery, sortBy, fuse]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes} min`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `Hace ${hours}h`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `Hace ${days} día${days > 1 ? 's' : ''}`;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
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
                <span className="flex items-center">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  {reports.length} reportes disponibles
                </span>
                <span className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  {new Date().toLocaleDateString('es-ES')}
                </span>
              </div>
            </div>
          </div>
          <p className="text-white/90 text-lg max-w-3xl">
            {departmentDescription}
          </p>
        </div>
      </div>

      {/* Controls Section */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-4 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar reportes por nombre o descripción..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Ordenar por..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated_at">Última actualización</SelectItem>
              <SelectItem value="created_at">Fecha de creación</SelectItem>
              <SelectItem value="nombre">Nombre A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="card-professional">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredAndSortedReports.length > 0 ? (
          // Reports
          filteredAndSortedReports.map((report) => (
            <Card key={report.id} className="card-interactive group border-0 shadow-md hover:shadow-dinamic">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors line-clamp-2">
                      {report.nombre}
                    </CardTitle>
                    {report.descripcion && (
                      <CardDescription className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {report.descripcion}
                      </CardDescription>
                    )}
                  </div>
                  <Badge variant="secondary" className="ml-2 bg-muted text-foreground/80 border border-border">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Activo
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="mr-2 h-4 w-4" />
                      {formatDate(report.updated_at)}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      Creado: {new Date(report.created_at).toLocaleDateString('es-ES')}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate(`/reportes/${report.id}`)}
                      className="group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-secondary group-hover:text-white transition-all"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Ver reporte
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          // No reports found
          <div className="col-span-full">
            <Card className="card-professional text-center py-12">
              <CardContent>
                <DepartmentIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {searchQuery ? 'No se encontraron reportes' : 'No hay reportes disponibles'}
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? `No se encontraron reportes que coincidan con "${searchQuery}" en el departamento ${departmentName}.`
                    : `Aún no hay reportes creados para el departamento ${departmentName}.`
                  }
                </p>
                {searchQuery && (
                  <Button 
                    variant="outline" 
                    onClick={() => setSearchQuery("")}
                    className="mt-4"
                  >
                    Limpiar búsqueda
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {!loading && reports.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="card-professional">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Reportes</p>
                  <p className="text-2xl font-bold text-foreground">{reports.length}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-professional">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Actualizado Hoy</p>
                  <p className="text-2xl font-bold text-foreground">
                    {reports.filter(r => 
                      new Date(r.updated_at).toDateString() === new Date().toDateString()
                    ).length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-professional">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Resultados</p>
                  <p className="text-2xl font-bold text-foreground">
                    {filteredAndSortedReports.length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Search className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
