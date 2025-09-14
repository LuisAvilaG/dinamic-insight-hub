import { useState, useEffect, forwardRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Check, ChevronsUpDown } from "lucide-react"
 
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export type ColumnType = 'text' | 'varchar' | 'int' | 'int2' | 'int4' | 'int8' | 'float4' | 'float8' | 'numeric' | 'date' | 'timestamp' | 'timestamptz';

interface ColumnSelectorProps {
  tableName: string;
  selectedColumns: string[];
  onSelectionChange: (columns: string[]) => void;
  maxSelection?: number;
  allowedColumnTypes?: ColumnType[];
}

// Envolvemos el componente con forwardRef
export const ColumnSelector = forwardRef<HTMLButtonElement, ColumnSelectorProps>((
  { tableName, selectedColumns, onSelectionChange, maxSelection = Infinity, allowedColumnTypes }, ref) => {
  const [columns, setColumns] = useState<{ name: string; type: string; }[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchColumns = async () => {
      if (!tableName) return;
      setLoading(true);
      try {
        const { data, error } = await supabase.rpc('get_table_columns', { p_table_name: tableName });
        if (error) throw error;
        
        let filteredColumns = data;
        if (allowedColumnTypes) {
          filteredColumns = data.filter((col: any) => allowedColumnTypes.includes(col.data_type));
        }

        setColumns(filteredColumns || []);
      } catch (error) {
        console.error('Error fetching columns:', error);
        setColumns([]);
      } finally {
        setLoading(false);
      }
    };
    fetchColumns();
  }, [tableName, allowedColumnTypes]);

  const handleSelect = (columnName: string) => {
    let newSelection;
    if (selectedColumns.includes(columnName)) {
      newSelection = selectedColumns.filter(c => c !== columnName);
    } else {
      if (selectedColumns.length < maxSelection) {
        newSelection = [...selectedColumns, columnName];
      } else if (maxSelection === 1) {
        newSelection = [columnName];
      } else {
        return; // No changes if max selection is reached
      }
    }
    onSelectionChange(newSelection);
    if (maxSelection === 1) {
      setOpen(false);
    }
  };

  const buttonText = selectedColumns.length > 0 ? selectedColumns.join(', ') : "Seleccionar columnas...";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {/* Pasamos el ref al botón */}
        <Button
          ref={ref} 
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={loading}
        >
          <span className="truncate">{loading ? "Cargando..." : buttonText}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Buscar columna..." />
          <CommandEmpty>No se encontraron columnas.</CommandEmpty>
          <CommandGroup>
            {columns.map((column) => (
              <CommandItem
                key={column.name}
                value={column.name}
                onSelect={() => handleSelect(column.name)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedColumns.includes(column.name) ? "opacity-100" : "opacity-0"
                  )}
                />
                {column.name} <span className='text-xs text-slate-400 ml-2'>({column.type})</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
});

ColumnSelector.displayName = 'ColumnSelector';
