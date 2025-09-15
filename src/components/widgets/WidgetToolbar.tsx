import { Button } from '@/components/ui/button';
import { Pen, Trash2 } from 'lucide-react';
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
} from "@/components/ui/alert-dialog"

interface WidgetToolbarProps {
  widgetTitle: string;
  onEdit: () => void;
  onDelete: () => void;
}

export const WidgetToolbar = ({ widgetTitle, onEdit, onDelete }: WidgetToolbarProps) => {
  return (
    <div className="flex items-center gap-2 bg-white/90 border rounded-full px-2 py-1 shadow-md">
      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={onEdit}>
        <Pen className="h-4 w-4" />
        <span className="sr-only">Editar</span>
      </Button>
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-red-500 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Eliminar</span>
            </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                    Esta acción es permanente. El widget "<b>{widgetTitle}</b>" será eliminado y no podrá ser recuperado.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} className="bg-red-500 hover:bg-red-600">Confirmar</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};
