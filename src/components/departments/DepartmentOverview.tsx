import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  Star, 
  ExternalLink,
  Calendar,
  Eye,
  Download
} from "lucide-react";
import { useState } from "react";

interface Report {
  id: string;
  title: string;
  description: string;
  lastUpdated: string;
  category: string;
  isFavorite: boolean;
  views: number;
  thumbnail: string;
}

interface DepartmentOverviewProps {
  departmentName: string;
  departmentDescription: string;
  departmentIcon: React.ElementType;
  reports: Report[];
  gradientColor: string;
}

export const DepartmentOverview = ({ 
  departmentName, 
  departmentDescription, 
  departmentIcon: Icon,
  reports,
  gradientColor 
}: DepartmentOverviewProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || report.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", ...new Set(reports.map(r => r.category))];

  return (
    <div className="space-y-8">
      {/* Department Header */}
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradientColor} p-8 text-white`}>
        <div className="absolute inset-0 pattern-geometric opacity-10"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Icon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">{departmentName}</h1>
              <p className="text-white/90 text-lg max-w-2xl">
                {departmentDescription}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{reports.length}</div>
            <div className="text-white/80">Reportes disponibles</div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar reportes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Categoría:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category === "all" ? "Todas" : category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => (
          <Card key={report.id} className="card-interactive group">
            <CardHeader className="pb-4">
              <div className="aspect-video bg-gradient-to-br from-accent to-muted rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 pattern-geometric opacity-20"></div>
                <div className="relative text-center">
                  <Icon className="h-12 w-12 text-primary mx-auto mb-2" />
                  <div className="text-xs text-muted-foreground">Vista Previa</div>
                </div>
                <Button
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                    {report.title}
                  </CardTitle>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {report.category}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`ml-2 ${report.isFavorite ? 'text-yellow-500' : 'text-muted-foreground'}`}
                >
                  <Star className={`h-4 w-4 ${report.isFavorite ? 'fill-current' : ''}`} />
                </Button>
              </div>
              
              <CardDescription className="mt-2">
                {report.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-3 w-3" />
                    <span>{report.views}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{report.lastUpdated}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button className="flex-1 btn-gradient">
                  Ver Reporte
                </Button>
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredReports.length === 0 && (
        <Card className="card-professional">
          <CardContent className="p-12 text-center">
            <Icon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No se encontraron reportes
            </h3>
            <p className="text-muted-foreground">
              Intenta ajustar los filtros o términos de búsqueda
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};