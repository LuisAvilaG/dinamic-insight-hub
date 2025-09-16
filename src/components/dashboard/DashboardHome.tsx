
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
import { useNavigate } from "react-router-dom"; // IMPORTAMOS useNavigate

// --- Tipos y Componentes Auxiliares (sin cambios) ---
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

const WelcomeBanner = () => { /* ... (sin cambios) ... */ };

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
                    <Avatar>
                        <AvatarImage src={profile?.avatar_url} />
                        <AvatarFallback>{getInitials(profile?.nombre || '')}</AvatarFallback>
                    </Avatar>
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

const AnnouncementsSection = () => { /* ... (sin cambios) ... */ };
const NotificationsSection = () => { /* ... (sin cambios) ... */ };


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
