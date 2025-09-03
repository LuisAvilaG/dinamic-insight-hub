import { DepartmentOverviewConnected } from "@/components/departments/DepartmentOverviewConnected";
import { Users } from "lucide-react";

export const DirectivoPage = () => {
  return (
    <DepartmentOverviewConnected
      departmentName="Directivo"
      departmentDescription="Dashboard ejecutivo con indicadores estratégicos, análisis de mercado y herramientas para la toma de decisiones de alto nivel."
      departmentIcon={Users}
      gradientColor="from-orange-500 to-orange-600"
    />
  );
};