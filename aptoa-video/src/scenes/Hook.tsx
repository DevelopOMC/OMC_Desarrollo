import React from 'react';
import {AbsoluteFill, random, useVideoConfig} from 'remotion';
import cues from '../cues.json';
import {LightBackground} from '../components/Backgrounds';
import {Icon} from '../components/Icons';
import {RevealText} from '../components/RevealText';
import {BACK_OUT, CUBIC_IN, EXPO_IN, EXPO_OUT, clamp01, easedVelocity, springAt, tween, wobble} from '../lib/anim';
import {C, FONT, HAND, SHADOW} from '../theme';

const K = cues.hook;

/* ---------- Atrezo del "caos": papeles, Excel y WhatsApps ---------- */

const PaperSheet: React.FC<{title: string; note: string; w?: number}> = ({title, note, w = 270}) => (
  <div
    style={{
      width: w,
      height: w * 1.28,
      background: '#FFFEFB',
      borderRadius: 6,
      boxShadow: SHADOW.paper,
      padding: 22,
      fontFamily: FONT,
      position: 'relative',
      border: '1px solid #EEE9DF',
    }}
  >
    <div style={{position: 'absolute', top: -18, left: 34, transform: 'rotate(-18deg)'}}>
      <Icon name="paperclip" size={46} color="#8A8FA8" strokeWidth={1.8} />
    </div>
    <div style={{fontSize: 13, fontWeight: 800, letterSpacing: '0.12em', color: '#6B7090'}}>{title}</div>
    <div style={{display: 'flex', gap: 12, marginTop: 14}}>
      <div style={{width: 58, height: 70, background: '#E9EBF2', borderRadius: 4}} />
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 9, paddingTop: 4}}>
        {[0.9, 0.7, 0.8, 0.5].map((v, i) => (
          <div key={i} style={{height: 7, width: `${v * 100}%`, background: '#DADDE8', borderRadius: 4}} />
        ))}
      </div>
    </div>
    <div style={{marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10}}>
      {[1, 0.85, 0.95, 0.6, 0.9, 0.75].map((v, i) => (
        <div key={i} style={{height: 6, width: `${v * 100}%`, background: '#E3E5EE', borderRadius: 4}} />
      ))}
    </div>
    <div
      style={{
        fontFamily: HAND,
        fontWeight: 700,
        fontSize: 30,
        color: '#2F3FB0',
        marginTop: 12,
        transform: 'rotate(-4deg)',
        lineHeight: 1,
      }}
    >
      {note}
    </div>
  </div>
);

const StickyNote: React.FC<{text: string; color?: string}> = ({text, color = '#FFE68A'}) => (
  <div
    style={{
      width: 210,
      height: 190,
      background: `linear-gradient(170deg, ${color} 0%, #FFD85C 100%)`,
      boxShadow: '0 16px 28px -12px rgba(120,90,0,0.45), 0 2px 4px rgba(120,90,0,0.15)',
      padding: '26px 20px',
      fontFamily: HAND,
      fontWeight: 700,
      fontSize: 34,
      lineHeight: 1.02,
      color: '#5A4300',
      position: 'relative',
    }}
  >
    <div
      style={{
        position: 'absolute',
        top: -12,
        left: 70,
        width: 70,
        height: 24,
        background: 'rgba(255,255,255,0.55)',
        transform: 'rotate(-3deg)',
      }}
    />
    {text}
  </div>
);

const ExcelWindow: React.FC = () => {
  const rows = [
    ['Marta P.', '10', '3', '#¡REF!'],
    ['Diego R.', '5', '?', '120 €'],
    ['Sara C.', '8', '2', 'PEND.'],
    ['Lucía M.', '12', '7', '#N/A'],
    ['Javier G.', '6', '1', '90 €'],
  ];
  return (
    <div
      style={{
        width: 540,
        background: C.white,
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: SHADOW.card,
        fontFamily: FONT,
        border: '1px solid #DDE1E6',
      }}
    >
      <div style={{height: 44, background: C.excel, display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px'}}>
        <div style={{display: 'flex', gap: 7}}>
          {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
            <div key={c} style={{width: 11, height: 11, borderRadius: 99, background: c}} />
          ))}
        </div>
        <Icon name="sheet" size={20} color="#fff" />
        <div style={{color: '#fff', fontWeight: 700, fontSize: 17}}>alumnos_FINAL_v3 (2).xlsx</div>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: '38px 1.5fr 1fr 1fr 1.2fr', fontSize: 16}}>
        {['', 'A', 'B', 'C', 'D'].map((h, i) => (
          <div
            key={`h${i}`}
            style={{
              background: '#F1F3F4',
              borderRight: '1px solid #DDE1E6',
              borderBottom: '1px solid #DDE1E6',
              padding: '5px 8px',
              color: '#5F6368',
              fontWeight: 600,
              textAlign: 'center',
            }}
          >
            {h}
          </div>
        ))}
        {rows.map((r, ri) => (
          <React.Fragment key={ri}>
            <div
              style={{
                background: '#F1F3F4',
                borderRight: '1px solid #DDE1E6',
                borderBottom: '1px solid #E8EAED',
                padding: '8px 6px',
                color: '#5F6368',
                textAlign: 'center',
                fontWeight: 600,
              }}
            >
              {ri + 1}
            </div>
            {r.map((cell, ci) => {
              const err = cell.startsWith('#') || cell === '?';
              const warn = cell === 'PEND.';
              return (
                <div
                  key={ci}
                  style={{
                    borderRight: '1px solid #E8EAED',
                    borderBottom: '1px solid #E8EAED',
                    padding: '8px 10px',
                    color: err ? '#C5221F' : C.ink2,
                    background: err ? '#FCE8E6' : warn ? '#FEF7E0' : '#fff',
                    fontWeight: err ? 800 : 500,
                  }}
                >
                  {cell}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const ChatBubble: React.FC<{text: string; mine?: boolean; time: string}> = ({text, mine, time}) => (
  <div
    style={{
      position: 'relative',
      background: mine ? '#D9FDD3' : C.white,
      borderRadius: 18,
      borderTopRightRadius: mine ? 4 : 18,
      borderTopLeftRadius: mine ? 18 : 4,
      padding: '14px 18px 12px',
      boxShadow: SHADOW.soft,
      fontFamily: FONT,
      fontSize: 24,
      fontWeight: 600,
      color: '#111B21',
      display: 'flex',
      alignItems: 'flex-end',
      gap: 14,
      whiteSpace: 'nowrap',
    }}
  >
    {text}
    <span style={{fontSize: 14, color: '#667781', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 3}}>
      {time}
      {mine ? (
        <svg width="18" height="12" viewBox="0 0 18 12">
          <path d="M1 6.5l3 3L10.5 2.5M7 9.5l1.2 1L16.5 2.5" stroke="#53BDEB" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </svg>
      ) : null}
    </span>
  </div>
);

const WhatsBadge: React.FC<{count: number}> = ({count}) => (
  <div
    style={{
      width: 104,
      height: 104,
      borderRadius: 30,
      background: 'linear-gradient(160deg, #3BE07A 0%, #1EBE5A 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 20px 36px -12px rgba(30,190,90,0.6)',
      position: 'relative',
    }}
  >
    <Icon name="message" size={56} color="#fff" strokeWidth={2.2} />
    <div
      style={{
        position: 'absolute',
        top: -14,
        right: -14,
        minWidth: 46,
        height: 46,
        padding: '0 8px',
        borderRadius: 99,
        background: C.red,
        color: '#fff',
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '4px solid #F7F8FC',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {count}
    </div>
  </div>
);

const MissedCalls: React.FC<{count: number}> = ({count}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      background: 'rgba(255,255,255,0.96)',
      borderRadius: 22,
      padding: '14px 22px 14px 14px',
      boxShadow: SHADOW.card,
      fontFamily: FONT,
      border: `1px solid ${C.border}`,
    }}
  >
    <div
      style={{
        width: 54,
        height: 54,
        borderRadius: 16,
        background: C.redTint,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name="phoneMissed" size={28} color={C.red} strokeWidth={2.2} />
    </div>
    <div>
      <div style={{fontSize: 15, fontWeight: 700, color: C.muted2, letterSpacing: '0.04em'}}>TELÉFONO · AHORA</div>
      <div style={{fontSize: 23, fontWeight: 800, color: C.navy, fontVariantNumeric: 'tabular-nums'}}>
        {count} llamadas perdidas
      </div>
    </div>
  </div>
);

type Prop = {
  key: string;
  group: 'papel' | 'excel' | 'chat';
  x: number;
  y: number;
  rot: number;
  enter: number;
  exitIdx: number;
  exitVec: [number, number, number];
  render: (frame: number) => React.ReactNode;
};

const PROPS: Prop[] = [
  {key: 'paperA', group: 'papel', x: 120, y: 92, rot: -8, enter: K.props[0], exitIdx: 0, exitVec: [-1500, -260, -60], render: () => <PaperSheet title="FICHA DEL ALUMNO" note="¿clase jueves?" />},
  {key: 'excel', group: 'excel', x: 1262, y: 58, rot: 3.5, enter: K.props[1], exitIdx: 0, exitVec: [0, 0, 0], render: () => <ExcelWindow />},
  {key: 'bubble1', group: 'chat', x: 1170, y: 706, rot: -1.5, enter: K.props[2], exitIdx: 0, exitVec: [0, 0, 0], render: () => <ChatBubble text="¿Me cambias la práctica del jueves?" time="10:41" />},
  {key: 'sticky1', group: 'papel', x: 575, y: 78, rot: -6, enter: K.props[3], exitIdx: 1, exitVec: [-1300, -520, -80], render: () => <StickyNote text="¡Llamar a Marta! cambio a las 17:00" />},
  {key: 'paperB', group: 'papel', x: 38, y: 404, rot: 6, enter: K.props[4], exitIdx: 2, exitVec: [-1400, 120, -70], render: () => <PaperSheet title="RECIBO · MATRÍCULA" note="pagado?? 120€" w={250} />},
  {key: 'badge', group: 'chat', x: 1712, y: 648, rot: 6, enter: K.props[5], exitIdx: 1, exitVec: [0, 0, 0], render: (f) => <WhatsBadge count={12 + Math.floor(tween(f, 8, 70, 0, 15, (t) => t))} />},
  {key: 'bubble2', group: 'chat', x: 1318, y: 818, rot: 1.5, enter: K.props[6], exitIdx: 2, exitVec: [0, 0, 0], render: () => <ChatBubble text="¿Cuántas clases me quedan?" time="10:43" mine />},
  {key: 'sticky2', group: 'papel', x: 150, y: 790, rot: 5, enter: K.props[7], exitIdx: 3, exitVec: [-1200, 380, 70], render: () => <StickyNote text="Examen Diego: ¿martes o jueves?" color="#FFD6E7" />},
  {key: 'calls', group: 'chat', x: 735, y: 780, rot: -2, enter: K.props[8], exitIdx: 3, exitVec: [0, 0, 0], render: (f) => <MissedCalls count={f < 40 ? 3 : f < 70 ? 4 : 5} />},
  {key: 'paperC', group: 'papel', x: 452, y: 742, rot: -5, enter: K.props[9], exitIdx: 4, exitVec: [-1300, 420, -50], render: () => <PaperSheet title="HOJA DE CLASES" note="¡¡sin coche el lunes!!" w={236} />},
  {key: 'bubble3', group: 'chat', x: 1225, y: 928, rot: -1, enter: K.props[10], exitIdx: 4, exitVec: [0, 0, 0], render: () => <ChatBubble text="¿Cuándo es mi examen?" time="10:44" />},
  {key: 'sticky3', group: 'papel', x: 1640, y: 430, rot: 8, enter: K.props[11], exitIdx: 5, exitVec: [-2600, -320, -90], render: () => <StickyNote text="Factura ITV ¡pendiente!" color="#C9F2FF" />},
];

const Burst: React.FC<{frame: number; at: number; x: number; y: number; color: string; seed: string; count?: number; dist?: number}> = ({
  frame,
  at,
  x,
  y,
  color,
  seed,
  count = 8,
  dist = 90,
}) => {
  const p = tween(frame, at, 16, 0, 1, EXPO_OUT);
  if (frame < at || p >= 1) return null;
  return (
    <>
      {new Array(count).fill(0).map((_, i) => {
        const a = (i / count) * Math.PI * 2 + random(`${seed}${i}`) * 0.6;
        const d = dist * (0.6 + random(`${seed}d${i}`) * 0.6) * p;
        const s = 10 * (1 - p) + 2;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x + Math.cos(a) * d - s / 2,
              top: y + Math.sin(a) * d - s / 2,
              width: s,
              height: s,
              borderRadius: 99,
              background: color,
              opacity: 1 - p,
            }}
          />
        );
      })}
    </>
  );
};

export const HookScene: React.FC<{frame: number}> = ({frame}) => {
  const {fps} = useVideoConfig();

  const renderProp = (p: Prop) => {
    const s = springAt(frame, fps, p.enter, {damping: 11, stiffness: 190, mass: 0.7});
    if (frame < p.enter) return null;
    const idle = {
      x: wobble(frame, p.x * 0.01, 1, 5),
      y: wobble(frame, p.y * 0.013 + 2, 0.8, 6),
      r: wobble(frame, p.x * 0.02 + 5, 0.7, 1.2),
    };
    let x = p.x + idle.x;
    let y = p.y + idle.y + (1 - s) * 60;
    let rot = p.rot + idle.r + (1 - s) * (p.rot > 0 ? 14 : -14);
    let scale = 0.55 + 0.45 * s;
    let opacity = clamp01(s * 1.8);
    let blur = 0;

    if (p.key === 'calls' || p.key === 'badge') {
      const buzzing = (frame > 12 && frame < 34) || (frame > 64 && frame < 84);
      if (buzzing) {
        x += Math.sin(frame * 3.3) * 4;
        rot += Math.sin(frame * 2.7) * 1.5;
      }
    }

    if (p.group === 'papel') {
      const at = K.papeles + p.exitIdx * 2;
      const e = tween(frame, at, 16, 0, 1, EXPO_IN);
      x += p.exitVec[0] * e;
      y += p.exitVec[1] * e;
      rot += p.exitVec[2] * e;
      blur = Math.min(14, easedVelocity(frame, at, 16, Math.hypot(p.exitVec[0], p.exitVec[1]), EXPO_IN) * 0.05);
      if (e >= 1) return null;
    } else if (p.group === 'excel') {
      const e = tween(frame, K.excel, 12, 0, 1, EXPO_IN);
      scale *= 1 - e;
      rot += 18 * e;
      if (e >= 1) return null;
    } else {
      const at = K.whatsapps + p.exitIdx * 1.5;
      const up = tween(frame, at, 3, 0, 1, EXPO_OUT);
      const down = tween(frame, at + 2, 5, 0, 1, CUBIC_IN);
      scale *= 1 + 0.14 * up - 1.14 * down;
      if (down >= 1) return null;
    }

    return (
      <div
        key={p.key}
        style={{
          position: 'absolute',
          left: x,
          top: y,
          transform: `rotate(${rot}deg) scale(${Math.max(0, scale)})`,
          transformOrigin: 'center center',
          opacity,
          filter: blur > 0.5 ? `blur(${blur.toFixed(1)}px)` : undefined,
        }}
      >
        {p.render(frame)}
      </div>
    );
  };

  // Punto final del titular: rebota y se expande como iris hacia la escena de marca
  const bounce = springAt(frame, fps, K.dotBounce, {damping: 8, stiffness: 260, mass: 0.5});
  const bounceScale = frame >= K.dotBounce ? 1 + Math.sin(clamp01(bounce) * Math.PI) * 0.7 : 1;
  const irisT = clamp01((frame - K.irisStart) / (K.irisEnd - K.irisStart));
  const iris = Math.pow(irisT, 3.2);
  const dotR = 7;
  const radius = dotR * bounceScale + iris * 1900;
  const dotVisible = frame >= K.whatsapps + 8;
  const dotIn = tween(frame, K.whatsapps + 8, 10, 0, 1, BACK_OUT);

  const dot = (
    <span style={{position: 'relative', display: 'inline-block', width: '0.2em', height: '1em', verticalAlign: 'top'}}>
      {dotVisible ? (
        <span
          style={{
            position: 'absolute',
            left: `calc(0.02em - ${radius * dotIn}px)`,
            top: `calc(0.935em - ${radius * dotIn}px)`,
            width: radius * 2 * dotIn,
            height: radius * 2 * dotIn,
            borderRadius: '50%',
            background:
              iris > 0.01
                ? `radial-gradient(circle at 50% 50%, #1A1F57 0%, #0E1236 ${Math.max(20, 60 - iris * 40)}%, ${C.violet} 100%)`
                : C.violet,
            boxShadow: iris > 0.01 ? `0 0 0 ${6 + iris * 20}px rgba(123,63,242,${0.35 * (1 - iris)})` : 'none',
            zIndex: 20,
          }}
        />
      ) : null}
    </span>
  );

  const titleOut = tween(frame, K.irisStart, 28, 0, 1, EXPO_IN);

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <LightBackground frame={frame} />
      {PROPS.map(renderProp)}
      {/* "poof" del Excel */}
      {frame >= K.excel + 8 && frame < K.excel + 30 ? (
        <div
          style={{
            position: 'absolute',
            left: 1532 - 150 * tween(frame, K.excel + 8, 20),
            top: 222 - 150 * tween(frame, K.excel + 8, 20),
            width: 300 * tween(frame, K.excel + 8, 20),
            height: 300 * tween(frame, K.excel + 8, 20),
            borderRadius: 999,
            border: `4px solid rgba(29,111,66,${0.6 * (1 - tween(frame, K.excel + 8, 20))})`,
          }}
        />
      ) : null}
      <Burst frame={frame} at={K.excel + 9} x={1532} y={222} color={C.excel} seed="ex" count={10} dist={180} />
      <Burst frame={frame} at={K.whatsapps + 5} x={1400} y={750} color={C.whatsapp} seed="w1" />
      <Burst frame={frame} at={K.whatsapps + 6} x={1764} y={700} color={C.whatsapp} seed="w2" />
      <Burst frame={frame} at={K.whatsapps + 8} x={1500} y={858} color={C.whatsapp} seed="w3" />
      <Burst frame={frame} at={K.whatsapps + 11} x={1380} y={966} color={C.whatsapp} seed="w4" />
      <Burst frame={frame} at={K.whatsapps + 9} x={915} y={826} color={C.red} seed="w5" />

      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: FONT,
          color: C.navy,
          textAlign: 'center',
          transform: `scale(${1 + titleOut * 0.08})`,
        }}
      >
        <div style={{marginTop: -30}}>
          <RevealText
            frame={frame}
            start={K.title}
            stagger={4}
            dur={22}
            segments={[{t: 'Tu autoescuela,'}]}
            style={{fontSize: 136, fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1.05}}
          />
          <RevealText
            frame={frame}
            start={K.papeles}
            stagger={3}
            dur={18}
            segments={[
              {t: 'sin papeles,', at: K.papeles},
              {t: 'ni Excel,', at: K.excel},
              {t: 'ni WhatsApps', at: K.whatsapps, tail: dot},
            ]}
            style={{fontSize: 72, fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.1, marginTop: 22, color: C.navy}}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
