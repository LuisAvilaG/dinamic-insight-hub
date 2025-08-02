import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LoginFormProps {
  onLogin: (email: string, role: string, remember: boolean) => void;
}

export const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log('Intentando login con:', { email, password });
      
      // Fetch directo a la API de Supabase
      const response = await fetch(
        `https://rytfakmpznrithljllyl.supabase.co/rest/v1/Cuentas?Correo=eq.${email}&Password=eq.${password}`,
        {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5dGZha21wem5yaXRobGpsbHlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNTI2MzYsImV4cCI6MjA2OTcyODYzNn0.fpbvpK8eIeOJayhuFDmm-KBWWDA6kekkOcM0DpwsVko',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5dGZha21wem5yaXRobGpsbHlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNTI2MzYsImV4cCI6MjA2OTcyODYzNn0.fpbvpK8eIeOJayhuFDmm-KBWWDA6kekkOcM0DpwsVko'
          }
        }
      );

      const data = await response.json();
      console.log('Respuesta de Supabase:', data);

      if (!data || data.length === 0) {
        console.log('Sin datos encontrados');
        toast({
          title: "Error de autenticación",
          description: "Email o contraseña incorrectos",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Login exitoso
      const userData = data[0];
      console.log('Datos del usuario:', userData);
      
      toast({
        title: "Bienvenido",
        description: `Acceso autorizado como ${userData.Rol || 'Usuario'}`,
      });
      
      onLogin(email, userData.Rol || 'Usuario', remember);
    } catch (error) {
      console.error('Error en login:', error);
      toast({
        title: "Error",
        description: "No se pudo conectar con el servidor",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary-light to-secondary p-4 pattern-geometric">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
            <div className="text-white text-2xl font-bold">DS</div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Dinamic Software
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Business Intelligence Platform
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu.email@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-11 w-11 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={remember}
                  onCheckedChange={(checked) => setRemember(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm">
                  Recordarme
                </Label>
              </div>
              
              <Button variant="link" className="p-0 h-auto text-primary hover:text-secondary">
                ¿Olvidaste tu contraseña?
              </Button>
            </div>
            
            <Button
              type="submit"
              className="w-full h-11 btn-gradient"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Iniciar Sesión
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};