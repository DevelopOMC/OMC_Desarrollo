import React from 'react';
import {AbsoluteFill, random, useVideoConfig} from 'remotion';
import cues from '../cues.json';
import {AppIcon} from '../components/Brand';
import {Cursor} from '../components/Device';
import {Icon} from '../components/Icons';
import {RevealText} from '../components/RevealText';
import {Wordmark} from '../components/Wordmark';
import {EXPO_IN_OUT, EXPO_OUT, QUART_IN_OUT, bezier, clamp01, springAt, tween} from '../lib/anim';
import {C, FONT, GRAD} from '../theme';

const K = cues.cta;
const T = cues.transitions.proofToCta;

export const CTAScene: React.FC<{frame: number}> = ({frame}) => {
  const {fps} = useVideoConfig();
  const t = frame / 30;

  // Anillo luminoso que acompaña al iris de entrada
  const irisStart = T.at - T.frames / 2;
  const irisT = clamp01((frame - irisStart) / T.frames);
  const irisR = QUART_IN_OUT(irisT) * 1150;

  const flash = frame >= K.impact ? 0.4 * (1 - tween(frame, K.impact, 14, 0, 1, EXPO_OUT)) : 0;
  const icon = springAt(frame, fps, K.impact - 1, {damping: 11, stiffness: 160});
  const draw = tween(frame, K.impact + 4, 24, 0, 1, EXPO_OUT);
  const letters: [number, number, number] = [0, 1, 2].map((i) => tween(frame, K.impact + 8 + i * 3, 18, 0, 1, EXPO_OUT)) as [
    number,
    number,
    number,
  ];
  const sub = tween(frame, K.sub, 20, 0, 1, EXPO_OUT);
  const btn = springAt(frame, fps, K.button, {damping: 12, stiffness: 170});
  const shimmer = tween(frame, K.button + 16, 26, 0, 1, EXPO_IN_OUT);
  const pressed = frame >= K.click - 2 && frame < K.click + 5;
  const ripple = frame >= K.click ? tween(frame, K.click, 26, 0, 1, EXPO_OUT) : 0;

  const BTN_W = 700;
  const BTN_H = 108;
  const btnCenter: [number, number] = [960, 752];
  const cm = tween(frame, K.cursor, K.click - 3 - K.cursor, 0, 1, EXPO_IN_OUT);
  const target: [number, number] = [btnCenter[0] + 268, btnCenter[1] + 6];
  const [bx, by] = bezier(cm, [1560, 1080], [1480, 920], [1300, 820], target);
  const away = tween(frame, K.click + 8, 22, 0, 1, EXPO_IN_OUT);
  const cx = bx + away * 150;
  const cy = by + away * 210;
  const cursorFade = 1 - tween(frame, K.click + 12, 16, 0, 1, EXPO_IN_OUT);

  return (
    <AbsoluteFill style={{overflow: 'hidden', fontFamily: FONT}}>
      {/* Fondo degradado de la web + orbes */}
      <AbsoluteFill style={{background: GRAD.cta}} />
      <AbsoluteFill
        style={{
          background: [
            `radial-gradient(700px 560px at ${300 + Math.sin(t) * 60}px ${880 + Math.cos(t * 0.8) * 40}px, rgba(20,184,166,0.38), rgba(20,184,166,0) 70%)`,
            `radial-gradient(800px 600px at ${1620 + Math.cos(t * 0.7) * 80}px ${140 + Math.sin(t) * 50}px, rgba(167,139,250,0.45), rgba(167,139,250,0) 70%)`,
            `radial-gradient(900px 500px at 960px 760px, rgba(59,91,255,0.28), rgba(59,91,255,0) 70%)`,
          ].join(','),
        }}
      />
      {/* haces de luz diagonales */}
      <AbsoluteFill style={{opacity: 0.5}}>
        {[0, 1, 2].map((i) => {
          const x = ((frame * (1.6 + i * 0.5) + i * 700) % 2600) - 400;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: x,
                top: -300,
                width: 120 + i * 60,
                height: 1700,
                transform: 'rotate(24deg)',
                background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.07), rgba(255,255,255,0))',
              }}
            />
          );
        })}
      </AbsoluteFill>
      {/* partículas flotantes */}
      {new Array(26).fill(0).map((_, i) => {
        const x = random(`cx${i}`) * 1920;
        const y = (random(`cy${i}`) * 1200 - frame * (0.6 + random(`cs${i}`) * 1.4) + 1200) % 1200;
        const s = 2 + random(`cz${i}`) * 4;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y - 60,
              width: s,
              height: s,
              borderRadius: 99,
              background: '#fff',
              opacity: 0.12 + random(`co${i}`) * 0.3,
            }}
          />
        );
      })}

      {/* Logotipo */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 150,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 30,
        }}
      >
        <div style={{transform: `scale(${0.3 + 0.7 * icon}) rotate(${(1 - icon) * -30}deg)`, opacity: clamp01(icon * 2)}}>
          <AppIcon size={112} shine={tween(frame, K.impact + 10, 22, 0, 1, EXPO_IN_OUT)} />
        </div>
        <Wordmark id="wmCta" width={420} variant="dark" draw={draw} letters={letters} />
      </div>

      {/* Titular */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 336, textAlign: 'center'}}>
        <RevealText
          frame={frame}
          start={K.headline}
          stagger={2.6}
          dur={22}
          segments={[{t: 'Digitaliza tu autoescuela'}, {t: 'en segundos.', br: true, gradient: GRAD.accentLight}]}
          style={{color: '#fff', fontSize: 104, fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1.04}}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 600,
          textAlign: 'center',
          color: 'rgba(255,255,255,0.84)',
          fontSize: 32,
          fontWeight: 500,
          opacity: sub,
          transform: `translateY(${(1 - sub) * 18}px)`,
        }}
      >
        Prueba Aptoa <b style={{color: '#fff', fontWeight: 800}}>14 días gratis</b>. Sin tarjeta, sin compromiso.
      </div>

      {/* Botón principal */}
      {frame >= K.button ? (
        <div
          style={{
            position: 'absolute',
            left: btnCenter[0] - BTN_W / 2,
            top: btnCenter[1] - BTN_H / 2,
            width: BTN_W,
            height: BTN_H,
            transform: `scale(${(0.6 + 0.4 * btn) * (pressed ? 0.96 : 1)})`,
            opacity: clamp01(btn * 2),
          }}
        >
          {ripple > 0 && ripple < 1 ? (
            <div
              style={{
                position: 'absolute',
                inset: -40 * ripple,
                borderRadius: 999,
                border: `3px solid rgba(255,255,255,${0.7 * (1 - ripple)})`,
              }}
            />
          ) : null}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 999,
              background: '#fff',
              boxShadow: '0 24px 60px -16px rgba(8,10,40,0.6), 0 0 0 8px rgba(255,255,255,0.10)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 22,
              overflow: 'hidden',
            }}
          >
            <span style={{fontSize: 40, fontWeight: 800, color: C.navy, letterSpacing: '-0.02em'}}>
              Empieza gratis en <span style={{color: C.violet}}>aptoa.es</span>
            </span>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 999,
                background: GRAD.button,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `translateX(${Math.sin(clamp01((frame - K.button - 10) / 20) * Math.PI) * 8}px)`,
              }}
            >
              <Icon name="arrowRight" size={32} color="#fff" strokeWidth={2.8} />
            </div>
            {shimmer > 0 && shimmer < 1 ? (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: `linear-gradient(105deg, rgba(123,63,242,0) ${shimmer * 140 - 30}%, rgba(123,63,242,0.16) ${shimmer * 140 - 15}%, rgba(123,63,242,0) ${shimmer * 140}%)`,
                }}
              />
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Garantías de la web */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 872,
          display: 'flex',
          justifyContent: 'center',
          gap: 44,
        }}
      >
        {['Sin permanencia', 'Migración gratuita', 'Soporte en español'].map((txt, i) => {
          const p = tween(frame, K.checks[i], 16, 0, 1, EXPO_OUT);
          return (
            <div
              key={txt}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                color: 'rgba(255,255,255,0.88)',
                fontSize: 27,
                fontWeight: 600,
                opacity: p,
                transform: `translateY(${(1 - p) * 20}px)`,
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 99,
                  background: 'rgba(16,185,129,0.22)',
                  border: '1.5px solid rgba(52,211,153,0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="check" size={19} color="#6EE7B7" strokeWidth={3} />
              </div>
              {txt}
            </div>
          );
        })}
      </div>

      {frame >= K.cursor ? (
        <Cursor x={cx} y={cy} frame={frame} clickAt={K.click} opacity={clamp01((frame - K.cursor) / 5) * cursorFade} />
      ) : null}

      {/* anillo del iris */}
      {irisT > 0 && irisT < 1 ? (
        <div
          style={{
            position: 'absolute',
            left: 960 - irisR,
            top: 540 - irisR,
            width: irisR * 2,
            height: irisR * 2,
            borderRadius: '50%',
            border: '6px solid rgba(190,170,255,0.9)',
            boxShadow: '0 0 40px rgba(160,130,255,0.8), inset 0 0 40px rgba(160,130,255,0.6)',
          }}
        />
      ) : null}
      {flash > 0.01 ? <AbsoluteFill style={{background: '#fff', opacity: flash}} /> : null}
    </AbsoluteFill>
  );
};
