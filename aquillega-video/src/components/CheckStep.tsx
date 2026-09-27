import { makeTransform, scale, translateX } from "@remotion/animation-utils";
import React from "react";
import {
  interpolate,
  interpolateColors,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { clamp, fadeFrom, springAt } from "../lib/animation";
import { colors, fonts, radii, shadows, springs } from "../theme";

/** Checkmark que se dibuja con stroke-dashoffset dentro de un círculo que "pop". */
export const AnimatedCheck: React.FC<{
  size: number;
  /** Frame (local) en el que se completa el paso */
  at: number;
  number?: number;
}> = ({ size, at, number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = springAt(frame, fps, at, springs.pop);
  const draw = interpolate(frame, [at + 3, at + 12], [0, 1], clamp);
  const done = frame >= at;
  const fill = interpolateColors(
    pop,
    [0, 1],
    [colors.primaryLight, colors.primary],
  );

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: done ? fill : colors.primaryLight,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: makeTransform([scale(done ? 0.8 + 0.2 * pop : 1)]),
        boxShadow: done ? shadows.primary : "none",
        flexShrink: 0,
      }}
    >
      {!done && number !== undefined ? (
        <span
          style={{
            fontFamily: fonts.family,
            fontWeight: fonts.weights.extrabold,
            fontSize: size * 0.42,
            color: colors.primary,
          }}
        >
          {number}
        </span>
      ) : null}
      {done ? (
        <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24">
          <path
            d="M5.5 12.5l4.2 4.2L18.5 7.8"
            fill="none"
            stroke={colors.surface}
            strokeWidth={3.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={22}
            strokeDashoffset={22 * (1 - draw)}
          />
        </svg>
      ) : null}
    </div>
  );
};

/** Tarjeta de paso de alta: entra con spring y se marca como completada. */
export const CheckStep: React.FC<{
  index: number;
  label: string;
  enterAt: number;
  checkAt: number;
  width: number;
  height: number;
  fontSize: number;
}> = ({ index, label, enterAt, checkAt, width, height, fontSize }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = springAt(frame, fps, enterAt, springs.snappy);
  const done = springAt(frame, fps, checkAt, springs.smooth, 10);

  return (
    <div
      style={{
        width,
        height,
        borderRadius: radii.md + 8,
        backgroundColor: colors.surface,
        boxShadow: shadows.card,
        display: "flex",
        alignItems: "center",
        gap: height * 0.2,
        padding: `0 ${height * 0.26}px`,
        opacity: fadeFrom(enter, 0.5),
        transform: makeTransform([
          translateX((1 - enter) * 140),
          scale(0.9 + 0.1 * enter),
        ]),
        outline: `4px solid ${interpolateColors(done, [0, 1], ["rgba(46,158,91,0)", colors.primaryLight])}`,
      }}
    >
      <AnimatedCheck size={height * 0.58} at={checkAt} number={index + 1} />
      <div
        style={{
          fontFamily: fonts.family,
          fontWeight: fonts.weights.bold,
          fontSize,
          color: colors.ink,
          letterSpacing: "-0.02em",
        }}
      >
        {label}
      </div>
    </div>
  );
};
