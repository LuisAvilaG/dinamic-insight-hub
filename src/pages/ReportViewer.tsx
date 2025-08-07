import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Report {
  id: string;
  nombre: string;
  departamento: string;
  descripcion?: string;
  iframe_code: string;
  created_at: string;
  updated_at: string;
}

export const ReportViewer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadReport = async () => {
      if (!id) {
        navigate('/reportes');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('reportes')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          toast({
            title: "Error",
            description: "Reporte no encontrado",
            variant: "destructive",
          });
          navigate('/reportes');
          return;
        }

        setReport(data);
      } catch (error) {
        console.error('Error loading report:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar el reporte",
          variant: "destructive",
        });
        navigate('/reportes');
      } finally {
        setIsLoading(false);
      }
    };

    loadReport();
  }, [id, navigate, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Cargando reporte...</div>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/reportes')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Reportes
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">{report.nombre}</h1>
            <Badge variant="secondary">{report.departamento}</Badge>
          </div>
          {report.descripcion && (
            <p className="text-muted-foreground">{report.descripcion}</p>
          )}
        </div>
      </div>

      {/* Report Viewer */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Visualización del Reporte</CardTitle>
              <CardDescription>
                Reporte de Looker Studio - {report.departamento}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Extract src URL from iframe code
                const srcMatch = report.iframe_code.match(/src="([^"]+)"/);
                if (srcMatch) {
                  window.open(srcMatch[1], '_blank');
                }
              }}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Abrir en Nueva Pestaña
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-muted/20 rounded-lg p-4">
            <div 
              className="w-full min-h-[600px] flex items-center justify-center"
              dangerouslySetInnerHTML={{ 
                __html: report.iframe_code.replace(
                  /width="[^"]*"/,
                  'width="100%"'
                ).replace(
                  /height="[^"]*"/,
                  'height="600"'
                )
              }}
            />
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            <p>Última actualización: {new Date(report.updated_at).toLocaleDateString('es-ES')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};