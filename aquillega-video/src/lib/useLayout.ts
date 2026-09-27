import { useVideoConfig } from "remotion";

/**
 * Las escenas son las mismas en 9:16 y 16:9: solo cambia la disposición.
 * `pick` devuelve el valor adecuado para el formato actual.
 */
export const useLayout = () => {
  const { width, height } = useVideoConfig();
  const isVertical = height > width;
  const pick = <T>(vertical: T, horizontal: T): T =>
    isVertical ? vertical : horizontal;
  return { width, height, isVertical, pick };
};
