import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, PlusCircle, ChevronRight } from 'lucide-react';
import { Tables } from '@/types/supabase';

type Dashboard = Tables<'report_dashboards', { schema: 'be_exponential' }>;

const departmentOptions = [
  "Operativo",
  "Financiero",
  "Consultoría",
  "Directivo",
  "Dinamic",
];

export const DashboardManager = () => {
  const { toast } = useToast();
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [newDashboard, setNewDashboard] = useState({ name: '', description: '', department: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      // La RPC ya devuelve el objeto completo, lo añadimos al estado
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
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Crear Nuevo Dashboard</CardTitle>
          <CardDescription>
            Añade un nuevo dashboard, asignándole un nombre y un departamento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Nombre del Dashboard</label>
                <Input
                  id="name"
                  name="name"
                  value={newDashboard.name}
                  onChange={handleInputChange}
                  placeholder="Ej: Reporte de Ventas Q4"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="department" className="text-sm font-medium">Departamento</label>
                <Select
                  name="department"
                  onValueChange={handleDepartmentChange}
                  value={newDashboard.department}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Selecciona un departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {departmentOptions.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Descripción (Opcional)</label>
              <Textarea
                id="description"
                name="description"
                value={newDashboard.description}
                onChange={handleInputChange}
                placeholder="Ej: Un resumen del rendimiento de ventas y KPIs clave para el último trimestre."
                disabled={isSubmitting}
                rows={3}
              />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Crear Dashboard
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dashboards Existentes</CardTitle>
          <CardDescription>
            Selecciona un dashboard para ver sus detalles y añadirle widgets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : dashboards.length === 0 ? (
             <p className="text-center text-muted-foreground py-8">No hay dashboards creados todavía.</p>
          ) : (
            <div className="space-y-2">
              {dashboards.map(d => (
                <Link to={`/admin/dashboards/${d.id}`} key={d.id} className="block p-4 bg-muted/50 rounded-lg transition-colors hover:bg-muted/90">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{d.name}</h3>
                      <p className="text-sm text-muted-foreground">{d.department}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
