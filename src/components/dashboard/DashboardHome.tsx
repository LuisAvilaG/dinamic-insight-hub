import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  DollarSign, 
  Search, 
  Users, 
  Zap,
  TrendingUp,
  Activity,
  Calendar,
  ArrowRight
} from "lucide-react";

const departmentCards = [
  {
    title: "Operativo",
    description: "Reportes y métricas operacionales",
    icon: BarChart3,
    color: "from-blue-500 to-blue-600",
    reports: 12,
    lastUpdate: "Hace 2 horas",
    url: "/operativo"
  },
  {
    title: "Financiero", 
    description: "Análisis financiero y presupuestos",
    icon: DollarSign,
    color: "from-green-500 to-green-600",
    reports: 8,
    lastUpdate: "Hace 1 hora",
    url: "/financiero"
  },
  {
    title: "Consultoría",
    description: "Reportes de proyectos y consultoría", 
    icon: Search,
    color: "from-purple-500 to-purple-600",
    reports: 15,
    lastUpdate: "Hace 30 min",
    url: "/consultoria"
  },
  {
    title: "Directivo",
    description: "Dashboard ejecutivo y KPIs",
    icon: Users,
    color: "from-orange-500 to-orange-600", 
    reports: 6,
    lastUpdate: "Hace 15 min",
    url: "/directivo"
  },
  {
    title: "Dinamic",
    description: "Herramientas y utilidades Dinamic",
    icon: Zap,
    color: "from-primary to-secondary",
    reports: 10,
    lastUpdate: "Hace 5 min",
    url: "/dinamic"
  }
];

const quickStats = [
  {
    title: "Total Reportes",
    value: "51",
    change: "+12%",
    icon: BarChart3,
    positive: true
  },
  {
    title: "Usuarios Activos",
    value: "24",
    change: "+8%", 
    icon: Users,
    positive: true
  },
  {
    title: "Actualizaciones Hoy",
    value: "18",
    change: "+5%",
    icon: Activity,
    positive: true
  },
  {
    title: "Tiempo Promedio",
    value: "2.3m",
    change: "-15%",
    icon: TrendingUp,
    positive: true
  }
];

export const DashboardHome = () => {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Bienvenido a Dinamic Software
          </h1>
          <p className="text-muted-foreground mt-2">
            Tu plataforma de Business Intelligence para la toma de decisiones
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{new Date().toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <Card key={index} className="card-professional">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="mt-4">
                <Badge 
                  variant={stat.positive ? "default" : "destructive"}
                  className="text-xs"
                >
                  {stat.change} vs mes anterior
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Department Cards */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-6">
          Departamentos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departmentCards.map((dept, index) => (
            <Card key={index} className="card-interactive group">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 bg-gradient-to-br ${dept.color} rounded-lg flex items-center justify-center`}>
                    <dept.icon className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {dept.reports} reportes
                  </Badge>
                </div>
                <CardTitle className="text-xl font-semibold">
                  {dept.title}
                </CardTitle>
                <CardDescription>
                  {dept.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Actualizado {dept.lastUpdate}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                  >
                    Ver reportes
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-6">
          Actividad Reciente
        </h2>
        <Card className="card-professional">
          <CardContent className="p-6">
            <div className="space-y-4">
              {[
                "Reporte Financiero Q4 actualizado",
                "Nueva métrica agregada al dashboard Operativo", 
                "Usuario María García accedió a Consultoría",
                "Exportación completada: Análisis de Ventas"
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm text-foreground">{activity}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    Hace {index + 1}h
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};