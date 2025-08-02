import { DepartmentOverview } from "@/components/departments/DepartmentOverview";
import { Search } from "lucide-react";

const consultoriaReports = [
  {
    id: "con-001",
    title: "Estado de Proyectos",
    description: "Overview completo del estado de todos los proyectos activos",
    lastUpdated: "Hace 30 min",
    category: "proyectos",
    isFavorite: true,
    views: 342,
    thumbnail: "/consultoria-1.jpg"
  },
  {
    id: "con-002",
    title: "Utilización de Recursos",
    description: "Análisis de carga de trabajo y disponibilidad del equipo",
    lastUpdated: "Hace 1 hora",
    category: "recursos",
    isFavorite: true,
    views: 267,
    thumbnail: "/consultoria-2.jpg"
  },
  {
    id: "con-003",
    title: "Rentabilidad por Proyecto",
    description: "Márgenes y rentabilidad detallada por proyecto",
    lastUpdated: "Hace 2 horas",
    category: "rentabilidad",
    isFavorite: false,
    views: 189,
    thumbnail: "/consultoria-3.jpg"
  },
  {
    id: "con-004",
    title: "Facturación y Cobros",
    description: "Control de facturación pendiente y estado de cobros",
    lastUpdated: "Hace 4 horas",
    category: "facturacion",
    isFavorite: true,
    views: 156,
    thumbnail: "/consultoria-4.jpg"
  },
  {
    id: "con-005",
    title: "Satisfacción del Cliente",
    description: "Métricas de satisfacción y feedback de clientes",
    lastUpdated: "Ayer",
    category: "clientes",
    isFavorite: false,
    views: 134,
    thumbnail: "/consultoria-5.jpg"
  },
  {
    id: "con-006",
    title: "Pipeline de Ventas",
    description: "Oportunidades comerciales y proyección de ingresos",
    lastUpdated: "Hace 1 día",
    category: "ventas",
    isFavorite: true,
    views: 298,
    thumbnail: "/consultoria-6.jpg"
  }
];

export const ConsultoriaPage = () => {
  return (
    <DepartmentOverview
      departmentName="Consultoría"
      departmentDescription="Gestión integral de proyectos de consultoría, control de rentabilidad y optimización de recursos especializados."
      departmentIcon={Search}
      reports={consultoriaReports}
      gradientColor="from-purple-500 to-purple-600"
    />
  );
};