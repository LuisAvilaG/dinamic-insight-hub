import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ResponsiveBar } from '@nivo/bar';

interface PreviewProps {
  title: string;
  data: any[];
  config: any;
}

export const BarChart = ({ title, data, config }: PreviewProps) => {
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

  const yAxisLegend = config.yAxisAggregation === 'COUNT' ? 'Conteo' : `${config.yAxisAggregation}(${config.yAxisColumn})`;

  // The query builder now consistently aliases the aggregated result to "value".
  // The `keys` prop for Nivo now expects ['value'].
  const chartKeys = ['value'];

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <ResponsiveBar
            data={data}
            keys={chartKeys}
            indexBy={config.xAxis}
            margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
            padding={0.3}
            valueScale={{ type: 'linear' }}
            indexScale={{ type: 'band', round: true }}
            colors={{ scheme: 'nivo' }}
            borderColor={{ from: 'color', modifiers: [ [ 'darker', 1.6 ] ] }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: config.xAxis,
                legendPosition: 'middle',
                legendOffset: 32
            }}
            axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: yAxisLegend,
                legendPosition: 'middle',
                legendOffset: -50 // Adjusted for potentially longer labels
            }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor={{ from: 'color', modifiers: [ [ 'darker', 1.6 ] ] }}
            legends={[]}
            role="application"
        />
      </CardContent>
    </Card>
  );
};