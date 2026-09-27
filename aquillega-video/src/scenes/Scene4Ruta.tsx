import {
  makeTransform,
  rotate,
  scale,
  translate,
} from "@remotion/animation-utils";
import { getLength, getPointAtLength } from "@remotion/paths";
import { BadgeCheck, Bike, Laugh, Smile, Store } from "lucide-react";
import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { DrawIcon } from "../components/Icons";
import { useSvgId } from "../components/Logo";
import { SceneContainer } from "../components/SceneContainer";
import { SpringText } from "../components/SpringText";
import { clamp, fadeFrom, springAt } from "../lib/animation";
import { useLayout } from "../lib/useLayout";
import { colors, fonts, radii, shadows, springs } from "../theme";
import { SCENES } from "../timeline";

const { durationInFrames } = SCENES.ruta;

const T = {
  map: 0,
  storePin: 6,
  customerPin: 12,
  rider: 16,
  routeStart: 20,
  routeEnd: 100,
  badge: 104,
  label: 112,
};

/** Mapa ilustrado en un viewBox de 1000×1000. */
const MAP = 1000;
const STREET = 46;
const STREETS_X = [140, 420, 700, 880];
const STREETS_Y = [160, 440, 720, 880];
const PARKS = new Set(["1-0", "3-1", "0-3", "2-2"]);

/** Ruta por calles con esquinas redondeadas: tienda → cliente. */
const ROUTE =
  "M140 160V390Q140 440 190 440H370Q420 440 420 490V830Q420 880 470 880H880";
const ROUTE_LENGTH = getLength(ROUTE);
const START = { x: 140, y: 160 };
const END = { x: 880, y: 880 };

const blocks = (() => {
  const xs = [-100, ...STREETS_X, MAP + 100];
  const ys = [-100, ...STREETS_Y, MAP + 100];
  const result: {
    key: string;
    x: number;
    y: number;
    width: number;
    height: number;
    park: boolean;
  }[] = [];
  for (let i = 0; i < xs.length - 1; i++) {
    for (let j = 0; j < ys.length - 1; j++) {
      const x = xs[i] + STREET / 2;
      const y = ys[j] + STREET / 2;
      result.push({
        key: `${i}-${j}`,
        x,
        y,
        width: xs[i + 1] - STREET / 2 - x,
        height: ys[j + 1] - STREET / 2 - y,
        park: PARKS.has(`${i}-${j}`),
      });
    }
  }
  return result;
})();

const Pin: React.FC<{
  x: number;
  y: number;
  size: number;
  color: string;
  enter: number;
  bounce?: number;
  children: React.ReactNode;
}> = ({ x, y, size, color, enter, bounce = 0, children }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: size,
      height: size,
      borderRadius: "50%",
      backgroundColor: color,
      border: `8px solid ${colors.surface}`,
      boxShadow: shadows.card,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      opacity: fadeFrom(enter, 0.3),
      transform: makeTransform([
        translate("-50%", "-50%"),
        translate(0, (1 - enter) * -90),
        scale(Math.max(0, enter) * (1 + 0.28 * bounce)),
      ]),
    }}
  >
    {children}
  </div>
);

export const Scene4Ruta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { pick, isVertical } = useLayout();

  const mapBox = pick(
    { left: 70, top: 600, size: 940 },
    { left: 880, top: 90, size: 900 },
  );
  const k = mapBox.size / MAP;

  const mapIn = springAt(frame, fps, T.map, springs.snappy);
  const storeIn = springAt(frame, fps, T.storePin, springs.bouncy);
  const customerIn = springAt(frame, fps, T.customerPin, springs.bouncy);
  const riderIn = springAt(frame, fps, T.rider, springs.pop);

  // La ruta se dibuja con stroke-dashoffset animado con interpolate().
  const progress = interpolate(frame, [T.routeStart, T.routeEnd], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const drawn = progress * ROUTE_LENGTH;
  const riderPoint =
    getPointAtLength(ROUTE, Math.min(drawn, ROUTE_LENGTH - 180)) ?? START;
  const moving = frame >= T.routeStart && frame < T.routeEnd;
  const bob = moving ? Math.sin(frame * 0.9) * 5 : 0;

  const arrived = frame >= T.routeEnd;
  const cheer = springAt(frame, fps, T.routeEnd, springs.pop);
  const cheerBounce = arrived ? Math.sin(Math.min(1, cheer) * Math.PI) : 0;
  const badge = springAt(frame, fps, T.badge, {
    damping: 7,
    stiffness: 190,
    mass: 0.6,
  });
  const label = springAt(frame, fps, T.label, springs.snappy);
  const burst = interpolate(frame, [T.routeEnd, T.routeEnd + 22], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  const rider = { x: riderPoint.x * k, y: riderPoint.y * k + bob };
  const clipId = useSvgId("map-clip");

  return (
    <SceneContainer durationInFrames={durationInFrames}>
      <AbsoluteFill>
        <div
          style={pick<React.CSSProperties>(
            { position: "absolute", left: 60, right: 60, top: 250 },
            {
              position: "absolute",
              left: 120,
              width: 680,
              top: 0,
              bottom: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 40,
            },
          )}
        >
          <SpringText
            text={"Tú vendes,\n*nosotros llevamos.*"}
            fontSize={pick(86, 84)}
            align={pick("center", "left")}
            delay={8}
          />
          {!isVertical ? (
            <SpringText
              text="Repartidores verificados en tu zona, sin contratar a nadie."
              fontSize={38}
              weight={fonts.weights.semibold}
              color={colors.inkSoft}
              align="left"
              delay={22}
              stagger={1}
              lineHeight={1.3}
            />
          ) : null}
        </div>

        <div
          style={{
            position: "absolute",
            left: mapBox.left,
            top: mapBox.top,
            width: mapBox.size,
            height: mapBox.size,
            opacity: fadeFrom(mapIn, 0.4),
            transform: makeTransform([scale(0.92 + 0.08 * mapIn)]),
          }}
        >
          <svg
            width={mapBox.size}
            height={mapBox.size}
            viewBox={`0 0 ${MAP} ${MAP}`}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: radii.xl,
              boxShadow: shadows.lifted,
            }}
          >
            <defs>
              <clipPath id={clipId}>
                <rect width={MAP} height={MAP} rx={80} />
              </clipPath>
            </defs>
            <g clipPath={`url(#${clipId})`}>
              <rect width={MAP} height={MAP} fill={colors.surface} />
              {blocks.map((b) => (
                <rect
                  key={b.key}
                  x={b.x}
                  y={b.y}
                  width={b.width}
                  height={b.height}
                  rx={26}
                  fill={b.park ? colors.primaryLight : "#F1ECE3"}
                />
              ))}
              {/* Halo + trazo de la ruta */}
              <path
                d={ROUTE}
                fill="none"
                stroke={colors.primaryGlow}
                strokeOpacity={0.35}
                strokeWidth={40}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={ROUTE_LENGTH}
                strokeDashoffset={ROUTE_LENGTH - drawn}
              />
              <path
                d={ROUTE}
                fill="none"
                stroke={colors.primary}
                strokeWidth={16}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={ROUTE_LENGTH}
                strokeDashoffset={ROUTE_LENGTH - drawn}
              />
              {/* Confeti al entregar */}
              {Array.from({ length: 10 }, (_, i) => {
                const angle = (i / 10) * Math.PI * 2 + 0.3;
                const distance = 60 + 110 * burst;
                return (
                  <circle
                    key={i}
                    cx={END.x + Math.cos(angle) * distance}
                    cy={END.y + Math.sin(angle) * distance}
                    r={i % 2 ? 9 : 12}
                    fill={i % 2 ? colors.accent : colors.primary}
                    opacity={arrived ? 1 - burst : 0}
                  />
                );
              })}
            </g>
          </svg>

          <Pin
            x={START.x * k}
            y={START.y * k}
            size={128}
            color={colors.primary}
            enter={storeIn}
          >
            <DrawIcon
              icon={Store}
              size={58}
              color={colors.surface}
              strokeWidth={2.2}
            />
          </Pin>
          <Pin
            x={END.x * k}
            y={END.y * k}
            size={128}
            color={colors.accent}
            enter={customerIn}
            bounce={cheerBounce}
          >
            <DrawIcon
              icon={arrived ? Laugh : Smile}
              size={62}
              color={colors.surface}
              strokeWidth={2.2}
            />
          </Pin>

          {/* Repartidor + badge de verificación */}
          <div
            style={{
              position: "absolute",
              left: rider.x,
              top: rider.y,
              width: 112,
              height: 112,
              borderRadius: "50%",
              backgroundColor: colors.surface,
              boxShadow: shadows.lifted,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: fadeFrom(riderIn, 0.3),
              transform: makeTransform([
                translate("-50%", "-50%"),
                scale(Math.max(0, riderIn)),
              ]),
            }}
          >
            <DrawIcon
              icon={Bike}
              size={62}
              color={colors.primary}
              strokeWidth={2.2}
            />
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: -112,
                width: 100,
                height: 100,
                marginLeft: -50,
                borderRadius: "50%",
                backgroundColor: colors.primary,
                border: `7px solid ${colors.surface}`,
                boxShadow: shadows.primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: fadeFrom(badge, 0.2),
                transform: makeTransform([
                  scale(Math.max(0, badge)),
                  rotate((1 - badge) * -40),
                ]),
              }}
            >
              <DrawIcon
                icon={BadgeCheck}
                size={58}
                color={colors.surface}
                strokeWidth={2.4}
              />
            </div>
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: -196,
                whiteSpace: "nowrap",
                padding: "16px 30px",
                borderRadius: radii.pill,
                backgroundColor: colors.ink,
                color: colors.surface,
                fontFamily: fonts.family,
                fontWeight: fonts.weights.bold,
                fontSize: 32,
                opacity: fadeFrom(label, 0.4),
                transform: makeTransform([
                  translate("-50%", "0%"),
                  translate(0, (1 - label) * 30),
                  scale(0.8 + 0.2 * label),
                ]),
              }}
            >
              Repartidor verificado
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </SceneContainer>
  );
};
