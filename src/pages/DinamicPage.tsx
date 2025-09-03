import { DepartmentOverviewConnected } from "@/components/departments/DepartmentOverviewConnected";
import { Zap } from "lucide-react";

export const DinamicPage = () => {
  return (
    <DepartmentOverviewConnected
      departmentName="Dinamic"
      departmentDescription="Herramientas avanzadas y utilidades exclusivas de Dinamic Software para potenciar tu experiencia de Business Intelligence."
      departmentIcon={Zap}
      gradientColor="from-primary to-secondary"
    />
  );
};