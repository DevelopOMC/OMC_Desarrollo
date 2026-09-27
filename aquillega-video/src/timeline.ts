/**
 * Guion temporal del anuncio (30 fps). Los frames son exactos al guion:
 * cada escena empieza en `from` y dura `durationInFrames`.
 */
export const FPS = 30;
export const DURATION_IN_FRAMES = 900; // 30 s

export const SCENES = {
  caos: { from: 0, durationInFrames: 120 }, //       0–120  ·  0–4 s
  alta: { from: 120, durationInFrames: 180 }, //   120–300  ·  4–10 s
  ventajas: { from: 300, durationInFrames: 180 }, // 300–480  · 10–16 s
  ruta: { from: 480, durationInFrames: 180 }, //   480–660  · 16–22 s
  mapa: { from: 660, durationInFrames: 150 }, //   660–810  · 22–27 s
  cta: { from: 810, durationInFrames: 90 }, //     810–900  · 27–30 s
} as const;

export type SceneId = keyof typeof SCENES;

export const FORMATS = {
  vertical: { width: 1080, height: 1920 }, // 9:16
  horizontal: { width: 1920, height: 1080 }, // 16:9
} as const;

/** Frames que dura la animación de salida al final de cada escena. */
export const EXIT_FRAMES = 10;
