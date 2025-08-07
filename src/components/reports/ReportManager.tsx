import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Eye, Edit, Trash2, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const reportSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  departamento: z.string().min(1, 'El departamento es requerido'),
  descripcion: z.string().optional(),
  iframe_code: z.string().min(1, 'El código iframe es requerido'),
});

interface Report {
  id: string;
  nombre: string;
  departamento: string;
  descripcion?: string;
  iframe_code: string;
  created_at: string;
  updated_at: string;
}

const departamentos = [
  { value: 'Financiero', label: 'Financiero' },
  { value: 'Operativo', label: 'Operativo' },
  { value: 'Directivo', label: 'Directivo' },
  { value: 'Consultoría', label: 'Consultoría' },
  { value: 'Dinamic', label: 'Dinamic' },
];

export const ReportManager = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof reportSchema>>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      nombre: '',
      departamento: '',
      descripcion: '',
      iframe_code: '',
    },
  });

  const loadReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reportes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los reportes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const onSubmit = async (values: z.infer<typeof reportSchema>) => {
    try {
      if (editingReport) {
        const { error } = await supabase
          .from('reportes')
          .update(values)
          .eq('id', editingReport.id);

        if (error) throw error;
        
        toast({
          title: "Éxito",
          description: "Reporte actualizado correctamente",
        });
      } else {
        const { error } = await supabase
          .from('reportes')
          .insert([values as any]);

        if (error) throw error;
        
        toast({
          title: "Éxito",
          description: "Reporte creado correctamente",
        });
      }

      form.reset();
      setIsDialogOpen(false);
      setEditingReport(null);
      loadReports();
    } catch (error) {
      console.error('Error saving report:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el reporte",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (report: Report) => {
    setEditingReport(report);
    form.reset({
      nombre: report.nombre,
      departamento: report.departamento,
      descripcion: report.descripcion || '',
      iframe_code: report.iframe_code,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este reporte?')) {
      try {
        const { error } = await supabase
          .from('reportes')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        toast({
          title: "Éxito",
          description: "Reporte eliminado correctamente",
        });
        loadReports();
      } catch (error) {
        console.error('Error deleting report:', error);
        toast({
          title: "Error",
          description: "No se pudo eliminar el reporte",
          variant: "destructive",
        });
      }
    }
  };

  const handleView = (report: Report) => {
    navigate(`/reportes/${report.id}`);
  };

  const handleNewReport = () => {
    setEditingReport(null);
    form.reset();
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Cargando reportes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Reportes</h1>
          <p className="text-muted-foreground">
            Administra los reportes de Looker Studio por departamento
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewReport} className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Reporte
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingReport ? 'Editar Reporte' : 'Crear Nuevo Reporte'}
              </DialogTitle>
              <DialogDescription>
                {editingReport 
                  ? 'Modifica la información del reporte existente'
                  : 'Agrega un nuevo reporte de Looker Studio al sistema'
                }
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Reporte</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Análisis de Ventas Q1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="departamento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departamento</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un departamento" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departamentos.map((dept) => (
                            <SelectItem key={dept.value} value={dept.value}>
                              {dept.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="descripcion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe el contenido y propósito de este reporte..."
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="iframe_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código Iframe de Looker Studio</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder='<iframe width="600" height="443" src="https://lookerstudio.google.com/embed/..." frameborder="0" style="border:0" allowfullscreen sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"></iframe>'
                          className="min-h-[120px] font-mono text-sm"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingReport(null);
                      form.reset();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingReport ? 'Actualizar' : 'Crear'} Reporte
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Reports Grid */}
      {reports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay reportes</h3>
            <p className="text-muted-foreground text-center mb-4">
              Comienza creando tu primer reporte de Looker Studio
            </p>
            <Button onClick={handleNewReport} className="gap-2">
              <Plus className="h-4 w-4" />
              Crear Primer Reporte
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <Card key={report.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{report.nombre}</CardTitle>
                    <Badge variant="secondary">{report.departamento}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4 line-clamp-3">
                  {report.descripcion || 'Sin descripción'}
                </CardDescription>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleView(report)}
                    className="gap-1 flex-1"
                  >
                    <Eye className="h-3 w-3" />
                    Ver Reporte
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(report)}
                    className="gap-1"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(report.id)}
                    className="gap-1 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};