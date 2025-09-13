
import { useState, useEffect, useRef } from 'react';
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
import { Loader2, PlusCircle, Calendar as CalendarIcon, FileText, Edit, Trash2, ShieldCheck, Upload, Paperclip, UploadCloud, Eye, X } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { v4 as uuidv4 } from 'uuid';

// ===================================
// --- TIPOS Y DATOS UNIFICADOS ---
// ===================================

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

type Documento = {
    id: number;
    user_id: string;
    nombre_documento: string;
    tipo_documento: string;
    path_almacenamiento: string; 
    subido_en: string; 
}

type DocumentoMostrado = {
    id: string;
    tipo: 'Contrato' | 'Archivo';
    nombre: string;
    tipo_especifico: string; 
    fecha_creacion: string;
    es_activo?: boolean;
    estado_semaforo?: Contrato['estado_semaforo'];
    metadata: Contrato | Documento; 
};

type ContratoForm = Omit<Contrato, 'id' | 'user_id' | 'estado_semaforo'>;
const tiposDeContrato: Contrato['tipo_contrato'][] = ['Indefinido', 'Temporal', 'Prácticas', 'Otro'];
const tiposDeDocumentoGeneral = ['Identificación', 'CV', 'Nómina', 'Certificado', 'Otro'];

// ===================================
// --- FORMULARIOS ---
// ===================================

const FormularioContrato = ({ userId, onSave, initialData }: { userId: string, onSave: () => void, initialData?: Contrato | null }) => {
  const [formData, setFormData] = useState<Partial<ContratoForm>>({});
  const [duration, setDuration] = useState(''); 
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (initialData) {
        setFormData({ ...initialData, fecha_inicio: initialData.fecha_inicio ? format(parseISO(initialData.fecha_inicio), 'yyyy-MM-dd') : undefined, fecha_fin: initialData.fecha_fin ? format(parseISO(initialData.fecha_fin), 'yyyy-MM-dd') : undefined });
    } else {
        setFormData({ puesto: '', tipo_contrato: 'Indefinido', es_activo: true });
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
    setIsSaving(true);
    const dataToSave = { ...formData, user_id: userId, es_activo: formData.es_activo === null ? false : formData.es_activo };
    try {
      if (dataToSave.es_activo) await supabase.from('contratos').update({ es_activo: false }).eq('user_id', userId);
      const { error } = initialData ? await supabase.from('contratos').update(dataToSave).eq('id', initialData.id) : await supabase.from('contratos').insert(dataToSave);
      if (error) throw error;
      toast({ title: `✅ Contrato ${initialData ? 'actualizado' : 'añadido'}` });
      onSave();
    } catch (error: any) {
      toast({ variant: "destructive", title: "❌ Error", description: error.message });
    } finally { setIsSaving(false); }
  };

  return (
     <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="puesto" className="text-right">Puesto</Label><Input id="puesto" value={formData.puesto || ''} onChange={e => setFormData({...formData, puesto: e.target.value})} className="col-span-3" /></div>
        <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="tipo" className="text-right">Tipo</Label><Select value={formData.tipo_contrato} onValueChange={value => setFormData({...formData, tipo_contrato: value as Contrato['tipo_contrato']})}><SelectTrigger className="col-span-3"><SelectValue placeholder="Seleccionar tipo..." /></SelectTrigger><SelectContent>{tiposDeContrato.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
        <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Fecha Inicio</Label><Popover><PopoverTrigger asChild><Button variant={"outline"} className="col-span-3 font-normal justify-start"><CalendarIcon className="mr-2 h-4 w-4" />{formData.fecha_inicio ? format(parseISO(formData.fecha_inicio), "PPP", {locale: es}) : <span>Elegir fecha</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.fecha_inicio ? parseISO(formData.fecha_inicio) : undefined} onSelect={date => setFormData({...formData, fecha_inicio: date ? format(date, 'yyyy-MM-dd') : undefined})} initialFocus /></PopoverContent></Popover></div>
        {formData.tipo_contrato && formData.tipo_contrato !== 'Indefinido' && (<><div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="duracion" className="text-right">Duración (meses)</Label><Input id="duracion" type="number" min="1" value={duration} onChange={e => setDuration(e.target.value)} className="col-span-3" placeholder="Ej: 6" /></div><div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Fecha Fin</Label><Input value={formData.fecha_fin ? format(parseISO(formData.fecha_fin), "dd/MM/yyyy") : 'Calculada automáticamente'} readOnly disabled className="col-span-3 bg-slate-100"/></div></>)}
        <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="es_activo" className="text-right">Contrato Activo</Label><Checkbox id="es_activo" checked={!!formData.es_activo} onCheckedChange={checked => setFormData({...formData, es_activo: !!checked})} className="col-span-3"/></div>
        <DialogFooter><DialogClose asChild><Button variant="ghost">Cancelar</Button></DialogClose><Button onClick={handleSave} disabled={isSaving}>{isSaving ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Guardar Cambios'}</Button></DialogFooter>
    </div>
  );
};

const FormularioArchivo = ({ userId, onSave }: { userId: string, onSave: () => void }) => {
    const [nombre, setNombre] = useState('');
    const [tipo, setTipo] = useState('Otro');
    const [file, setFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files && e.target.files[0]) setFile(e.target.files[0]); };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); if (e.dataTransfer.files && e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]); };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };

    const handleSave = async () => {
        if (!file || !nombre) { toast({ variant: "destructive", title: "Faltan datos", description: "Por favor, dale un nombre y elige un archivo." }); return; }
        setIsSaving(true);
        try {
            const fileExtension = file.name.split('.').pop();
            const filePath = `${userId}/${uuidv4()}.${fileExtension}`;
            const { error: uploadError } = await supabase.storage.from('documentos_empleados').upload(filePath, file);
            if (uploadError) throw uploadError;

            const { error: dbError } = await supabase.from('documentos_empleados').insert({
                user_id: userId,
                nombre_documento: nombre,
                tipo_documento: tipo,
                path_almacenamiento: filePath,
                tamano_archivo: file.size,
                tipo_mime: file.type
            });

            if (dbError) throw dbError;
            toast({ title: "✅ Archivo subido con éxito" });
            onSave();
        } catch (error: any) { toast({ variant: "destructive", title: "❌ Error al subir el archivo", description: error.message });
        } finally { setIsSaving(false); }
    };

    return (
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="doc-nombre" className="text-right">Nombre</Label><Input id="doc-nombre" value={nombre} onChange={e => setNombre(e.target.value)} className="col-span-3" placeholder="Ej: DNI (Anverso)" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="doc-tipo" className="text-right">Tipo</Label><Select value={tipo} onValueChange={setTipo}><SelectTrigger className="col-span-3"><SelectValue placeholder="Seleccionar tipo..." /></SelectTrigger><SelectContent>{tiposDeDocumentoGeneral.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
            <div onDrop={handleDrop} onDragOver={handleDragOver} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} className={`col-span-4 mt-2 p-6 border-2 border-dashed rounded-md text-center transition-colors ${isDragging ? 'border-primary bg-primary/10' : 'border-gray-300'}`}>
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">Arrastra y suelta un archivo aquí</p>
                <p className="mt-1 text-xs text-gray-500">o</p>
                <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => fileInputRef.current?.click()}>Seleccionar Archivo</Button>
                <Input ref={fileInputRef} id="doc-file" type="file" onChange={handleFileChange} className="hidden" />
            </div>
            {file && <div className="col-span-4 flex items-center justify-center gap-2 text-sm text-gray-600 bg-gray-100 p-2 rounded-md"><Paperclip className="h-4 w-4"/><span>{file.name}</span></div>}
             <DialogFooter className="mt-4"><DialogClose asChild><Button variant="ghost">Cancelar</Button></DialogClose><Button onClick={handleSave} disabled={isSaving}>{isSaving ? <Loader2 className="h-4 w-4 animate-spin"/> : <><Upload className="h-4 w-4 mr-2"/> Guardar</>}</Button></DialogFooter>
        </div>
    );
}

// ===================================
// --- COMPONENTES VISUALES ---
// ===================================

const SemaforoBadge = ({ status, esActivo }: { status: Contrato['estado_semaforo'], esActivo: boolean }) => {
    if (!esActivo) return <Tooltip><TooltipTrigger><div className="h-3 w-3 rounded-full border bg-gray-400 border-gray-500" /></TooltipTrigger><TooltipContent><p>Inactivo</p></TooltipContent></Tooltip>;
    const normalizedStatus = status === 'Próximo a Vencer' ? 'Por Vencer' : status;
    const colorClasses: { [key: string]: string } = { 'Por Vencer': "bg-yellow-400 border-yellow-500", 'Vencido': "bg-red-500 border-red-600", 'Vigente': "bg-green-500 border-green-600" };
    return (
        <Tooltip><TooltipTrigger><div className={`h-3 w-3 rounded-full border ${colorClasses[normalizedStatus]}`} /></TooltipTrigger><TooltipContent><p>{normalizedStatus}</p></TooltipContent></Tooltip>
    );
};

// ===================================
// --- COMPONENTE PRINCIPAL DE GESTIÓN ---
// ===================================
export const GestionDocumentos = ({ userId, userName }: { userId: string, userName: string }) => {
  const [documentos, setDocumentos] = useState<DocumentoMostrado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const [showAddChoice, setShowAddChoice] = useState(false);
  const [showContractForm, setShowContractForm] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingContract, setEditingContract] = useState<Contrato | null>(null);
  const [deletingItem, setDeletingItem] = useState<DocumentoMostrado | null>(null);
  const [viewingDoc, setViewingDoc] = useState<{url: string, title: string} | null>(null);

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
        const { data: cData, error: cError } = await supabase.from('contratos_con_semaforo').select('*').eq('user_id', userId);
        if (cError) throw cError;

        const { data: aData, error: aError } = await supabase.from('documentos_empleados').select('*').eq('user_id', userId);
        if (aError) throw aError;

        const cFormateados: DocumentoMostrado[] = cData.map(c => ({ id: `c-${c.id}`, tipo: 'Contrato', nombre: c.puesto, tipo_especifico: c.tipo_contrato, fecha_creacion: c.fecha_inicio, es_activo: c.es_activo, estado_semaforo: c.estado_semaforo, metadata: c as Contrato }));
        const aFormateados: DocumentoMostrado[] = aData.map(d => ({ id: `d-${d.id}`, tipo: 'Archivo', nombre: d.nombre_documento, tipo_especifico: d.tipo_documento, fecha_creacion: d.subido_en, metadata: d as Documento }));
        setDocumentos([...cFormateados, ...aFormateados].sort((a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime()));
    } catch (err: any) { setError(`No se pudieron cargar los datos: ${err.message}`); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [userId]);

  const handleSave = () => { setShowContractForm(false); setShowUploadForm(false); setEditingContract(null); fetchData(); };
  
  const handleViewDocument = async (doc: DocumentoMostrado) => {
    if (doc.tipo !== 'Archivo') return;
    const metadata = doc.metadata as Documento;

    try {
        const { data, error } = await supabase.storage
            .from('documentos_empleados')
            .createSignedUrl(metadata.path_almacenamiento, 300); // URL válida por 5 minutos

        if (error) throw error;

        setViewingDoc({ url: data.signedUrl, title: doc.nombre });

    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "❌ No se pudo mostrar el archivo",
            description: error.message,
        });
    }
  };
  
  const handleDelete = async () => {
    if (!deletingItem) return;
    const { tipo, metadata } = deletingItem;
    try {
        if (tipo === 'Contrato') {
            const { error } = await supabase.from('contratos').delete().eq('id', (metadata as Contrato).id);
            if (error) throw error;
        } else { 
            const doc = metadata as Documento;
            const { error: storageError } = await supabase.storage.from('documentos_empleados').remove([doc.path_almacenamiento]);
            if (storageError && storageError.message !== 'The resource was not found') throw storageError;

            const { error: dbError } = await supabase.from('documentos_empleados').delete().eq('id', doc.id);
            if (dbError) throw dbError;
        }
        toast({ title: `🗑️ ${tipo} eliminado con éxito` });
        fetchData();
    } catch (error: any) { toast({ variant: "destructive", title: `❌ Error al eliminar el ${tipo}`, description: error.message });
    } finally { setDeletingItem(null); }
  };
  
  return (
    <TooltipProvider>
     <div className="p-4 bg-slate-50/50 rounded-lg border">
        <div className="flex justify-between items-center mb-4"><h4 className="text-base font-semibold text-gray-700 flex items-center gap-2"><FileText className="h-5 w-5 text-gray-500" />Documentos de {userName}</h4><Button size="sm" variant="outline" onClick={() => setShowAddChoice(true)}><PlusCircle className="h-4 w-4 mr-2"/>Añadir Documento</Button></div>
        {loading && <div className="flex items-center justify-center py-6"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}
        {error && <div className="text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
        {!loading && !error && (
            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader><TableRow>
                        <TableHead className="w-12 text-center">Estado</TableHead>
                        <TableHead>Nombre / Puesto</TableHead>
                        <TableHead className="w-[180px]">Tipo</TableHead>
                        <TableHead className="w-[150px]">Fecha</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                        {documentos.map(doc => (
                            <TableRow key={doc.id} className={doc.tipo === 'Contrato' && doc.es_activo ? 'bg-blue-50/60' : ''}>
                                <TableCell className="text-center">
                                    {doc.tipo === 'Contrato' ? (
                                        <Tooltip><TooltipTrigger asChild>
                                            <button onClick={() => { setEditingContract(doc.metadata as Contrato); setShowContractForm(true); }} className="mx-auto flex items-center justify-center">
                                                <SemaforoBadge status={doc.estado_semaforo!} esActivo={doc.es_activo!} />
                                            </button>
                                        </TooltipTrigger><TooltipContent>Editar Contrato</TooltipContent></Tooltip>
                                    ) : (
                                        <Tooltip><TooltipTrigger asChild>
                                            <button onClick={() => handleViewDocument(doc)} className="mx-auto flex items-center justify-center">
                                                <Eye className="h-5 w-5 text-gray-500"/>
                                            </button>
                                        </TooltipTrigger><TooltipContent>Ver Documento</TooltipContent></Tooltip>
                                    )}
                                </TableCell>
                                <TableCell className="font-medium">{doc.nombre}</TableCell>
                                <TableCell className="text-muted-foreground">{doc.tipo === 'Contrato' ? 'Contrato' : doc.tipo_especifico}</TableCell>
                                <TableCell className="text-muted-foreground">{format(parseISO(doc.fecha_creacion), 'dd/MM/yyyy')}</TableCell>
                                <TableCell className="text-right">
                                    {doc.tipo === 'Contrato' && (<Button variant="ghost" size="icon" onClick={() => { setEditingContract(doc.metadata as Contrato); setShowContractForm(true); }}><Tooltip><TooltipTrigger asChild><Edit className="h-4 w-4"/></TooltipTrigger><TooltipContent>Editar Contrato</TooltipContent></Tooltip></Button>)}
                                    <Button variant="ghost" size="icon" onClick={() => setDeletingItem(doc)}><Tooltip><TooltipTrigger asChild><Trash2 className="h-4 w-4 text-red-500"/></TooltipTrigger><TooltipContent>Eliminar {doc.tipo}</TooltipContent></Tooltip></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                         {documentos.length === 0 && <TableRow><TableCell colSpan={5} className="text-center h-24 text-muted-foreground">Aún no hay documentos para este empleado.</TableCell></TableRow>}
                    </TableBody>
                </Table>
            </div>
        )}

        {/* --- Modales --- */}
        <Dialog open={showAddChoice} onOpenChange={setShowAddChoice}><DialogContent className="sm:max-w-[425px]"><DialogHeader><DialogTitle>¿Qué deseas añadir?</DialogTitle></DialogHeader><div className="grid grid-cols-2 gap-4 py-4"><Button variant="outline" size="lg" onClick={() => { setShowAddChoice(false); setEditingContract(null); setShowContractForm(true); }}>Contrato</Button><Button variant="outline" size="lg" onClick={() => { setShowAddChoice(false); setShowUploadForm(true); }}>Archivo General</Button></div></DialogContent></Dialog>
        <Dialog open={showContractForm} onOpenChange={setShowContractForm}><DialogContent className="sm:max-w-[525px]"><DialogHeader><DialogTitle>{editingContract ? 'Editar' : 'Nuevo'} Contrato para {userName}</DialogTitle></DialogHeader><FormularioContrato userId={userId} onSave={handleSave} initialData={editingContract} /></DialogContent></Dialog>
        <Dialog open={showUploadForm} onOpenChange={setShowUploadForm}><DialogContent className="sm:max-w-2xl"><DialogHeader><DialogTitle>Subir Nuevo Archivo</DialogTitle></DialogHeader><FormularioArchivo userId={userId} onSave={handleSave} /></DialogContent></Dialog>
        <AlertDialog open={!!deletingItem} onOpenChange={() => setDeletingItem(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>¿Estás seguro?</AlertDialogTitle><AlertDialogDescription>Esta acción es permanente y no se puede deshacer.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete}>Sí, eliminar</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>

        {/* --- Visor de Documentos Modal --- */}
        <Dialog open={!!viewingDoc} onOpenChange={(isOpen) => { if (!isOpen) { setViewingDoc(null); } }}>
            <DialogContent className="max-w-[90vw] h-[90vh] flex flex-col p-0 gap-0 [&>button]:hidden">
                <DialogHeader className="p-4 bg-[#3EA0C7] rounded-t-lg flex justify-center items-center relative">
                    <DialogTitle className="text-white text-2xl">{viewingDoc?.title}</DialogTitle>
                    <DialogClose asChild className="absolute right-4 top-1/2 -translate-y-1/2">
                        <Button variant="ghost" size="icon" className="rounded-full text-white/70 hover:bg-white/20 hover:text-white">
                            <X className="h-6 w-6" />
                        </Button>
                    </DialogClose>
                </DialogHeader>
                <div className="flex-1 w-full h-full bg-gray-100">
                    <iframe src={viewingDoc?.url} className="w-full h-full border-0" />
                </div>
            </DialogContent>
        </Dialog>

    </div>
    </TooltipProvider>
  );
}
