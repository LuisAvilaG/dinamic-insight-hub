
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Edit, Loader2, UserPlus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AsignarLider } from "@/components/admin/AsignarLider";

type Empleado = {
  user_id: string;
  Nombre: string;
  Email: string;
  Rol: string;
  RolEmpresa?: string;
};
type FormValues = { email: string; nombre: string; };
type EditFormValues = { Rol: string; RolEmpresa: string; };

export const GestionRecursosHumanosPage = () => {
  const { toast } = useToast();
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmpleado, setSelectedEmpleado] = useState<Empleado | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { register: registerCreate, handleSubmit: handleSubmitCreate, formState: { errors: errorsCreate, isSubmitting: isSubmittingCreate } } = useForm<FormValues>();
  const { register: registerEdit, handleSubmit: handleSubmitEdit, setValue, formState: { isSubmitting: isSubmittingEdit } } = useForm<EditFormValues>();
  
  const fetchEmpleados = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("Cuentas").select("user_id, Nombre, Email, Rol, RolEmpresa");
    if (error) {
      toast({ title: "Error", description: "No se pudieron cargar los empleados.", variant: "destructive" });
    } else {
      setEmpleados(data as Empleado[]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchEmpleados(); }, []);

  const handleCreateUser = async (formData: FormValues) => {
    const { data, error } = await supabase.functions.invoke('create-user', { body: { email: formData.email, name: formData.nombre } });
    if (error) {
      toast({ title: "Error al crear usuario", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Éxito", description: "Usuario creado. Se ha enviado un correo de invitación." });
      fetchEmpleados();
    }
  };

  const handleEditUser = (empleado: Empleado) => {
    setSelectedEmpleado(empleado);
    setValue("Rol", empleado.Rol);
    setValue("RolEmpresa", empleado.RolEmpresa || '');
    setIsEditModalOpen(true);
  };

  const onUpdateUser = async (formData: EditFormValues) => {
    if (!selectedEmpleado) return;
    const { error } = await supabase
      .from("Cuentas")
      .update({ Rol: formData.Rol, RolEmpresa: formData.RolEmpresa })
      .eq("user_id", selectedEmpleado.user_id);
      
    if (error) {
      toast({ title: "Error al actualizar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Éxito", description: "Usuario actualizado." });
      setIsEditModalOpen(false);
      fetchEmpleados();
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold flex items-center"><Users className="mr-3"/>Gestión de Equipo</h1>
                <p className="text-muted-foreground">Administra los roles y la estructura de tu equipo.</p>
            </div>
            <Dialog>
                <DialogTrigger asChild><Button><UserPlus className="mr-2 h-4 w-4" />Invitar Usuario</Button></DialogTrigger>
                <DialogContent>
                    <DialogHeader><DialogTitle>Invitar Nuevo Usuario</DialogTitle></DialogHeader>
                    <form onSubmit={handleSubmitCreate(handleCreateUser)} className="space-y-4">
                        <div>
                            <Label htmlFor="nombre">Nombre Completo</Label>
                            <Input id="nombre" {...registerCreate("nombre", { required: "El nombre es obligatorio" })} />
                            {errorsCreate.nombre && <p className="text-red-500 text-sm mt-1">{errorsCreate.nombre.message}</p>}
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" {...registerCreate("email", { required: "El email es obligatorio" })} />
                             {errorsCreate.email && <p className="text-red-500 text-sm mt-1">{errorsCreate.email.message}</p>}
                        </div>
                        <Button type="submit" disabled={isSubmittingCreate}>{isSubmittingCreate && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Invitar Usuario</Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Lista de Empleados</CardTitle></CardHeader>
            <CardContent>
            {loading ? <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div> :
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Rol del Sistema</TableHead>
                  <TableHead>Rol en la Empresa</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {empleados.map((emp) => (
                  <TableRow key={emp.user_id}>
                    <TableCell className="font-medium">{emp.Nombre}</TableCell>
                    <TableCell>{emp.Rol}</TableCell>
                    <TableCell className="text-muted-foreground">{emp.RolEmpresa || 'No asignado'}</TableCell>
                    <TableCell className="text-right">
                        <Button variant="outline" size="icon" onClick={() => handleEditUser(emp)}><Edit className="h-4 w-4"/></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>}
            </CardContent>
        </Card>

        <AsignarLider empleados={empleados} onLiderAsignado={fetchEmpleados}/>
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent>
              <DialogHeader><DialogTitle>Editar Rol de {selectedEmpleado?.Nombre}</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmitEdit(onUpdateUser)} className="space-y-4">
                <div>
                    <Label htmlFor="rol-sistema">Rol del Sistema</Label>
                    <Input id="rol-sistema" {...registerEdit("Rol")} />
                </div>
                <div>
                    <Label htmlFor="rol-empresa">Rol en la Empresa</Label>
                    <Input id="rol-empresa" placeholder="Ej. Desarrollador Frontend" {...registerEdit("RolEmpresa")} />
                </div>
                <Button type="submit" disabled={isSubmittingEdit}>{isSubmittingEdit && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Actualizar Rol</Button>
              </form>
          </DialogContent>
      </Dialog>
    </div>
  );
};
