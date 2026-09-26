import React from 'react';
import {AbsoluteFill} from 'remotion';
import cues from '../cues.json';
import {LightBackground} from '../components/Backgrounds';
import {Icon} from '../components/Icons';
import {RevealText} from '../components/RevealText';
import {Avatar, Chip, Eyebrow, Stars} from '../components/ui';
import {EXPO_OUT, clamp01, tween} from '../lib/anim';
import {C, FONT, GRAD, SHADOW} from '../theme';

const K = cues.proof;

export const ProofScene: React.FC<{frame: number}> = ({frame}) => {
  const n = Math.round(tween(frame, K.countStart, K.countEnd - K.countStart, 0, 320, EXPO_OUT));
  const card = tween(frame, K.card, 30, 0, 1, EXPO_OUT);
  const countPop = tween(frame, K.countStart, 20, 0, 1, EXPO_OUT);
  const cap = tween(frame, K.caption, 20, 0, 1, EXPO_OUT);
  const aside = tween(frame, K.stars[4] + 4, 18, 0, 1, EXPO_OUT);

  return (
    <AbsoluteFill style={{overflow: 'hidden', fontFamily: FONT}}>
      <LightBackground frame={frame} tint="lavender" />

      <div style={{position: 'absolute', left: 150, top: 282, width: 820}}>
        <Eyebrow frame={frame} at={K.countStart} icon="star">
          Testimonios
        </Eyebrow>
        <div
          style={{
            fontSize: 250,
            fontWeight: 800,
            letterSpacing: '-0.06em',
            lineHeight: 1,
            marginTop: 18,
            backgroundImage: GRAD.accent,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            WebkitTextFillColor: 'transparent',
            fontVariantNumeric: 'tabular-nums',
            transform: `translateY(${(1 - countPop) * 40}px) scale(${0.92 + 0.08 * countPop})`,
            transformOrigin: 'left bottom',
            opacity: countPop,
            paddingBottom: 12,
          }}
        >
          +{n}
        </div>
        <div
          style={{
            fontSize: 48,
            fontWeight: 800,
            letterSpacing: '-0.035em',
            color: C.navy,
            lineHeight: 1.12,
            opacity: cap,
            transform: `translateY(${(1 - cap) * 24}px)`,
          }}
        >
          autoescuelas ya gestionan
          <br />
          con <span style={{color: C.violet}}>Aptoa</span>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 22, marginTop: 34}}>
          <div style={{display: 'flex'}}>
            {[
              {i: 'CM', c: C.violet},
              {i: 'LF', c: C.green},
              {i: 'RT', c: '#D97706'},
              {i: 'MS', c: C.blue},
            ].map((a, k) => {
              const p = tween(frame, K.caption + 4 + k * 2, 14, 0, 1, EXPO_OUT);
              return (
                <div key={a.i} style={{marginLeft: k ? -14 : 0, transform: `scale(${p})`, opacity: p}}>
                  <div style={{borderRadius: 99, background: '#fff', padding: 3}}>
                    <Avatar initials={a.i} color={a.c} size={54} />
                  </div>
                </div>
              );
            })}
          </div>
          <div>
            <Stars frame={frame} at={K.stars} size={32} />
            <div style={{fontSize: 19, fontWeight: 600, color: C.muted2, marginTop: 6, opacity: aside}}>
              (y desearían haberlo descubierto antes)
            </div>
          </div>
        </div>
      </div>

      {/* Caso de éxito */}
      <div style={{position: 'absolute', left: 1010, top: 318, perspective: 1800}}>
        <div
          style={{
            width: 780,
            transform: `translateX(${(1 - card) * 180}px) rotateY(${-18 * (1 - card)}deg) rotate(${-1.5 * (1 - card)}deg)`,
            transformOrigin: 'right center',
            opacity: clamp01(card * 1.6),
          }}
        >
          <div
            style={{
              background: C.navy,
              borderRadius: 36,
              padding: 16,
              boxShadow: SHADOW.float,
              backgroundImage: 'radial-gradient(600px 400px at 90% 0%, rgba(123,63,242,0.55), rgba(123,63,242,0) 70%)',
            }}
          >
            <div style={{background: C.white, borderRadius: 26, padding: '34px 40px 36px', position: 'relative'}}>
              <Chip color={C.violet} bg={C.violetTint} size={17}>
                <Icon name="star" size={16} color={C.violet} fill={C.violet} strokeWidth={1.5} />
                CASO DE ÉXITO
              </Chip>
              <div
                style={{
                  position: 'absolute',
                  right: 36,
                  bottom: -64,
                  fontSize: 230,
                  fontWeight: 800,
                  lineHeight: 1,
                  backgroundImage: GRAD.accent,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                  WebkitTextFillColor: 'transparent',
                  opacity: 0.14,
                }}
              >
                »
              </div>
              <RevealText
                frame={frame}
                start={K.quote}
                stagger={1.6}
                dur={18}
                segments={[{t: '«Recuperé a seis alumnos el primer mes solo con la'}, {t: 'alerta de abandono.»', gradient: GRAD.accent}]}
                style={{marginTop: 22, fontSize: 47, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.2, color: C.navy}}
              />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  marginTop: 30,
                  opacity: tween(frame, K.quote + 16, 16),
                }}
              >
                <Avatar initials="LF" color={C.violet} size={62} />
                <div>
                  <div style={{fontSize: 25, fontWeight: 800}}>Laura Fernández</div>
                  <div style={{fontSize: 18, fontWeight: 600, color: C.muted2}}>Cliente de Aptoa</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
