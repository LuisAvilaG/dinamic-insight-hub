/**
 * Paleta de colores moderna para los gráficos y widgets del dashboard.
 * Inspirada en diseños de dashboards contemporáneos.
 */

// Paleta principal para gráficos (líneas, barras, donas, etc.)
export const CHART_COLOR_PALETTE = [
  '#3b82f6', // blue-500
  '#f97316', // orange-500
  '#14b8a6', // teal-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#22c55e', // green-500
  '#f59e0b', // amber-500
];

// Clases de Tailwind para los fondos y texto de los íconos de los KPIs.
// Esto permite asignar colores de forma dinámica basados en el título o el tipo de widget.
export const KPI_ICON_STYLES = [
  {
    background: 'bg-blue-100 dark:bg-blue-900/50',
    foreground: 'text-blue-600 dark:text-blue-400',
  },
  {
    background: 'bg-orange-100 dark:bg-orange-900/50',
    foreground: 'text-orange-600 dark:text-orange-400',
  },
  {
    background: 'bg-teal-100 dark:bg-teal-900/50',
    foreground: 'text-teal-600 dark:text-teal-400',
  },
  {
    background: 'bg-violet-100 dark:bg-violet-900/50',
    foreground: 'text-violet-600 dark:text-violet-400',
  },
  {
    background: 'bg-pink-100 dark:bg-pink-900/50',
    foreground: 'text-pink-600 dark:text-pink-400',
  },
  {
    background: 'bg-green-100 dark:bg-green-900/50',
    foreground: 'text-green-600 dark:text-green-400',
  },
  {
    background: 'bg-amber-100 dark:bg-amber-900/50',
    foreground: 'text-amber-600 dark:text-amber-400',
  },
];

// Función para obtener un estilo de ícono de forma consistente basado en un string (ej. el título del widget)
export const getKpiIconStyle = (title: string) => {
  // Genera un hash simple a partir del string
  const hashCode = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convertir a 32bit integer
    }
    return Math.abs(hash);
  };

  const index = hashCode(title) % KPI_ICON_STYLES.length;
  return KPI_ICON_STYLES[index];
};