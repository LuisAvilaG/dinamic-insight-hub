import React, { useState, useEffect } from 'react';
import Organigrama from "@/components/admin/Organigrama";
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";

const OrganigramaViewerPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: users, error } = await supabase
          .from('Cuentas')
          .select('user_id, Nombre, Rol, departamento, avatar_url, "Líder"');

        if (error) throw error;

        setData(users);
      } catch (err) {
        setError(err.message);
        toast({ title: "Error", description: "No se pudieron cargar los datos del organigrama.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="w-full h-full p-4">
        <h1 className="text-2xl font-bold mb-4">Organigrama de la Empresa</h1>
        <div className="border rounded-lg" style={{ height: 'calc(100vh - 10rem)' }}>
            {loading && <div className="flex items-center justify-center h-full"><p>Cargando organigrama...</p></div>}
            {error && <div className="flex items-center justify-center h-full"><p className='text-destructive'>Error: {error}</p></div>}
            {data && (
                <Organigrama data={data} editable={false} />
            )}
        </div>
    </div>
  );
};

export default OrganigramaViewerPage;
