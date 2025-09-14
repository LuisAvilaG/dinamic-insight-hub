import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ConfigProps {
  config: any;
  setConfig: (config: any) => void;
  columns: { column_name: string; data_type: string }[];
}

export const KpiConfig = ({ config, setConfig, columns }: ConfigProps) => {
  const numericColumns = columns.filter(c => ['integer', 'bigint', 'numeric', 'real', 'double precision'].includes(c.data_type));

  return (
    <div className="space-y-4 pt-4">
       <div className="space-y-2">
        <Label>Columna a agregar</Label>
        <Select
          value={config.column}
          onValueChange={(value) => setConfig({ ...config, column: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una columna" />
          </SelectTrigger>
          <SelectContent>
            {numericColumns.map(c => (
              <SelectItem key={c.column_name} value={c.column_name}>{c.column_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Agregación</Label>
        <Select
          value={config.aggregation}
          onValueChange={(value) => setConfig({ ...config, aggregation: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una agregación" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sum">Suma</SelectItem>
            <SelectItem value="avg">Promedio</SelectItem>
            <SelectItem value="count">Recuento</SelectItem>
            <SelectItem value="min">Mínimo</SelectItem>
            <SelectItem value="max">Máximo</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
