
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { LogIn, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const formSchema = z.object({
  email: z.string().email({ message: "Por favor, introduce un email válido." }),
  password: z.string().min(1, { message: "La contraseña no puede estar vacía." }),
  remember: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

export const LoginForm = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const handleSubmit = async (values: FormData) => {
    setIsLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (signInError) {
        throw new Error(signInError.message.includes("Invalid login credentials") 
          ? "Email o contraseña incorrectos." 
          : "Error al iniciar sesión.");
      }
      
      toast({
        title: "¡Bienvenido de nuevo!",
        description: "Has iniciado sesión correctamente.",
      });

    } catch (error: any) {
      toast({
        title: "Error de inicio de sesión",
        description: error.message || "No se pudo conectar con el servidor.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <div 
      className="flex h-screen w-full items-center justify-start bg-cover bg-center px-4 md:px-20 lg:px-96"
      style={{ backgroundImage: "url('/login-background.png')" }}
    >
      <Card className="w-full max-w-md bg-black/35 backdrop-blur-lg border border-white/20 rounded-xl shadow-2xl text-white">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 h-16 flex justify-center">
            <img src="/logo-dinamic-software.png" alt="Dinamic Software Logo" className="h-full w-auto object-contain" />
          </div>
          <CardTitle className="text-2xl text-white [text-shadow:0_1px_4px_rgb(0_0_0_/_0.5)]">Bienvenido</CardTitle>
          <CardDescription className="text-gray-200 [text-shadow:0_1px_2px_rgb(0_0_0_/_0.5)]">Dinamic Business Intelligence Platform</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="email" className="text-gray-200 font-medium [text-shadow:0_1px_2px_rgb(0_0_0_/_0.4)]">Email</Label>
                    <FormControl>
                      <Input id="email" type="email" placeholder="tu.email@empresa.com" {...field} className="bg-black/30 border-white/30 text-white placeholder:text-gray-300 focus:ring-sky-500 focus:border-sky-500" />
                    </FormControl>
                    <FormMessage className="[text-shadow:none]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="password" className="text-gray-200 font-medium [text-shadow:0_1px_2px_rgb(0_0_0_/_0.4)]">Contraseña</Label>
                    <FormControl>
                      <Input id="password" type="password" placeholder="********" {...field} className="bg-black/30 border-white/30 text-white placeholder:text-gray-300 focus:ring-sky-500 focus:border-sky-500" />
                    </FormControl>
                    <FormMessage className="[text-shadow:none]"/>
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between">
                <FormField
                  control={form.control}
                  name="remember"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox id="remember" checked={field.value} onCheckedChange={field.onChange} className="border-gray-300 data-[state=checked]:bg-sky-500 data-[state=checked]:text-white" />
                      </FormControl>
                      <Label htmlFor="remember" className="font-normal text-gray-200 [text-shadow:0_1px_2px_rgb(0_0_0_/_0.4)]">Recordarme</Label>
                    </FormItem>
                  )}
                />
                <a href="#" className="text-sm text-sky-400 hover:text-sky-300 hover:underline [text-shadow:0_1px_2px_rgb(0_0_0_/_0.4)]">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <Button type="submit" className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <LogIn className="mr-2 h-5 w-5" />
                )}
                Iniciar Sesión
              </Button>
            </form>
          </Form>
          
          <div className="mt-6 text-center text-xs text-gray-300 [text-shadow:0_1px_2px_rgb(0_0_0_/_0.5)]">
            © 2025 Dinamic Software. Todos los derechos reservados.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
