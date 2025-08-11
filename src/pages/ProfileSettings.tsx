import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save, User } from "lucide-react";

interface Cuenta {
  Correo: string;
  Nombre: string | null;
  Rol: string | null;
  Estado: string;
  UltimoAcceso: string | null;
  avatar_url: string | null;
  departamento: string | null;
  Password?: string; // sólo para lectura/validación
}

const departamentos = [
  "Operativo",
  "Financiero",
  "Consultoría",
  "Directivo",
  "Dinamic",
];

export default function ProfileSettings() {
  const { toast } = useToast();
  const [email] = useState<string | null>(() => localStorage.getItem("dinamic_user_email"));
  const [cuenta, setCuenta] = useState<Cuenta | null>(null);
  const [nombre, setNombre] = useState("");
  const [departamento, setDepartamento] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) return;
    (async () => {
      const { data, error } = await (supabase as any)
        .from("Cuentas")
        .select("Correo, Nombre, Rol, Estado, UltimoAcceso, avatar_url, departamento")
        .eq("Correo", email)
        .maybeSingle();
      if (error) {
        console.error(error);
        toast({ title: "Error", description: "No se pudo cargar tu perfil", variant: "destructive" });
        return;
      }
      if (data) {
        setCuenta(data);
        setNombre(data.Nombre ?? "");
        setDepartamento(data.departamento ?? "");
        setAvatarUrl(data.avatar_url ?? "");
      }
    })();
  }, [email, toast]);

  const saveProfile = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const updates: Partial<Cuenta> = {
        Nombre: nombre,
        departamento: departamento || null,
        avatar_url: avatarUrl || null,
      };
      const { error } = await (supabase as any)
        .from("Cuentas")
        .update(updates)
        .eq("Correo", email);
      if (error) throw error;
      toast({ title: "Perfil actualizado", description: "Se guardaron tus cambios" });
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "No se pudieron guardar los cambios", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (!email) return;
    if (!currentPass || !newPass || !confirmPass) {
      toast({ title: "Completa los campos", description: "Ingresa tu contraseña actual y la nueva", variant: "destructive" });
      return;
    }
    if (newPass !== confirmPass) {
      toast({ title: "Contraseñas no coinciden", description: "Verifica la nueva contraseña" , variant: "destructive"});
      return;
    }
    // Validar contraseña actual
    const { data, error } = await (supabase as any)
      .from("Cuentas")
      .select("Password")
      .eq("Correo", email)
      .maybeSingle();
    if (error || !data) {
      toast({ title: "Error", description: "No se pudo validar la contraseña", variant: "destructive" });
      return;
    }
    if (data.Password !== currentPass) {
      toast({ title: "Contraseña actual incorrecta", description: "Vuelve a intentarlo", variant: "destructive" });
      return;
    }
    const { error: updErr } = await (supabase as any)
      .from("Cuentas")
      .update({ Password: newPass })
      .eq("Correo", email);
    if (updErr) {
      toast({ title: "Error", description: "No se pudo actualizar la contraseña", variant: "destructive" });
      return;
    }
    setCurrentPass("");
    setNewPass("");
    setConfirmPass("");
    toast({ title: "Contraseña actualizada" });
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Configuración de Perfil</CardTitle>
          <CardDescription>Actualiza tu información personal</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="flex flex-col items-center gap-3">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarUrl || undefined} />
              <AvatarFallback>DS</AvatarFallback>
            </Avatar>
            <div className="w-full">
              <Label htmlFor="avatar">URL de foto de perfil</Label>
              <Input id="avatar" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." />
            </div>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre" />
            </div>
            <div>
              <Label htmlFor="correo">Email</Label>
              <Input id="correo" value={email || ""} disabled />
            </div>
            <div>
              <Label>Departamento</Label>
              <Select value={departamento || ""} onValueChange={(v) => setDepartamento(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un departamento" />
                </SelectTrigger>
                <SelectContent>
                  {departamentos.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Rol</Label>
              <Input value={cuenta?.Rol || "Usuario"} disabled />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <Button onClick={saveProfile} disabled={loading} className="gap-2">
                <Save className="h-4 w-4" /> Guardar cambios
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Cambiar contraseña</CardTitle>
          <CardDescription>Actualiza tu contraseña de acceso</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Contraseña actual</Label>
            <Input type="password" value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} />
          </div>
          <div>
            <Label>Nueva contraseña</Label>
            <Input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} />
          </div>
          <div>
            <Label>Confirmar nueva contraseña</Label>
            <Input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} />
          </div>
          <div className="md:col-span-3 flex justify-end">
            <Button variant="secondary" onClick={changePassword}>Actualizar contraseña</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
