
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Bell, 
  CheckCircle2, 
  ChevronRight, 
  Sparkles, 
  Calendar,
  XCircle,
  Loader2,
  AlertTriangle,
  Megaphone,
  Cake
} from "lucide-react";
import { useAnnouncements } from "@/hooks/useAnnouncements"; 
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/hooks/useNotifications";
import { useNavigate } from "react-router-dom";

// --- Tipos y Componentes Auxiliares ---

type Announcement = {
  id: string;
  title: string;
  description: string | null;
  event_date: string | null;
  created_at: string;
  announcement_type: 'Evento' | 'Informativo' | 'Urgente' | 'Cumpleaños';
};

const AnnouncementIcon = ({ type }: { type: Announcement['announcement_type'] }) => {
    switch (type) {
        case 'Evento': return <div className="p-3 bg-purple-100 rounded-lg"><Calendar className="h-5 w-5 text-purple-600"/></div>;
        case 'Urgente': return <div className="p-3 bg-red-100 rounded-lg"><AlertTriangle className="h-5 w-5 text-red-600"/></div>;
        case 'Cumpleaños': return <div className="p-3 bg-pink-100 rounded-lg"><Cake className="h-5 w-5 text-pink-600"/></div>;
        default: return <div className="p-3 bg-blue-100 rounded-lg"><Megaphone className="h-5 w-5 text-blue-600"/></div>;
    }
};


// --- Componentes Principales del Layout ---

const WelcomeBanner = () => {
    const today = format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: es });
    return (
      <div className="relative col-span-1 md:col-span-2 lg:col-span-4 bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 p-8 rounded-2xl text-white overflow-hidden shadow-lg">
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full"></div>
        <div className="relative z-10 flex flex-col justify-between h-full">
          <div>
            <Sparkles className="h-8 w-8 mb-4 text-white/80" />
            <h1 className="text-4xl font-bold mb-2">Bienvenido a Dinamic Software</h1>
            <p className="text-lg text-white/90 max-w-lg">Tu plataforma de Business Intelligence.</p>
          </div>
          <div className="mt-6 text-sm text-white/80"><span>{today}</span></div>
        </div>
      </div>
    );
};

const HrCorner = () => {
    const { profile } = useAuth();
    const navigate = useNavigate();
    const getInitials = (name: string) => {
        if (!name) return "";
        const names = name.split(' ');
        if (names.length > 1) return `${names[0][0]}${names[1][0]}`.toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };
    return (
        <Card className="col-span-1 md:col-span-2 lg:col-span-2 shadow-sm">
            <CardHeader><CardTitle className="flex items-center"><Sparkles className="h-5 w-5 mr-2 text-primary" /> Mi Rincón RRHH</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg">
                    <Avatar><AvatarImage src={profile?.avatar_url} /><AvatarFallback>{getInitials(profile?.nombre || '')}</AvatarFallback></Avatar>
                    <div className="flex-1">
                        <p className="font-semibold">{profile?.nombre || 'Usuario'}</p>
                        <p className="text-sm text-muted-foreground">{profile?.RolEmpresa || profile?.role}</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Button onClick={() => navigate('/recursos-humanos?tab=mis-vacaciones')} className="bg-blue-500 hover:bg-blue-600 text-white"><Calendar className="h-4 w-4 mr-2"/>Solicitar Vacaciones</Button>
                    <Button onClick={() => navigate('/recursos-humanos')} className="bg-purple-500 hover:bg-purple-600 text-white"><Calendar className="h-4 w-4 mr-2"/>Pedir Permisos</Button>
                </div>
            </CardContent>
        </Card>
    );
};

const AnnouncementsSection = () => {
    const { announcements, loading } = useAnnouncements(10); 
    return (
        <Card className="col-span-1 lg:col-span-3 shadow-sm flex flex-col">
            <CardHeader><CardTitle>Anuncios Importantes</CardTitle></CardHeader>
            <CardContent className="flex-grow">
                {loading ? <div className="flex justify-center items-center h-full min-h-[220px]"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                : announcements.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">No hay anuncios recientes.</p>
                : <ScrollArea className="h-[220px] pr-4"><div className="space-y-4">
                    {(announcements as Announcement[]).map(ann => (
                        <div key={ann.id} className="flex items-center space-x-4 p-2 hover:bg-muted/50 rounded-lg cursor-pointer">
                            <AnnouncementIcon type={ann.announcement_type} />
                            <div>
                                <p className="font-semibold leading-tight">{ann.title}</p>
                                <p className="text-sm text-muted-foreground">
                                    {ann.event_date ? format(new Date(ann.event_date + 'T00:00:00'), "dd 'de' MMMM, yyyy", { locale: es }) : ann.description || `Publicado el ${format(new Date(ann.created_at), "dd/MM/yy")}`}
                                </p>
                            </div>
                            <ChevronRight className="h-5 w-5 ml-auto text-muted-foreground"/>
                        </div>
                    ))}
                  </div></ScrollArea>}
            </CardContent>
        </Card>
    );
};

const NotificationsSection = () => {
    const { notifications, loading } = useNotifications();
    return (
        <Card className="col-span-1 lg:col-span-3 shadow-sm flex flex-col">
            <CardHeader><CardTitle>Notificaciones</CardTitle></CardHeader>
            <CardContent className="flex-grow">
            {loading ? <div className="flex justify-center items-center h-full min-h-[220px]"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            : notifications.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">No tienes notificaciones.</p>
            : <ScrollArea className="h-[220px] pr-4"><div className="space-y-4">
                {notifications.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-2">
                        <Bell className="h-5 w-5 flex-shrink-0 text-primary" />
                        <p className="text-sm text-muted-foreground flex-1">{item.message}</p>
                    </div>
                ))}
              </div></ScrollArea>}
            </CardContent>
        </Card>
    )
}

// --- Componente Principal ---
export const DashboardHome = () => (
  <div className="p-4 md:p-6 space-y-6 bg-muted/30 min-h-screen">
    <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
      <WelcomeBanner />
      <HrCorner />
      <AnnouncementsSection />
      <NotificationsSection />
    </div>
  </div>
);
