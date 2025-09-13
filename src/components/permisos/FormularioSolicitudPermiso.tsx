
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format, differenceInBusinessDays, startOfDay, isSameDay } from "date-fns";
import { es } from 'date-fns/locale';
import { useToast } from "@/components/ui/use-toast";
import { useState } from 'react';

const motivoEnum = z.enum([
    'Permiso días especiales',
    'Permiso día de cumpleaños',
    'Permiso medio día cumpleaños familiar',
    'Permiso asuntos médicos',
    'Licencia de matrimonio',
    'Otro'
]);

const formSchema = z.object({
  fecha_inicio: z.date({ required_error: "La fecha de inicio es obligatoria." }),
  fecha_fin: z.date({ required_error: "La fecha de fin es obligatoria." }),
  motivo: motivoEnum,
  es_medio_dia: z.boolean().default(false),
  comentarios_solicitante: z.string().max(500, "Los comentarios no pueden exceder los 500 caracteres.").optional(),
})
.refine(data => data.fecha_fin >= data.fecha_inicio, {
  message: "La fecha de fin no puede ser anterior a la de inicio.",
  path: ["fecha_fin"],
})
.refine(data => !data.es_medio_dia || (data.es_medio_dia && isSameDay(data.fecha_inicio, data.fecha_fin)), {
    message: "La opción 'Medio día' solo es válida si la fecha de inicio y fin son la misma.",
    path: ["es_medio_dia"],
});

export const FormularioSolicitudPermiso = ({ onSolicitudCreada }: { onSolicitudCreada?: () => void }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fecha_inicio: undefined,
      fecha_fin: undefined,
      es_medio_dia: false,
      comentarios_solicitante: "",
    },
  });

  const fechaInicio = form.watch("fecha_inicio");
  const fechaFin = form.watch("fecha_fin");
  const esMedioDiaVisible = fechaInicio && fechaFin && isSameDay(fechaInicio, fechaFin);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    setIsSubmitting(true);

    const fechaInicioNorm = startOfDay(values.fecha_inicio);
    const fechaFinNorm = startOfDay(values.fecha_fin);

    // El cálculo de días hábiles ya se realiza correctamente con esta función
    const total_dias = values.es_medio_dia ? 0.5 : differenceInBusinessDays(fechaFinNorm, fechaInicioNorm) + 1;

    try {
      const { error } = await supabase.from('permisos_solicitudes').insert({
        solicitante_user_id: user.id,
        fecha_inicio: format(fechaInicioNorm, 'yyyy-MM-dd'),
        fecha_fin: format(fechaFinNorm, 'yyyy-MM-dd'),
        motivo: values.motivo,
        total_dias,
        comentarios_solicitante: values.comentarios_solicitante,
        estado: 'pendiente',
      });

      if (error) throw error;

      toast({ title: "✅ Solicitud de Permiso Enviada", description: "Tu solicitud ha sido enviada para aprobación." });
      form.reset();
      if (onSolicitudCreada) onSolicitudCreada();

    } catch (error: any) {
      console.error('Error creating permission request:', error);

      // Captura el error específico de la base de datos y muestra un mensaje amigable
      if (error && error.message && error.message.includes('Saldo insuficiente')) {
        toast({
          variant: "destructive",
          title: "Saldo Insuficiente",
          description: error.message, // Muestra el mensaje de error personalizado desde la DB
        });
      } else {
        toast({
          variant: "destructive",
          title: "❌ Error",
          description: `No se pudo enviar la solicitud. ${error.message}`,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-sm border-0">
      <CardHeader>
        <CardTitle>Crear Nueva Solicitud de Permiso</CardTitle>
        <CardDescription>Selecciona las fechas y el motivo para tu permiso.</CardDescription>
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
                          <Button variant={"outline"} className={"font-normal justify-start text-left"}>
                            {field.value ? format(field.value, "PPP", { locale: es }) : <span>Elige una fecha</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date.getDay() === 0 || date.getDay() === 6} initialFocus />
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
                          <Button variant={"outline"} className={"font-normal justify-start text-left"}>
                            {field.value ? format(field.value, "PPP", { locale: es }) : <span>Elige una fecha</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date.getDay() === 0 || date.getDay() === 6} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {esMedioDiaVisible && (
              <FormField
                control={form.control}
                name="es_medio_dia"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>¿Es de medio día?</FormLabel>
                      <FormDescription>
                        Marca esta opción si tu permiso es solo de medio día.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="motivo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo del Permiso</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un motivo..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {motivoEnum.options.map(motivo => (
                        <SelectItem key={motivo} value={motivo}>{motivo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comentarios_solicitante"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comentarios (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Añade cualquier información adicional que consideres necesaria." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isSubmitting ? 'Enviando...' : 'Solicitar Permiso'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};
