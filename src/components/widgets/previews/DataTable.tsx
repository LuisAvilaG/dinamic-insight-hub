import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PreviewProps {
  title: string;
  data: any[];
  config: any;
}

export const DataTable = ({ title, data, config }: PreviewProps) => {
  if (!data || data.length === 0 || !config.columns || config.columns.length === 0) return null;

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {config.columns.map((col: string) => (
                <TableHead key={col}>{col}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {config.columns.map((col: string) => (
                  <TableCell key={col}>{row[col]}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
