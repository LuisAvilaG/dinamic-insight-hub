
"use client"
import { forwardRef } from "react"
import {tv} from "tailwind-variants"

import { cn } from "@/lib/utils"

// Componentes de Recharts que vamos a exportar
export {
  AreaChart,
  BarChart,
  LineChart,
  PieChart,
  RadarChart,
  RadialBarChart,
  // Elementos básicos
  CartesianGrid,
  Legend,
  PolarGrid,
  Tooltip,
  XAxis,
  YAxis,
  // Formas
  Area,
  Bar,
  Line,
  Pie,
  Radar,
  RadialBar,
} from "recharts"

// ========= Contenedor del Gráfico =========
const ChartContainer = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    config: object // Se requiere una configuración, aunque no se use directamente aquí
  }
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-legend_li]:text-muted-foreground [&_.recharts-polar-angle-axis_text]:fill-muted-foreground [&_.recharts-radial-bar-background-sector]:fill-muted",
      className
    )}
    {...props}
  >
    {children}
  </div>
))
ChartContainer.displayName = "ChartContainer"

// ========= Leyenda del Gráfico =========
const chartLegendVariants = tv({
  base: "flex items-center gap-2 text-sm text-muted-foreground",
  variants: {
    align: {
      left: "justify-start",
      center: "justify-center",
      right: "justify-end",
    },
    verticalAlign: {
      top: "items-start",
      middle: "items-center",
      bottom: "items-end",
    },
  },
  defaultVariants: {
    align: "center",
    verticalAlign: "bottom",
  },
});


const ChartLegend = forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &{
    align?: "left" | "center" | "right";
    verticalAlign?: "top" | "middle" | "bottom";
  }
>(({ className, align, verticalAlign, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(chartLegendVariants({ align, verticalAlign }), className)}
    {...props}
  />
))
ChartLegend.displayName = "ChartLegend"


// ========= Tooltip del Gráfico =========
const chartTooltipVariants = tv({
  base: "flex flex-col gap-1 rounded-lg border bg-background p-2.5 text-sm shadow-lg",
});

const ChartTooltip = forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn(chartTooltipVariants(), className)} {...props} />
))
ChartTooltip.displayName = "ChartTooltip"

const ChartTooltipContent = forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: "line" | "dot" | "dashed"
    nameKey?: string
    labelKey?: string
  }
>(({ 
  className, 
  hideLabel = false,
  hideIndicator = false, 
  ...props 
}, ref) => (
  <div
    ref={ref}
    className={cn("grid w-32 gap-1.5", className)}
    {...props}
  />
))
ChartTooltipContent.displayName = "ChartTooltipContent"


export {
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
}
