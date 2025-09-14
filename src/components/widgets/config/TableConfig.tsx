import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";

interface ConfigProps {
  config: any;
  setConfig: (config: any) => void;
  columns: { column_name: string; data_type: string }[];
}

export const TableConfig = ({ config, setConfig, columns }: ConfigProps) => {
  const allColumns = columns.map(c => ({ value: c.column_name, label: c.column_name }));

  return (
    <div className="space-y-4 pt-4 border-t">
       <p className="text-sm font-medium text-gray-700">Configuración de Datos</p>
      <div className="space-y-2">
        <Label>Columnas a mostrar</Label>
         <p className="text-xs text-muted-foreground">Selecciona las columnas que quieres ver en la tabla.</p>
        <MultiSelect
          options={allColumns}
          value={config.columns || []}
          onChange={(selected) => setConfig({ ...config, columns: selected })}
          placeholder="Seleccionar columnas..."
        />
      </div>
    </div>
  );
};
