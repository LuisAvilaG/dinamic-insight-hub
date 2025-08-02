import { DepartmentOverview } from "@/components/departments/DepartmentOverview";
import { Zap } from "lucide-react";

const dinamicReports = [
  {
    id: "din-001",
    title: "Herramientas de Automatización",
    description: "Suite de herramientas para automatizar procesos empresariales",
    lastUpdated: "Hace 5 min",
    category: "automatizacion",
    isFavorite: true,
    views: 512,
    thumbnail: "/dinamic-1.jpg"
  },
  {
    id: "din-002",
    title: "Integración de Sistemas",
    description: "Conectores y APIs para integración con sistemas externos",
    lastUpdated: "Hace 30 min",
    category: "integracion",
    isFavorite: true,
    views: 378,
    thumbnail: "/dinamic-2.jpg"
  },
  {
    id: "din-003",
    title: "Generador de Reportes",
    description: "Herramienta para crear reportes personalizados dinámicamente",
    lastUpdated: "Hace 1 hora",
    category: "reportes",
    isFavorite: false,
    views: 234,
    thumbnail: "/dinamic-3.jpg"
  },
  {
    id: "din-004",
    title: "Analytics Avanzado",
    description: "Algoritmos de machine learning para análisis predictivo",
    lastUpdated: "Hace 2 horas",
    category: "analytics",
    isFavorite: true,
    views: 456,
    thumbnail: "/dinamic-4.jpg"
  },
  {
    id: "din-005",
    title: "Dashboard Builder",
    description: "Constructor visual de dashboards interactivos",
    lastUpdated: "Hace 4 horas",
    category: "dashboards",
    isFavorite: false,
    views: 189,
    thumbnail: "/dinamic-5.jpg"
  },
  {
    id: "din-006",
    title: "Workflow Engine",
    description: "Motor de flujos de trabajo para automatizar procesos",
    lastUpdated: "Ayer",
    category: "workflows",
    isFavorite: true,
    views: 267,
    thumbnail: "/dinamic-6.jpg"
  },
  {
    id: "din-007",
    title: "Data Connector Hub",
    description: "Centro de conexiones para fuentes de datos múltiples",
    lastUpdated: "Hace 1 día",
    category: "conectores",
    isFavorite: false,
    views: 145,
    thumbnail: "/dinamic-7.jpg"
  },
  {
    id: "din-008",
    title: "AI Assistant",
    description: "Asistente de inteligencia artificial para análisis de datos",
    lastUpdated: "Hace 1 día",
    category: "ia",
    isFavorite: true,
    views: 398,
    thumbnail: "/dinamic-8.jpg"
  }
];

export const DinamicPage = () => {
  return (
    <DepartmentOverview
      departmentName="Dinamic"
      departmentDescription="Herramientas avanzadas y utilidades exclusivas de Dinamic Software para potenciar tu experiencia de Business Intelligence."
      departmentIcon={Zap}
      reports={dinamicReports}
      gradientColor="from-primary to-secondary"
    />
  );
};