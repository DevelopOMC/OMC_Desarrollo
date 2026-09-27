import {
  makeTransform,
  rotate,
  scale,
  translate,
  translateY,
} from "@remotion/animation-utils";
import {
  ArrowDown,
  CalendarX,
  Percent,
  ShoppingBag,
  Sparkles,
  Store,
} from "lucide-react";
import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { DrawIcon } from "../components/Icons";
import { SceneContainer } from "../components/SceneContainer";
import { SpringText } from "../components/SpringText";
import { clamp, fadeFrom, springAt } from "../lib/animation";
import { useLayout } from "../lib/useLayout";
import { colors, fonts, radii, shadows, springs } from "../theme";
import { SCENES } from "../timeline";

const { durationInFrames } = SCENES.ventajas;

const T = {
  title: 2,
  firstTile: 16,
  tileStagger: 10,
  counterCard: 66,
  countFrom: 76,
  countTo: 118,
};

type BenefitKind = "comisiones" | "cuota" | "tienda";

const BENEFITS: { kind: BenefitKind; label: string }[] = [
  { kind: "comisiones", label: "Comisiones\nbajas" },
  { kind: "cuota", label: "Sin cuota\nmensual" },
  { kind: "tienda", label: "Tienda online\nincluida" },
];

/** Contenido animado de cada baldosa (a partir de su frame de entrada). */
const BenefitIcon: React.FC<{
  kind: BenefitKind;
  start: number;
  size: number;
}> = ({ kind, start, size }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const draw = springAt(frame, fps, start + 2, springs.smooth, 22);
  const iconSize = size * 0.52;

  if (kind === "comisiones") {
    // El % decrece a saltos, con una flecha que rebota hacia abajo.
    const steps = [18, 27, 36].map((d) =>
      springAt(frame, fps, start + d, springs.bouncy),
    );
    const shrink = 1 - 0.11 * steps.reduce((a, b) => a + b, 0);
    const arrow = springAt(frame, fps, start + 14, springs.pop);
    const bob =
      Math.max(0, Math.sin((frame - start - 14) / 4)) * 10 * Math.min(1, arrow);
    return (
      <>
        <div style={{ transform: makeTransform([scale(shrink)]) }}>
          <DrawIcon
            icon={Percent}
            size={iconSize}
            color={colors.primary}
            strokeWidth={2.4}
            draw={draw}
          />
        </div>
        <Badge progress={arrow} offsetY={bob}>
          <DrawIcon
            icon={ArrowDown}
            size={size * 0.17}
            color={colors.surface}
            strokeWidth={3}
          />
        </Badge>
      </>
    );
  }

  if (kind === "cuota") {
    // Calendario tachado: la línea naranja se dibuja con stroke-dashoffset.
    const strike = springAt(frame, fps, start + 20, springs.smooth, 14);
    const length = size * 0.8;
    return (
      <>
        <DrawIcon
          icon={CalendarX}
          size={iconSize}
          color={colors.primary}
          strokeWidth={2.2}
          draw={draw}
        />
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ position: "absolute", inset: 0 }}
        >
          <line
            x1={size * 0.22}
            y1={size * 0.22}
            x2={size * 0.78}
            y2={size * 0.78}
            stroke={colors.accent}
            strokeWidth={size * 0.06}
            strokeLinecap="round"
            strokeDasharray={length}
            strokeDashoffset={length * (1 - strike)}
            opacity={strike > 0.01 ? 1 : 0}
          />
        </svg>
      </>
    );
  }

  // Bolsa que se transforma en tienda (cross-fade + escala + giro con spring).
  const swap = springAt(frame, fps, start + 26, springs.smooth, 12);
  const storeIn = springAt(frame, fps, start + 30, springs.bouncy);
  const sparkle = springAt(frame, fps, start + 36, springs.pop);
  return (
    <>
      <div
        style={{
          position: "absolute",
          opacity: 1 - swap,
          transform: makeTransform([scale(1 - 0.6 * swap), rotate(-35 * swap)]),
        }}
      >
        <DrawIcon
          icon={ShoppingBag}
          size={iconSize}
          color={colors.primary}
          strokeWidth={2.2}
          draw={draw}
        />
      </div>
      <div
        style={{
          position: "absolute",
          opacity: fadeFrom(storeIn, 0.4),
          transform: makeTransform([
            scale(0.35 + 0.65 * storeIn),
            rotate(25 * (1 - storeIn)),
          ]),
        }}
      >
        <DrawIcon
          icon={Store}
          size={iconSize}
          color={colors.primary}
          strokeWidth={2.2}
        />
      </div>
      <Badge progress={sparkle} color={colors.primary}>
        <DrawIcon
          icon={Sparkles}
          size={size * 0.16}
          color={colors.surface}
          strokeWidth={2.6}
        />
      </Badge>
    </>
  );
};

const Badge: React.FC<{
  progress: number;
  offsetY?: number;
  color?: string;
  children: React.ReactNode;
}> = ({ progress, offsetY = 0, color = colors.accent, children }) => (
  <div
    style={{
      position: "absolute",
      top: -18,
      right: -18,
      width: 84,
      height: 84,
      borderRadius: "50%",
      backgroundColor: color,
      border: `6px solid ${colors.surface}`,
      boxShadow: color === colors.accent ? shadows.accent : shadows.primary,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      opacity: fadeFrom(progress, 0.3),
      transform: makeTransform([
        translateY(offsetY),
        scale(Math.max(0, progress)),
      ]),
    }}
  >
    {children}
  </div>
);

/** Reloj simple cuya aguja gira mientras cuenta el marcador. */
const Clock: React.FC<{ size: number; turn: number }> = ({ size, turn }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <circle
      cx="50"
      cy="54"
      r="36"
      fill={colors.surface}
      stroke={colors.accent}
      strokeWidth="8"
    />
    <rect x="42" y="6" width="16" height="10" rx="4" fill={colors.accent} />
    <line
      x1="50"
      y1="54"
      x2="50"
      y2="32"
      stroke={colors.ink}
      strokeWidth="7"
      strokeLinecap="round"
      transform={`rotate(${turn * 360} 50 54)`}
    />
    <circle cx="50" cy="54" r="5" fill={colors.ink} />
  </svg>
);

export const Scene3Ventajas: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { pick, isVertical } = useLayout();

  const tileSize = pick(260, 250);
  const minutes = interpolate(frame, [T.countFrom, T.countTo], [0, 20], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const cardIn = springAt(frame, fps, T.counterCard, springs.snappy);
  const done = springAt(frame, fps, T.countTo, springs.pop);
  const numberScale =
    frame >= T.countTo ? 1 + 0.12 * Math.sin(Math.min(1, done) * Math.PI) : 1;

  return (
    <SceneContainer durationInFrames={durationInFrames}>
      <AbsoluteFill>
        <SpringText
          text={
            isVertical
              ? "Más margen para\n*tu negocio*"
              : "Más margen para *tu negocio*"
          }
          fontSize={pick(86, 80)}
          delay={T.title}
          style={{
            position: "absolute",
            left: 60,
            right: 60,
            top: pick(230, 110),
          }}
        />

        {/* Tres ventajas */}
        <div
          style={{
            position: "absolute",
            display: "flex",
            justifyContent: "center",
            gap: pick(30, 60),
            ...pick<React.CSSProperties>(
              { left: 40, right: 40, top: 560 },
              { left: 110, width: 1180, top: 330 },
            ),
          }}
        >
          {BENEFITS.map(({ kind, label }, index) => {
            const start = T.firstTile + index * T.tileStagger;
            const enter = springAt(frame, fps, start, springs.bouncy);
            return (
              <div
                key={kind}
                style={{
                  width: pick(310, 360),
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: tileSize,
                    height: tileSize,
                    borderRadius: radii.xl,
                    backgroundColor: colors.surface,
                    boxShadow: shadows.card,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: fadeFrom(enter, 0.4),
                    transform: makeTransform([
                      translate(0, (1 - enter) * 120),
                      scale(Math.max(0, enter)),
                    ]),
                  }}
                >
                  <BenefitIcon kind={kind} start={start} size={tileSize} />
                </div>
                <SpringText
                  text={label}
                  fontSize={pick(40, 42)}
                  weight={fonts.weights.bold}
                  delay={start + 8}
                  stagger={2}
                  lineHeight={1.15}
                  style={{ marginTop: 34 }}
                />
              </div>
            );
          })}
        </div>

        {/* Contador 0 → 20 min */}
        <div
          style={{
            position: "absolute",
            display: "flex",
            alignItems: "center",
            gap: pick(44, 20),
            borderRadius: radii.lg + 8,
            backgroundColor: colors.surface,
            boxShadow: shadows.lifted,
            opacity: fadeFrom(cardIn, 0.4),
            transform: makeTransform([
              translate(0, (1 - cardIn) * 160),
              scale(0.9 + 0.1 * cardIn),
            ]),
            ...pick<React.CSSProperties>(
              {
                left: 110,
                right: 110,
                top: 1100,
                height: 330,
                padding: "0 70px",
              },
              {
                left: 1360,
                width: 440,
                top: 300,
                height: 480,
                flexDirection: "column",
                justifyContent: "center",
              },
            ),
          }}
        >
          <Clock size={pick(170, 150)} turn={minutes / 20} />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: isVertical ? "flex-start" : "center",
              fontFamily: fonts.family,
            }}
          >
            <div
              style={{
                fontSize: pick(40, 36),
                fontWeight: fonts.weights.semibold,
                color: colors.inkSoft,
              }}
            >
              Entrega media
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 14,
                color: colors.primary,
                fontWeight: fonts.weights.extrabold,
                letterSpacing: "-0.04em",
                transform: makeTransform([scale(numberScale)]),
                transformOrigin: isVertical ? "left center" : "center",
              }}
            >
              <span
                style={{
                  fontSize: pick(170, 150),
                  lineHeight: 1,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {Math.round(minutes)}
              </span>
              <span style={{ fontSize: pick(76, 68) }}>min</span>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </SceneContainer>
  );
};
