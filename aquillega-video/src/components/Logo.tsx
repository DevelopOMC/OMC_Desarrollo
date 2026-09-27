import React, { useId } from "react";
import { colors, fonts, logoGradient } from "../theme";

/*
 * Isotipo de AquíLLega vectorizado a partir del logo de aquillega.es:
 * dos "trazos de velocidad" (dedos) que se funden en una mano/ala que sube.
 * Todo está en cubic Béziers para poder animarlo (morph, ensamblado...).
 */

export const MARK_VIEWBOX = { x: -8, y: -4, width: 540, height: 280 } as const;
export const MARK_ASPECT = MARK_VIEWBOX.width / MARK_VIEWBOX.height;
export const MARK_CENTER = { x: 260, y: 136 } as const;
export const markViewBox = `${MARK_VIEWBOX.x} ${MARK_VIEWBOX.y} ${MARK_VIEWBOX.width} ${MARK_VIEWBOX.height}`;

/** Silueta completa del isotipo (17 segmentos, sentido horario). */
export const MARK_PATH =
  "M23 118.5L255 118.5C268 118.5 277 116.2 290 114C335.6 106.2 379.4 80.3 413.6 39" +
  "C435.7 12.3 454.3 1.1 477.6 0.2C505 -0.8 523.8 13.9 524.9 37.3C525.3 46.5 524.3 51.1 518.9 64.5" +
  "C482.5 154.6 383.8 238.3 284.1 263.6C252.5 271.7 246.7 272.6 196 272.6L137 272.6" +
  "C121.04 272.6 108.1 259.66 108.1 243.7C108.1 227.74 121.04 214.8 137 214.8L228 214.8" +
  "C238.71 214.8 247.4 206.11 247.4 195.4C247.4 184.69 238.71 176 228 176L23 176" +
  "C7.12 176 -5.75 163.13 -5.75 147.25C-5.75 131.37 7.12 118.5 23 118.5Z";

/**
 * Smartphone con la MISMA estructura de segmentos que MARK_PATH, para que
 * interpolatePath() haga un morph limpio punto a punto.
 */
export const PHONE_PATH =
  "M205 -34L300 -34C305 -34 310 -34 315 -34C337.1 -34 355 -16.1 355 6" +
  "C355 17.3 355 28.7 355 40C355 53.3 355 66.7 355 80C355 93.3 355 106.7 355 120" +
  "C355 168.7 355 217.3 355 266C355 288.1 337.1 306 315 306L205 306" +
  "C194.39 306 184.22 301.78 176.72 294.28C169.22 286.78 165 276.61 165 266L165 200" +
  "C165 190 165 180 165 170C165 160 165 150 165 140L165 6" +
  "C165 -4.61 169.22 -14.78 176.72 -22.28C184.22 -29.78 194.39 -34 205 -34Z";

export const PHONE_BOX = {
  x: 165,
  y: -34,
  width: 190,
  height: 340,
  radius: 40,
} as const;

/** Piezas para ensamblar el logo: cuerpo + dos "dedos" (píldoras). */
export const MARK_BODY_PATH =
  "M252 118.5L255 118.5C268 118.5 277 116.2 290 114C335.6 106.2 379.4 80.3 413.6 39" +
  "C435.7 12.3 454.3 1.1 477.6 0.2C505 -0.8 523.8 13.9 524.9 37.3C525.3 46.5 524.3 51.1 518.9 64.5" +
  "C482.5 154.6 383.8 238.3 284.1 263.6C252.5 271.7 246.7 272.6 196 272.6L190 272.6L190 214.8L228 214.8" +
  "C238.71 214.8 247.4 206.11 247.4 195.4C247.4 184.69 238.71 176 228 176L252 176Z";

export const MARK_FINGERS = {
  top: { x: -5.75, y: 118.5, width: 315.75, height: 57.5 },
  bottom: { x: 108.1, y: 214.8, width: 141.9, height: 57.8 },
} as const;

/** Degradado del isotipo; `id` debe ser único en el documento. */
export const MarkGradient: React.FC<{ id: string }> = ({ id }) => (
  <linearGradient
    id={id}
    x1="0"
    y1="230"
    x2="520"
    y2="20"
    gradientUnits="userSpaceOnUse"
  >
    <stop offset="0" stopColor={logoGradient[0]} />
    <stop offset="0.5" stopColor={logoGradient[1]} />
    <stop offset="1" stopColor={logoGradient[2]} />
  </linearGradient>
);

export const useSvgId = (prefix: string) =>
  `${prefix}-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

export const LogoMark: React.FC<{
  width: number;
  fill?: string;
  style?: React.CSSProperties;
}> = ({ width, fill, style }) => {
  const gradientId = useSvgId("mark");
  return (
    <svg
      width={width}
      height={width / MARK_ASPECT}
      viewBox={markViewBox}
      style={{ overflow: "visible", ...style }}
    >
      <defs>
        <MarkGradient id={gradientId} />
      </defs>
      <path d={MARK_PATH} fill={fill ?? `url(#${gradientId})`} />
    </svg>
  );
};

export const WORDMARK = "Aquí Llega";

/**
 * Logotipo "Aquí Llega" en Sora. Cada letra es un span para poder animarlas
 * por separado con `letterStyle`.
 */
export const Wordmark: React.FC<{
  fontSize: number;
  letterStyle?: (index: number) => React.CSSProperties;
  style?: React.CSSProperties;
}> = ({ fontSize, letterStyle, style }) => {
  const splitAt = WORDMARK.indexOf(" ");
  return (
    <div
      style={{
        display: "flex",
        fontFamily: fonts.family,
        fontWeight: fonts.weights.bold,
        fontSize,
        lineHeight: 1,
        letterSpacing: "-0.035em",
        whiteSpace: "pre",
        ...style,
      }}
    >
      {[...WORDMARK].map((char, index) => (
        <span
          key={index}
          style={{
            display: "inline-block",
            color: index < splitAt ? colors.ink : colors.primary,
            width: char === " " ? "0.26em" : undefined,
            ...letterStyle?.(index),
          }}
        >
          {char}
        </span>
      ))}
    </div>
  );
};
