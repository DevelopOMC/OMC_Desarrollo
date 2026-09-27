import { makeTransform, scale, translateY } from "@remotion/animation-utils";
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { exitAt } from "../lib/animation";
import { EXIT_FRAMES } from "../timeline";

/**
 * Envoltorio común de escena: "cámara" con un zoom lento y salida con
 * spring() durante los últimos EXIT_FRAMES frames.
 */
export const SceneContainer: React.FC<{
  durationInFrames: number;
  exit?: boolean;
  zoom?: number;
  children: React.ReactNode;
}> = ({ durationInFrames, exit = true, zoom = 0.03, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = exit ? exitAt(frame, fps, durationInFrames, EXIT_FRAMES) : 0;
  const camera = interpolate(frame, [0, durationInFrames], [1, 1 + zoom]);

  return (
    <AbsoluteFill
      style={{
        opacity: 1 - out,
        transform: makeTransform([
          translateY(-50 * out),
          scale(camera * (1 - 0.06 * out)),
        ]),
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
