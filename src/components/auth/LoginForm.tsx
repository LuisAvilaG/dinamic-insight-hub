import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, LogIn } from "lucide-react";
import dinamicLogo from "/lovable-uploads/9b828b6e-2c36-4919-b6e0-7ef42a97c137.png";
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
    <div className="min-h-screen stripe-section bg-background">
      <div className="stripe-container">
        <div className="stripe-two-col min-h-screen">
          {/* Left side - Hero content */}
          <div className="flex flex-col justify-center space-y-8 py-12">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <img 
                  src="/lovable-uploads/9b828b6e-2c36-4919-b6e0-7ef42a97c137.png" 
                  alt="Dinamic Software" 
                  className="w-12 h-12 object-contain"
                />
                <span className="stripe-logo-text text-2xl font-bold">
                  Dinamic Software
                </span>
              </div>
              <div className="space-y-4">
                <h1 className="stripe-heading-xl text-foreground">
                  Unified, global Business Intelligence to grow your revenue
                </h1>
                <p className="stripe-text-lg max-w-lg">
                  Tu plataforma integral para la toma de decisiones inteligentes. 
                  Generamos innovación, buscamos crecimiento con tecnología de vanguardia.
                </p>
              </div>
            </div>
            
            {/* Feature highlights */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm text-muted-foreground">
                  Reportes en tiempo real y análisis avanzado
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm text-muted-foreground">
                  Dashboard intuitivo y fácil de usar
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm text-muted-foreground">
                  Integración completa entre departamentos
                </span>
              </div>
            </div>
          </div>

          {/* Right side - Login form */}
          <div className="flex flex-col justify-center py-12">
            <div className="max-w-sm mx-auto w-full space-y-6">
              <div className="text-center space-y-2">
                <h2 className="stripe-heading-lg text-foreground">
                  Iniciar sesión
                </h2>
                <p className="text-muted-foreground">
                  Accede a tu cuenta para continuar
                </p>
              </div>

              <Card className="stripe-card p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-foreground">
                      Correo electrónico
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="stripe-input w-full"
                      placeholder="tu@ejemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-foreground">
                      Contraseña
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        className="stripe-input w-full pr-10"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={remember}
                        onCheckedChange={(checked) => setRemember(checked as boolean)}
                      />
                      <label htmlFor="remember" className="text-muted-foreground">
                        Recordarme
                      </label>
                    </div>
                    <button type="button" className="text-primary hover:text-primary/80">
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="stripe-btn-primary w-full stripe-hover-lift"
                  >
                    {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
                  </button>
                </form>
              </Card>
              
              <div className="text-center text-xs text-muted-foreground">
                © 2024 Dinamic Software. Todos los derechos reservados.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};