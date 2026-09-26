import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import cues from '../cues.json';
import {LightBackground} from '../components/Backgrounds';
import {Icon} from '../components/Icons';
import {RevealText} from '../components/RevealText';
import {Avatar, Card, Chip, Counter, ProductBadge} from '../components/ui';
import {EXPO_OUT, clamp01, springAt, tween} from '../lib/anim';
import {C, FONT, GRAD, SHADOW} from '../theme';

const K = cues.driveiq;

const STUDENTS = [
  {ini: 'SC', name: 'Sara Castro', detail: 'Necesita atención · 2 prácticas en 30 días', risk: 'Alto', pct: 82, c: C.red, bg: C.redTint, av: C.red},
  {ini: 'DR', name: 'Diego Ruiz', detail: 'En progreso · 64% predicción', risk: 'Medio', pct: 46, c: '#D97706', bg: C.amberTint, av: C.blue},
  {ini: 'LM', name: 'Lucía Marín', detail: 'Listo para examen · 91% predicción', risk: 'Bajo', pct: 9, c: C.green, bg: C.greenTint, av: C.green},
];

export const DriveIQScene: React.FC<{frame: number}> = ({frame}) => {
  const {fps} = useVideoConfig();
  const cardIn = tween(frame, K.title - 4, 34, 0, 1, EXPO_OUT);
  const alert = springAt(frame, fps, K.alert, {damping: 12, stiffness: 170});
  const hl = frame >= K.highlight ? tween(frame, K.highlight, 30, 0, 1, EXPO_OUT) : 0;
  const bellShake = frame >= K.alert ? Math.sin((frame - K.alert) * 1.4) * 14 * Math.exp(-(frame - K.alert) / 10) : 0;

  const kpis = [
    {label: 'Predicción media', to: 78, suffix: '%', grad: GRAD.green},
    {label: 'En riesgo', to: 9, suffix: '', grad: GRAD.red},
    {label: 'Van bien', to: 61, suffix: '', grad: GRAD.navyBlue},
  ];

  return (
    <AbsoluteFill style={{overflow: 'hidden', fontFamily: FONT}}>
      <LightBackground frame={frame} tint="mint" />

      {/* Texto */}
      <div style={{position: 'absolute', left: 150, top: 250, width: 720}}>
        <ProductBadge frame={frame} at={K.title} letter="D" label="DriveIQ" color={C.green} />
        <RevealText
          frame={frame}
          start={K.title + 3}
          stagger={2.5}
          dur={20}
          segments={[
            {t: 'Anticipa quién va'},
            {t: 'a', br: true},
            {t: 'abandonar', gradient: GRAD.accent},
            {t: 'antes'},
            {t: 'de que ocurra.', br: true},
          ]}
          style={{marginTop: 34, fontSize: 80, fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1.06, color: C.navy}}
        />
        <div
          style={{
            marginTop: 30,
            fontSize: 29,
            lineHeight: 1.45,
            color: C.muted,
            fontWeight: 500,
            maxWidth: 620,
            opacity: tween(frame, K.title + 14, 20),
            transform: `translateY(${(1 - tween(frame, K.title + 14, 20)) * 16}px)`,
          }}
        >
          La IA predice el aprobado y el riesgo de abandono de cada alumno.
        </div>
        <div style={{display: 'flex', gap: 14, marginTop: 30}}>
          {[
            {icon: 'alert' as const, text: 'Semáforo de riesgo', c: C.red, bg: C.redTint},
            {icon: 'lightbulb' as const, text: 'Recomendación automática', c: C.violet, bg: C.violetTint},
          ].map((ch, i) => {
            const p = tween(frame, K.chips[i], 16, 0, 1, EXPO_OUT);
            return (
              <div key={ch.text} style={{opacity: p, transform: `translateY(${(1 - p) * 20}px) scale(${0.9 + 0.1 * p})`}}>
                <Chip color={ch.c} bg={ch.bg} size={21} style={{padding: '10px 18px', border: `1px solid ${ch.c}22`}}>
                  <Icon name={ch.icon} size={22} color={ch.c} strokeWidth={2.3} />
                  {ch.text}
                </Chip>
              </div>
            );
          })}
        </div>
      </div>

      {/* Panel DriveIQ */}
      <div style={{position: 'absolute', left: 930, top: 170, perspective: 2000}}>
        <div
          style={{
            transform: `translateX(${(1 - cardIn) * 220}px) rotateY(${-16 + 11 * cardIn}deg) rotateX(${7 - 5 * cardIn}deg)`,
            transformOrigin: 'left center',
            opacity: clamp01(cardIn * 1.6),
          }}
        >
          <Card radius={30} style={{width: 840, padding: 30}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <div>
                <div style={{fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em'}}>Panel DriveIQ</div>
                <div style={{fontSize: 17, fontWeight: 500, color: C.muted2, marginTop: 2}}>126 alumnos activos · actualizado hoy</div>
              </div>
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 16,
                  background: C.bg2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <Icon name="bell" size={26} color={C.navy} strokeWidth={2.1} />
                {frame >= K.alert ? (
                  <div
                    style={{
                      position: 'absolute',
                      top: 9,
                      right: 10,
                      width: 12,
                      height: 12,
                      borderRadius: 99,
                      background: C.red,
                      border: '2px solid #fff',
                      transform: `scale(${alert})`,
                    }}
                  />
                ) : null}
              </div>
            </div>

            <div style={{display: 'flex', gap: 14, marginTop: 24}}>
              {kpis.map((k, i) => {
                const p = tween(frame, K.kpiStart + i * 3, 18, 0, 1, EXPO_OUT);
                return (
                  <div
                    key={k.label}
                    style={{
                      flex: 1,
                      height: 136,
                      borderRadius: 22,
                      background: k.grad,
                      padding: '18px 22px',
                      color: '#fff',
                      opacity: p,
                      transform: `translateY(${(1 - p) * 24}px)`,
                      boxShadow: '0 16px 30px -14px rgba(26,31,78,0.45)',
                    }}
                  >
                    <div style={{fontSize: 18, fontWeight: 600, opacity: 0.88}}>{k.label}</div>
                    <Counter
                      frame={frame}
                      start={K.kpiStart + i * 3}
                      end={K.kpiEnd + i * 3}
                      to={k.to}
                      suffix={k.suffix}
                      style={{fontSize: 60, fontWeight: 800, letterSpacing: '-0.03em', display: 'block', marginTop: 6}}
                    />
                  </div>
                );
              })}
            </div>

            <div style={{display: 'flex', gap: 10, marginTop: 22}}>
              <Chip color="#fff" bg={C.navy} size={17}>
                Todos
              </Chip>
              <Chip color={C.red} bg={C.redTint} size={17}>
                Riesgo alto
              </Chip>
              <Chip color={C.green2} bg={C.greenTint} size={17}>
                Van bien
              </Chip>
            </div>

            <div style={{display: 'flex', flexDirection: 'column', gap: 12, marginTop: 18}}>
              {STUDENTS.map((s, i) => {
                const p = tween(frame, K.rows[i], 18, 0, 1, EXPO_OUT);
                const bar = tween(frame, K.rows[i] + 4, 24, 0, s.pct / 100, EXPO_OUT);
                const isAlert = i === 0 && hl > 0;
                return (
                  <div
                    key={s.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 18,
                      padding: '16px 20px',
                      borderRadius: 20,
                      background: isAlert ? '#FFF6F6' : C.bg,
                      border: `1px solid ${isAlert ? 'rgba(239,68,68,0.35)' : C.border}`,
                      boxShadow: isAlert ? `0 0 0 ${6 * (1 - hl)}px rgba(239,68,68,${0.25 * (1 - hl)})` : 'none',
                      opacity: p,
                      transform: `translateY(${(1 - p) * 26}px)`,
                    }}
                  >
                    <Avatar initials={s.ini} color={s.av} size={50} />
                    <div style={{flex: 1}}>
                      <div style={{fontSize: 22, fontWeight: 800}}>{s.name}</div>
                      <div style={{fontSize: 16, fontWeight: 500, color: C.muted2, marginTop: 2}}>{s.detail}</div>
                    </div>
                    <div style={{width: 130}}>
                      <div style={{fontSize: 13, fontWeight: 700, color: C.muted2, marginBottom: 6}}>RIESGO {Math.round(bar * 100)}%</div>
                      <div style={{height: 8, borderRadius: 99, background: '#E6E8F2', overflow: 'hidden'}}>
                        <div style={{width: `${bar * 100}%`, height: '100%', background: s.c, borderRadius: 99}} />
                      </div>
                    </div>
                    <Chip color={s.c} bg={s.bg} size={17} style={{minWidth: 86, justifyContent: 'center'}}>
                      <span
                        style={{
                          width: 9,
                          height: 9,
                          borderRadius: 99,
                          background: s.c,
                          boxShadow: isAlert ? `0 0 0 ${4 + Math.sin(frame * 0.5) * 3}px ${s.c}33` : 'none',
                        }}
                      />
                      {s.risk}
                    </Chip>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Alerta de abandono */}
      {frame >= K.alert ? (
        <div
          style={{
            position: 'absolute',
            left: 1010,
            top: 800,
            width: 700,
            transform: `translateY(${(1 - alert) * 60}px) scale(${0.85 + 0.15 * alert})`,
            transformOrigin: 'center bottom',
            opacity: clamp01(alert * 1.6),
          }}
        >
          <div
            style={{
              background: C.white,
              borderRadius: 26,
              boxShadow: SHADOW.float,
              border: `1px solid ${C.border}`,
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, background: C.red}} />
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                background: C.redTint,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `rotate(${bellShake}deg)`,
                flexShrink: 0,
              }}
            >
              <Icon name="bell" size={32} color={C.red} strokeWidth={2.3} />
            </div>
            <div style={{flex: 1}}>
              <div style={{fontSize: 16, fontWeight: 800, color: C.red, letterSpacing: '0.08em'}}>ALERTA DE ABANDONO</div>
              <div style={{fontSize: 22, fontWeight: 700, color: C.navy, marginTop: 3}}>Sara Castro lleva 12 días sin practicar</div>
              <div style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, color: C.violet, fontWeight: 700, fontSize: 18}}>
                <Icon name="sparkles" size={20} color={C.violet} strokeWidth={2.2} />
                Recomendación: llámala hoy
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: GRAD.button,
                color: '#fff',
                fontWeight: 800,
                fontSize: 19,
                padding: '14px 22px',
                borderRadius: 16,
                flexShrink: 0,
              }}
            >
              <Icon name="phone" size={20} color="#fff" strokeWidth={2.2} />
              Llamar
            </div>
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
