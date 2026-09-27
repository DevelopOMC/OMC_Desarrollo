import {
  makeTransform,
  rotate,
  scale,
  translate,
} from "@remotion/animation-utils";
import { ArrowRight, MousePointer2 } from "lucide-react";
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { DrawIcon } from "../components/Icons";
import {
  MARK_ASPECT,
  MARK_BODY_PATH,
  MARK_CENTER,
  MARK_FINGERS,
  MarkGradient,
  markViewBox,
  useSvgId,
  Wordmark,
} from "../components/Logo";
import { SceneContainer } from "../components/SceneContainer";
import { clamp, fadeFrom, springAt } from "../lib/animation";
import { useLayout } from "../lib/useLayout";
import { colors, fonts, radii, shadows, springs } from "../theme";
import { SCENES } from "../timeline";

const { durationInFrames } = SCENES.cta;

const T = {
  shapes: 0,
  body: 10,
  fingerTop: 14,
  fingerBottom: 18,
  letters: 16,
  flash: 32,
  cta: 38,
  url: 48,
  cursor: 54,
  tap: 66,
};

/** Formas pequeñas que convergen hacia el logo (posiciones deterministas). */
const SHAPES = Array.from({ length: 22 }, (_, i) => {
  const angle = random(`angle-${i}`) * Math.PI * 2;
  const distance = 650 + random(`distance-${i}`) * 500;
  const kinds = ["circle", "square", "pill"] as const;
  const palette = [
    colors.primary,
    colors.primaryGlow,
    colors.accent,
    colors.primaryDark,
  ];
  return {
    from: { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance },
    to: {
      x: (random(`tx-${i}`) - 0.5) * 380,
      y: (random(`ty-${i}`) - 0.5) * 150,
    },
    size: 18 + random(`size-${i}`) * 26,
    kind: kinds[i % kinds.length],
    color: palette[i % palette.length],
    delay: Math.round(random(`delay-${i}`) * 8),
    spin: (random(`spin-${i}`) - 0.5) * 540,
  };
});

/** Isotipo montado a partir de sus tres piezas. */
const AssembledMark: React.FC<{ width: number }> = ({ width }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const gradientId = useSvgId("cta-mark");

  const body = springAt(frame, fps, T.body, springs.bouncy);
  const top = springAt(frame, fps, T.fingerTop, springs.snappy);
  const bottom = springAt(frame, fps, T.fingerBottom, springs.snappy);
  const { x: cx, y: cy } = MARK_CENTER;

  return (
    <svg
      width={width}
      height={width / MARK_ASPECT}
      viewBox={markViewBox}
      style={{ overflow: "visible" }}
    >
      <defs>
        <MarkGradient id={gradientId} />
      </defs>
      <g fill={`url(#${gradientId})`}>
        <g
          opacity={fadeFrom(body, 0.3)}
          transform={`translate(${(1 - body) * 260} ${(1 - body) * -220}) rotate(${(1 - body) * 35} ${cx} ${cy}) translate(${cx} ${cy}) scale(${0.3 + 0.7 * body}) translate(${-cx} ${-cy})`}
        >
          <path d={MARK_BODY_PATH} />
        </g>
        <rect
          {...MARK_FINGERS.top}
          rx={MARK_FINGERS.top.height / 2}
          opacity={fadeFrom(top, 0.3)}
          transform={`translate(${(1 - top) * -520} 0)`}
        />
        <rect
          {...MARK_FINGERS.bottom}
          rx={MARK_FINGERS.bottom.height / 2}
          opacity={fadeFrom(bottom, 0.3)}
          transform={`translate(${(1 - bottom) * -640} 0)`}
        />
      </g>
    </svg>
  );
};

export const Scene6Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { pick, isVertical, width } = useLayout();

  const logoCenter = pick({ x: 540, y: 720 }, { x: 960, y: 400 });
  const markWidth = pick(480, 280);

  const cta = springAt(frame, fps, T.cta, {
    damping: 8,
    stiffness: 150,
    mass: 0.7,
  });
  const url = springAt(frame, fps, T.url, springs.snappy);
  const cursor = springAt(frame, fps, T.cursor, springs.snappy);
  const press = springAt(frame, fps, T.tap, springs.pop);
  const pressScale =
    frame >= T.tap ? 1 - 0.07 * Math.sin(Math.min(1, press) * Math.PI) : 1;
  const ripple = interpolate(frame, [T.tap, T.tap + 18], [0, 1], clamp);
  const flash = interpolate(frame, [T.flash, T.flash + 20], [0, 1], clamp);

  const ctaTop = pick(1070, 580);
  const ctaHeight = pick(150, 136);
  const cursorSize = pick(104, 96);

  return (
    <SceneContainer
      durationInFrames={durationInFrames}
      exit={false}
      zoom={0.02}
    >
      <AbsoluteFill>
        {/* Formas que convergen al centro */}
        {SHAPES.map((shape, i) => {
          const p = springAt(
            frame,
            fps,
            T.shapes + shape.delay,
            springs.snappy,
          );
          const x = interpolate(p, [0, 1], [shape.from.x, shape.to.x]);
          const y = interpolate(p, [0, 1], [shape.from.y, shape.to.y]);
          const absorb = interpolate(p, [0.75, 1], [1, 0], clamp);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: logoCenter.x + x,
                top: logoCenter.y + y,
                width: shape.kind === "pill" ? shape.size * 2 : shape.size,
                height: shape.size,
                borderRadius:
                  shape.kind === "square" ? shape.size * 0.3 : radii.pill,
                backgroundColor: shape.color,
                opacity: absorb * fadeFrom(p, 0.2),
                transform: makeTransform([
                  translate("-50%", "-50%"),
                  rotate(shape.spin * (1 - p)),
                  scale(0.4 + 0.6 * absorb),
                ]),
              }}
            />
          );
        })}

        {/* Resplandor suave al completarse el logo */}
        <div
          style={{
            position: "absolute",
            left: logoCenter.x,
            top: logoCenter.y,
            width: 1100,
            height: 1100,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${colors.primaryGlow} 0%, rgba(92, 201, 138, 0) 65%)`,
            opacity: frame >= T.flash ? 0.45 * (1 - flash) : 0,
            transform: makeTransform([
              translate("-50%", "-50%"),
              scale(0.35 + 0.9 * flash),
            ]),
          }}
        />

        {/* Logo: isotipo + logotipo */}
        <div
          style={{
            position: "absolute",
            left: 0,
            width,
            top: logoCenter.y,
            display: "flex",
            flexDirection: isVertical ? "column" : "row",
            alignItems: "center",
            justifyContent: "center",
            gap: pick(26, 34),
            transform: makeTransform([translate("0px", "-50%")]),
          }}
        >
          <AssembledMark width={markWidth} />
          <Wordmark
            fontSize={pick(132, 124)}
            style={{ marginTop: isVertical ? 0 : 28 }}
            letterStyle={(index) => {
              const s = springAt(
                frame,
                fps,
                T.letters + index * 1.5,
                springs.snappy,
              );
              const dx = (random(`lx-${index}`) - 0.5) * 900;
              const dy = (random(`ly-${index}`) - 0.5) * 700;
              return {
                opacity: fadeFrom(s, 0.4),
                transform: makeTransform([
                  translate((1 - s) * dx, (1 - s) * dy),
                  rotate((1 - s) * (random(`lr-${index}`) - 0.5) * 140),
                  scale(0.2 + 0.8 * s),
                ]),
              };
            }}
          />
        </div>

        {/* CTA */}
        <div
          style={{
            position: "absolute",
            left: 0,
            width,
            top: ctaTop,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "relative",
              height: ctaHeight,
              display: "flex",
              alignItems: "center",
              gap: 30,
              padding: `0 ${ctaHeight * 0.16}px 0 ${ctaHeight * 0.42}px`,
              borderRadius: radii.pill,
              backgroundColor: colors.accent,
              boxShadow: shadows.accent,
              fontFamily: fonts.family,
              fontWeight: fonts.weights.extrabold,
              fontSize: pick(54, 52),
              letterSpacing: "-0.02em",
              color: colors.surface,
              opacity: fadeFrom(cta, 0.3),
              transform: makeTransform([scale(Math.max(0, cta) * pressScale)]),
            }}
          >
            Registrar mi negocio
            <div
              style={{
                width: ctaHeight * 0.68,
                height: ctaHeight * 0.68,
                borderRadius: "50%",
                backgroundColor: colors.surface,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <DrawIcon
                icon={ArrowRight}
                size={ctaHeight * 0.36}
                color={colors.accent}
                strokeWidth={3}
              />
            </div>
            {/* Onda del "tap" sobre la flecha */}
            <div
              style={{
                position: "absolute",
                left: `calc(100% - ${ctaHeight * 0.5}px)`,
                top: "50%",
                width: 260,
                height: 260,
                borderRadius: "50%",
                backgroundColor: colors.surface,
                opacity: frame >= T.tap ? 0.35 * (1 - ripple) : 0,
                transform: makeTransform([
                  translate("-50%", "-50%"),
                  scale(0.1 + ripple),
                ]),
              }}
            />
            {/* Cursor que pulsa la flecha del botón (la punta cae en su centro) */}
            <div
              style={{
                position: "absolute",
                left: `calc(100% - ${ctaHeight * 0.5 + cursorSize * 0.17}px)`,
                top: ctaHeight / 2 - cursorSize * 0.17,
                transformOrigin: "17% 17%",
                opacity: fadeFrom(cursor, 0.3),
                transform: makeTransform([
                  translate((1 - cursor) * 260, (1 - cursor) * 240),
                  scale(
                    1 -
                      0.12 *
                        Math.sin(Math.min(1, press) * Math.PI) *
                        (frame >= T.tap ? 1 : 0),
                  ),
                ]),
              }}
            >
              <DrawIcon
                icon={MousePointer2}
                size={cursorSize}
                color={colors.ink}
                strokeWidth={1.6}
                style={{
                  fill: colors.surface,
                  filter: "drop-shadow(0 10px 16px rgba(29,43,36,0.25))",
                }}
              />
            </div>
          </div>
        </div>

        {/* URL */}
        <div
          style={{
            position: "absolute",
            left: 0,
            width,
            top: ctaTop + ctaHeight + pick(64, 50),
            textAlign: "center",
            fontFamily: fonts.family,
            fontWeight: fonts.weights.bold,
            fontSize: pick(46, 42),
            color: colors.ink,
            letterSpacing: "-0.01em",
            opacity: fadeFrom(url, 0.5),
            transform: makeTransform([translate(0, (1 - url) * 40)]),
          }}
        >
          aquillega<span style={{ color: colors.primary }}>.es</span>
        </div>
      </AbsoluteFill>
    </SceneContainer>
  );
};
