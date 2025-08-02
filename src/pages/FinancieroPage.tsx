import { DepartmentOverview } from "@/components/departments/DepartmentOverview";
import { DollarSign } from "lucide-react";

const financieroReports = [
  {
    id: "fin-001",
    title: "Estado de Resultados",
    description: "Análisis completo de ingresos, gastos y rentabilidad",
    lastUpdated: "Hace 1 hora",
    category: "resultados",
    isFavorite: true,
    views: 234,
    thumbnail: "/financiero-1.jpg"
  },
  {
    id: "fin-002",
    title: "Flujo de Caja",
    description: "Proyecciones y análisis del flujo de efectivo",
    lastUpdated: "Hace 3 horas",
    category: "cashflow",
    isFavorite: true,
    views: 189,
    thumbnail: "/financiero-2.jpg"
  },
  {
    id: "fin-003",
    title: "Análisis de Presupuestos",
    description: "Comparativa presupuesto vs real por departamento",
    lastUpdated: "Hace 5 horas",
    category: "presupuestos",
    isFavorite: false,
    views: 156,
    thumbnail: "/financiero-3.jpg"
  },
  {
    id: "fin-004",
    title: "Indicadores Financieros",
    description: "KPIs financieros clave y ratios de liquidez",
    lastUpdated: "Ayer",
    category: "indicadores",
    isFavorite: true,
    views: 298,
    thumbnail: "/financiero-4.jpg"
  },
  {
    id: "fin-005",
    title: "Análisis de Costos",
    description: "Desglose detallado de costos por proyecto y centro",
    lastUpdated: "Hace 1 día",
    category: "costos",
    isFavorite: false,
    views: 112,
    thumbnail: "/financiero-5.jpg"
  },
  {
    id: "fin-006",
    title: "Rentabilidad por Cliente",
    description: "Análisis de márgenes y rentabilidad por cliente",
    lastUpdated: "Hace 2 días",
    category: "rentabilidad",
    isFavorite: true,
    views: 187,
    thumbnail: "/financiero-6.jpg"
  }
];

export const FinancieroPage = () => {
  return (
    <DepartmentOverview
      departmentName="Financiero"
      departmentDescription="Análisis financiero integral para el control presupuestario, seguimiento de KPIs y toma de decisiones estratégicas."
      departmentIcon={DollarSign}
      reports={financieroReports}
      gradientColor="from-green-500 to-green-600"
    />
  );
};