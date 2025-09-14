import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ConfigProps {
  config: any;
  setConfig: (config: any) => void;
  columns: { column_name: string; data_type: string }[];
}

export const DonutChartConfig = ({ config, setConfig, columns }: ConfigProps) => {
  const numericColumns = columns.filter(c => ['integer', 'bigint', 'numeric', 'real', 'double precision'].includes(c.data_type));
  const categoricalColumns = columns.filter(c => ['character varying', 'text'].includes(c.data_type));

  return (
    <div className="space-y-4 pt-4 border-t">
        <p className="text-sm font-medium text-gray-700">Configuración de Datos</p>
      <div className="space-y-2">
        <Label>Categoría</Label>
         <p className="text-xs text-muted-foreground">La columna para agrupar los segmentos.</p>
        <Select
          value={config.category}
          onValueChange={(value) => setConfig({ ...config, category: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una categoría" />
          </SelectTrigger>
          <SelectContent>
            {categoricalColumns.map(c => (
              <SelectItem key={c.column_name} value={c.column_name}>{c.column_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Valor</Label>
        <p className="text-xs text-muted-foreground">La columna numérica para calcular el tamaño de los segmentos.</p>
        <Select
          value={config.value}
          onValueChange={(value) => setConfig({ ...config, value: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una columna de valor" />
          </SelectTrigger>
          <SelectContent>
            {numericColumns.map(c => (
              <SelectItem key={c.column_name} value={c.column_name}>{c.column_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
