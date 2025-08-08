import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, LogIn } from "lucide-react";
import dinamicLogo from "@/assets/dinamic-logo.png";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
      
      // Verificar credenciales directamente
      if (email === 'admin@dinamic.com' && password === '123') {
        toast({
          title: "¡Bienvenido a Dinamic Software!",
          description: "Acceso autorizado como Admin",
        });
        onLogin(email, 'Admin', remember);
        return;
      }
      
      // Si no es el admin, buscar en la base de datos
      const { data, error } = await (supabase as any)
        .from('Cuentas')
        .select('Correo, Password, Rol')
        .eq('Correo', email)
        .eq('Password', password);

      if (error) {
        console.error('Error de Supabase:', error);
        toast({
          title: "Error de autenticación",
          description: "Email o contraseña incorrectos",
          variant: "destructive",
        });
        return;
      }

      if (!data || data.length === 0) {
        console.log('Sin datos encontrados');
        toast({
          title: "Error de autenticación",
          description: "Email o contraseña incorrectos",
          variant: "destructive",
        });
        return;
      }

      // Login exitoso
      const userData = data[0];
      console.log('Datos del usuario:', userData);
      
      toast({
        title: "¡Bienvenido a Dinamic Software!",
        description: `Acceso autorizado como ${userData.Rol || 'Usuario'}`,
      });
      
      onLogin(email, userData.Rol || 'Usuario', remember);
    } catch (error) {
      console.error('Error en login:', error);
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor. Verifica tu conexión.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pattern-fluid bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/50">
      <div className="absolute inset-0 pattern-mesh-subtle"></div>
      
      <Card className="w-full max-w-md shadow-xl border-0 card-glass relative z-10">
        <CardHeader className="text-center space-y-6 pb-8">
          <div className="mx-auto w-40 h-20 flex items-center justify-center">
            <img 
              src="/lovable-uploads/9b828b6e-2c36-4919-b6e0-7ef42a97c137.png" 
              alt="Dinamic Software" 
              className="w-full h-full object-contain"
            />
          </div>
          
          <div className="space-y-3">
            <CardTitle className="text-3xl font-black logo-stripe">
              DINAMIC
            </CardTitle>
            <div className="text-lg font-bold text-indigo-600">
              SOFTWARE
            </div>
            <CardDescription className="text-slate-600 text-base">
              Generamos innovación, buscamos crecimiento
            </CardDescription>
            <div className="text-sm text-slate-500">
              Business Intelligence Platform
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu.email@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 input-stripe text-base"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-slate-700">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 pr-12 input-stripe text-base"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-12 w-12 hover:bg-transparent text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
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
                <Label htmlFor="remember" className="text-sm text-slate-600">
                  Recordarme
                </Label>
              </div>
              
              <Button variant="link" className="p-0 h-auto text-indigo-600 hover:text-indigo-800 transition-all">
                ¿Olvidaste tu contraseña?
              </Button>
            </div>
            
            <Button
              type="submit"
              className="w-full h-12 btn-gradient-stripe text-lg font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  <span>Iniciando sesión...</span>
                </div>
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" />
                  Iniciar Sesión
                </>
              )}
            </Button>
          </form>
          
          <div className="text-center text-xs text-slate-500">
            © 2024 Dinamic Software. Todos los derechos reservados.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};