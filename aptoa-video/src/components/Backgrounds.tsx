import React from 'react';
import {AbsoluteFill, random, staticFile} from 'remotion';
import {C} from '../theme';

/** Fondo claro de la web: blanco roto con halos lavanda/menta y retícula de puntos. */
export const LightBackground: React.FC<{frame: number; tint?: 'lavender' | 'mint' | 'mixed'; grid?: boolean}> = ({
  frame,
  tint = 'mixed',
  grid = true,
}) => {
  const d = frame * 0.35;
  const a = Math.sin(frame / 40) * 40;
  const b = Math.cos(frame / 52) * 50;
  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          background: [
            tint !== 'mint'
              ? `radial-gradient(900px 700px at ${1550 + a}px ${120 + b}px, rgba(165,140,255,0.30), rgba(165,140,255,0) 70%)`
              : '',
            tint !== 'lavender'
              ? `radial-gradient(800px 600px at ${260 - a}px ${980 - b}px, rgba(16,185,129,0.14), rgba(16,185,129,0) 70%)`
              : '',
            `radial-gradient(1100px 800px at ${960 + b}px ${540 + a}px, rgba(59,91,255,0.07), rgba(59,91,255,0) 70%)`,
          ]
            .filter(Boolean)
            .join(','),
        }}
      />
      {grid ? (
        <AbsoluteFill
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(26,31,78,0.13) 1.3px, rgba(26,31,78,0) 1.8px)',
            backgroundSize: '38px 38px',
            backgroundPosition: `${d * 0.4}px ${-d}px`,
            WebkitMaskImage: 'radial-gradient(ellipse 75% 70% at 50% 50%, #000 30%, transparent 100%)',
            maskImage: 'radial-gradient(ellipse 75% 70% at 50% 50%, #000 30%, transparent 100%)',
            opacity: 0.8,
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

/** Fondo oscuro de marca: azul noche con orbes violeta/azul/cian en movimiento. */
export const DarkBackground: React.FC<{frame: number; intensity?: number}> = ({frame, intensity = 1}) => {
  const t = frame / 30;
  const o1x = 560 + Math.sin(t * 0.7) * 160;
  const o1y = 300 + Math.cos(t * 0.5) * 90;
  const o2x = 1400 + Math.cos(t * 0.6) * 180;
  const o2y = 760 + Math.sin(t * 0.8) * 110;
  const o3x = 1240 + Math.sin(t * 0.45 + 1) * 220;
  const o3y = 180 + Math.cos(t * 0.55 + 2) * 80;
  return (
    <AbsoluteFill style={{background: '#0B0E2B', overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          background: [
            `radial-gradient(760px 620px at ${o1x}px ${o1y}px, rgba(123,63,242,${0.42 * intensity}), rgba(123,63,242,0) 70%)`,
            `radial-gradient(820px 640px at ${o2x}px ${o2y}px, rgba(59,91,255,${0.4 * intensity}), rgba(59,91,255,0) 70%)`,
            `radial-gradient(560px 420px at ${o3x}px ${o3y}px, rgba(31,208,255,${0.16 * intensity}), rgba(31,208,255,0) 70%)`,
            'radial-gradient(1400px 900px at 50% 50%, #1A1F57 0%, #0E1236 55%, #080A22 100%)',
          ].join(','),
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
          backgroundSize: '96px 96px',
          backgroundPosition: `${-frame * 0.25}px ${-frame * 0.5}px`,
          WebkitMaskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, #000 10%, transparent 90%)',
          maskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, #000 10%, transparent 90%)',
        }}
      />
      <AbsoluteFill
        style={{background: 'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(0,0,0,0) 55%, rgba(3,4,18,0.55) 100%)'}}
      />
    </AbsoluteFill>
  );
};

/** Grano de película animado (textura precalculada, desplazada cada frame). */
export const Grain: React.FC<{frame: number; opacity?: number}> = ({frame, opacity = 0.06}) => {
  const x = Math.floor(random(`gx${frame}`) * 384);
  const y = Math.floor(random(`gy${frame}`) * 384);
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url(${staticFile('textures/grain.png')})`,
        backgroundSize: '384px 384px',
        backgroundPosition: `${x}px ${y}px`,
        mixBlendMode: 'overlay',
        opacity,
        pointerEvents: 'none',
      }}
    />
  );
};
