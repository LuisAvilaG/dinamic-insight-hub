import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, PlusCircle } from 'lucide-react';

interface AddWidgetDialogProps {
  dashboardId: string;
  onWidgetAdded: (newWidget: any) => void;
}

const WIDGET_TYPES = ['kpi', 'bar_chart', 'line_chart', 'table'];

export const AddWidgetDialog = ({ dashboardId, onWidgetAdded }: AddWidgetDialogProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [widgetType, setWidgetType] = useState<string>('');
  const [query, setQuery] = useState('');

  const handleSubmit = async () => {
    if (!widgetType || !query) {
      toast({
        title: 'Campos requeridos',
        description: 'Por favor, selecciona un tipo de widget y escribe una consulta.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('report_widgets')
        .insert({
          dashboard_id: dashboardId,
          widget_type: widgetType,
          query: query,
          position: 0, // Default position, will need a better system later
        })
        .schema('be_exponential')
        .select()
        .single();

      if (error) throw error;

      toast({
        title: '¡Widget añadido!',
        description: `El widget de tipo ${widgetType} ha sido creado.`,
        className: 'bg-green-100 text-green-800',
      });
      
      onWidgetAdded(data);
      setIsOpen(false);
      setWidgetType('');
      setQuery('');

    } catch (error: any) {
      toast({
        title: 'Error al añadir el widget',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Widget
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Añadir Nuevo Widget</DialogTitle>
          <DialogDescription>
            Configura un nuevo widget para tu dashboard. Selecciona el tipo y define la consulta SQL para obtener los datos.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
             <label htmlFor="widget-type" className="text-sm font-medium">Tipo de Widget</label>
            <Select onValueChange={setWidgetType} value={widgetType}>
                <SelectTrigger id="widget-type">
                    <SelectValue placeholder="Selecciona un tipo..." />
                </SelectTrigger>
                <SelectContent>
                    {WIDGET_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label htmlFor="query" className="text-sm font-medium">Consulta SQL</label>
            <Textarea
              id="query"
              placeholder="SELECT COUNT(*) AS total FROM employees;"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-h-[150px] font-mono text-sm"
            />
          </div>
        </div>
        <DialogFooter>
            <DialogClose asChild>
                 <Button variant="outline">Cancelar</Button>
            </DialogClose>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Añadir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
