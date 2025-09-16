
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export type Notification = {
  id: string;
  user_id: string;
  message: string;
  type: 'Solicitud' | 'Anuncio' | 'Dashboard';
  link: string | null;
  is_read: boolean;
  created_at: string;
};

export const useNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchAndSetNotifications = useCallback(async () => {
    if (!user) return;
    
    // CORRECCIÓN: Apuntamos a la tabla en el esquema 'public' por defecto.
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching notifications:', error);
      toast({ title: "Error", description: "No se pudieron cargar las notificaciones.", variant: "destructive" });
    } else {
      setNotifications(data || []);
      const unread = data.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    }
  }, [user, toast]);


  useEffect(() => {
    if (!user) {
        setLoading(false);
        return;
    }
    
    setLoading(true);
    fetchAndSetNotifications().finally(() => setLoading(false));

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on<Notification>(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          toast({ title: "Nueva Notificación", description: payload.new.message });
          fetchAndSetNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchAndSetNotifications, toast]);

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking as read:', error);
    } else {
      setNotifications(current =>
        current.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(current => Math.max(0, current - 1));
    }
  };
  
  const markAllAsRead = async () => {
      if (!user) return;
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if(error){
          console.error("Error al marcar todo como leído:", error);
      } else {
          setNotifications(current => current.map(n => ({...n, is_read: true})));
          setUnreadCount(0);
      }
  }

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead };
};
