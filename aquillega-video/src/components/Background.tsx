import React from "react";
import {
  AbsoluteFill,
  interpolateColors,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors } from "../theme";

/**
 * Fondo crema continuo con dos formas orgánicas que derivan muy despacio.
 * `neutral` (0–1) lo lleva al gris neutro de la escena 1 y oculta las formas.
 */
export const Background: React.FC<{ neutral?: number }> = ({ neutral = 0 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const brand = 1 - neutral;
  const drift = (phase: number, amplitude: number) =>
    Math.sin(frame / 55 + phase) * amplitude;
  const base = Math.max(width, height);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: interpolateColors(
          neutral,
          [0, 1],
          [colors.background, colors.backgroundNeutral],
        ),
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: base * 0.55,
          height: base * 0.55,
          borderRadius: "50%",
          backgroundColor: colors.primaryLight,
          opacity: 0.7 * brand,
          left: -base * 0.22 + drift(0, 26),
          top: -base * 0.2 + drift(1.3, 20),
        }}
      />
      <div
        style={{
          position: "absolute",
          width: base * 0.42,
          height: base * 0.42,
          borderRadius: "50%",
          backgroundColor: colors.accentLight,
          opacity: 0.75 * brand,
          right: -base * 0.17 + drift(2.1, 22),
          bottom: -base * 0.15 + drift(0.7, 26),
        }}
      />
    </AbsoluteFill>
  );
};
