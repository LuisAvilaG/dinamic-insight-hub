import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Organigrama from "@/components/admin/Organigrama";
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";

// THE CSS IMPORT IS REMOVED AS IT DOES NOT EXIST IN THE PACKAGE.

const GestionarOrganigramaPage = () => {
  const [data, setData] = useState(null);
  const [draggedNode, setDraggedNode] = useState(null);
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

  const handleNodeDrop = (droppedInfo) => {
    const { draggedNodeId, targetNodeId } = droppedInfo;

    const draggedUser = data.find(u => u.user_id === draggedNodeId);
    const targetUser = data.find(u => u.user_id === targetNodeId);

    const draggedName = draggedUser ? draggedUser.Nombre : '';
    const targetName = targetUser ? targetUser.Nombre : 'la cima del organigrama';

    setDraggedNode({
      userId: draggedNodeId,
      newLeaderId: targetNodeId,
    });

    toast({ 
      title: "Cambio Detectado", 
      description: `${draggedName} ahora reportará a ${targetName}. Haga clic en 'Guardar Cambios' para aplicar.` 
    });
  };

  const handleSaveChanges = async () => {
    if (!draggedNode) {
        toast({ title: "Sin cambios", description: "No se ha detectado ningún cambio para guardar.", variant: "info" });
        return;
    }

    try {
      const { error } = await supabase
        .from('Cuentas')
        .update({ 'Líder': draggedNode.newLeaderId })
        .eq('user_id', draggedNode.userId);

      if (error) throw error;

      toast({ title: "Éxito", description: "El organigrama ha sido actualizado.", variant: "success" });
      
       const { data: users, error: refetchError } = await supabase
          .from('Cuentas')
          .select('user_id, Nombre, Rol, departamento, avatar_url, "Líder"');
        if(refetchError) throw refetchError;
        setData(users); 

      setDraggedNode(null); 
    } catch (error) {
      console.error('Error saving changes:', error);
      toast({ title: "Error al Guardar", description: error.message, variant: "destructive" });
    }
  };
  
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestionar Organigrama</h1>
        <Button onClick={handleSaveChanges} disabled={!draggedNode}>Guardar Cambios</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Nuestra Organización</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ height: "600px", width: "100%" }}>
            {loading ? (
              <p>Cargando organigrama...</p>
            ) : error ? (
              <p className='text-destructive'>Error: {error}</p>
            ) : data && data.length > 0 ? (
              <Organigrama 
                data={data} 
                editable={true} 
                onNodeDrop={handleNodeDrop} 
              />
            ) : (
              <p>No se encontraron empleados para mostrar en el organigrama.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GestionarOrganigramaPage;
