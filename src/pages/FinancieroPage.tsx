import { DepartmentOverviewConnected } from "@/components/departments/DepartmentOverviewConnected";
import { DollarSign } from "lucide-react";

export const FinancieroPage = () => {
  return (
    <DepartmentOverviewConnected
      departmentName="Financiero"
      departmentDescription="Análisis financiero integral para el control presupuestario, seguimiento de KPIs y toma de decisiones estratégicas."
      departmentIcon={DollarSign}
      gradientColor="from-green-500 to-green-600"
    />
  );
};