import React from 'react';
import {AbsoluteFill, random, useVideoConfig} from 'remotion';
import cues from '../cues.json';
import {DarkBackground} from '../components/Backgrounds';
import {AppIcon} from '../components/Brand';
import {Icon, IconName} from '../components/Icons';
import {RevealText} from '../components/RevealText';
import {Wordmark} from '../components/Wordmark';
import {EXPO_IN, EXPO_IN_OUT, EXPO_OUT, bezier, clamp01, lerp, springAt, tween} from '../lib/anim';
import {FONT, GRAD} from '../theme';

const K = cues.brand;
const HUB: [number, number] = [960, 600];

type Node = {
  title: string;
  sub: string;
  icon: IconName;
  grad: string;
  glow: string;
  cx: number;
  cy: number;
  side: -1 | 1;
};

const NODES: Node[] = [
  {title: 'RouteBook', sub: 'Clases, flota y calendario', icon: 'calendar', grad: 'linear-gradient(135deg, #5B7BFF 0%, #3B5BFF 100%)', glow: '#7F97FF', cx: 425, cy: 452, side: -1},
  {title: 'DriveIQ', sub: 'Predicción de abandono', icon: 'brain', grad: 'linear-gradient(135deg, #34D399 0%, #0E9E70 100%)', glow: '#5EF0B8', cx: 1495, cy: 452, side: 1},
  {title: 'App del alumno', sub: 'Tests DGT y reservas', icon: 'smartphone', grad: 'linear-gradient(135deg, #A57BFF 0%, #7B3FF2 100%)', glow: '#C3A6FF', cx: 425, cy: 792, side: -1},
  {title: 'Cobros automáticos', sub: 'Facturas y pagos', icon: 'euro', grad: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)', glow: '#FFD479', cx: 1495, cy: 792, side: 1},
];

const NODE_W = 480;
const NODE_H = 136;

const connector = (n: Node) => {
  const start: [number, number] = [HUB[0] + n.side * 92, HUB[1] + (n.cy < HUB[1] ? -40 : 40)];
  const end: [number, number] = [n.cx - n.side * (NODE_W / 2), n.cy];
  const midX = (start[0] + end[0]) / 2;
  const c1: [number, number] = [midX, start[1]];
  const c2: [number, number] = [midX, end[1]];
  return {start, c1, c2, end, d: `M ${start[0]} ${start[1]} C ${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${end[0]} ${end[1]}`};
};

export const BrandScene: React.FC<{frame: number}> = ({frame}) => {
  const {fps} = useVideoConfig();

  // --- Impacto de revelado ---
  const flash = frame >= K.impact ? 0.55 * (1 - tween(frame, K.impact, 14, 0, 1, EXPO_OUT)) : 0;
  const ring = tween(frame, K.impact, 40, 0, 1, EXPO_OUT);

  // --- Icono: aparece, brilla y viaja al centro del hub ---
  const s = springAt(frame, fps, K.impact - 1, {damping: 11, stiffness: 150, mass: 0.9});
  const move = tween(frame, K.toHub - 2, 24, 0, 1, EXPO_IN_OUT);
  const iconSize = lerp(250, 176, move);
  const iconCy = lerp(392, HUB[1], move);
  const beat = frame >= 225 ? ((frame - 225) % 15) / 15 : 1;
  const beatPulse = frame >= 225 ? Math.exp(-beat * 5) * 0.035 : 0;
  const iconScale = (0.25 + 0.75 * s) * (1 + beatPulse);
  const iconBlur = (1 - tween(frame, K.impact, 12, 0, 1, EXPO_OUT)) * 18;
  const shine = tween(frame, 150, 24, 0, 1, EXPO_IN_OUT);

  // --- Logotipo + claim ---
  const wmOut = tween(frame, K.toHub - 4, 12, 0, 1, EXPO_IN);
  const draw = tween(frame, K.wordmark, 26, 0, 1, EXPO_OUT);
  const letters: [number, number, number] = [0, 1, 2].map((i) => tween(frame, K.wordmark + 4 + i * 3, 20, 0, 1, EXPO_OUT)) as [
    number,
    number,
    number,
  ];
  const tag = tween(frame, K.tagline, 30, 0, 1, EXPO_OUT);

  // --- Hub ---
  const hubOn = frame >= K.toHub + 8;

  return (
    <AbsoluteFill style={{overflow: 'hidden', fontFamily: FONT}}>
      <DarkBackground frame={frame} intensity={0.8 + 0.2 * tween(frame, K.impact, 20)} />

      {/* onda expansiva */}
      {frame >= K.impact && ring < 1 ? (
        <div
          style={{
            position: 'absolute',
            left: 960 - (140 + ring * 900),
            top: 392 - (140 + ring * 900),
            width: (140 + ring * 900) * 2,
            height: (140 + ring * 900) * 2,
            borderRadius: '50%',
            border: `${3 - ring * 2}px solid rgba(160,190,255,${0.75 * (1 - ring)})`,
            boxShadow: `0 0 60px rgba(90,120,255,${0.45 * (1 - ring)}) inset`,
          }}
        />
      ) : null}

      {/* partículas del impacto */}
      {frame >= K.impact && frame < K.impact + 40
        ? new Array(28).fill(0).map((_, i) => {
            const p = tween(frame, K.impact, 36, 0, 1, EXPO_OUT);
            const a = random(`pa${i}`) * Math.PI * 2;
            const d = (180 + random(`pd${i}`) * 520) * p;
            const sz = 3 + random(`ps${i}`) * 6;
            const col = ['#6FE3FF', '#9B7BFF', '#FFFFFF', '#5B7BFF'][i % 4];
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: 960 + Math.cos(a) * d,
                  top: 392 + Math.sin(a) * d * 0.8,
                  width: sz,
                  height: sz,
                  borderRadius: 99,
                  background: col,
                  boxShadow: `0 0 12px ${col}`,
                  opacity: (1 - p) * 0.9,
                }}
              />
            );
          })
        : null}

      {/* conectores del hub */}
      {hubOn ? (
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          <defs>
            <filter id="pulseGlow" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur stdDeviation="5" />
            </filter>
          </defs>
          {NODES.map((n, i) => {
            const c = connector(n);
            const p = tween(frame, K.nodes[i] - 4, 18, 0, 1, EXPO_OUT);
            return (
              <g key={n.title}>
                <mask id={`cm${i}`} maskUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080">
                  <path d={c.d} stroke="#fff" strokeWidth={10} fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
                </mask>
                <g mask={`url(#cm${i})`}>
                  <path d={c.d} stroke="rgba(255,255,255,0.10)" strokeWidth={6} fill="none" />
                  <path d={c.d} stroke="rgba(255,255,255,0.45)" strokeWidth={2.4} fill="none" strokeDasharray="3 11" strokeLinecap="round" />
                </g>
                {[0, 1].map((k) => {
                  const period = 30;
                  const t0 = K.nodes[i] + 12 + k * 15;
                  if (frame < t0) return null;
                  const tt = ((frame - t0) % period) / period;
                  const [x, y] = bezier(EXPO_IN_OUT(tt), c.start, c.c1, c.c2, c.end);
                  const o = Math.sin(tt * Math.PI);
                  return (
                    <g key={k} opacity={o}>
                      <circle cx={x} cy={y} r={10} fill={n.glow} filter="url(#pulseGlow)" />
                      <circle cx={x} cy={y} r={4.5} fill="#fff" />
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      ) : null}

      {/* anillos de pulso del hub al ritmo */}
      {frame >= 225
        ? [0, 1].map((k) => {
            const t0 = 225 + k * 15;
            if (frame < t0) return null;
            const tt = ((frame - t0) % 30) / 30;
            const r = 100 + tt * 90;
            return (
              <div
                key={k}
                style={{
                  position: 'absolute',
                  left: HUB[0] - r,
                  top: HUB[1] - r,
                  width: r * 2,
                  height: r * 2,
                  borderRadius: '50%',
                  border: `2px solid rgba(140,170,255,${0.5 * (1 - tt)})`,
                }}
              />
            );
          })
        : null}

      {/* icono */}
      <div
        style={{
          position: 'absolute',
          left: 960 - iconSize / 2,
          top: iconCy - iconSize / 2,
          transform: `scale(${iconScale}) rotate(${(1 - s) * -24}deg)`,
          filter: iconBlur > 0.3 ? `blur(${iconBlur}px)` : undefined,
          opacity: clamp01((frame - (K.impact - 2)) / 4),
        }}
      >
        <AppIcon size={iconSize} shine={shine} glow={1} />
      </div>

      {/* logotipo */}
      <div
        style={{
          position: 'absolute',
          left: 960 - 330,
          top: 612,
          opacity: 1 - wmOut,
          transform: `translateY(${wmOut * 40}px)`,
        }}
      >
        <Wordmark id="wmBrand" width={660} variant="dark" draw={draw} letters={letters} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 800,
          textAlign: 'center',
          color: 'rgba(255,255,255,0.82)',
          fontWeight: 700,
          fontSize: 27,
          letterSpacing: `${0.14 + (1 - tag) * 0.5}em`,
          textTransform: 'uppercase',
          opacity: tag * (1 - wmOut),
          transform: `translateY(${wmOut * 40}px)`,
        }}
      >
        Software de gestión para autoescuelas
      </div>

      {/* titular del hub */}
      {hubOn ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center'}}>
          <div
            style={{
              color: '#B7A6FF',
              fontWeight: 700,
              fontSize: 22,
              letterSpacing: `${0.2 + (1 - tween(frame, K.headline, 20)) * 0.3}em`,
              opacity: tween(frame, K.headline, 16),
              marginBottom: 18,
            }}
          >
            ¿QUÉ ES APTOA?
          </div>
          <RevealText
            frame={frame}
            start={K.headline + 2}
            stagger={2.5}
            dur={20}
            segments={[{t: 'Todo lo que tu academia necesita,'}, {t: 'conectado.', gradient: GRAD.accentLight}]}
            style={{color: '#fff', fontSize: 68, fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.1}}
          />
        </div>
      ) : null}

      {/* nodos */}
      {hubOn
        ? NODES.map((n, i) => {
            const p = springAt(frame, fps, K.nodes[i], {damping: 13, stiffness: 160});
            if (frame < K.nodes[i]) return null;
            return (
              <div
                key={n.title}
                style={{
                  position: 'absolute',
                  left: n.cx - NODE_W / 2,
                  top: n.cy - NODE_H / 2,
                  width: NODE_W,
                  height: NODE_H,
                  borderRadius: 30,
                  background: 'linear-gradient(160deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.05) 100%)',
                  border: '1px solid rgba(255,255,255,0.16)',
                  boxShadow: '0 30px 60px -20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 22,
                  padding: '0 26px',
                  transform: `translate(${(1 - p) * n.side * 60}px, ${(1 - p) * 30}px) scale(${0.8 + 0.2 * p})`,
                  opacity: clamp01(p * 1.5),
                }}
              >
                <div
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: 22,
                    background: n.grad,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 12px 30px -8px ${n.glow}99`,
                  }}
                >
                  <Icon name={n.icon} size={38} color="#fff" strokeWidth={2.2} />
                </div>
                <div>
                  <div style={{color: '#fff', fontSize: 32, fontWeight: 800, letterSpacing: '-0.025em', whiteSpace: 'nowrap'}}>{n.title}</div>
                  <div style={{color: 'rgba(255,255,255,0.64)', fontSize: 22, fontWeight: 500, marginTop: 4}}>{n.sub}</div>
                </div>
              </div>
            );
          })
        : null}

      {/* destello del impacto */}
      {flash > 0.01 ? <AbsoluteFill style={{background: '#fff', opacity: flash}} /> : null}
    </AbsoluteFill>
  );
};
