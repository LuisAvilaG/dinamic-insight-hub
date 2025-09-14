import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WidgetType } from './AddWidget';

interface PreviewProps {
  title: string;
  widgetType: WidgetType;
  previewData: any[] | null;
}

const KpiPreview = ({ data, title }: { data: any[] | null, title: string }) => {
  let value = "0";
  if (data && data.length > 0 && data[0]) {
    const firstRow = data[0];
    const key = Object.keys(firstRow)[0];
    value = firstRow[key];
  }
  return (
    <Card className="h-full w-full flex flex-col">
      <CardHeader><CardTitle className="text-base font-medium">{title}</CardTitle></CardHeader>
      <CardContent className="flex-grow flex items-center justify-center">
        <div className="text-4xl font-bold">{String(value)}</div>
      </CardContent>
    </Card>
  );
};

const TablePreview = ({ data, title }: { data: any[] | null, title: string }) => {
  const headers = data && data.length > 0 ? Object.keys(data[0]) : [];
  return (
    <Card className="h-full w-full flex flex-col">
      <CardHeader><CardTitle className="text-base font-medium">{title}</CardTitle></CardHeader>
      <CardContent className="flex-grow overflow-auto">
        <Table>
          <TableHeader><TableRow>{headers.map(h => <TableHead key={h}>{h}</TableHead>)}</TableRow></TableHeader>
          <TableBody>
            {(data || []).map((row, i) => (
              <TableRow key={i}>{headers.map(h => <TableCell key={h}>{String(row[h])}</TableCell>)}</TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const ChartPreview = ({ data, title, type }: { data: any[] | null, title: string, type: 'bar' | 'line' }) => {
  if (!data || data.length === 0) {
    return <Card><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent>No hay datos para previsualizar.</CardContent></Card>;
  }
  const keys = Object.keys(data[0]);
  const dimension = keys[0];
  const metric = keys[1];

  const ChartComponent = type === 'bar' ? BarChart : LineChart;
  const GraphicComponent = type === 'bar' ? Bar : Line;

  return (
    <Card className="h-full w-full">
      <CardHeader><CardTitle className="text-base font-medium">{title}</CardTitle></CardHeader>
      <CardContent className="h-[calc(100%-4rem)] w-full">
         <ResponsiveContainer width="100%" height="100%">
          <ChartComponent data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={dimension} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip wrapperStyle={{ zIndex: 1000 }} />
            <Legend wrapperStyle={{ fontSize: '14px' }} />
            <GraphicComponent dataKey={metric} fill={type === 'bar' ? '#3b82f6' : '#8884d8'} name={metric} isAnimationActive={false} />
          </ChartComponent>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};


export const WidgetPreview = ({ widgetType, previewData, title }: PreviewProps) => {

  if (!previewData) {
    return <div className="text-slate-400">La previsualización aparecerá aquí.</div>;
  }
  
  if (previewData.length > 0 && previewData[0]?.error) {
      return <div className="text-red-500 text-sm p-4 bg-red-100 rounded-md">{previewData[0].error}</div>;
  }

  switch (widgetType) {
    case 'kpi':
      return <KpiPreview data={previewData} title={title} />;
    case 'table':
      return <TablePreview data={previewData} title={title} />;
    case 'bar_chart':
      return <ChartPreview data={previewData} title={title} type="bar" />;
    case 'line_chart':
      return <ChartPreview data={previewData} title={title} type="line" />;
    default:
      return <div className="text-slate-500">Tipo de widget no reconocido.</div>;
  }
};
