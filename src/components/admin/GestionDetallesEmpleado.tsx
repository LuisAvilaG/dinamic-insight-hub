
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/components/ui/use-toast";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Pencil, Save, X, CalendarIcon, UserCheck, Briefcase } from 'lucide-react';

// --- Interfaces y Tipos ---
interface CuentaConDetalles {
  user_id: string;
  Nombre: string;
  departamento: string | null;
  lider_user_id: string | null;
  dias_disponibles_anual: number | null;
  fecha_inicio_labores: string | null;
  dias_especiales_disponibles: number | null;
}
const departamentosDisponibles = ['Financiero', 'Operativo', 'Directivo', 'Consultoría', 'Dinamic', 'RRHH'];

export const GestionDetallesEmpleado = ({ cuenta, lideres, onUpdate }: { cuenta: CuentaConDetalles, lideres: any[], onUpdate: (updatedFields: Partial<CuentaConDetalles>) => void }) => {
  const { toast } = useToast();

  // Estados para la edición en línea
  const [editingDepto, setEditingDepto] = useState(false);
  const [deptoValue, setDeptoValue] = useState(cuenta.departamento);
  const [editingDays, setEditingDays] = useState(false);
  const [daysValue, setDaysValue] = useState<number | string>(cuenta.dias_disponibles_anual ?? '');
  const [editingSpecialDays, setEditingSpecialDays] = useState(false);
  const [specialDaysValue, setSpecialDaysValue] = useState<number | string>(cuenta.dias_especiales_disponibles ?? '');

  const handleSaveWrapper = async (saveFunction: Function, updatedField: Partial<CuentaConDetalles>, successMessage: string, onAfterSave?: () => void) => {
    try {
      const { error } = await saveFunction();
      if (error) throw error;
      toast({ title: "✅ Éxito", description: successMessage });
      onUpdate(updatedField);
      onAfterSave?.();
    } catch (err: any) {
      toast({ variant: "destructive", title: "❌ Error", description: err.message });
    }
  }

  const handleSaveDepartamento = (newDepto: string | null) => {
    const finalDepto = newDepto === 'no-departamento' ? null : newDepto;
    handleSaveWrapper(async () => await supabase.from('Cuentas').update({ departamento: finalDepto }).eq('user_id', cuenta.user_id), { departamento: finalDepto }, 'Departamento actualizado.', () => setEditingDepto(false));
  }

  const handleSaveDiasAnuales = () => {
    const newDays = parseInt(daysValue as string, 10);
    if (isNaN(newDays) || newDays < 0) {
        toast({ variant: "destructive", title: "Valor inválido", description: "Por favor, introduce un número válido y positivo." });
        return;
    }
    // BUG FIX: Especificar onConflict para que upsert funcione como un UPDATE si el user_id ya existe.
    const apiCall = supabase.from('vacaciones_saldos').upsert({ user_id: cuenta.user_id, dias_disponibles_anual: newDays }, { onConflict: 'user_id' });
    handleSaveWrapper(async () => await apiCall, { dias_disponibles_anual: newDays }, 'Días anuales guardados.', () => setEditingDays(false));
  }

  const handleSaveDiasEspeciales = () => {
      const newDays = parseInt(specialDaysValue as string, 10);
      if (isNaN(newDays) || newDays < 0) {
        toast({ variant: "destructive", title: "Valor inválido", description: "Por favor, introduce un número válido y positivo." });
        return;
      }
      // BUG FIX: Especificar onConflict para que upsert funcione como un UPDATE si el user_id ya existe.
      const apiCall = supabase.from('permisos_saldos').upsert({ user_id: cuenta.user_id, dias_especiales_disponibles: newDays }, { onConflict: 'user_id' });
      handleSaveWrapper(async () => await apiCall, { dias_especiales_disponibles: newDays }, 'Días especiales guardados.', () => setEditingSpecialDays(false));
  }

  const handleSaveFechaInicio = (date?: Date) => {
      if (!date) return;
      const isoDate = format(date, 'yyyy-MM-dd');
      // BUG FIX: Especificar onConflict para que upsert funcione como un UPDATE si el user_id ya existe.
      const apiCall = supabase.from('vacaciones_saldos').upsert({ user_id: cuenta.user_id, fecha_inicio_labores: isoDate }, { onConflict: 'user_id' });
      handleSaveWrapper(async () => await apiCall, { fecha_inicio_labores: isoDate }, 'Fecha de inicio guardada.');
  }
  
  const handleLeaderChange = (newLeaderId: string | null) => {
      const finalLeaderId = newLeaderId === 'no-leader' ? null : newLeaderId;
      const apiCall = finalLeaderId ? supabase.from('vacaciones_aprobadores').upsert({ empleado_user_id: cuenta.user_id, aprobador_user_id: finalLeaderId }, { onConflict: 'empleado_user_id' }) : supabase.from('vacaciones_aprobadores').delete().eq('empleado_user_id', cuenta.user_id);
      handleSaveWrapper(async () => await apiCall, { lider_user_id: finalLeaderId }, 'Líder asignado.');
  }

  return (
    <div className="p-4 bg-slate-50/50 rounded-lg border">
        <h4 className="text-base font-semibold text-gray-700 flex items-center gap-2 mb-4"><Briefcase className="h-5 w-5 text-gray-500"/>Detalles del Empleado</h4>
        <div className="space-y-3">
            <div className="flex items-center justify-between p-2 rounded-md hover:bg-slate-100">
                <span className="text-sm font-medium text-gray-600">Departamento</span>
                {editingDepto ? (
                    <div className="flex items-center gap-1"><Select defaultValue={deptoValue || 'no-departamento'} onValueChange={handleSaveDepartamento}><SelectTrigger className="w-40 h-9"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="no-departamento">*Sin depto*</SelectItem>{departamentosDisponibles.map(d=><SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select><Button size="icon" variant="ghost" onClick={()=>setEditingDepto(false)}><X className="h-4 w-4"/></Button></div>
                ) : (
                    <div className="flex items-center gap-2"><span className="font-semibold">{cuenta.departamento || 'N/A'}</span><Button size="icon" variant="ghost" onClick={()=>{ setDeptoValue(cuenta.departamento); setEditingDepto(true);}}><Pencil className="h-4 w-4"/></Button></div>
                )}
            </div>
            <div className="flex items-center justify-between p-2 rounded-md hover:bg-slate-100">
                <span className="text-sm font-medium text-gray-600">Días Anuales Disp.</span>
                {editingDays ? (
                     <div className="flex items-center gap-1"><Input type="number" value={daysValue} onChange={e=>setDaysValue(e.target.value)} className="w-20 h-9"/><Button size="icon" variant="ghost" onClick={handleSaveDiasAnuales}><Save className="h-4 w-4"/></Button><Button size="icon" variant="ghost" onClick={()=>setEditingDays(false)}><X className="h-4 w-4"/></Button></div>
                ) : (
                    <div className="flex items-center gap-2"><span className="font-semibold">{cuenta.dias_disponibles_anual ?? 'N/A'}</span><Button size="icon" variant="ghost" onClick={()=>{setDaysValue(cuenta.dias_disponibles_anual ?? ''); setEditingDays(true);}}><Pencil className="h-4 w-4"/></Button></div>
                )}
            </div>
            <div className="flex items-center justify-between p-2 rounded-md hover:bg-slate-100">
                <span className="text-sm font-medium text-gray-600">Días Especiales Disp.</span>
                 {editingSpecialDays ? (
                     <div className="flex items-center gap-1"><Input type="number" value={specialDaysValue} onChange={e=>setSpecialDaysValue(e.target.value)} className="w-20 h-9"/><Button size="icon" variant="ghost" onClick={handleSaveDiasEspeciales}><Save className="h-4 w-4"/></Button><Button size="icon" variant="ghost" onClick={()=>setEditingSpecialDays(false)}><X className="h-4 w-4"/></Button></div>
                ) : (
                    <div className="flex items-center gap-2"><span className="font-semibold">{cuenta.dias_especiales_disponibles ?? 'N/A'}</span><Button size="icon" variant="ghost" onClick={()=>{setSpecialDaysValue(cuenta.dias_especiales_disponibles ?? ''); setEditingSpecialDays(true);}}><Pencil className="h-4 w-4"/></Button></div>
                )}
            </div>
            <div className="flex items-center justify-between p-2 rounded-md hover:bg-slate-100">
                <span className="text-sm font-medium text-gray-600">Inicio de Labores</span>
                <Popover><PopoverTrigger asChild><Button variant={"outline"} className="font-normal w-40 justify-start h-9"><CalendarIcon className="mr-2 h-4 w-4" />{cuenta.fecha_inicio_labores ? format(new Date(cuenta.fecha_inicio_labores+'T00:00:00'), "dd/MM/yy") : 'No asignada'}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={cuenta.fecha_inicio_labores ? new Date(cuenta.fecha_inicio_labores+'T00:00:00') : undefined} onSelect={handleSaveFechaInicio} initialFocus /></PopoverContent></Popover>
            </div>
            <div className="flex items-center justify-between p-2 rounded-md hover:bg-slate-100">
                <span className="text-sm font-medium text-gray-600">Líder Asignado</span>
                <Select value={cuenta.lider_user_id || 'no-leader'} onValueChange={handleLeaderChange}>
                    <SelectTrigger className="w-48 h-9"><UserCheck className="h-4 w-4 mr-2 text-muted-foreground" /><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="no-leader">*Sin líder*</SelectItem>{lideres.filter(l=>l.user_id !== cuenta.user_id).map(l=><SelectItem key={l.user_id} value={l.user_id}>{l.Nombre}</SelectItem>)}</SelectContent>
                </Select>
            </div>
        </div>
    </div>
  );
}
