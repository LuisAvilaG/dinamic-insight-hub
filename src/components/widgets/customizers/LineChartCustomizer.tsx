import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"

interface LineChartCustomizerProps {
  onConfigChange: (config: object) => void;
}

const curveTypes = [
    'basis', 'cardinal', 'catmullRom', 'linear', 'monotoneX', 'monotoneY', 'natural', 'step', 'stepAfter', 'stepBefore'
];

export function LineChartCustomizer({ onConfigChange }: LineChartCustomizerProps) {
  const [settings, setSettings] = useState({
    curve: 'linear',
    pointSize: 10,
    enableArea: false,
  });

  useEffect(() => {
    onConfigChange(settings);
  }, [settings, onConfigChange]);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4 pt-4">
      <div>
        <Label>Tipo de Curva</Label>
        <Select value={settings.curve} onValueChange={(v) => handleSettingChange('curve', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {curveTypes.map(curve => (
              <SelectItem key={curve} value={curve}>{curve}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className='space-y-2'>
        <Label>Tamaño del Punto (de 0 a 20)</Label>
        <Slider 
          defaultValue={[10]} 
          max={20} 
          step={1} 
          onValueChange={(value) => handleSettingChange('pointSize', value[0])}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch 
            id="enable-area" 
            checked={settings.enableArea}
            onCheckedChange={(checked) => handleSettingChange('enableArea', checked)}
        />
        <Label htmlFor="enable-area">Habilitar Área de Relleno</Label>
      </div>
    </div>
  );
}
