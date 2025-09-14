import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BarChartCustomizerProps {
  onConfigChange: (config: object) => void;
}

const colorSchemes = [
  'nivo', 'category10', 'accent', 'dark2', 'paired', 'pastel1', 'pastel2', 'set1', 'set2', 'set3', 'blues', 'greens', 'oranges', 'reds', 'purples'
];

export function BarChartCustomizer({ onConfigChange }: BarChartCustomizerProps) {
  const [settings, setSettings] = useState({
    layout: 'vertical',
    colors: 'nivo',
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
        <Label>Orientación</Label>
        <Select value={settings.layout} onValueChange={(v) => handleSettingChange('layout', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="vertical">Vertical</SelectItem>
            <SelectItem value="horizontal">Horizontal</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Esquema de Color</Label>
        <Select value={settings.colors} onValueChange={(v) => handleSettingChange('colors', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {colorSchemes.map(scheme => (
              <SelectItem key={scheme} value={scheme}>{scheme}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
