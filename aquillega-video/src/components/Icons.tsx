import type { LucideIcon } from "lucide-react";
import React from "react";
import { colors, radii, shadows } from "../theme";

/** Mayor que cualquier trazo de un icono lucide (viewBox 24×24). */
const DASH = 100;

/**
 * Icono lucide que se "dibuja" trazo a trazo (stroke-dashoffset heredado por
 * todos los paths del SVG). `draw` va de 0 (invisible) a 1 (completo).
 */
export const DrawIcon: React.FC<{
  icon: LucideIcon;
  size: number;
  color?: string;
  strokeWidth?: number;
  draw?: number;
  style?: React.CSSProperties;
}> = ({
  icon: Icon,
  size,
  color = colors.ink,
  strokeWidth = 2,
  draw = 1,
  style,
}) => {
  const complete = draw >= 1;
  return (
    <Icon
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      absoluteStrokeWidth={false}
      style={{
        display: "block",
        opacity: draw <= 0 ? 0 : 1,
        strokeDasharray: complete ? undefined : DASH,
        strokeDashoffset: complete ? undefined : DASH * (1 - draw),
        ...style,
      }}
    />
  );
};

/** Baldosa redondeada con un icono centrado (estilo flat). */
export const IconTile: React.FC<{
  icon: LucideIcon;
  size: number;
  iconSize?: number;
  color?: string;
  background?: string;
  radius?: number;
  shadow?: string;
  strokeWidth?: number;
  draw?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({
  icon,
  size,
  iconSize = size * 0.5,
  color = colors.primary,
  background = colors.surface,
  radius = radii.lg,
  shadow = shadows.card,
  strokeWidth = 2,
  draw = 1,
  style,
  children,
}) => (
  <div
    style={{
      position: "relative",
      width: size,
      height: size,
      borderRadius: radius,
      backgroundColor: background,
      boxShadow: shadow,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      ...style,
    }}
  >
    <DrawIcon
      icon={icon}
      size={iconSize}
      color={color}
      strokeWidth={strokeWidth}
      draw={draw}
    />
    {children}
  </div>
);
