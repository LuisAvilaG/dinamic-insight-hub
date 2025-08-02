import { DepartmentOverview } from "@/components/departments/DepartmentOverview";
import { Users } from "lucide-react";

const directivoReports = [
  {
    id: "dir-001",
    title: "Dashboard Ejecutivo",
    description: "KPIs estratégicos y métricas de alto nivel para la dirección",
    lastUpdated: "Hace 15 min",
    category: "estrategia",
    isFavorite: true,
    views: 456,
    thumbnail: "/directivo-1.jpg"
  },
  {
    id: "dir-002",
    title: "Análisis de Competencia",
    description: "Benchmarking y análisis competitivo del mercado",
    lastUpdated: "Hace 1 hora",
    category: "competencia",
    isFavorite: true,
    views: 234,
    thumbnail: "/directivo-2.jpg"
  },
  {
    id: "dir-003",
    title: "Indicadores de Crecimiento",
    description: "Métricas de crecimiento y expansión del negocio",
    lastUpdated: "Hace 3 horas",
    category: "crecimiento",
    isFavorite: false,
    views: 189,
    thumbnail: "/directivo-3.jpg"
  },
  {
    id: "dir-004",
    title: "Análisis de Riesgos",
    description: "Identificación y evaluación de riesgos empresariales",
    lastUpdated: "Ayer",
    category: "riesgos",
    isFavorite: true,
    views: 167,
    thumbnail: "/directivo-4.jpg"
  },
  {
    id: "dir-005",
    title: "Roadmap Estratégico",
    description: "Planificación estratégica y hoja de ruta empresarial",
    lastUpdated: "Hace 1 día",
    category: "planificacion",
    isFavorite: false,
    views: 145,
    thumbnail: "/directivo-5.jpg"
  },
  {
    id: "dir-006",
    title: "Performance Organizacional",
    description: "Análisis del rendimiento global de la organización",
    lastUpdated: "Hace 2 días",
    category: "performance",
    isFavorite: true,
    views: 298,
    thumbnail: "/directivo-6.jpg"
  }
];

export const DirectivoPage = () => {
  return (
    <DepartmentOverview
      departmentName="Directivo"
      departmentDescription="Dashboard ejecutivo con indicadores estratégicos, análisis de mercado y herramientas para la toma de decisiones de alto nivel."
      departmentIcon={Users}
      reports={directivoReports}
      gradientColor="from-orange-500 to-orange-600"
    />
  );
};