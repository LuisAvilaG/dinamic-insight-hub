
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertCircle, Search, FileText } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"; // <-- IMPORTACIÓN AÑADIDA
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { format, intervalToDuration, parseISO } from "date-fns";

// Tipos
type ContratoGlobal = {
    user_id: string;
    nombre_empleado: string;
    puesto: string;
    fecha_inicio: string;
    fecha_fin: string | null;
    tipo_contrato: string;
    estado_semaforo: 'Vigente' | 'Por Vencer' | 'Vencido' | 'Próximo a Vencer'; 
}

type Empleado = {
    user_id: string;
    Nombre: string;
}

// -- Componente de Círculo de Estado --
const SemaforoBadge = ({ status }: { status: ContratoGlobal['estado_semaforo'] }) => {
    const normalizedStatus = status === 'Próximo a Vencer' ? 'Por Vencer' : status;
    const colorClasses: { [key: string]: string } = {
        'Por Vencer': "bg-yellow-400 border-yellow-500",
        'Vencido': "bg-red-500 border-red-600",
        'Vigente': "bg-green-500 border-green-600",
        'Inactivo': "bg-gray-400 border-gray-500",
    };
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                    <div className={`h-3 w-3 rounded-full border ${colorClasses[normalizedStatus] || colorClasses['Inactivo']}`} />
                </TooltipTrigger>
                <TooltipContent>
                    <p>{normalizedStatus}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

// -- Función para calcular la duración --
const getContractDuration = (startDate: string, endDate: string | null): string => {
    if (!endDate) return 'Indefinido';
    try {
        const start = parseISO(startDate);
        const end = parseISO(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) return '-';
        const duration = intervalToDuration({ start, end });
        const parts = [];
        if (duration.years && duration.years > 0) parts.push(`${duration.years} ${duration.years > 1 ? 'años' : 'año'}`);
        if (duration.months && duration.months > 0) parts.push(`${duration.months} ${duration.months > 1 ? 'meses' : 'mes'}`);
        if (duration.days && duration.days > 0 && parts.length < 2) parts.push(`${duration.days} ${duration.days > 1 ? 'días' : 'día'}`);
        return parts.length > 0 ? parts.join(', ') : 'Corta';
    } catch (e) { return '-'; }
}

const VistaGlobalContratos = () => {
    const [contratos, setContratos] = useState<ContratoGlobal[]>([]);
    const [empleados, setEmpleados] = useState<Empleado[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState('');
    const [filterPersona, setFilterPersona] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data: cuentasData, error: cuentasError } = await supabase.from('Cuentas').select('user_id, Nombre');
            if (cuentasError) {
                setError(`Error al cargar empleados: ${cuentasError.message}`); setLoading(false); return;
            }
            setEmpleados(cuentasData as Empleado[]);
            const cuentasMap = new Map(cuentasData.map(c => [c.user_id, c.Nombre]));

            const { data: contratosData, error: contratosError } = await supabase.from('contratos_con_semaforo').select('*').eq('es_activo', true);
            if (contratosError) {
                setError(`Error al cargar contratos: ${contratosError.message}`); setLoading(false); return;
            }

            const contratosGlobales: ContratoGlobal[] = contratosData.map(contrato => ({
                ...contrato,
                nombre_empleado: cuentasMap.get(contrato.user_id) || 'Empleado Desconocido',
            }));
            setContratos(contratosGlobales);
            setLoading(false);
        };
        fetchData();
    }, []);

    const filteredContratos = useMemo(() => {
        return contratos.filter(c => {
            const searchLower = searchTerm.toLowerCase();
            const searchMatch = !searchTerm || 
                c.nombre_empleado.toLowerCase().includes(searchLower) ||
                c.puesto.toLowerCase().includes(searchLower);
            const estadoMatch = !filterEstado || (c.estado_semaforo === filterEstado || (c.estado_semaforo === 'Próximo a Vencer' && filterEstado === 'Por Vencer'));
            const personaMatch = !filterPersona || c.user_id === filterPersona;
            return searchMatch && estadoMatch && personaMatch;
        });
    }, [searchTerm, contratos, filterEstado, filterPersona]);

    return (
        <Card>
            <CardHeader>
                 <div className="flex items-start justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2"><FileText/> Gestión Global de Contratos</CardTitle>
                        <CardDescription>Visualiza y filtra todos los contratos activos de los empleados.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={filterPersona} onValueChange={setFilterPersona}><SelectTrigger className="w-48"><SelectValue placeholder="Filtrar por empleado..." /></SelectTrigger><SelectContent>{empleados.map(e => <SelectItem key={e.user_id} value={e.user_id}>{e.Nombre}</SelectItem>)}</SelectContent></Select>
                        <Select value={filterEstado} onValueChange={setFilterEstado}><SelectTrigger className="w-48"><SelectValue placeholder="Filtrar por estado..." /></SelectTrigger><SelectContent><SelectItem value="Vigente">Vigente</SelectItem><SelectItem value="Por Vencer">Por Vencer</SelectItem><SelectItem value="Vencido">Vencido</SelectItem></SelectContent></Select>
                        <div className="relative w-64">
                            <Input placeholder="Buscar por puesto..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 h-9"/>
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        </div>
                         <Button variant="outline" onClick={() => {setFilterPersona(''); setFilterEstado(''); setSearchTerm('');}}>Limpiar</Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {loading && <div className="flex items-center justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
                {error && <div className="p-6 bg-destructive/10 border-destructive/20 rounded-lg flex items-center"><AlertCircle className="h-5 w-5 mr-3 text-destructive" /><p>{error}</p></div>}
                {!loading && !error && (
                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50/80">
                            <TableRow>
                                <TableHead className="w-[32px]"></TableHead>
                                <TableHead>Empleado</TableHead>
                                <TableHead>Puesto</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Duración</TableHead>
                                <TableHead>Inicio</TableHead>
                                <TableHead>Fin</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {filteredContratos.length > 0 ? (
                                filteredContratos.map((c) => (
                                <TableRow key={c.user_id}>
                                    <TableCell><SemaforoBadge status={c.estado_semaforo} /></TableCell>
                                    <TableCell className="font-medium">{c.nombre_empleado}</TableCell>
                                    <TableCell>{c.puesto}</TableCell>
                                    <TableCell>{c.tipo_contrato}</TableCell>
                                    <TableCell>{getContractDuration(c.fecha_inicio, c.fecha_fin)}</TableCell>
                                    <TableCell>{format(parseISO(c.fecha_inicio), 'dd/MM/yyyy')}</TableCell>
                                    <TableCell>{c.fecha_fin ? format(parseISO(c.fecha_fin), 'dd/MM/yyyy') : 'Indefinido'}</TableCell>
                                </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                <TableCell colSpan={7} className="text-center h-24">
                                    No se encontraron contratos que coincidan con los filtros.
                                </TableCell>
                                </TableRow>
                            )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default VistaGlobalContratos;
