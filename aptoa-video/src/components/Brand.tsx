import React from 'react';
import {Img, staticFile} from 'remotion';

const ICON = staticFile('brand/aptoa-icon.png');

/** Icono de la app (PNG 1024 original) con barrido de brillo opcional. */
export const AppIcon: React.FC<{
  size: number;
  /** 0..1 progreso del destello diagonal */
  shine?: number;
  glow?: number;
  style?: React.CSSProperties;
}> = ({size, shine, glow = 0, style}) => {
  const x = shine === undefined ? -100 : -40 + shine * 180;
  return (
    <div style={{position: 'relative', width: size, height: size, ...style}}>
      {glow > 0 ? (
        <div
          style={{
            position: 'absolute',
            inset: -size * 0.35,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(59,91,255,${0.55 * glow}) 0%, rgba(123,63,242,${0.28 * glow}) 38%, rgba(123,63,242,0) 70%)`,
          }}
        />
      ) : null}
      <Img
        src={ICON}
        style={{
          position: 'absolute',
          inset: 0,
          width: size,
          height: size,
          filter: `drop-shadow(0 ${size * 0.06}px ${size * 0.09}px rgba(15,19,48,0.35))`,
        }}
      />
      {shine !== undefined && shine > 0 && shine < 1 ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            WebkitMaskImage: `url(${ICON})`,
            WebkitMaskSize: '100% 100%',
            maskImage: `url(${ICON})`,
            maskSize: '100% 100%',
            background: `linear-gradient(115deg, rgba(255,255,255,0) ${x - 14}%, rgba(255,255,255,0.75) ${x}%, rgba(255,255,255,0) ${x + 14}%)`,
            mixBlendMode: 'screen',
          }}
        />
      ) : null}
    </div>
  );
};
