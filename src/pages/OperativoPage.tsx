import { DepartmentOverview } from "@/components/departments/DepartmentOverview";
import { BarChart3 } from "lucide-react";

const operativoReports = [
  {
    id: "op-001",
    title: "Análisis de Productividad",
    description: "Métricas de productividad por equipo y departamento",
    lastUpdated: "Hace 2 horas",
    category: "productividad",
    isFavorite: true,
    views: 156,
    thumbnail: "/operativo-1.jpg"
  },
  {
    id: "op-002", 
    title: "Indicadores de Calidad",
    description: "Control de calidad y métricas de satisfacción",
    lastUpdated: "Hace 4 horas",
    category: "calidad",
    isFavorite: false,
    views: 89,
    thumbnail: "/operativo-2.jpg"
  },
  {
    id: "op-003",
    title: "Capacidad de Producción",
    description: "Análisis de capacidad y utilización de recursos",
    lastUpdated: "Hace 6 horas", 
    category: "produccion",
    isFavorite: true,
    views: 203,
    thumbnail: "/operativo-3.jpg"
  },
  {
    id: "op-004",
    title: "Eficiencia Operacional",
    description: "KPIs de eficiencia y optimización de procesos",
    lastUpdated: "Ayer",
    category: "eficiencia",
    isFavorite: false,
    views: 134,
    thumbnail: "/operativo-4.jpg"
  },
  {
    id: "op-005",
    title: "Gestión de Inventarios",
    description: "Control de stock y rotación de inventarios",
    lastUpdated: "Hace 1 día",
    category: "inventarios",
    isFavorite: false,
    views: 78,
    thumbnail: "/operativo-5.jpg"
  },
  {
    id: "op-006",
    title: "Tiempos de Entrega",
    description: "Análisis de cumplimiento de plazos de entrega",
    lastUpdated: "Hace 2 días",
    category: "logistica",
    isFavorite: true,
    views: 167,
    thumbnail: "/operativo-6.jpg"
  }
];

export const OperativoPage = () => {
  return (
    <DepartmentOverview
      departmentName="Operativo"
      departmentDescription="Reportes y métricas operacionales para optimizar procesos, controlar calidad y maximizar la eficiencia de tus operaciones."
      departmentIcon={BarChart3}
      reports={operativoReports}
      gradientColor="from-blue-500 to-blue-600"
    />
  );
};