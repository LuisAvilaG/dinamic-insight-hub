
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, AlertCircle, Search, ChevronsUpDown, User, Settings } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { GestionDocumentos } from './GestionDocumentos'; // CAMBIO: Importamos el nuevo componente
import { GestionDetallesEmpleado } from './GestionDetallesEmpleado';

// --- Interfaces y Tipos ---
interface CuentaConDetalles {
  user_id: string;
  Correo: string;
  Nombre: string;
  Rol: string;
  departamento: string | null;
  lider_user_id: string | null;
  dias_disponibles_anual: number | null;
  fecha_inicio_labores: string | null;
  dias_especiales_disponibles: number | null;
}

// --- Componente de Fila de Empleado (Actualizado) ---
const EmployeeRow = ({ cuenta, lideres, onUpdate }: { cuenta: CuentaConDetalles, lideres: CuentaConDetalles[], onUpdate: (userId: string, updatedFields: Partial<CuentaConDetalles>) => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible asChild key={cuenta.user_id}>
      <>
        <TableRow className={`border-b-0 transition-colors ${isOpen ? 'bg-slate-100/80' : 'hover:bg-slate-50/80'}`} >
            <TableCell className="font-medium">{cuenta.Nombre}<br/><span className='text-xs text-muted-foreground'>{cuenta.Correo}</span></TableCell>
            <TableCell><span className="capitalize">{cuenta.Rol}</span></TableCell>
            <TableCell>{cuenta.departamento || 'N/A'}</TableCell>
            <TableCell className="text-right">
                <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4 mr-2"/>
                        Gestionar
                        <ChevronsUpDown className={`h-4 w-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </Button>
                </CollapsibleTrigger>
            </TableCell>
        </TableRow>
        <CollapsibleContent asChild>
          <tr className="bg-white">
            <td colSpan={4} className="p-0">
                <div className="p-6 bg-slate-100/80 border-t border-b">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {/* CAMBIO: Usamos el nuevo componente de documentos */}
                        <GestionDocumentos userId={cuenta.user_id} userName={cuenta.Nombre} />
                        <GestionDetallesEmpleado cuenta={cuenta} lideres={lideres} onUpdate={(updatedFields) => onUpdate(cuenta.user_id, updatedFields)} />
                    </div>
                </div>
            </td>
          </tr>
        </CollapsibleContent>
      </>
    </Collapsible>
  );
};


// --- Componente Principal (Sin cambios en su lógica interna) ---
export const AsignarLider = () => {
  const [cuentas, setCuentas] = useState<CuentaConDetalles[]>([]);
  const [lideres, setLideres] = useState<CuentaConDetalles[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        { data: cuentasData, error: cuentasError },
        { data: aprobadoresData, error: aprobadoresError },
        { data: saldosData, error: saldosError },
        { data: permisosSaldosData, error: permisosSaldosError }
      ] = await Promise.all([
        supabase.from('Cuentas').select('user_id, Correo, Nombre, Rol, departamento'),
        supabase.from('vacaciones_aprobadores').select('empleado_user_id, aprobador_user_id'),
        supabase.from('vacaciones_saldos').select('user_id, dias_disponibles_anual, fecha_inicio_labores'),
        supabase.from('permisos_saldos').select('user_id, dias_especiales_disponibles')
      ]);

      if (cuentasError) throw new Error(`al cargar cuentas: ${cuentasError.message}`);
      if (aprobadoresError) throw new Error(`al cargar aprobadores: ${aprobadoresError.message}`);
      if (saldosError) throw new Error(`al cargar saldos: ${saldosError.message}`);
      if (permisosSaldosError) throw new Error(`al cargar saldos de permisos: ${permisosSaldosError.message}`);

      const aprobadoresMap = new Map(aprobadoresData.map(item => [item.empleado_user_id, item.aprobador_user_id]));
      const saldosMap = new Map(saldosData.map(item => [item.user_id, { dias: item.dias_disponibles_anual, fecha: item.fecha_inicio_labores }]));
      const permisosSaldosMap = new Map(permisosSaldosData.map(item => [item.user_id, item.dias_especiales_disponibles]));

      const cuentasConDetalles = cuentasData.map(cuenta => ({
        ...cuenta,
        lider_user_id: aprobadoresMap.get(cuenta.user_id) || null,
        dias_disponibles_anual: saldosMap.get(cuenta.user_id)?.dias ?? null,
        fecha_inicio_labores: saldosMap.get(cuenta.user_id)?.fecha || null,
        dias_especiales_disponibles: permisosSaldosMap.get(cuenta.user_id) ?? null,
      }));
      
      const sortedData = cuentasConDetalles.sort((a, b) => a.Nombre.localeCompare(b.Nombre));
      setCuentas(sortedData);
      setLideres(sortedData);

    } catch (err: any) {
      setError(`No se pudieron cargar los datos. Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleLocalUpdate = (userId: string, updatedFields: Partial<CuentaConDetalles>) => {
    setCuentas(prevCuentas => 
      prevCuentas.map(cuenta => 
        cuenta.user_id === userId ? { ...cuenta, ...updatedFields } : cuenta
      )
    );
  };

  const filteredCuentas = useMemo(() => {
    if (!searchTerm) return cuentas;
    return cuentas.filter(cuenta =>
      cuenta.Nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cuenta.departamento && cuenta.departamento.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, cuentas]);

  if (loading) return <div className="flex items-center justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (error) return <div className="p-6 bg-destructive/10 border-destructive/20 rounded-lg flex items-center"><AlertCircle className="h-5 w-5 mr-3 text-destructive" /><p>{error}</p></div>;

  return (
    <Card className="shadow-sm border-0">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle>Gestión de Equipo</CardTitle>
          <CardDescription>Visualiza y gestiona los empleados, sus contratos y detalles.</CardDescription>
        </div>
        <div className="relative w-72">
            <Input
              placeholder="Buscar por nombre o depto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="w-[35%]">Empleado</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCuentas.length > 0 ? (
                filteredCuentas.map((cuenta) => (
                   <EmployeeRow key={cuenta.user_id} cuenta={cuenta} lideres={lideres} onUpdate={handleLocalUpdate} />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
                    No se encontraron empleados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
