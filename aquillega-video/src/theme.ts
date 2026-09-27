import type { SpringConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Sora";

/**
 * Design tokens de AquíLLega.
 * Toda la paleta, tipografía, radios, sombras y "físicas" de animación del
 * vídeo salen de aquí: para ajustar la marca basta con tocar este archivo.
 */

export const colors = {
  /** Verde primario de marca */
  primary: "#2E9E5B",
  primaryDark: "#23804A",
  primaryDeep: "#17603A",
  primaryGlow: "#5CC98A",
  primaryLight: "#DDF1E4",
  /** Naranja de acento */
  accent: "#F5942A",
  accentDark: "#D9780F",
  accentLight: "#FDEAD3",
  /** Fondo blanco/crema */
  background: "#FAF7F2",
  /** Fondo neutro (escena 1, antes de que aparezca la marca) */
  backgroundNeutral: "#EEECE7",
  surface: "#FFFFFF",
  ink: "#1D2B24",
  inkSoft: "#5F6D66",
  line: "#E9E2D7",
  mapLand: "#DDF1E4",
  mapNeighbour: "#EFEAE1",
  /** Rojo de notificación (solo escena 1: "caos") */
  alert: "#E5484D",
} as const;

/** Degradado del isotipo (de la cola de la "mano" a la cabeza). */
export const logoGradient = [
  colors.primaryDeep,
  colors.primary,
  colors.primaryGlow,
];
// Alternativa con el degradado original de aquillega.es:
// export const logoGradient = ["#9B3CFF", "#6C8BFF", "#5BE0FF"];

const sora = loadFont("normal", {
  weights: ["500", "600", "700", "800"],
  subsets: ["latin"],
});

export const fonts = {
  /** Sora: la tipografía de aquillega.es (sans-serif geométrica, 500–800) */
  family: sora.fontFamily,
  weights: { medium: 500, semibold: 600, bold: 700, extrabold: 800 },
} as const;

export const radii = {
  sm: 18,
  md: 32,
  lg: 48,
  xl: 72,
  pill: 999,
} as const;

export const shadows = {
  soft: "0 10px 30px rgba(29, 43, 36, 0.08)",
  card: "0 22px 60px rgba(29, 43, 36, 0.12)",
  lifted: "0 30px 80px rgba(29, 43, 36, 0.18)",
  primary: "0 18px 40px rgba(46, 158, 91, 0.35)",
  accent: "0 18px 40px rgba(245, 148, 42, 0.40)",
  alert: "0 12px 26px rgba(229, 72, 77, 0.35)",
} as const;

/** Configuraciones de spring() reutilizadas en todas las escenas. */
export const springs = {
  /** Entradas con rebote marcado (iconos, badges, CTA) */
  bouncy: { damping: 10, stiffness: 170, mass: 0.7 },
  /** "Pop" rápido con overshoot (notificaciones, checks) */
  pop: { damping: 9, stiffness: 220, mass: 0.55 },
  /** Entradas firmes con un leve rebote (textos, tarjetas) */
  snappy: { damping: 16, stiffness: 180, mass: 0.8 },
  /** Movimiento suave sin rebote (salidas, cámara, morph) */
  smooth: { damping: 200, stiffness: 120, mass: 1 },
} satisfies Record<string, Partial<SpringConfig>>;
