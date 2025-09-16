
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PlusCircle, Trash2, Loader2, Megaphone, Calendar as CalendarIcon, AlertTriangle, Cake } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from "@/lib/utils";

type Announcement = {
  id: string;
  title: string;
  description: string | null;
  event_date: string | null;
  created_at: string;
  announcement_type: 'Evento' | 'Informativo' | 'Urgente' | 'Cumpleaños';
  created_by_user_id: string;
};

const AnnouncementIcon = ({ type }: { type: Announcement['announcement_type'] }) => {
    switch (type) {
        case 'Evento': return <CalendarIcon className="h-5 w-5 text-purple-500"/>;
        case 'Urgente': return <AlertTriangle className="h-5 w-5 text-red-500"/>;
        case 'Cumpleaños': return <Cake className="h-5 w-5 text-pink-500"/>;
        default: return <Megaphone className="h-5 w-5 text-blue-500"/>;
    }
};

export const GestionAnunciosPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm<Omit<Announcement, 'id' | 'created_at' | 'created_by_user_id'>>({
      defaultValues: { announcement_type: 'Informativo', title: '', description: '', event_date: null }
  });

  const fetchAnnouncements = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error", description: "No se pudieron cargar los anuncios.", variant: "destructive" });
    } else {
      setAnnouncements(data as Announcement[]);
    }
    setLoading(false);
  };

  const onSubmit = async (formData: Omit<Announcement, 'id' | 'created_at' | 'created_by_user_id'>) => {
    if (!user) return toast({ title: "Error", description: "No se pudo identificar al usuario.", variant: "destructive" });
    
    const dataToInsert = { ...formData, created_by_user_id: user.id, event_date: formData.event_date || null };
    const { error: announcementError } = await supabase.from("announcements").insert([dataToInsert]);

    if (announcementError) return toast({ title: "Error al crear anuncio", description: announcementError.message, variant: "destructive" });

    const { data: users, error: usersError } = await supabase.from('"Cuentas"').select("user_id");
    if (usersError) return toast({ title: "Anuncio creado, pero...", description: "No se pudieron obtener los usuarios para enviar notificaciones.", variant: "destructive" });

    const notifications = users.map(u => ({
        user_id: u.user_id,
        message: `Se ha publicado un nuevo anuncio: "${formData.title}"`,
        type: 'Anuncio' as const,
        link: '/dashboard'
    }));

    const { error: notificationError } = await supabase.from("notifications").insert(notifications);
    if (notificationError) return toast({ title: "Anuncio creado, pero...", description: "No se pudieron enviar las notificaciones.", variant: "destructive" });
    
    toast({ title: "Éxito", description: "Anuncio y notificaciones creadas correctamente." });
    reset();
    setIsDialogOpen(false);
    fetchAnnouncements();
  };

  const deleteAnnouncement = async (id: string) => {
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) {
      toast({ title: "Error al eliminar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Éxito", description: "Anuncio eliminado." });
      fetchAnnouncements();
    }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const handleDateSelect = (date: Date | undefined, onChange: (value: string | null) => void) => {
    if (!date) return onChange(null);
    const formattedDate = format(date, 'yyyy-MM-dd');
    onChange(formattedDate);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Anuncios</h1>
          <p className="text-muted-foreground">Crea y gestiona los anuncios del dashboard principal.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button><PlusCircle className="h-4 w-4 mr-2" />Crear Nuevo Anuncio</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nuevo Anuncio</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Controller name="announcement_type" control={control} render={({ field }) => (
                <div>
                  <Label>Tipo de Anuncio</Label>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Informativo">Informativo</SelectItem>
                      <SelectItem value="Evento">Evento</SelectItem>
                      <SelectItem value="Urgente">Urgente</SelectItem>
                      <SelectItem value="Cumpleaños">Cumpleaños</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )} />
              <div>
                <Label htmlFor="title">Título</Label>
                <Input id="title" {...register("title", { required: "El título es obligatorio" })} />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <Label>Descripción (Opcional)</Label>
                <Textarea {...register("description")} />
              </div>
              <Controller name="event_date" control={control} render={({ field }) => (
                <div>
                  <Label>Fecha del Evento (Opcional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(parseISO(field.value), "PPP", { locale: es }) : <span>Elige una fecha</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value ? parseISO(field.value) : undefined} onSelect={(date) => handleDateSelect(date, field.onChange)} initialFocus /></PopoverContent>
                  </Popover>
                </div>
              )} />
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="ghost">Cancelar</Button></DialogClose>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Crear Anuncio</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader><CardTitle>Anuncios Activos</CardTitle></CardHeader>
        <CardContent>
          {loading ? <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
           : announcements.length === 0 ? <p className="text-muted-foreground text-center py-8">No hay anuncios creados.</p>
           : <div className="space-y-4">{announcements.map((ann) => (
              <div key={ann.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <AnnouncementIcon type={ann.announcement_type} />
                  <div>
                    <p className="font-semibold">{ann.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {ann.event_date ? format(parseISO(ann.event_date), "dd 'de' MMMM, yyyy", { locale: es }) : `Publicado el ${format(new Date(ann.created_at), "dd/MM/yy")}`}
                    </p>
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción es permanente y no se puede deshacer. El anuncio será eliminado de la base de datos.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteAnnouncement(ann.id)}>Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}</div>}
        </CardContent>
      </Card>
    </div>
  );
};
