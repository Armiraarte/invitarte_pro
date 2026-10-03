/*
  Paleta unica del sitio: fondo negro con acentos vivos.
  Todos los colores de secciones, iconos y detalles salen de aqui.
*/
export const BRAND_COLORS = {
  cyan: '#22d3ee',
  violet: '#a78bfa',
  fuchsia: '#f472b6',
  amber: '#fbbf24',
  emerald: '#34d399',
  orange: '#fb923c'
} as const;

export const BRAND_SWATCHES = [
  BRAND_COLORS.fuchsia,
  BRAND_COLORS.cyan,
  BRAND_COLORS.violet,
  BRAND_COLORS.amber,
  BRAND_COLORS.emerald,
  BRAND_COLORS.orange
];

export const BRAND_GRADIENT = `linear-gradient(90deg, ${BRAND_COLORS.cyan} 0%, ${BRAND_COLORS.violet} 35%, ${BRAND_COLORS.fuchsia} 68%, ${BRAND_COLORS.amber} 100%)`;

export const PAGE_BACKGROUND = '#050507';
