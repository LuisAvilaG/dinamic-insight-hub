import { useState, useEffect } from 'react';
import { ColumnSelector, ColumnType } from './ColumnSelector';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface GaugeBuilderProps {
  tableName: string;
  onConfigChange: (config: object) => void;
}

export function GaugeBuilder({ tableName, onConfigChange }: GaugeBuilderProps) {
  const [config, setConfig] = useState({
    maxValue: 100,
    unit: '',
    currentValueSource: 'sql',
    currentValue: 0,
    currentValueQuery: '',
    style: 'bar', // Forzar 'bar' como único estilo
  });

  const handleConfigChange = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    onConfigChange(config);
  }, [config, onConfigChange]);

  const handleColumnSelection = (cols: string[]) => {
    if (cols.length > 0) {
      const query = `SELECT ${cols[0]} FROM be_exponential."${tableName}" LIMIT 1`;
      handleConfigChange('currentValueQuery', query);
    } else {
      handleConfigChange('currentValueQuery', '');
    }
  };

  return (
    <div className="space-y-4 pt-4">
      <div>
        <Label>Valor Máximo (Meta)</Label>
        <Input 
          type="number" 
          value={config.maxValue}
          onChange={(e) => handleConfigChange('maxValue', parseInt(e.target.value) || 100)}
          placeholder="100"
        />
      </div>
      <div>
        <Label>Unidad (Opcional)</Label>
        <Input 
          value={config.unit}
          onChange={(e) => handleConfigChange('unit', e.target.value)}
          placeholder="%, €, etc."
        />
      </div>
      <div>
        <Label>Valor Actual</Label>
        <RadioGroup 
          value={config.currentValueSource} 
          onValueChange={(value) => handleConfigChange('currentValueSource', value)}
          className="flex space-x-4 py-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="sql" id="sql" />
            <Label htmlFor="sql">Desde la Base de Datos</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="manual" id="manual" />
            <Label htmlFor="manual">Valor Manual</Label>
          </div>
        </RadioGroup>
        {config.currentValueSource === 'sql' ? (
          <div>
            <p className="text-xs text-slate-500 pb-2">Selecciona la columna numérica para el valor actual.</p>
            <ColumnSelector 
              tableName={tableName} 
              onSelectionChange={handleColumnSelection}
              maxSelection={1}
              allowedColumnTypes={['int', 'int2', 'int4', 'int8', 'float4', 'float8', 'numeric']}
              selectedColumns={[]}
            />
          </div>
        ) : (
          <Input 
            type="number"
            value={config.currentValue}
            onChange={(e) => handleConfigChange('currentValue', parseInt(e.target.value))}
          />
        )}
      </div>
       {/* El selector de estilo se ha eliminado */}
    </div>
  );
}
