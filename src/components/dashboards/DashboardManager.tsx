import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, PlusCircle, ChevronRight, Search, Briefcase, DollarSign, Users, Building, Zap, BarChart3 } from 'lucide-react';
import { Tables } from '@/types/supabase';

type Dashboard = Tables<'report_dashboards', { schema: 'be_exponential' }>;

const departmentOptions = [
  "Operativo", "Financiero", "Consultoría", "Directivo", "Dinamic",
];

const departmentIcons: { [key: string]: React.ElementType } = {
  Operativo: Briefcase,
  Financiero: DollarSign,
  Consultoría: Users,
  Directivo: Building,
  Dinamic: Zap,
  default: BarChart3,
};

const DepartmentIcon = ({ department }: { department: string }) => {
  const Icon = departmentIcons[department] || departmentIcons.default;
  return <Icon className="w-6 h-6 text-white" />;
};


export const DashboardManager = () => {
  const { toast } = useToast();
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [newDashboard, setNewDashboard] = useState({ name: '', description: '', department: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDashboards();
  }, []);

  const fetchDashboards = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_dashboards');
      if (error) throw error;
      setDashboards(data || []);
    } catch (error: any) {
      toast({
        title: 'Error al cargar',
        description: 'No se pudieron cargar los dashboards: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewDashboard(prev => ({ ...prev, [name]: value }));
  };

  const handleDepartmentChange = (value: string) => {
    setNewDashboard(prev => ({ ...prev, department: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDashboard.name || !newDashboard.department) {
      toast({
        title: 'Campos requeridos',
        description: 'Tanto el nombre como el departamento son obligatorios.',
        variant: 'destructive',
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .rpc('create_dashboard', { 
          p_name: newDashboard.name, 
          p_description: newDashboard.description || null, 
          p_department: newDashboard.department 
        })
        .single();
      if (error) throw error;
      setDashboards(prev => [data, ...prev]);
      setNewDashboard({ name: '', description: '', department: '' });
      toast({
        title: '¡Éxito!',
        description: 'Dashboard creado correctamente.',
        className: 'bg-green-100 text-green-800',
      });
    } catch (error: any) {
      toast({
        title: 'Error al crear',
        description: 'No se pudo crear el dashboard: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDashboards = useMemo(() => {
    return dashboards.filter(d =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [dashboards, searchQuery]);

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Crear Nuevo Dashboard</CardTitle>
          <CardDescription>
            Añade un nuevo dashboard, asignándole un nombre y un departamento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Input name="name" value={newDashboard.name} onChange={handleInputChange} placeholder="Nombre del Dashboard" disabled={isSubmitting} />
               <Select name="department" onValueChange={handleDepartmentChange} value={newDashboard.department} disabled={isSubmitting}>
                 <SelectTrigger><SelectValue placeholder="Selecciona un departamento" /></SelectTrigger>
                 <SelectContent>{departmentOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
               </Select>
            </div>
            <Textarea name="description" value={newDashboard.description} onChange={handleInputChange} placeholder="Descripción (Opcional)" disabled={isSubmitting} rows={3} />
            <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando...</> : <><PlusCircle className="mr-2 h-4 w-4" /> Crear Dashboard</>}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Dashboards Existentes</CardTitle>
          <CardDescription>
            Busca y selecciona un dashboard para ver sus detalles y añadirle widgets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-base"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
          ) : filteredDashboards.length === 0 ? (
             <p className="text-center text-muted-foreground py-12">
               {searchQuery ? 'No se encontraron dashboards.' : 'No hay dashboards creados todavía.'}
             </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDashboards.map(d => (
                <Link to={`/admin/dashboards/${d.id}`} key={d.id} className="group block">
                  <Card className="h-full transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 border-l-4 border-primary">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                          <DepartmentIcon department={d.department} />
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h3 className="text-lg font-bold text-foreground truncate">{d.name}</h3>
                      <p className="text-sm text-muted-foreground">{d.department}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
