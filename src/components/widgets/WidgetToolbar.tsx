import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { EditWidget } from "./EditWidget";

// El tipo debe coincidir con el que se usa en WidgetRenderer
type WidgetFromDB = {
  id: string;
  type: any;
  title: string;
  query: string;
  config: object | null;
  layout: object;
};

interface WidgetToolbarProps {
  widget: WidgetFromDB;
  onWidgetDeleted: () => void;
  onWidgetUpdated: () => void;
}

export const WidgetToolbar = ({ widget, onWidgetDeleted, onWidgetUpdated }: WidgetToolbarProps) => {
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      const { error } = await supabase.rpc('delete_widget', { p_widget_id: widget.id });
      if (error) throw error;
      
      toast({
        title: "Widget Eliminado",
        description: `El widget "${widget.title}" ha sido eliminado exitosamente.`,
      });

      onWidgetDeleted();

    } catch (error: any) {
      toast({
        title: "Error al eliminar",
        description: `No se pudo eliminar el widget: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="widget-toolbar flex items-center space-x-1 bg-white/90 backdrop-blur-sm rounded-md p-1 z-10 shadow-lg border border-gray-200">
       <EditWidget widget={widget} onWidgetUpdated={onWidgetUpdated} />
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-100">
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el widget 
              <span className="font-bold">"{widget.title}"</span> del dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
