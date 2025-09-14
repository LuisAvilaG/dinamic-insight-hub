import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from '@/components/ui/textarea';
import { TableSelector } from './TableSelector';
import { ColumnSelector } from './ColumnSelector';
import { WidgetPreview } from './WidgetPreview';
import { Pencil } from 'lucide-react';

// Basic type for a widget from the database
type WidgetFromDB = {
  id: string;
  type: any;
  title: string;
  query: string;
  config: object | null;
  layout: object;
};

interface EditWidgetProps {
  widget: WidgetFromDB;
  onWidgetUpdated: () => void;
}

export const EditWidget = ({ widget, onWidgetUpdated }: EditWidgetProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState(widget.title);
  const [selectedTable, setSelectedTable] = useState<string | null>(null); // This state is tricky to derive from a query
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]); // Same here
  const [customQuery, setCustomQuery] = useState(widget.query);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
        // When the dialog opens, sync state with widget props
        setTitle(widget.title);
        setCustomQuery(widget.query);
        // Resetting table/column selectors is complex because a query is just a string.
        // A robust solution might parse the SQL, but that's a big task.
        // For now, we just show the query and let the user edit it.
        setSelectedTable(null);
        setSelectedColumns([]);
    }
  }, [isOpen, widget]);

  const generateQuery = () => {
    // When editing, the customQuery is the source of truth, as reverse-engineering the selectors is not feasible.
    if (customQuery) return customQuery;
    if (!selectedTable) return '';
    const cols = selectedColumns.length > 0 ? selectedColumns.join(', ') : '*';
    return `SELECT ${cols} FROM ${selectedTable}`;
  };

  const handleUpdateWidget = async () => {
    setIsSubmitting(true);
    const finalQuery = generateQuery();

    if (!finalQuery) {
      toast({ title: 'Error', description: 'La consulta SQL no puede estar vacía.', variant: 'destructive' });
      setIsSubmitting(false);
      return;
    }

    try {
      const { error } = await supabase.rpc('update_widget_details', {
        p_widget_id: widget.id,
        p_title: title,
        p_query: finalQuery,
        p_config: { title, query: finalQuery }
      });

      if (error) throw error;

      toast({ title: 'Widget Actualizado', description: 'El widget se ha actualizado correctamente.' });
      onWidgetUpdated();
      setIsOpen(false);

    } catch (error: any) {
      toast({ title: 'Error al actualizar el widget', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-blue-100">
            <Pencil className="h-4 w-4 text-blue-500" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Editar Widget: {widget.type}</DialogTitle>
          <DialogDescription>Modifica los detalles de tu widget.</DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
            {/* Columna de Configuración */}
            <div className="space-y-4">
                <div>
                    <label htmlFor="widget-title-edit" className="text-sm font-medium">Título del Widget</label>
                    <Input id="widget-title-edit" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>

                <div className="space-y-2">
                    <h4 className="font-medium">Constructor de Consultas (Referencia)</h4>
                    <p className="text-xs text-gray-500">El constructor no puede editar una consulta existente. Modifica el SQL directamente.</p>
                    <TableSelector onTableSelect={() => {}} /> 
                    <ColumnSelector tableName={null} onSelectionChange={() => {}} />
                </div>

                <div className="space-y-2">
                    <h4 className="font-medium">Editor de SQL</h4>
                    <Textarea 
                        value={customQuery} 
                        onChange={(e) => setCustomQuery(e.target.value)} 
                        placeholder="Escribe tu consulta SQL directamente aquí..." 
                        rows={5}
                    />
                </div>
            </div>

            {/* Columna de Previsualización */}
            <div className="space-y-4">
                <h4 className="font-medium">Previsualización</h4>
                <WidgetPreview 
                    widgetType={widget.type}
                    title={title} 
                    query={generateQuery()} 
                />
            </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>Cancelar</Button>
          <Button onClick={handleUpdateWidget} disabled={isSubmitting}>
            {isSubmitting ? 'Actualizando...' : 'Guardar Cambios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};