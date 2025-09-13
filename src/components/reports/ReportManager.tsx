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
import { Plus, Eye, Edit, Trash2, FileText, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const reportSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  departamento: z.string().min(1, 'El departamento es requerido'),
  descripcion: z.string().optional(),
  frecuencia_actualizacion: z.string().optional(),
  iframe_code: z.string().min(1, 'El código iframe es requerido'),
});

interface Report {
  id: string;
  nombre: string;
  departamento: string;
  descripcion?: string;
  frecuencia_actualizacion?: string;
  iframe_code: string;
  created_at: string;
  updated_at: string;
}

// --- Opciones para el formulario de frecuencia ---
const departamentos = [
  { value: 'Financiero', label: 'Financiero' },
  { value: 'Operativo', label: 'Operativo' },
  { value: 'Directivo', label: 'Directivo' },
  { value: 'Consultoría', label: 'Consultoría' },
  { value: 'Dinamic', label: 'Dinamic' },
];
const frequencyTypes = [
  { value: 'diaria', label: 'Diaria' },
  { value: 'semanal', label: 'Semanal' },
  { value: 'mensual', label: 'Mensual' },
];
const monthOptions = [
  { value: 'inicio', label: 'A inicios de mes' },
  { value: 'fin', label: 'A finales de mes' },
  { value: 'especifico', label: 'Un día específico' },
];
const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
// ---

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
        frecuencia_actualizacion: '',
        iframe_code: '',
    },
  });

  // Estado local para los controles de frecuencia
  const [freqType, setFreqType] = useState('diaria');
  const [freqDay, setFreqDay] = useState(daysOfWeek[0]);
  const [freqMonthType, setFreqMonthType] = useState('inicio');
  const [freqMonthDay, setFreqMonthDay] = useState('1');
  const [freqTime, setFreqTime] = useState('09:00');

  // Efecto para construir la cadena de texto final
  useEffect(() => {
    let finalFrequency = '';
    if (freqType === 'diaria') {
      finalFrequency = `Diariamente a las ${freqTime}`;
    } else if (freqType === 'semanal') {
      finalFrequency = `Semanalmente, los ${freqDay} a las ${freqTime}`;
    } else if (freqType === 'mensual') {
      if (freqMonthType === 'inicio') {
        finalFrequency = `Mensualmente, a inicios de mes a las ${freqTime}`;
      } else if (freqMonthType === 'fin') {
        finalFrequency = `Mensualmente, a finales de mes a las ${freqTime}`;
      } else {
        finalFrequency = `Mensualmente, el día ${freqMonthDay} a las ${freqTime}`;
      }
    }
    form.setValue('frecuencia_actualizacion', finalFrequency);
  }, [freqType, freqDay, freqMonthType, freqMonthDay, freqTime, form]);

  const loadReports = async () => {
    try {
      const { data, error } = await supabase.from('reportes').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error("Error loading reports:", error);
      toast({ title: "Error", description: "No se pudieron cargar los reportes", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadReports() }, []);

  const onSubmit = async (values: z.infer<typeof reportSchema>) => {
    try {
      const reportData = { ...values, frecuencia_actualizacion: values.frecuencia_actualizacion || null };
      if (editingReport) {
        const { error } = await supabase.from('reportes').update(reportData).eq('id', editingReport.id);
        if (error) throw error;
        toast({ title: "Éxito", description: "Reporte actualizado correctamente" });
      } else {
        const { error } = await supabase.from('reportes').insert([reportData as any]);
        if (error) throw error;
        toast({ title: "Éxito", description: "Reporte creado correctamente" });
      }
      form.reset();
      setIsDialogOpen(false);
      setEditingReport(null);
      loadReports();
    } catch (error) {
      console.error("Error saving report:", error);
      toast({ title: "Error", description: "No se pudo guardar el reporte", variant: "destructive" });
    }
  };

  // Función para parsear la frecuencia y setear el estado local
  const parseAndSetFrequency = (frequencyString: string | null | undefined) => {
    if (!frequencyString) {
        setFreqType('diaria');
        setFreqDay(daysOfWeek[0]);
        setFreqMonthType('inicio');
        setFreqMonthDay('1');
        setFreqTime('09:00');
        return;
    }

    const timeMatch = frequencyString.match(/a las (\d{2}:\d{2})/);
    if (timeMatch) setFreqTime(timeMatch[1]);

    if (frequencyString.startsWith('Diariamente')) {
        setFreqType('diaria');
    } else if (frequencyString.startsWith('Semanalmente')) {
        setFreqType('semanal');
        const dayMatch = daysOfWeek.find(day => frequencyString.includes(day));
        if (dayMatch) setFreqDay(dayMatch);
    } else if (frequencyString.startsWith('Mensualmente')) {
        setFreqType('mensual');
        if (frequencyString.includes('inicios de mes')) {
            setFreqMonthType('inicio');
        } else if (frequencyString.includes('finales de mes')) {
            setFreqMonthType('fin');
        } else {
            setFreqMonthType('especifico');
            const dayMatch = frequencyString.match(/el día (\d+)/);
            if (dayMatch) setFreqMonthDay(dayMatch[1]);
        }
    }
  };

  const handleEdit = (report: Report) => {
    setEditingReport(report);
    form.reset({
        nombre: report.nombre,
        departamento: report.departamento,
        descripcion: report.descripcion || '',
        iframe_code: report.iframe_code,
        frecuencia_actualizacion: report.frecuencia_actualizacion || '',
    });
    parseAndSetFrequency(report.frecuencia_actualizacion);
    setIsDialogOpen(true);
  };
  
  const handleNewReport = () => {
    setEditingReport(null);
    form.reset({
        nombre: '',
        departamento: '',
        descripcion: '',
        frecuencia_actualizacion: '',
        iframe_code: '',
    });
    parseAndSetFrequency(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este reporte?')) {
      try {
        const { error } = await supabase.from('reportes').delete().eq('id', id);
        if (error) throw error;
        toast({ title: "Éxito", description: "Reporte eliminado" });
        loadReports();
      } catch (error) {
        toast({ title: "Error", description: "No se pudo eliminar", variant: "destructive" });
      }
    }
  };

  const handleView = (report: Report) => navigate(`/reportes/${report.id}`);

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Gestión de Reportes</h1>
                <p className="text-muted-foreground">Administra los reportes de Looker Studio por departamento</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button onClick={handleNewReport} className="gap-2"><Plus />Nuevo Reporte</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingReport ? 'Editar Reporte' : 'Crear Nuevo Reporte'}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField control={form.control} name="nombre" render={({ field }) => (<FormItem><FormLabel>Nombre del Reporte</FormLabel><FormControl><Input placeholder="Ej: Análisis de Ventas Q1" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="departamento" render={({ field }) => (<FormItem><FormLabel>Departamento</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecciona un departamento" /></SelectTrigger></FormControl><SelectContent>{departamentos.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="descripcion" render={({ field }) => (<FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea placeholder="Describe el reporte..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                            
                            <div>
                                <FormLabel>Frecuencia de Actualización</FormLabel>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                                    <Select value={freqType} onValueChange={setFreqType}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>{frequencyTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                                    </Select>
                                    
                                    {freqType === 'semanal' && (
                                        <Select value={freqDay} onValueChange={setFreqDay}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>{daysOfWeek.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                                        </Select>
                                    )}

                                    {freqType === 'mensual' && (
                                        <Select value={freqMonthType} onValueChange={setFreqMonthType}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>{monthOptions.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                                        </Select>
                                    )}

                                    <Select value={freqTime} onValueChange={setFreqTime}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent className="max-h-60">{hours.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                {freqType === 'mensual' && freqMonthType === 'especifico' && (
                                    <div className="mt-2">
                                    <FormLabel>Día del mes</FormLabel>
                                    <Input type="number" min="1" max="31" value={freqMonthDay} onChange={e => setFreqMonthDay(e.target.value)} className="w-full mt-1" />
                                    </div>
                                )}
                            </div>

                            <FormField control={form.control} name="iframe_code" render={({ field }) => (<FormItem className="mt-4"><FormLabel>Código Iframe</FormLabel><FormControl><Textarea placeholder='<iframe ...>' className="font-mono" {...field} /></FormControl><FormMessage /></FormItem>)} />

                            <div className="flex justify-end gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                                <Button type="submit">{editingReport ? 'Actualizar' : 'Crear'} Reporte</Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>

      {isLoading ? <div className="text-center p-8">Cargando reportes...</div> : reports.length === 0 ? (
          <Card><CardContent className="py-12 text-center"><FileText className="mx-auto h-12 w-12 text-muted-foreground" /><h3 className="mt-4 font-semibold">No hay reportes</h3><p className="mt-2 text-sm text-muted-foreground">Crea tu primer reporte para empezar</p><Button onClick={handleNewReport} className="mt-6 gap-2"><Plus/>Crear</Button></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <Card key={report.id} className="group hover:shadow-lg transition-shadow flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">{report.nombre}</CardTitle>
                <Badge variant="secondary">{report.departamento}</Badge>
              </CardHeader>
              <CardContent className="flex flex-col flex-grow">
                <CardDescription className="line-clamp-2 flex-grow mb-4">{report.descripcion || 'Sin descripción'}</CardDescription>
                {report.frecuencia_actualizacion && (
                  <div className="text-xs text-muted-foreground mb-4 flex items-center"><RefreshCw className="h-3 w-3 mr-2"/><span>{report.frecuencia_actualizacion}</span></div>
                )}
                <div className="flex gap-2 mt-auto">
                  <Button size="sm" onClick={() => handleView(report)} className="gap-1 flex-1"><Eye className="h-3"/>Ver</Button>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(report)}><Edit className="h-3"/></Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(report.id)} className="text-destructive"><Trash2 className="h-3"/></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};