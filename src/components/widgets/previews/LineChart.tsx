import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ResponsiveLine } from '@nivo/line';

interface PreviewProps {
  title: string;
  data: any[];
  config: any;
}

// Transforms data into the format Nivo expects for line charts.
const transformDataForNivo = (data: any[], xAxis: string, aggregation: string, yAxisColumn: string | null) => {
  const lineId = aggregation === 'COUNT' ? 'Count' : `${aggregation}(${yAxisColumn})`;

  return [
    {
      id: lineId,
      data: data.map(item => ({
        x: item[xAxis],
        // The query builder now consistently aliases the aggregated result to "value".
        y: item.value
      }))
    }
  ];
};

export const LineChart = ({ title, data, config }: PreviewProps) => {
  // Check for the new configuration properties.
  if (!data || data.length === 0 || !config.xAxis || !config.yAxisAggregation) {
    return (
        <Card className="w-full h-full flex flex-col">
            <CardHeader>
                <CardTitle className="text-base font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Datos insuficientes para mostrar el gráfico.</p>
            </CardContent>
        </Card>
    );
  }

  const nivoData = transformDataForNivo(data, config.xAxis, config.yAxisAggregation, config.yAxisColumn);
  const yAxisLegend = config.yAxisAggregation === 'COUNT' ? 'Conteo' : `${config.yAxisAggregation}(${config.yAxisColumn})`;

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <ResponsiveLine
            data={nivoData}
            margin={{ top: 20, right: 110, bottom: 50, left: 60 }}
            xScale={{ type: 'point' }}
            yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: config.xAxis,
                legendOffset: 36,
                legendPosition: 'middle'
            }}
            axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: yAxisLegend,
                legendOffset: -50, // Adjusted for potentially longer labels
                legendPosition: 'middle'
            }}
            pointSize={10}
            pointColor={{ theme: 'background' }}
            pointBorderWidth={2}
            pointBorderColor={{ from: 'serieColor' }}
            useMesh={true}
            legends={[
                {
                    anchor: 'bottom-right',
                    direction: 'column',
                    justify: false,
                    translateX: 100,
                    translateY: 0,
                    itemsSpacing: 0,
                    itemDirection: 'left-to-right',
                    itemWidth: 80,
                    itemHeight: 20,
                    itemOpacity: 0.75,
                    symbolSize: 12,
                    symbolShape: 'circle',
                    symbolBorderColor: 'rgba(0, 0, 0, .5)',
                    effects: [
                        {
                            on: 'hover',
                            style: {
                                itemBackground: 'rgba(0, 0, 0, .03)',
                                itemOpacity: 1
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