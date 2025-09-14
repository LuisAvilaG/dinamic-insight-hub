import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ResponsivePie } from '@nivo/pie';

interface PreviewProps {
  title: string;
  data: any[];
  config: any;
}

// Nivo espera `id` y `value` para los datos del gráfico de tarta
const transformDataForNivo = (data: any[], categoryKey: string, valueKey: string) => {
  return data.map(item => ({
    id: item[categoryKey],
    label: item[categoryKey],
    value: item[valueKey]
  }));
};

export const DonutChart = ({ title, data, config }: PreviewProps) => {
  if (!data || data.length === 0 || !config.category || !config.value) return null;

  const nivoData = transformDataForNivo(data, config.category, config.value);

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <ResponsivePie
          data={nivoData}
          margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
          innerRadius={0.5}
          padAngle={0.7}
          cornerRadius={3}
          activeOuterRadiusOffset={8}
          borderWidth={1}
          borderColor={{ from: 'color', modifiers: [ [ 'darker', 0.2 ] ] }}
          arcLinkLabelsSkipAngle={10}
          arcLinkLabelsTextColor="#333333"
          arcLinkLabelsThickness={2}
          arcLinkLabelsColor={{ from: 'color' }}
          arcLabelsSkipAngle={10}
          arcLabelsTextColor={{ from: 'color', modifiers: [ [ 'darker', 2 ] ] }}
          legends={[
            {
              anchor: 'bottom',
              direction: 'row',
              justify: false,
              translateX: 0,
              translateY: 56,
              itemsSpacing: 0,
              itemWidth: 100,
              itemHeight: 18,
              itemTextColor: '#999',
              itemDirection: 'left-to-right',
              itemOpacity: 1,
              symbolSize: 18,
              symbolShape: 'circle',
              effects: [
                {
                  on: 'hover',
                  style: {
                    itemTextColor: '#000'
                  }
                }
              ]
            }
          ]}
        />
      </CardContent>
    </Card>
  );
};