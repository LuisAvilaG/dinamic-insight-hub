import { useState } from 'react';
import { Button } from "@/components/ui/button";
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
import { Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

interface DeleteWidgetButtonProps {
  widgetId: string;
  onWidgetDeleted: () => void;
}

export function DeleteWidgetButton({ widgetId, onWidgetDeleted }: DeleteWidgetButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase.rpc('delete_widget', { p_widget_id: widgetId });
      if (error) throw error;
      
      toast({ title: '¡Widget eliminado!', className: 'bg-green-100 text-green-800' });
      onWidgetDeleted();
    } catch (error: any) {
      toast({ title: 'Error al eliminar el widget', description: error.message, variant: 'destructive' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer text-red-500 hover:text-red-700">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. El widget será eliminado permanentemente de tu dashboard.
          </Aler tDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
