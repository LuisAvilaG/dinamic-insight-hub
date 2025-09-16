
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, CheckCheck } from "lucide-react";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const NotificationItem = ({ notification, onRead }: { notification: Notification; onRead: (id: string) => void }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!notification.is_read) {
      onRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <DropdownMenuItem
      onClick={handleClick}
      className={`flex items-start gap-3 p-3 cursor-pointer ${!notification.is_read ? 'bg-blue-50' : ''}`}
    >
      <div className="flex-shrink-0">
        {!notification.is_read && <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5"></div>}
      </div>
      <div className="flex-1">
        <p className="text-sm text-foreground">{notification.message}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: es })}
        </p>
      </div>
    </DropdownMenuItem>
  );
};

export const Notifications = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {unreadCount}
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 md:w-96" align="end">
        <DropdownMenuLabel className="flex justify-between items-center">
          Notificaciones
          {unreadCount > 0 && (
            <Button variant="link" size="sm" className="p-0 h-auto" onClick={markAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-1" /> Marcar todas como leídas
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-10">No tienes notificaciones.</p>
          ) : (
            notifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} onRead={markAsRead} />
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
