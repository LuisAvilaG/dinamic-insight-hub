import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format, differenceInBusinessDays, startOfDay } from "date-fns";
import { es } from 'date-fns/locale';
import { useToast } from "@/components/ui/use-toast";
import { useState } from 'react';

const formSchema = z.object({
  fecha_inicio: z.date({ required_error: "La fecha de inicio es obligatoria." }),
  fecha_fin: z.date({ required_error: "La fecha de fin es obligatoria." }),
}).refine(data => data.fecha_fin >= data.fecha_inicio, {
  message: "La fecha de fin no puede ser anterior a la de inicio.",
  path: ["fecha_fin"],
});

export const FormularioSolicitud = ({ onSolicitudCreada }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fecha_inicio: undefined,
      fecha_fin: undefined,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    setIsSubmitting(true);

    const fechaInicio = startOfDay(values.fecha_inicio);
    const fechaFin = startOfDay(values.fecha_fin);

    const dias_solicitados = differenceInBusinessDays(fechaFin, fechaInicio) + 1;

    try {
      const { error } = await supabase.from('vacaciones_solicitudes').insert({
        solicitante_user_id: user.id,
        fecha_inicio: format(fechaInicio, 'yyyy-MM-dd'),
        fecha_fin: format(fechaFin, 'yyyy-MM-dd'),
        dias_solicitados,
        estado: 'Pendiente',
      });

      if (error) throw error;

      toast({ title: "✅ Solicitud enviada", description: "Tu solicitud de vacaciones ha sido enviada para aprobación." });
      form.reset();
      if (onSolicitudCreada) onSolicitudCreada();
    } catch (error: any) {
      console.error('Error creating vacation request:', error);
      
      if (error && error.message && error.message.includes('No tienes suficientes días de vacaciones')) {
        toast({
          variant: "destructive",
          title: "Saldo Insuficiente",
          description: error.message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "❌ Error",
          description: "No se pudo enviar la solicitud. Revisa las fechas e inténtalo de nuevo.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-sm border-0">
      <CardHeader>
        <CardTitle>Crear Nueva Solicitud</CardTitle>
        <CardDescription>Selecciona las fechas para tus próximas vacaciones.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="fecha_inicio"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Inicio</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant={"outline"} className="font-normal">
                            {field.value ? format(field.value, "PPP", { locale: es }) : <span>Elige una fecha</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fecha_fin"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Fin</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant={"outline"} className="font-normal">
                            {field.value ? format(field.value, "PPP", { locale: es }) : <span>Elige una fecha</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isSubmitting ? 'Enviando...' : 'Solicitar Vacaciones'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};
