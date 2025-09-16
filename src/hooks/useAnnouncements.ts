
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

type Announcement = {
  id: string;
  title: string;
  description: string | null;
  event_date: string | null;
  created_at: string;
};

export const useAnnouncements = (limit: number = 3) => {
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error fetching announcements for dashboard:", error);
        toast({
          title: "Error de Carga",
          description: "No se pudieron cargar los anuncios del dashboard.",
          variant: "destructive",
        });
      } else {
        setAnnouncements(data);
      }
      
      setLoading(false);
    };

    fetchAnnouncements();
  }, [limit, toast]);

  return { announcements, loading };
};
