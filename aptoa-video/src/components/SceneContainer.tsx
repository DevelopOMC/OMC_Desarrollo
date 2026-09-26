import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EXPO_IN, EXPO_OUT, QUART_IN_OUT, SNAP, clamp01, easedVelocity} from '../lib/anim';
import {H, W} from '../theme';

export type TransitionKind = 'whipLeft' | 'whipUp' | 'zoomThrough' | 'iris' | 'none';
export type TransitionSpec = {kind: TransitionKind; at: number; frames: number};

const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/**
 * Contenedor de escena: aplica las transiciones de entrada/salida (barrido con
 * desenfoque de movimiento direccional, zoom a través, iris) y un leve
 * "camera drift" para que ningún plano quede estático.
 */
export const SceneContainer: React.FC<{
  id: string;
  frame: number;
  from: number;
  to: number;
  enter?: TransitionSpec;
  exit?: TransitionSpec;
  drift?: number;
  children: React.ReactNode;
}> = ({id, frame, from, to, enter, exit, drift = 0.035, children}) => {
  let tx = 0;
  let ty = 0;
  let scale = 1;
  let opacity = 1;
  let blurX = 0;
  let blurY = 0;
  let cssBlur = 0;
  let clip: string | undefined;

  const apply = (spec: TransitionSpec, dir: 'in' | 'out') => {
    const start = spec.at - spec.frames / 2;
    const t = clamp01((frame - start) / spec.frames);
    if (spec.kind === 'whipLeft' || spec.kind === 'whipUp') {
      const e = SNAP(t);
      const dist = spec.kind === 'whipLeft' ? W : H;
      const offset = dir === 'in' ? dist * (1 - e) : -dist * e;
      const v = Math.abs(easedVelocity(frame, start, spec.frames, dist, SNAP));
      const b = Math.min(90, v * 0.16);
      if (spec.kind === 'whipLeft') {
        tx += offset;
        blurX = Math.max(blurX, b);
      } else {
        ty += offset;
        blurY = Math.max(blurY, b);
      }
    } else if (spec.kind === 'zoomThrough') {
      // La escena saliente no se desvanece (queda debajo); la entrante cubre por encima.
      if (dir === 'out') {
        scale *= 1 + 1.1 * EXPO_IN(t);
        cssBlur = Math.max(cssBlur, 18 * EXPO_IN(t));
      } else {
        scale *= 0.7 + 0.3 * EXPO_OUT(t);
        opacity *= smoothstep(0.28, 0.6, t);
        cssBlur = Math.max(cssBlur, 16 * (1 - EXPO_OUT(t)));
      }
    } else if (spec.kind === 'iris' && dir === 'in') {
      const e = QUART_IN_OUT(t);
      if (t < 1) clip = `circle(${e * 1150}px at 50% 50%)`;
    }
  };

  if (enter && frame < enter.at + enter.frames / 2) apply(enter, 'in');
  if (exit && frame > exit.at - exit.frames / 2) apply(exit, 'out');

  const local = clamp01((frame - from) / Math.max(1, to - from));
  const driftScale = 1 + drift * local;
  const needsSvgBlur = blurX > 0.4 || blurY > 0.4;
  const filters = [needsSvgBlur ? `url(#mb-${id})` : '', cssBlur > 0.3 ? `blur(${cssBlur}px)` : '']
    .filter(Boolean)
    .join(' ');

  return (
    <AbsoluteFill style={{clipPath: clip, WebkitClipPath: clip}}>
      {needsSvgBlur ? (
        <svg width="0" height="0" style={{position: 'absolute'}}>
          <filter id={`mb-${id}`} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation={`${blurX.toFixed(2)} ${blurY.toFixed(2)}`} edgeMode="duplicate" />
          </filter>
        </svg>
      ) : null}
      <AbsoluteFill
        style={{
          transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
          opacity,
          filter: filters || undefined,
        }}
      >
        <AbsoluteFill style={{transform: `scale(${driftScale})`}}>{children}</AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
