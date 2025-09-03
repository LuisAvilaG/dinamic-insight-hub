import { DepartmentOverviewConnected } from "@/components/departments/DepartmentOverviewConnected";
import { BarChart3 } from "lucide-react";

export const OperativoPage = () => {
  return (
    <DepartmentOverviewConnected
      departmentName="Operativo"
      departmentDescription="Reportes y métricas operacionales para optimizar procesos, controlar calidad y maximizar la eficiencia de tus operaciones."
      departmentIcon={BarChart3}
      gradientColor="from-blue-500 to-blue-600"
    />
  );
};