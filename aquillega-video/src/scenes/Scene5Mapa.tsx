import { makeTransform, scale } from "@remotion/animation-utils";
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { useSvgId } from "../components/Logo";
import { SceneContainer } from "../components/SceneContainer";
import { SpringText } from "../components/SpringText";
import { CITIES, type City } from "../data/cities";
import {
  ANDORRA_PATH,
  BALEARES_PATH,
  CANARIAS_BOX,
  CANARIAS_PATH,
  FRANCE_PATH,
  PORTUGAL_PATH,
  projectLonLat,
  SPAIN_MAINLAND_PATH,
  SPAIN_VIEWBOX,
} from "../data/spain-map";
import { clamp, fadeFrom, springAt } from "../lib/animation";
import { useLayout } from "../lib/useLayout";
import { colors, fonts, springs } from "../theme";
import { SCENES } from "../timeline";

const { durationInFrames } = SCENES.mapa;

const T = { map: 0, headline: 6, firstCity: 20, cityStagger: 6 };
const PULSE_PERIOD = 36;
const HUB = CITIES[0];

const labelOffset = (label: City["label"]) => {
  switch (label) {
    case "left":
      return { dx: -22, dy: 9, anchor: "end" as const };
    case "top":
      return { dx: 0, dy: -26, anchor: "middle" as const };
    case "bottom":
      return { dx: 0, dy: 44, anchor: "middle" as const };
    default:
      return { dx: 22, dy: 9, anchor: "start" as const };
  }
};

/** Arco suave desde Madrid (hub) hasta cada ciudad peninsular/balear. */
const arcPath = (from: [number, number], to: [number, number]) => {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const bend = 0.18;
  return `M${x1} ${y1}Q${mx - (y2 - y1) * bend} ${my + (x2 - x1) * bend} ${x2} ${y2}`;
};

export const Scene5Mapa: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { pick, isVertical } = useLayout();

  const mapWidth = pick(1000, 960);
  const mapHeight = (mapWidth * SPAIN_VIEWBOX.height) / SPAIN_VIEWBOX.width;
  const mapIn = springAt(frame, fps, T.map, springs.snappy);
  const hub = projectLonLat(HUB.lon, HUB.lat);
  const fadeId = useSvgId("neighbour-fade");
  const maskId = useSvgId("neighbour-mask");

  return (
    <SceneContainer durationInFrames={durationInFrames} zoom={0.04}>
      <AbsoluteFill>
        <SpringText
          text={
            isVertical
              ? "Ya presente en\n*más de 10 ciudades.*"
              : "Ya presente en *más de 10 ciudades.*"
          }
          fontSize={pick(80, 88)}
          align={pick("center", "left")}
          delay={T.headline}
          style={pick<React.CSSProperties>(
            { position: "absolute", left: 50, right: 50, top: 230 },
            { position: "absolute", left: 120, width: 700, top: 330 },
          )}
        />

        <svg
          width={mapWidth}
          height={mapHeight}
          viewBox={`0 0 ${SPAIN_VIEWBOX.width} ${SPAIN_VIEWBOX.height}`}
          style={{
            position: "absolute",
            overflow: "visible",
            ...pick<React.CSSProperties>(
              { left: 40, top: 560 },
              { left: 870, top: (1080 - mapHeight) / 2 },
            ),
            opacity: fadeFrom(mapIn, 0.4),
            transform: makeTransform([scale(0.94 + 0.06 * mapIn)]),
          }}
        >
          <defs>
            <radialGradient id={fadeId} cx="0.5" cy="0.42" r="0.6">
              <stop offset="0.5" stopColor="white" />
              <stop offset="0.88" stopColor="black" />
            </radialGradient>
            <mask
              id={maskId}
              maskUnits="userSpaceOnUse"
              x={-60}
              y={-60}
              width={1120}
              height={1100}
            >
              <rect
                x={-60}
                y={-60}
                width={1120}
                height={1100}
                fill={`url(#${fadeId})`}
              />
            </mask>
          </defs>

          {/* Vecinos, solo contexto (se desvanecen hacia los bordes) */}
          <g
            fill={colors.mapNeighbour}
            stroke={colors.background}
            strokeWidth={3}
            mask={`url(#${maskId})`}
          >
            <path d={PORTUGAL_PATH} />
            <path d={FRANCE_PATH} />
          </g>

          {/* España con "grosor" flat */}
          <g transform="translate(0 12)" fill="#BFE3CB">
            <path d={SPAIN_MAINLAND_PATH} />
            <path d={BALEARES_PATH} />
            <path d={CANARIAS_PATH} />
          </g>
          <g
            fill={colors.mapLand}
            stroke={colors.primary}
            strokeOpacity={0.45}
            strokeWidth={2.5}
            strokeLinejoin="round"
          >
            <path d={SPAIN_MAINLAND_PATH} />
            <path d={BALEARES_PATH} />
            <path d={CANARIAS_PATH} />
          </g>
          <path d={ANDORRA_PATH} fill={colors.mapNeighbour} />
          <rect
            {...CANARIAS_BOX}
            rx={28}
            fill="none"
            stroke={colors.primary}
            strokeOpacity={0.3}
            strokeWidth={3}
            strokeDasharray="10 12"
          />

          {/* Conexiones desde Madrid */}
          {CITIES.map((city, index) => {
            if (index === 0 || city.lat < 30) return null;
            const start = T.firstCity + index * T.cityStagger;
            const draw = springAt(frame, fps, start - 4, springs.smooth, 12);
            const to = projectLonLat(city.lon, city.lat);
            const length = Math.hypot(to[0] - hub[0], to[1] - hub[1]) * 1.1;
            return (
              <path
                key={city.name}
                d={arcPath(hub, to)}
                fill="none"
                stroke={colors.primary}
                strokeOpacity={0.4}
                strokeWidth={3}
                strokeLinecap="round"
                strokeDasharray={length}
                strokeDashoffset={length * (1 - draw)}
                opacity={draw > 0.01 ? 1 : 0}
              />
            );
          })}

          {/* Ciudades: se iluminan en secuencia y laten en bucle */}
          {CITIES.map((city, index) => {
            const start = T.firstCity + index * T.cityStagger;
            const on = springAt(frame, fps, start, springs.pop);
            const [x, y] = projectLonLat(city.lon, city.lat);
            const local = frame - start;
            const pulse = local > 0 ? (local % PULSE_PERIOD) / PULSE_PERIOD : 0;
            const label = labelOffset(city.label);
            const isHub = index === 0;
            return (
              <g key={city.name} opacity={fadeFrom(on, 0.3)}>
                {local > 0 ? (
                  <circle
                    cx={x}
                    cy={y}
                    r={12 + 30 * pulse}
                    fill="none"
                    stroke={isHub ? colors.accent : colors.primary}
                    strokeWidth={4}
                    opacity={interpolate(pulse, [0, 1], [0.7, 0], clamp)}
                  />
                ) : null}
                <circle
                  cx={x}
                  cy={y}
                  r={24 * Math.max(0, on)}
                  fill={colors.primary}
                  opacity={0.16}
                />
                <circle
                  cx={x}
                  cy={y}
                  r={(isHub ? 14 : 11) * Math.max(0, on)}
                  fill={isHub ? colors.accent : colors.primary}
                  stroke={colors.surface}
                  strokeWidth={4}
                />
                <text
                  x={x + label.dx}
                  y={y + label.dy}
                  textAnchor={label.anchor}
                  fontFamily={fonts.family}
                  fontWeight={
                    isHub ? fonts.weights.extrabold : fonts.weights.bold
                  }
                  fontSize={isHub ? 30 : 25}
                  fill={colors.ink}
                  stroke={colors.background}
                  strokeWidth={6}
                  paintOrder="stroke"
                  opacity={interpolate(local, [2, 10], [0, 1], clamp)}
                >
                  {city.name}
                </text>
              </g>
            );
          })}
        </svg>
      </AbsoluteFill>
    </SceneContainer>
  );
};
