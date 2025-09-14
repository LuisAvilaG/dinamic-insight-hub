import { BarChart, GanttChart, LineChart, Table, Gauge, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WidgetType } from "./AddWidget";

interface WidgetTypeSelectorProps {
  onSelectType: (type: WidgetType) => void;
}

const widgetTypes = [
  { 
    type: 'kpi' as const, 
    label: 'KPI', 
    description: 'Muestra un único valor numérico clave.',
    icon: <GanttChart className="h-10 w-10 mb-4" /> 
  },
  { 
    type: 'gauge' as const, 
    label: 'Progreso (Gauge)', 
    description: 'Mide un valor actual contra una meta.',
    icon: <Gauge className="h-10 w-10 mb-4" /> 
  },
  { 
    type: 'time_series' as const, 
    label: 'Serie Temporal', 
    description: 'Muestra la evolución de una métrica en el tiempo.',
    icon: <TrendingUp className="h-10 w-10 mb-4" /> 
  },
  { 
    type: 'table' as const, 
    label: 'Tabla', 
    description: 'Muestra datos en formato tabular.', 
    icon: <Table className="h-10 w-10 mb-4" /> 
  },
  { 
    type: 'bar_chart' as const, 
    label: 'Gráfica de Barras', 
    description: 'Compara valores entre categorías.', 
    icon: <BarChart className="h-10 w-10 mb-4" /> 
  },
  { 
    type: 'line_chart' as const, 
    label: 'Gráfica de Líneas', 
    description: 'Muestra tendencias a lo largo del tiempo.', 
    icon: <LineChart className="h-10 w-10 mb-4" /> 
  },
];

export function WidgetTypeSelector({ onSelectType }: WidgetTypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4">
      {widgetTypes.map(({ type, label, description, icon }) => (
        <Card 
          key={type} 
          className="cursor-pointer hover:bg-slate-50 transition-colors text-center"
          onClick={() => onSelectType(type)}
        >
          <CardHeader>
            <div className="flex justify-center items-center">{icon}</div>
            <CardTitle className="text-lg">{label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">{description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
