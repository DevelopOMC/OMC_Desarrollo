import { interpolate, spring, type SpringConfig } from "remotion";
import { springs } from "../theme";

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

/**
 * spring() de Remotion con retardo: 0 → 1 (con overshoot según la config).
 * Es la base de todas las entradas, salidas y rebotes del vídeo.
 */
export const springAt = (
  frame: number,
  fps: number,
  delay = 0,
  config: Partial<SpringConfig> = springs.snappy,
  durationInFrames?: number,
) => spring({ frame, fps, delay, config, durationInFrames });

/** Progreso 0 → 1 de la salida de un elemento que termina en `end`. */
export const exitAt = (
  frame: number,
  fps: number,
  end: number,
  length = 12,
  config: Partial<SpringConfig> = springs.smooth,
) =>
  spring({ frame, fps, delay: end - length, config, durationInFrames: length });

/** Opacidad derivada de un spring (sin valores negativos ni > 1). */
export const fadeFrom = (progress: number, until = 0.6) =>
  interpolate(progress, [0, until], [0, 1], clamp);
