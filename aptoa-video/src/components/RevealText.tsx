import React from 'react';
import {EXPO_OUT, tween} from '../lib/anim';

export type Seg = {
  /** Texto del segmento (puede contener varias palabras). */
  t: string;
  /** Frame absoluto de inicio para este segmento (si no, se encadena por índice). */
  at?: number;
  gradient?: string;
  color?: string;
  weight?: number;
  /** Salto de línea antes del segmento. */
  br?: boolean;
  /** Tachado animado que se dibuja en este frame. */
  strikeAt?: number;
  strikeColor?: string;
  /** Elemento que se añade pegado a la última palabra (p. ej. un punto animado). */
  tail?: React.ReactNode;
};

/** Ajuste óptico: acerca la puntuación final (la de Plus Jakarta Sans es muy abierta en display). */
const splitPunct = (w: string): React.ReactNode => {
  const m = w.match(/^(.*?)([,.:;»]+)$/);
  if (!m || !m[1]) return w;
  return (
    <>
      {m[1]}
      <span style={{marginLeft: '-0.07em'}}>{m[2]}</span>
    </>
  );
};

const gradientStyle = (g?: string): React.CSSProperties =>
  g
    ? {
        backgroundImage: g,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        WebkitTextFillColor: 'transparent',
      }
    : {};

/**
 * Titular con revelado palabra a palabra: cada palabra emerge desde una máscara
 * con un ligero giro, con escalonado configurable.
 */
export const RevealText: React.FC<{
  frame: number;
  start: number;
  segments: Seg[];
  stagger?: number;
  dur?: number;
  style?: React.CSSProperties;
  mode?: 'rise' | 'fall';
}> = ({frame, start, segments, stagger = 2.5, dur = 20, style, mode = 'rise'}) => {
  let index = 0;
  const dir = mode === 'rise' ? 1 : -1;
  return (
    <div style={style}>
      {segments.map((seg, si) => {
        const words = seg.t.split(' ').filter(Boolean);
        const segStart = seg.at;
        const nodes = words.map((w, wi) => {
          const s = segStart !== undefined ? segStart + wi * stagger : start + index * stagger;
          index++;
          const p = tween(frame, s, dur, 0, 1, EXPO_OUT);
          const isLast = wi === words.length - 1;
          return (
            <React.Fragment key={`${si}-${wi}`}>
              <span
                style={{
                  display: 'inline-block',
                  overflow: 'hidden',
                  verticalAlign: 'top',
                  padding: '0.1em 0.06em 0.2em',
                  margin: '-0.1em -0.06em -0.2em',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    transform: `translateY(${dir * (1 - p) * 112}%) rotate(${dir * (1 - p) * 5}deg)`,
                    transformOrigin: '0% 100%',
                    opacity: p <= 0 ? 0 : 1,
                    color: seg.color,
                    fontWeight: seg.weight,
                    ...gradientStyle(seg.gradient),
                  }}
                >
                  {splitPunct(w)}
                </span>
              </span>
              {isLast && seg.tail ? seg.tail : null}
              {isLast && si === segments.length - 1 ? null : ' '}
            </React.Fragment>
          );
        });
        const content =
          seg.strikeAt !== undefined ? (
            <span style={{position: 'relative', display: 'inline-block'}}>
              {nodes}
              <span
                style={{
                  position: 'absolute',
                  left: '-0.04em',
                  top: '54%',
                  height: '0.085em',
                  borderRadius: '0.05em',
                  width: `calc(${tween(frame, seg.strikeAt, 12, 0, 1, EXPO_OUT) * 100}% - 0.2em)`,
                  background: seg.strikeColor ?? '#EF4444',
                }}
              />
            </span>
          ) : (
            nodes
          );
        return (
          <React.Fragment key={si}>
            {seg.br ? <br /> : null}
            {content}
          </React.Fragment>
        );
      })}
    </div>
  );
};
