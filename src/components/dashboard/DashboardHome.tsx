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
  ArrowRight,
  Sparkles
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
    <div className="stripe-section">
      {/* Welcome Section - Stripe style hero */}
      <div className="stripe-container mb-16">
        <div className="stripe-two-col">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 bg-muted rounded-full px-4 py-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              <span>Business Intelligence Platform</span>
            </div>
            <h1 className="stripe-heading-xl text-foreground">
              Bienvenido a <span className="stripe-logo-text">Dinamic Software</span>
            </h1>
            <p className="stripe-text-lg max-w-lg">
              Tu plataforma de Business Intelligence para la toma de decisiones inteligentes. 
              Generamos innovación, buscamos crecimiento.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="stripe" size="lg" className="stripe-hover-lift">
                Ver Reportes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="stripe-outline" size="lg" className="stripe-hover-lift">
                Explorar Dashboard
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="stripe-card p-8 stripe-bg-gradient stripe-pattern-subtle">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
                <Calendar className="h-4 w-4" />
                <span>{new Date().toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div className="space-y-4">
                <div className="h-4 bg-muted rounded-full"></div>
                <div className="h-4 bg-muted rounded-full w-3/4"></div>
                <div className="h-4 bg-muted rounded-full w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats - Stripe style metrics */}
      <div className="stripe-container mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => (
            <Card key={index} className="stripe-card-interactive p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="stripe-icon w-10 h-10 flex items-center justify-center text-white">
                  <stat.icon className="h-5 w-5" />
                </div>
                <Badge 
                  variant={stat.positive ? "default" : "destructive"}
                  className="text-xs bg-muted text-muted-foreground border-0"
                >
                  {stat.change}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stat.value}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Department Cards - Clean Stripe layout */}
      <div className="stripe-container mb-16">
        <div className="mb-8">
          <h2 className="stripe-heading-lg mb-2">Departamentos</h2>
          <p className="stripe-text-lg">Accede a los reportes organizados por departamento</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departmentCards.map((dept, index) => (
            <Card key={index} className="stripe-card-interactive group p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="stripe-icon w-12 h-12 flex items-center justify-center text-white">
                  <dept.icon className="h-6 w-6" />
                </div>
                <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground">
                  {dept.reports} reportes
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {dept.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {dept.description}
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    Actualizado {dept.lastUpdate}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-primary hover:text-primary hover:bg-muted"
                  >
                    Ver reportes
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity - Minimal Stripe style */}
      <div className="stripe-container">
        <div className="mb-8">
          <h2 className="stripe-heading-lg mb-2">Actividad Reciente</h2>
          <p className="stripe-text-lg">Últimas actualizaciones y accesos al sistema</p>
        </div>
        <Card className="stripe-card p-6">
          <div className="space-y-3">
            {[
              "Reporte Financiero Q4 actualizado",
              "Nueva métrica agregada al dashboard Operativo", 
              "Usuario María García accedió a Consultoría",
              "Exportación completada: Análisis de Ventas"
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 hover:bg-muted rounded-md transition-all group cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full group-hover:bg-primary/80"></div>
                  <span className="text-sm text-foreground">{activity}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  Hace {index + 1}h
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};