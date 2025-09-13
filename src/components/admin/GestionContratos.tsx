
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { format, addMonths, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Loader2, AlertCircle, PlusCircle, Calendar as CalendarIcon, FileText, Edit, Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";


// --- TIPOS Y DATOS --- 
type Contrato = {
  id: number;
  user_id: string;
  tipo_contrato: 'Indefinido' | 'Temporal' | 'Prácticas' | 'Otro';
  fecha_inicio: string;
  fecha_fin: string | null;
  puesto: string;
  es_activo: boolean;
  estado_semaforo: 'Vigente' | 'Por Vencer' | 'Vencido' | 'Próximo a Vencer';
};
type ContratoForm = Omit<Contrato, 'id' | 'user_id' | 'estado_semaforo'>;
const tiposDeContrato: Contrato['tipo_contrato'][] = ['Indefinido', 'Temporal', 'Prácticas', 'Otro'];

// --- FORMULARIO DE CREACIÓN/EDICIÓN ---
const FormularioContrato = ({ userId, onSave, initialData }: { userId: string, onSave: () => void, initialData?: Contrato | null }) => {
  const [formData, setFormData] = useState<Partial<ContratoForm>>({});
  const [duration, setDuration] = useState(''); 
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (initialData) {
        setFormData({
            ...initialData,
            fecha_inicio: initialData.fecha_inicio ? format(parseISO(initialData.fecha_inicio), 'yyyy-MM-dd') : undefined,
            fecha_fin: initialData.fecha_fin ? format(parseISO(initialData.fecha_fin), 'yyyy-MM-dd') : undefined,
        });
    } else {
        setFormData({ puesto: '', tipo_contrato: '', es_activo: true });
    }
  }, [initialData]);

  useEffect(() => {
    if (formData.tipo_contrato && formData.tipo_contrato !== 'Indefinido' && formData.fecha_inicio && duration) {
      const dur = parseInt(duration, 10);
      if (!isNaN(dur) && dur > 0) {
        const newEndDate = addMonths(parseISO(formData.fecha_inicio), dur);
        setFormData(prev => ({ ...prev, fecha_fin: format(newEndDate, 'yyyy-MM-dd') }));
      }
    } else if (formData.tipo_contrato === 'Indefinido') {
      setFormData(prev => ({...prev, fecha_fin: undefined}));
      setDuration('');
    }
  }, [formData.tipo_contrato, formData.fecha_inicio, duration]);

  const handleSave = async () => {
    // ... (lógica de validación) ...
    setIsSaving(true);
    const dataToSave = {
      ...formData,
      user_id: userId,
      fecha_inicio: formData.fecha_inicio ? format(parseISO(formData.fecha_inicio), 'yyyy-MM-dd') : null,
      fecha_fin: formData.fecha_fin ? format(parseISO(formData.fecha_fin), 'yyyy-MM-dd') : null,
    };

    try {
      if (dataToSave.es_activo) {
        await supabase.from('contratos').update({ es_activo: false }).eq('user_id', userId);
      }

      let error;
      if (initialData) {
        const { error: updateError } = await supabase.from('contratos').update(dataToSave).eq('id', initialData.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase.from('contratos').insert(dataToSave);
        error = insertError;
      }
      if (error) throw error;

      toast({ title: `✅ Contrato ${initialData ? 'actualizado' : 'añadido'}` });
      onSave();
    } catch (error: any) {
      toast({ variant: "destructive", title: "❌ Error", description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
     <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="puesto" className="text-right">Puesto</Label>
            <Input id="puesto" value={formData.puesto || ''} onChange={e => setFormData({...formData, puesto: e.target.value})} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tipo" className="text-right">Tipo</Label>
            <Select value={formData.tipo_contrato} onValueChange={value => setFormData({...formData, tipo_contrato: value as Contrato['tipo_contrato']})}><SelectTrigger className="col-span-3"><SelectValue placeholder="Seleccionar tipo..." /></SelectTrigger><SelectContent>{tiposDeContrato.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Fecha Inicio</Label>
            <Popover><PopoverTrigger asChild><Button variant={"outline"} className="col-span-3 font-normal justify-start"><CalendarIcon className="mr-2 h-4 w-4" />{formData.fecha_inicio ? format(parseISO(formData.fecha_inicio), "PPP", {locale: es}) : <span>Elegir fecha</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.fecha_inicio ? parseISO(formData.fecha_inicio) : undefined} onSelect={date => setFormData({...formData, fecha_inicio: date ? format(date, 'yyyy-MM-dd') : undefined})} initialFocus /></PopoverContent></Popover>
        </div>

        {formData.tipo_contrato && formData.tipo_contrato !== 'Indefinido' && (
            <>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="duracion" className="text-right">Duración (meses)</Label>
                <Input id="duracion" type="number" min="1" value={duration} onChange={e => setDuration(e.target.value)} className="col-span-3" placeholder="Ej: 6" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Fecha Fin</Label>
                <Input value={formData.fecha_fin ? format(parseISO(formData.fecha_fin), "dd/MM/yyyy") : 'Calculada automáticamente'} readOnly disabled className="col-span-3 bg-slate-100"/>
            </div>
            </>
        )}

        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="es_activo" className="text-right">Contrato Activo</Label>
            <Checkbox id="es_activo" checked={formData.es_activo} onCheckedChange={checked => setFormData({...formData, es_activo: !!checked})} className="col-span-3"/>
        </div>
        <DialogFooter>
            <DialogClose asChild><Button variant="ghost">Cancelar</Button></DialogClose>
            <Button onClick={handleSave} disabled={isSaving}>{isSaving ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Guardar Cambios'}</Button>
        </DialogFooter>
    </div>
  );
};

// --- COMPONENTE DE BADGE (ACTUALIZADO A CÍRCULO) ---
const SemaforoBadge = ({ status }: { status: Contrato['estado_semaforo'] }) => {
    const normalizedStatus = status === 'Próximo a Vencer' ? 'Por Vencer' : status;
    const colorClasses: { [key: string]: string } = {
        'Por Vencer': "bg-yellow-400 border-yellow-500",
        'Vencido': "bg-red-500 border-red-600",
        'Vigente': "bg-green-500 border-green-600",
        'Inactivo': "bg-gray-400 border-gray-500",
    };
    return (
        <Tooltip>
            <TooltipTrigger>
                <div className={`h-3 w-3 rounded-full border ${colorClasses[normalizedStatus] || colorClasses['Inactivo']}`} />
            </TooltipTrigger>
            <TooltipContent>
                <p>{normalizedStatus}</p>
            </TooltipContent>
        </Tooltip>
    );
};

// --- COMPONENTE PRINCIPAL DE GESTIÓN ---
export const GestionContratos = ({ userId, userName }: { userId: string, userName: string }) => {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingContract, setEditingContract] = useState<Contrato | null>(null);
  const [deletingContract, setDeletingContract] = useState<Contrato | null>(null);
  const { toast } = useToast();

  const fetchContratos = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('contratos_con_semaforo').select('*').eq('user_id', userId).order('fecha_inicio', { ascending: false });
    if (error) setError(`No se pudieron cargar: ${error.message}`);
    else setContratos(data as Contrato[]);
    setLoading(false);
  };

  useEffect(() => { fetchContratos(); }, [userId]);

  const handleSave = () => {
    setShowForm(false);
    setEditingContract(null);
    fetchContratos();
  };

  const handleDelete = async () => {
    if (!deletingContract) return;
    const { error } = await supabase.from('contratos').delete().eq('id', deletingContract.id);
    if (error) {
      toast({ variant: "destructive", title: "❌ Error al eliminar", description: error.message });
    } else {
      toast({ title: "🗑️ Contrato eliminado" });
      setDeletingContract(null);
      fetchContratos();
    }
  };
  
  return (
     <div className="p-4 bg-slate-50/50 rounded-lg border">
        <div className="flex justify-between items-center mb-4">
            <h4 className="text-base font-semibold text-gray-700 flex items-center gap-2"><FileText className="h-5 w-5 text-gray-500" />Historial de Contratos de {userName}</h4>
            <Button size="sm" variant="outline" onClick={() => { setEditingContract(null); setShowForm(true); }}><PlusCircle className="h-4 w-4 mr-2"/>Añadir Contrato</Button>
        </div>

        {/* ... (loading/error handling) ... */}

        <div className="border rounded-lg overflow-hidden">
            <Table>
                <TableHeader><TableRow>
                    <TableHead>Estado</TableHead>
                    <TableHead>Puesto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Inicio</TableHead>
                    <TableHead>Fin</TableHead>
                    <TableHead className="text-center">Activo</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                    {contratos.map(c => (
                        <TableRow key={c.id} className={c.es_activo ? 'bg-blue-50' : ''}>
                            <TableCell><SemaforoBadge status={c.estado_semaforo} /></TableCell>
                            <TableCell className="font-medium">{c.puesto}</TableCell>
                            <TableCell>{c.tipo_contrato}</TableCell>
                            <TableCell>{format(parseISO(c.fecha_inicio), 'dd/MM/yyyy')}</TableCell>
                            <TableCell>{c.fecha_fin ? format(parseISO(c.fecha_fin), 'dd/MM/yyyy') : '-'}</TableCell>
                            <TableCell className="text-center">{c.es_activo ? '✅' : ''}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => { setEditingContract(c); setShowForm(true); }}><Edit className="h-4 w-4"/></Button>
                                <Button variant="ghost" size="icon" onClick={() => setDeletingContract(c)}><Trash2 className="h-4 w-4 text-red-500"/></Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>

        {/* Form Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader><DialogTitle>{editingContract ? 'Editar' : 'Nuevo'} Contrato para {userName}</DialogTitle></DialogHeader>
                <FormularioContrato userId={userId} onSave={handleSave} initialData={editingContract} />
            </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deletingContract} onOpenChange={() => setDeletingContract(null)}>
            <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle>¿Estás seguro?</AlertDialogTitle><AlertDialogDescription>Esta acción es permanente y no se puede deshacer. El contrato será eliminado para siempre.</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Sí, eliminar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
