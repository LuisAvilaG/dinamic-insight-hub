import { useMemo, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Shield, Loader2 } from "lucide-react";

// ======= TYPE DEFINITIONS =======
type UserRow = Database["public"]["Tables"]["Cuentas"]["Row"];

interface CreateUserForm {
  email: string;
  nombre: string | null;
  rol: string | null;
  estado: string | null;
}

// ======= REACT QUERY HOOKS (DATA LOGIC) =======

const fetchUsers = async () => {
  const { data, error } = await supabase
    .from("Cuentas")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
};

const useUsersQuery = () => useQuery<UserRow[], Error>({ 
  queryKey: ['users'], 
  queryFn: fetchUsers 
});

const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation<UserRow, Error, Partial<UserRow>>({
    mutationFn: async (userData) => {
      const { error, data } = await supabase
        .from('Cuentas')
        .update({ Nombre: userData.Nombre, Rol: userData.Rol, Estado: userData.Estado })
        .eq('Correo', userData.Correo!)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ title: "Éxito", description: "Usuario actualizado correctamente." });
    },
    onError: (error) => {
      toast({ title: "Error al actualizar", description: error.message, variant: "destructive" });
    },
  });
};

const useCreateUserMutation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<null, Error, CreateUserForm>({
    mutationFn: async ({ email, nombre, rol, estado }) => {
      const { error } = await supabase.functions.invoke('create-user', {
        body: { email, nombre, rol, estado },
      });
      if (error) throw new Error(error.message);
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ title: "Éxito", description: "El usuario fue creado y recibirá una invitación por correo." });
    },
    onError: (error) => {
      toast({ title: "Error al crear", description: error.message, variant: "destructive" });
    },
  });
};

const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<null, Error, { email: string | null }>({
    mutationFn: async ({ email }) => {
      const { error } = await supabase.from('Cuentas').delete().eq('Correo', email!);
      if (error) throw new Error(error.message);
      return null;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ title: "Éxito", description: `Usuario ${vars.email} eliminado.` });
    },
    onError: (error, vars) => {
      toast({ title: "Error al eliminar", description: `No se pudo eliminar a ${vars.email}: ${error.message}`, variant: "destructive" });
    },
  });
};

// ======= DIALOG FORM SUB-COMPONENT =======
interface UserFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserRow | null;
  createUser: ReturnType<typeof useCreateUserMutation>;
  updateUser: ReturnType<typeof useUpdateUserMutation>;
}

const UserFormDialog = ({ isOpen, onClose, user, createUser, updateUser }: UserFormDialogProps) => {
  const [formState, setFormState] = useState<Partial<UserRow>>({});

  useEffect(() => {
    if (isOpen) {
      setFormState(user ? user : { Correo: '', Nombre: '', Rol: 'Usuario', Estado: 'activo' });
    }
  }, [isOpen, user]);

  const handleChange = (field: keyof Partial<UserRow>, value: string) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      updateUser.mutate(
        { ...formState, Correo: user.Correo }, 
        { onSuccess: onClose }
      );
    } else {
      createUser.mutate(
        { email: formState.Correo || '', nombre: formState.Nombre, rol: formState.Rol, estado: formState.Estado },
        { onSuccess: onClose }
      );
    }
  };

  const isMutating = createUser.isPending || updateUser.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent onInteractOutside={(e) => {if(isMutating) e.preventDefault()}}>
        <DialogHeader>
          <DialogTitle>{user ? "Editar Usuario" : "Crear Nuevo Usuario"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" value={formState.Nombre || ''} onChange={e => handleChange('Nombre', e.target.value)} disabled={isMutating} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input id="email" type="email" value={formState.Correo || ''} onChange={e => handleChange('Correo', e.target.value)} disabled={!!user || isMutating} required />
          </div>
          {!user && <p className="text-sm text-muted-foreground">El usuario recibirá una invitación para establecer una contraseña.</p>}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rol">Rol</Label>
              <Select value={formState.Rol || 'Usuario'} onValueChange={value => handleChange('Rol', value)} disabled={isMutating}>
                <SelectTrigger id="rol"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Administrador</SelectItem>
                  <SelectItem value="Usuario">Usuario</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select value={formState.Estado || 'activo'} onValueChange={value => handleChange('Estado', value)} disabled={isMutating}>
                <SelectTrigger id="estado"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isMutating}>Cancelar</Button>
            <Button type="submit" disabled={isMutating}>
              {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {user ? "Guardar Cambios" : "Crear Usuario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};


// ======= MAIN PAGE COMPONENT =======

export default function UsersAdmin() {
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);

  const { data: users = [], isLoading, isError, error } = useUsersQuery();
  const updateUser = useUpdateUserMutation();
  const createUser = useCreateUserMutation();
  const deleteUser = useDeleteUserMutation();
  
  useEffect(() => {
    document.title = "Gestión de Usuarios | Dinamic";
  }, []);

  const filteredUsers = useMemo(() => {
    if (!search) return users;
    const q = search.toLowerCase();
    return users.filter(user =>
      Object.values(user).some(val => String(val).toLowerCase().includes(q))
    );
  }, [users, search]);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (user: UserRow) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const handleDelete = (user: UserRow) => {
    if (confirm(`¿Seguro que quieres eliminar a ${user.Correo}?`)) {
      deleteUser.mutate({ email: user.Correo });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
          <p className="text-sm text-muted-foreground">Crea, edita y administra las cuentas de usuario.</p>
        </div>
        <Button onClick={handleOpenCreate}><Plus className="mr-2 h-4 w-4" /> Agregar Usuario</Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Usuarios del Sistema</CardTitle>
          <Input placeholder="Buscar..." className="w-full max-w-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Último Acceso</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={6} className="text-center h-24">Cargando...</TableCell></TableRow>
                ) : isError ? (
                  <TableRow><TableCell colSpan={6} className="text-center h-24 text-destructive">{`Error: ${error.message}`}</TableCell></TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center h-24">No se encontraron usuarios.</TableCell></TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.Correo}>
                      <TableCell className="font-medium">{user.Nombre || "—"}</TableCell>
                      <TableCell>{user.Correo}</TableCell>
                      <TableCell>{user.Rol || "-"}</TableCell>
                      <TableCell><span className={`px-2 py-1 rounded-full text-xs font-medium ${user.Estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{user.Estado}</span></TableCell>
                      <TableCell>{user.UltimoAcceso ? new Date(user.UltimoAcceso).toLocaleDateString() : "Nunca"}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(user)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(user)} disabled={deleteUser.isPending && deleteUser.variables?.email === user.Correo} className="text-destructive hover:text-destructive">
                          {deleteUser.isPending && deleteUser.variables?.email === user.Correo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <UserFormDialog 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        user={editingUser}
        createUser={createUser}
        updateUser={updateUser}
      />
    </div>
  );
}
