import {
  makeTransform,
  rotate,
  scale,
  translate,
  translateY,
} from "@remotion/animation-utils";
import { interpolatePath } from "@remotion/paths";
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  interpolateColors,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CheckStep } from "../components/CheckStep";
import {
  MARK_PATH,
  MarkGradient,
  PHONE_BOX,
  PHONE_PATH,
  useSvgId,
  Wordmark,
} from "../components/Logo";
import { SceneContainer } from "../components/SceneContainer";
import { SpringText } from "../components/SpringText";
import { clamp, fadeFrom, springAt } from "../lib/animation";
import { useLayout } from "../lib/useLayout";
import { colors, springs } from "../theme";
import { SCENES } from "../timeline";

const { durationInFrames } = SCENES.alta;

/** Frames clave (locales a la escena). */
const T = {
  tap: 18,
  morph: 26,
  wordmark: 54,
  headline: 68,
  firstStep: 88,
  stepStagger: 10,
};

const STEPS = [
  "Datos del negocio",
  "Dirección del negocio",
  "Contacto y acceso",
];

/** Área del SVG que contiene tanto el móvil como el isotipo. */
const STAGE = { x: -20, y: -60, width: 560, height: 400 };

/**
 * Smartphone → logo: interpolatePath() entre dos siluetas con la misma
 * estructura de segmentos + fundido de color tinta → degradado de marca.
 */
const PhoneToLogo: React.FC<{
  width: number;
  /** Desplazamiento inicial (px) para arrancar en el centro del encuadre */
  heroOffset: { x: number; y: number };
}> = ({ width, heroOffset }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const gradientId = useSvgId("morph");

  const enter = springAt(frame, fps, 0, springs.bouncy);
  const iconPop = springAt(frame, fps, 6, springs.pop);
  const press = springAt(frame, fps, T.tap, springs.pop);
  const morph = springAt(frame, fps, T.morph, springs.smooth, 30);
  // Tras el morph, el logo sube a su sitio para dejar hueco al texto.
  const settle = springAt(frame, fps, T.morph + 12, springs.snappy);

  const d = interpolatePath(morph, PHONE_PATH, MARK_PATH);
  const brand = interpolate(morph, [0.05, 0.5], [0, 1], clamp);
  const details = 1 - interpolate(morph, [0, 0.25], [0, 1], clamp);
  const ripple = interpolate(frame, [T.tap, T.tap + 16], [0, 1], clamp);
  const pressScale =
    frame < T.tap ? 1 : 1 - 0.12 * Math.sin(Math.min(1, press) * Math.PI);
  const twist = Math.sin(morph * Math.PI) * -7;

  const screen = {
    x: PHONE_BOX.x + 12,
    y: PHONE_BOX.y + 12,
    width: PHONE_BOX.width - 24,
    height: PHONE_BOX.height - 24,
  };
  const icon = { size: 84, cx: 260, cy: 136 };

  return (
    <svg
      width={width}
      height={(width * STAGE.height) / STAGE.width}
      viewBox={`${STAGE.x} ${STAGE.y} ${STAGE.width} ${STAGE.height}`}
      style={{
        overflow: "visible",
        opacity: fadeFrom(enter, 0.4),
        transform: makeTransform([
          translate(heroOffset.x * (1 - settle), heroOffset.y * (1 - settle)),
          translateY((1 - enter) * 260),
          scale(
            (0.7 + 0.3 * enter) *
              (1.3 - 0.3 * settle) *
              (1 + 0.08 * Math.sin(morph * Math.PI)),
          ),
          rotate(twist),
        ]),
      }}
    >
      <defs>
        <MarkGradient id={gradientId} />
      </defs>
      {/* Silueta que hace morph (tinta → degradado) */}
      <path d={d} fill={colors.ink} opacity={1 - brand} />
      <path d={d} fill={`url(#${gradientId})`} opacity={brand} />

      {/* Detalles del móvil: pantalla, altavoz y el icono de la app */}
      <g opacity={details}>
        <rect
          {...screen}
          rx={PHONE_BOX.radius - 12}
          fill={interpolateColors(
            ripple,
            [0, 1],
            [colors.background, colors.primaryLight],
          )}
        />
        <rect x={236} y={-12} width={48} height={10} rx={5} fill={colors.ink} />
        <circle
          cx={icon.cx}
          cy={icon.cy}
          r={70 * ripple}
          fill={colors.primary}
          opacity={0.35 * (1 - ripple)}
        />
        <g
          transform={`translate(${icon.cx} ${icon.cy}) scale(${Math.max(0, iconPop) * pressScale})`}
        >
          <rect
            x={-icon.size / 2}
            y={-icon.size / 2}
            width={icon.size}
            height={icon.size}
            rx={24}
            fill={`url(#${gradientId})`}
          />
          <path
            d={MARK_PATH}
            fill={colors.surface}
            transform="scale(0.12) translate(-260 -136)"
          />
        </g>
        <rect
          x={205}
          y={250}
          width={110}
          height={10}
          rx={5}
          fill={colors.line}
        />
      </g>
    </svg>
  );
};

export const Scene2Alta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { pick, isVertical } = useLayout();

  const column = pick(
    {
      left: 0,
      width: 1080,
      stageTop: 190,
      stageWidth: 620,
      hero: { x: 0, y: 420 },
    },
    {
      left: 90,
      width: 900,
      stageTop: 110,
      stageWidth: 560,
      hero: { x: 420, y: 230 },
    },
  );

  return (
    <SceneContainer durationInFrames={durationInFrames}>
      <AbsoluteFill>
        <div
          style={{
            position: "absolute",
            left: column.left,
            width: column.width,
            top: column.stageTop,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <PhoneToLogo width={column.stageWidth} heroOffset={column.hero} />
          <Wordmark
            fontSize={pick(118, 108)}
            style={{ marginTop: pick(-10, -18) }}
            letterStyle={(index) => {
              const s = springAt(
                frame,
                fps,
                T.wordmark + index * 2,
                springs.snappy,
              );
              return {
                opacity: fadeFrom(s, 0.5),
                transform: makeTransform([
                  translate(0, (1 - s) * 70),
                  rotate((1 - s) * -12),
                ]),
              };
            }}
          />
          <SpringText
            text={"Alta gratuita en\nmenos de *10 minutos.*"}
            fontSize={pick(68, 62)}
            highlightColor={colors.accent}
            delay={T.headline}
            style={{ marginTop: pick(56, 44) }}
          />
        </div>

        <div
          style={{
            position: "absolute",
            display: "flex",
            flexDirection: "column",
            gap: pick(28, 34),
            ...pick<React.CSSProperties>(
              { left: 110, right: 110, top: 1150 },
              {
                left: 1040,
                width: 760,
                top: 0,
                bottom: 0,
                justifyContent: "center",
              },
            ),
          }}
        >
          {STEPS.map((label, index) => (
            <CheckStep
              key={label}
              index={index}
              label={label}
              enterAt={T.firstStep + index * T.stepStagger}
              checkAt={T.firstStep + index * T.stepStagger + 12}
              width={isVertical ? 860 : 760}
              height={isVertical ? 136 : 150}
              fontSize={isVertical ? 42 : 44}
            />
          ))}
        </div>
      </AbsoluteFill>
    </SceneContainer>
  );
};
