import { makeTransform, rotate, translateY } from "@remotion/animation-utils";
import React from "react";
import { useCurrentFrame, useVideoConfig, type SpringConfig } from "remotion";
import { fadeFrom, springAt } from "../lib/animation";
import { colors, fonts, springs } from "../theme";

type Word = { text: string; highlighted: boolean } | { lineBreak: true };

/**
 * "Hola *mundo*\nadiós" → palabras; lo que va entre asteriscos se resalta y
 * "\n" fuerza un salto de línea.
 */
const parse = (text: string): Word[] =>
  text.split("*").flatMap((segment, index) =>
    segment.split(/(\n)/).flatMap((part): Word[] =>
      part === "\n"
        ? [{ lineBreak: true }]
        : part
            .split(" ")
            .filter(Boolean)
            .map((word) => ({ text: word, highlighted: index % 2 === 1 })),
    ),
  );

/**
 * Titular que entra palabra a palabra desde abajo con spring().
 */
export const SpringText: React.FC<{
  text: string;
  fontSize: number;
  delay?: number;
  stagger?: number;
  color?: string;
  highlightColor?: string;
  weight?: number;
  align?: "left" | "center";
  lineHeight?: number;
  distance?: number;
  config?: Partial<SpringConfig>;
  style?: React.CSSProperties;
}> = ({
  text,
  fontSize,
  delay = 0,
  stagger = 3,
  color = colors.ink,
  highlightColor = colors.primary,
  weight = fonts.weights.extrabold,
  align = "center",
  lineHeight = 1.08,
  distance = 0.9,
  config = springs.snappy,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  let wordIndex = 0;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: align === "center" ? "center" : "flex-start",
        columnGap: "0.25em",
        fontFamily: fonts.family,
        fontWeight: weight,
        fontSize,
        lineHeight,
        letterSpacing: "-0.025em",
        textAlign: align,
        ...style,
      }}
    >
      {parse(text).map((word, index) => {
        if ("lineBreak" in word) {
          return <div key={index} style={{ flexBasis: "100%", height: 0 }} />;
        }
        const progress = springAt(
          frame,
          fps,
          delay + wordIndex++ * stagger,
          config,
        );
        return (
          <span
            key={index}
            style={{
              display: "inline-block",
              color: word.highlighted ? highlightColor : color,
              opacity: fadeFrom(progress, 0.5),
              transform: makeTransform([
                translateY((1 - progress) * distance * fontSize),
                rotate((1 - progress) * 4),
              ]),
            }}
          >
            {word.text}
          </span>
        );
      })}
    </div>
  );
};
