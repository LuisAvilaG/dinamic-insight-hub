import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, LogIn, Zap } from "lucide-react";
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
      
      // Usar el cliente de Supabase correctamente
      const { data, error } = await supabase
        .from('Cuentas')
        .select('*')
        .eq('Correo', email)
        .eq('Contraseña', password)
        .single();

      if (error) {
        console.error('Error de Supabase:', error);
        toast({
          title: "Error de autenticación",
          description: "Email o contraseña incorrectos",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (!data) {
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
      console.log('Datos del usuario:', data);
      
      toast({
        title: "¡Bienvenido a Dinamic Software!",
        description: `Acceso autorizado como ${data.Rol || 'Usuario'}`,
      });
      
      onLogin(email, data.Rol || 'Usuario', remember);
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
    <div className="min-h-screen flex items-center justify-center p-4 pattern-dinamic bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <div className="absolute inset-0 pattern-dinamic opacity-50"></div>
      
      <Card className="w-full max-w-md shadow-dinamic border-0 bg-card/95 backdrop-blur-sm relative z-10">
        <CardHeader className="text-center space-y-6 pb-8">
          {/* Logo de Dinamic Software */}
          <div className="mx-auto w-24 h-24 dinamic-icon flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-accent-purple opacity-90"></div>
            <div className="relative z-10 flex items-center justify-center">
              <Zap className="w-12 h-12 text-white" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/20"></div>
          </div>
          
          <div className="space-y-3">
            <CardTitle className="text-3xl font-bold dinamic-logo">
              DINAMIC
            </CardTitle>
            <div className="text-lg font-semibold text-primary">
              SOFTWARE
            </div>
            <CardDescription className="text-muted-foreground text-base">
              Generamos innovación, buscamos crecimiento
            </CardDescription>
            <div className="text-sm text-muted-foreground/80">
              Business Intelligence Platform
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu.email@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 border-2 focus:border-primary transition-smooth"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 pr-12 border-2 focus:border-primary transition-smooth"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-12 w-12 hover:bg-transparent"
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
              
              <Button variant="link" className="p-0 h-auto text-primary hover:text-secondary transition-smooth">
                ¿Olvidaste tu contraseña?
              </Button>
            </div>
            
            <Button
              type="submit"
              className="w-full h-12 btn-dinamic text-lg font-semibold"
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
          
          <div className="text-center text-xs text-muted-foreground">
            © 2024 Dinamic Software. Todos los derechos reservados.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};