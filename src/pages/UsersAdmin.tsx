import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Shield } from "lucide-react";

interface UserRow {
  Correo: string;
  Password: string;
  Rol: string | null;
  Nombre?: string | null;
  Estado?: string | null;
  UltimoAcceso?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export default function UsersAdmin() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);

  const [form, setForm] = useState<UserRow>({
    Correo: "",
    Password: "",
    Rol: "Usuario",
    Nombre: "",
    Estado: "activo",
  });

  useEffect(() => {
    document.title = "Gestión de Usuarios | Dinamic";
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("Cuentas")
      .select("Correo, Password, Rol, Nombre, Estado, UltimoAcceso, created_at, updated_at")
      .order("Correo", { ascending: true });

    if (error) {
      toast({ title: "Error al cargar usuarios", description: error.message, variant: "destructive" });
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((u) =>
      [u.Nombre, u.Correo, u.Rol ?? "", u.Estado ?? ""].some((v) => (v || "").toLowerCase().includes(q))
    );
  }, [users, search]);

  const resetForm = () => {
    setForm({ Correo: "", Password: "", Rol: "Usuario", Nombre: "", Estado: "activo" });
    setEditing(null);
  };

  const openCreate = () => {
    resetForm();
    setOpen(true);
  };

  const openEdit = (row: UserRow) => {
    setEditing(row);
    setForm({
      Correo: row.Correo,
      Password: row.Password,
      Rol: row.Rol || "Usuario",
      Nombre: row.Nombre || "",
      Estado: row.Estado || "activo",
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.Correo || !form.Password) {
      toast({ title: "Datos incompletos", description: "Correo y contraseña son obligatorios", variant: "destructive" });
      return;
    }

    if (editing) {
      const { error } = await (supabase as any)
        .from("Cuentas")
        .update({
          Correo: form.Correo,
          Password: form.Password,
          Rol: form.Rol,
          Nombre: form.Nombre,
          Estado: form.Estado,
        })
        .eq("Correo", editing.Correo);

      if (error) {
        toast({ title: "Error al actualizar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Usuario actualizado" });
        setOpen(false);
        resetForm();
        fetchUsers();
      }
    } else {
      const { error } = await (supabase as any)
        .from("Cuentas")
        .insert({
          Correo: form.Correo,
          Password: form.Password,
          Rol: form.Rol,
          Nombre: form.Nombre,
          Estado: form.Estado,
        });

      if (error) {
        toast({ title: "Error al crear", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Usuario creado" });
        setOpen(false);
        resetForm();
        fetchUsers();
      }
    }
  };

  const handleDelete = async (row: UserRow) => {
    const confirmed = confirm(`¿Eliminar usuario ${row.Correo}?`);
    if (!confirmed) return;

    const { error } = await (supabase as any)
      .from("Cuentas")
      .delete()
      .eq("Correo", row.Correo);

    if (error) {
      toast({ title: "Error al eliminar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Usuario eliminado" });
      fetchUsers();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestión de Usuarios</h1>
          <p className="text-sm text-muted-foreground">Administra cuentas, roles y estados</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" /> Agregar Usuario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Editar usuario" : "Nuevo usuario"}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input value={form.Nombre || ""} onChange={(e) => setForm({ ...form, Nombre: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Correo</Label>
                <Input type="email" value={form.Correo} onChange={(e) => setForm({ ...form, Correo: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Contraseña</Label>
                <Input type="text" value={form.Password} onChange={(e) => setForm({ ...form, Password: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Rol</Label>
                <Select value={form.Rol || "Usuario"} onValueChange={(v) => setForm({ ...form, Rol: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Usuario">Usuario</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select value={form.Estado || "activo"} onValueChange={(v) => setForm({ ...form, Estado: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setOpen(false); resetForm(); }}>Cancelar</Button>
              <Button onClick={handleSubmit} className="bg-primary text-primary-foreground hover:bg-primary/90">Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border bg-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" /> Usuarios
          </CardTitle>
          <Input
            placeholder="Buscar por nombre, correo o rol..."
            className="w-full max-w-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
                  <TableHead>Último acceso</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!loading && filtered.map((u) => (
                  <TableRow key={u.Correo}>
                    <TableCell className="font-medium">{u.Nombre || "—"}</TableCell>
                    <TableCell>{u.Correo}</TableCell>
                    <TableCell>{u.Rol || "Usuario"}</TableCell>
                    <TableCell className={u.Estado === 'inactivo' ? 'text-destructive' : 'text-green-600'}>
                      {u.Estado || "activo"}
                    </TableCell>
                    <TableCell>{u.UltimoAcceso ? new Date(u.UltimoAcceso).toLocaleString() : "—"}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(u)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(u)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!loading && filtered.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No se encontraron usuarios
                    </TableCell>
                  </TableRow>
                )}
                {loading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Cargando...
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
