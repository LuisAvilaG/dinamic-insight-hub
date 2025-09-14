import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface TableSelectorProps {
  tables: string[];
  selectedTable: string | null;
  onTableSelect: (table: string) => void;
  isLoading: boolean;
}

export const TableSelector = ({ tables, selectedTable, onTableSelect, isLoading }: TableSelectorProps) => (
  <div className="space-y-2">
    <Label>Selecciona una tabla de origen</Label>
    <Select onValueChange={onTableSelect} value={selectedTable || undefined} disabled={isLoading}>
      <SelectTrigger>
        <SelectValue placeholder={isLoading ? "Cargando tablas..." : "Elige una tabla..."} />
      </SelectTrigger>
      <SelectContent>
        {tables.map(table => (
          <SelectItem key={table} value={table}>{table}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);
