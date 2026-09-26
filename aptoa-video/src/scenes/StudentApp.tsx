import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import cues from '../cues.json';
import {LightBackground} from '../components/Backgrounds';
import {Phone} from '../components/Device';
import {Icon} from '../components/Icons';
import {RevealText} from '../components/RevealText';
import {Eyebrow} from '../components/ui';
import {EXPO_OUT, clamp01, springAt, tween} from '../lib/anim';
import {C, FONT, GRAD} from '../theme';

const K = cues.app;
const PW = 340;

const Title: React.FC<{children: React.ReactNode; sub?: string}> = ({children, sub}) => (
  <div style={{padding: '4px 22px 0'}}>
    <div style={{fontSize: 23, fontWeight: 800, letterSpacing: '-0.02em'}}>{children}</div>
    {sub ? <div style={{fontSize: 14, fontWeight: 600, color: C.muted2, marginTop: 2}}>{sub}</div> : null}
  </div>
);

/* ---------- Pantalla 1: Test DGT ---------- */
const TestScreen: React.FC<{frame: number}> = ({frame}) => {
  const answered = frame >= K.answer;
  const pop = tween(frame, K.answer, 14, 0, 1, EXPO_OUT);
  const secs = 252 - Math.floor(Math.max(0, frame - K.phones[1]) / 30);
  const options = ['Ceda el paso', 'Sentido obligatorio', 'Dirección prohibida'];
  return (
    <div>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 22}}>
        <Title sub="Pregunta 4 de 10">Test DGT · Tema 4</Title>
        <div
          style={{
            fontSize: 14,
            fontWeight: 800,
            background: C.bg2,
            borderRadius: 8,
            padding: '5px 9px',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          0{Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}
        </div>
      </div>
      <div style={{display: 'flex', gap: 5, padding: '12px 22px 0'}}>
        {new Array(10).fill(0).map((_, i) => (
          <div key={i} style={{flex: 1, height: 5, borderRadius: 9, background: i < 4 ? C.violet : '#E6E8F2'}} />
        ))}
      </div>
      <div style={{display: 'flex', justifyContent: 'center', marginTop: 22}}>
        <div
          style={{
            width: 136,
            height: 136,
            borderRadius: 999,
            background: 'radial-gradient(circle at 35% 30%, #3E8BFF 0%, #1F5FD6 70%)',
            border: '6px solid #fff',
            boxShadow: '0 0 0 2px #D9DDEA, 0 14px 30px -10px rgba(31,95,214,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="70" height="80" viewBox="0 0 70 80">
            <path d="M35 6 L62 38 H46 V74 H24 V38 H8 Z" fill="#fff" />
          </svg>
        </div>
      </div>
      <div style={{fontSize: 19, fontWeight: 800, padding: '20px 22px 12px', lineHeight: 1.25}}>¿Qué indica esta señal?</div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 10, padding: '0 22px'}}>
        {options.map((o, i) => {
          const correct = i === 1;
          const on = answered && correct;
          return (
            <div
              key={o}
              style={{
                height: 54,
                borderRadius: 14,
                border: `2px solid ${on ? C.green : C.border}`,
                background: on ? C.greenTint : '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 16px',
                fontSize: 17,
                fontWeight: 700,
                color: on ? C.green2 : answered ? C.muted3 : C.ink2,
                transform: `scale(${on ? 1 + Math.sin(pop * Math.PI) * 0.05 : 1})`,
              }}
            >
              {o}
              {on ? (
                <div style={{transform: `scale(${pop})`}}>
                  <Icon name="checkCircle" size={24} color={C.green} strokeWidth={2.4} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ---------- Pantalla 2: Resultados ---------- */
const ResultsScreen: React.FC<{frame: number}> = ({frame}) => {
  const p = tween(frame, K.ring, 34, 0, 1, EXPO_OUT);
  const r = 74;
  const circ = 2 * Math.PI * r;
  const bars = [
    {label: 'Señales de prioridad', v: 0.3, c: C.red},
    {label: 'Velocidad y distancias', v: 0.58, c: C.amber},
    {label: 'Mecánica del vehículo', v: 0.88, c: C.green},
  ];
  return (
    <div>
      <Title sub="Últimos 30 tests">Tus resultados</Title>
      <div style={{display: 'flex', justifyContent: 'center', marginTop: 18, position: 'relative'}}>
        <svg width="190" height="190" viewBox="0 0 190 190">
          <defs>
            <linearGradient id="ringG" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#34D399" />
              <stop offset="1" stopColor="#0E9E70" />
            </linearGradient>
          </defs>
          <circle cx="95" cy="95" r={r} stroke="#EEF0FB" strokeWidth="16" fill="none" />
          <circle
            cx="95"
            cy="95"
            r={r}
            stroke="url(#ringG)"
            strokeWidth="16"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${circ * 0.82 * p} ${circ}`}
            transform="rotate(-90 95 95)"
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{fontSize: 46, fontWeight: 800, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums'}}>
            {Math.round(82 * p)}%
          </div>
          <div style={{fontSize: 13, fontWeight: 700, color: C.muted2}}>Media de aciertos</div>
        </div>
      </div>
      <div style={{fontSize: 17, fontWeight: 800, padding: '18px 22px 8px'}}>Tus puntos débiles</div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 12, padding: '0 22px'}}>
        {bars.map((b, i) => {
          const bp = tween(frame, K.ring + 8 + i * 4, 26, 0, 1, EXPO_OUT);
          return (
            <div key={b.label}>
              <div style={{fontSize: 14, fontWeight: 700, color: C.ink2, marginBottom: 6}}>{b.label}</div>
              <div style={{height: 8, borderRadius: 99, background: '#EEF0F5'}}>
                <div style={{width: `${b.v * bp * 100}%`, height: '100%', borderRadius: 99, background: b.c}} />
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          margin: '18px 22px 0',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: C.amberTint,
          borderRadius: 14,
          padding: '10px 14px',
          fontSize: 15,
          fontWeight: 800,
          color: '#B45309',
          opacity: tween(frame, K.ring + 20, 14),
        }}
      >
        <Icon name="flame" size={22} color={C.amber} fill="rgba(245,158,11,0.25)" strokeWidth={2.2} />
        Racha de 7 días · ¡sigue así!
      </div>
    </div>
  );
};

/* ---------- Pantalla 3: Reservar práctica ---------- */
const BookingScreen: React.FC<{frame: number}> = ({frame}) => {
  const chosen = frame >= K.tap;
  const booked = frame >= K.booked;
  const tapP = tween(frame, K.tap - 4, 14, 0, 1, EXPO_OUT);
  const bookP = tween(frame, K.booked, 14, 0, 1, EXPO_OUT);
  const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const slots = ['10:00 - 11:00', '12:00 - 13:00', '16:00 - 17:00'];
  return (
    <div style={{position: 'relative', height: '100%'}}>
      <Title sub="Toyota Yaris · 1234 BCD">Reservar práctica</Title>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: 8, padding: '16px 18px 0', textAlign: 'center'}}>
        {days.map((d) => (
          <div key={d} style={{fontSize: 12, fontWeight: 700, color: C.muted3}}>
            {d}
          </div>
        ))}
        {new Array(14).fill(0).map((_, i) => {
          const n = i + 1;
          const sel = n === 4;
          const tint = n === 9;
          return (
            <div key={n} style={{display: 'flex', justifyContent: 'center'}}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 11,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 15,
                  fontWeight: 800,
                  background: sel ? C.navy : tint ? C.violetTint : 'transparent',
                  color: sel ? '#fff' : tint ? C.violet : C.ink2,
                }}
              >
                {n}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{fontSize: 16, fontWeight: 800, padding: '18px 22px 10px'}}>Jueves 4 · huecos libres</div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 10, padding: '0 22px'}}>
        {slots.map((s, i) => {
          const on = i === 0 && chosen;
          return (
            <div
              key={s}
              style={{
                height: 54,
                borderRadius: 14,
                border: `2px solid ${on ? C.violet : C.border}`,
                background: on ? C.violetTint : '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 16px',
                fontSize: 16,
                fontWeight: 800,
                color: C.navy,
                position: 'relative',
              }}
            >
              {s}
              <span style={{fontSize: 13, fontWeight: 800, color: on ? C.violet : C.muted3}}>{on ? 'Elegido' : 'Libre'}</span>
              {i === 0 && frame >= K.tap - 4 && tapP < 1 ? (
                <div
                  style={{
                    position: 'absolute',
                    left: 120 - 34 * tapP,
                    top: 27 - 34 * tapP,
                    width: 68 * tapP,
                    height: 68 * tapP,
                    borderRadius: 99,
                    background: `rgba(26,31,78,${0.18 * (1 - tapP)})`,
                  }}
                />
              ) : null}
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 22,
          right: 22,
          bottom: 46,
          height: 58,
          borderRadius: 16,
          background: booked ? GRAD.green : GRAD.button,
          color: '#fff',
          fontSize: 18,
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          transform: `scale(${booked ? 0.94 + 0.06 * bookP : 1})`,
          boxShadow: booked ? '0 14px 24px -12px rgba(16,185,129,0.7)' : '0 14px 24px -12px rgba(123,63,242,0.6)',
        }}
      >
        {booked ? <Icon name="checkCircle" size={24} color="#fff" strokeWidth={2.4} /> : null}
        {booked ? '¡Práctica reservada!' : 'Reservar práctica'}
      </div>
    </div>
  );
};

export const StudentAppScene: React.FC<{frame: number}> = ({frame}) => {
  const {fps} = useVideoConfig();
  const phones = [
    {cx: 575, top: 336, rot: -7, scale: 0.83, at: K.phones[1], screen: <TestScreen frame={frame} />},
    {cx: 960, top: 300, rot: 0, scale: 0.9, at: K.phones[0], screen: <ResultsScreen frame={frame} />},
    {cx: 1345, top: 336, rot: 7, scale: 0.83, at: K.phones[2], screen: <BookingScreen frame={frame} />},
  ];
  return (
    <AbsoluteFill style={{overflow: 'hidden', fontFamily: FONT}}>
      <LightBackground frame={frame} tint="lavender" grid={false} />
      <div
        style={{
          position: 'absolute',
          left: 960 - 700,
          top: 380,
          width: 1400,
          height: 900,
          borderRadius: '50%',
          background: 'radial-gradient(closest-side, rgba(123,63,242,0.20), rgba(59,91,255,0.08) 55%, rgba(59,91,255,0) 100%)',
        }}
      />
      <div style={{position: 'absolute', left: 0, right: 0, top: 84, textAlign: 'center'}}>
        <Eyebrow frame={frame} at={K.title} icon="smartphone">
          Para tus alumnos
        </Eyebrow>
        <RevealText
          frame={frame}
          start={K.title + 2}
          stagger={2.2}
          dur={20}
          segments={[{t: 'Una app para que tus alumnos'}, {t: 'aprueben de verdad.', br: true, gradient: GRAD.accent}]}
          style={{marginTop: 18, fontSize: 74, fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1.06, color: C.navy}}
        />
      </div>
      {phones.map((ph, i) => {
        const s = springAt(frame, fps, ph.at, {damping: 15, stiffness: 110, mass: 1});
        if (frame < ph.at) return null;
        const floatY = Math.sin((frame + i * 20) / 22) * 6;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: ph.cx - PW / 2,
              top: ph.top + (1 - s) * 760 + floatY,
              transform: `rotate(${ph.rot * s + (1 - s) * ph.rot * 2}deg) scale(${ph.scale})`,
              transformOrigin: '50% 0%',
              opacity: clamp01(s * 2),
            }}
          >
            <Phone width={PW}>{ph.screen}</Phone>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
