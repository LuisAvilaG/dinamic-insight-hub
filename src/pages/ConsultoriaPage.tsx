import { DepartmentOverviewConnected } from "@/components/departments/DepartmentOverviewConnected";
import { Search } from "lucide-react";

export const ConsultoriaPage = () => {
  return (
    <DepartmentOverviewConnected
      departmentName="Consultoría"
      departmentDescription="Gestión integral de proyectos de consultoría, control de rentabilidad y optimización de recursos especializados."
      departmentIcon={Search}
      gradientColor="from-purple-500 to-purple-600"
    />
  );
};