import {Easing, interpolate, spring} from 'remotion';

// Curvas de animación
export const EXPO_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EXPO_IN = Easing.bezier(0.7, 0, 0.84, 0);
export const EXPO_IN_OUT = Easing.bezier(0.87, 0, 0.13, 1);
export const QUINT_OUT = Easing.bezier(0.22, 1, 0.36, 1);
export const QUART_IN_OUT = Easing.bezier(0.76, 0, 0.24, 1);
export const BACK_OUT = Easing.bezier(0.34, 1.56, 0.64, 1);
export const SMOOTH = Easing.bezier(0.45, 0, 0.55, 1);
export const SNAP = Easing.bezier(0.83, 0, 0.17, 1);
export const CUBIC_IN = Easing.bezier(0.32, 0, 0.67, 0);

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Interpolación con clamp entre [start, start + dur]. */
export const tween = (
  frame: number,
  start: number,
  dur: number,
  from = 0,
  to = 1,
  easing: (t: number) => number = EXPO_OUT,
) =>
  interpolate(frame, [start, start + Math.max(1, dur)], [from, to], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

/** Muelle físico con retardo. */
export const springAt = (
  frame: number,
  fps: number,
  delay: number,
  config: Partial<{damping: number; stiffness: number; mass: number; overshootClamping: boolean}> = {},
) =>
  spring({
    frame: frame - delay,
    fps,
    config: {damping: 13, stiffness: 170, mass: 0.8, ...config},
  });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Oscilación suave para movimientos "idle". */
export const wobble = (frame: number, seed: number, speed = 1, amp = 1) =>
  Math.sin((frame * 0.06 + seed * 1.7) * speed) * amp;

/** Cúbica de Bézier 2D. */
export const bezier = (
  t: number,
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
  p3: [number, number],
): [number, number] => {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return [a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]];
};

/** Velocidad (unidades/frame) de una curva de easing aplicada a una distancia. */
export const easedVelocity = (
  frame: number,
  start: number,
  dur: number,
  distance: number,
  easing: (t: number) => number,
) => {
  const t = (frame - start) / dur;
  if (t <= 0 || t >= 1) return 0;
  const d = 0.5 / dur;
  const a = easing(clamp01(t - d));
  const b = easing(clamp01(t + d));
  return ((b - a) / (2 * d)) * (distance / dur);
};
