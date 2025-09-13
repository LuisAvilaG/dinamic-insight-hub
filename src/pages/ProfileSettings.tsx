import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save, User, KeyRound } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ProfileState {
  nombre: string;
  avatarUrl: string;
}

export default function ProfileSettings() {
  const { toast } = useToast();
  const { user, profile, updateProfile, loading: authLoading } = useAuth();

  const [formState, setFormState] = useState<ProfileState>({ nombre: '', avatarUrl: '' });
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormState({
        nombre: profile.nombre || "",
        avatarUrl: profile.avatar_url || "",
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormState(prevState => ({ ...prevState, [id]: value }));
  };

  const saveProfile = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const updates = {
        Nombre: formState.nombre,
        avatar_url: formState.avatarUrl || null,
      };

      // CORRECTED: Update query to use the 'Correo' column for matching the user.
      const { error } = await supabase
        .from('Cuentas')
        .update(updates)
        .eq('Correo', user.email);

      if (error) {
        console.error("Update Error:", error);
        throw new Error(`Error en la base de datos: ${error.message}`);
      }

      // Update the global AuthContext state to reflect changes immediately
      updateProfile({ nombre: updates.Nombre, avatar_url: updates.avatar_url });

      toast({ title: "Perfil actualizado", description: "Tus cambios se han guardado correctamente." });
    } catch (e: any) {
      toast({ title: "Error al actualizar", description: e.message || "No se pudieron guardar los cambios.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (!user) return;
    if (newPass !== confirmPass) {
      toast({ title: "Las contraseñas no coinciden", variant: "destructive" });
      return;
    }
    setPassLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPass });
      if (error) throw error;
      setNewPass("");
      setConfirmPass("");
      toast({ title: "Contraseña actualizada" });
    } catch (e: any) {
      toast({ title: "Error al cambiar la contraseña", description: e.message, variant: "destructive" });
    } finally {
      setPassLoading(false);
    }
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) return `${names[0][0]}${names[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Configuración de Perfil</CardTitle>
          <CardDescription>Actualiza tu información personal y foto de perfil.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
          <div className="flex flex-col items-center gap-4 pt-2">
            <Avatar className="h-28 w-28 border-2 border-primary/10">
              <AvatarImage src={formState.avatarUrl || undefined} />
              <AvatarFallback className="text-3xl bg-muted">{getInitials(formState.nombre)}</AvatarFallback>
            </Avatar>
            <div className="w-full text-center">
              <Label htmlFor="avatarUrl">URL de la imagen de perfil</Label>
              <Input id="avatarUrl" value={formState.avatarUrl} onChange={handleInputChange} placeholder="https://..." />
            </div>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="nombre">Nombre Completo</Label>
              <Input id="nombre" value={formState.nombre} onChange={handleInputChange} placeholder="Tu nombre" />
            </div>
            <div>
              <Label htmlFor="correo">Email (no se puede cambiar)</Label>
              <Input id="correo" value={user?.email || ""} disabled />
            </div>
            
            <div className="md:col-span-2 flex justify-end items-center gap-4">
               {authLoading && <p className='text-sm text-muted-foreground'>Cargando...</p>}
              <Button onClick={saveProfile} disabled={loading || authLoading} className="gap-2">
                {loading ? "Guardando..." : <><Save className="h-4 w-4" /> Guardar Cambios</>}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5 text-primary" /> Cambiar Contraseña</CardTitle>
          <CardDescription>Establece una nueva contraseña para acceder a tu cuenta.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label htmlFor="newPass">Nueva Contraseña</Label>
            <Input id="newPass" type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="confirmPass">Confirmar Nueva Contraseña</Label>
            <Input id="confirmPass" type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button variant="secondary" onClick={changePassword} disabled={passLoading}>
              {passLoading ? "Actualizando..." : "Actualizar Contraseña"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
