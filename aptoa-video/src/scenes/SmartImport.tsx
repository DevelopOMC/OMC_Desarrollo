import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import cues from '../cues.json';
import {LightBackground} from '../components/Backgrounds';
import {Icon, IconName} from '../components/Icons';
import {RevealText} from '../components/RevealText';
import {Avatar, Card, Chip, Eyebrow} from '../components/ui';
import {EXPO_IN, EXPO_OUT, bezier, clamp01, springAt, tween} from '../lib/anim';
import {C, FONT, GRAD, SHADOW} from '../theme';

const K = cues.import;
const CORE: [number, number] = [1380, 318];
const CHIP_Y = 168;

const SOURCES: {label: string; icon: IconName; color: string; bg: string; cx: number}[] = [
  {label: 'alumnos.xlsx', icon: 'sheet', color: '#fff', bg: C.excel, cx: 1108},
  {label: 'fichas_papel.pdf', icon: 'file', color: '#fff', bg: '#6B7394', cx: 1380},
  {label: 'chat_whatsapp.txt', icon: 'message', color: '#fff', bg: C.whatsapp, cx: 1652},
];

const ROWS = [
  {ini: 'MP', name: 'Marta Pons', detail: 'Bono 10 prácticas · Permiso B', chip: 'Pagado', c: C.green, bg: C.greenTint, av: C.violet},
  {ini: 'DR', name: 'Diego Ruiz', detail: 'Teórico aprobado · Permiso B', chip: 'Al día', c: C.blue, bg: C.blueTint, av: C.blue},
  {ini: 'SC', name: 'Sara Castro', detail: 'Bono 5 prácticas · Permiso A2', chip: 'Pendiente', c: '#D97706', bg: C.amberTint, av: C.red},
  {ini: 'AG', name: 'Álvaro Gil', detail: 'Matrícula · Permiso B', chip: 'Pagado', c: C.green, bg: C.greenTint, av: C.green},
  {ini: 'LM', name: 'Lucía Marín', detail: 'Examen práctico 04/04', chip: 'Al día', c: C.blue, bg: C.blueTint, av: '#D97706'},
];

export const SmartImportScene: React.FC<{frame: number}> = ({frame}) => {
  const {fps} = useVideoConfig();
  const progress = tween(frame, K.countStart, K.countEnd - K.countStart, 0, 1, EXPO_OUT);
  const count = Math.round(progress * 200);
  const done = frame >= K.done;
  const doneP = tween(frame, K.done, 16, 0, 1, EXPO_OUT);
  const coreIn = springAt(frame, fps, K.chips[0] - 2, {damping: 12, stiffness: 150});
  const absorbFlash = K.absorb.reduce((acc, a) => acc + (frame >= a + 8 ? Math.exp(-(frame - a - 8) / 4) : 0), 0);
  const processing = frame >= K.absorb[0] && frame < K.done;

  return (
    <AbsoluteFill style={{overflow: 'hidden', fontFamily: FONT}}>
      <LightBackground frame={frame} tint="lavender" />

      {/* Texto */}
      <div style={{position: 'absolute', left: 150, top: 300, width: 760}}>
        <Eyebrow frame={frame} at={K.title} icon="sparkles">
          Smart Import · IA
        </Eyebrow>
        <RevealText
          frame={frame}
          start={K.title + 2}
          stagger={2.5}
          dur={20}
          segments={[
            {t: 'Todos tus datos,'},
            {t: 'en', br: true},
            {t: 'segundos.', gradient: GRAD.accent},
            {t: 'No en', br: true, color: C.muted3},
            {t: 'semanas.', color: C.muted3, strikeAt: K.strike, strikeColor: C.red},
          ]}
          style={{marginTop: 28, fontSize: 92, fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1.04, color: C.navy}}
        />
        <div
          style={{
            marginTop: 34,
            fontSize: 29,
            lineHeight: 1.45,
            color: C.muted,
            fontWeight: 500,
            maxWidth: 640,
            opacity: tween(frame, K.title + 12, 20),
            transform: `translateY(${(1 - tween(frame, K.title + 12, 20)) * 16}px)`,
          }}
        >
          Excel, fichas en papel o WhatsApp: la IA de Aptoa lo importa todo por ti.
        </div>
      </div>

      {/* Conectores fuente → núcleo IA */}
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        {SOURCES.map((src, i) => {
          const p = tween(frame, K.chips[i] + 2, 12, 0, 1, EXPO_OUT);
          const fade = 1 - tween(frame, K.done, 12);
          return (
            <path
              key={src.label}
              d={`M ${src.cx} ${CHIP_Y + 34} C ${src.cx} ${CHIP_Y + 86} ${CORE[0]} ${CHIP_Y + 66} ${CORE[0]} ${CORE[1] - 60}`}
              stroke={C.violet}
              strokeOpacity={0.35 * fade}
              strokeWidth={2.5}
              strokeDasharray="4 10"
              strokeLinecap="round"
              fill="none"
              pathLength={1}
              style={{strokeDashoffset: 0}}
              opacity={p}
            />
          );
        })}
      </svg>

      {/* Chips de origen que vuelan hacia la IA */}
      {SOURCES.map((src, i) => {
        const inP = springAt(frame, fps, K.chips[i], {damping: 12, stiffness: 180});
        if (frame < K.chips[i]) return null;
        const a = tween(frame, K.absorb[i], 10, 0, 1, EXPO_IN);
        if (a >= 1) return null;
        const [x, y] = bezier(a, [src.cx, CHIP_Y], [src.cx, CHIP_Y + 100], [CORE[0], CORE[1] - 110], CORE);
        return (
          <div
            key={src.label}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              transform: `translate(-50%, -50%) translateY(${(1 - inP) * -50}px) scale(${(0.7 + 0.3 * inP) * (1 - 0.8 * a)})`,
              opacity: clamp01(inP * 1.5) * (1 - a * 0.6),
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: C.white,
                border: `1px solid ${C.border}`,
                borderRadius: 18,
                padding: '10px 18px 10px 10px',
                boxShadow: SHADOW.card,
                whiteSpace: 'nowrap',
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: src.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name={src.icon} size={24} color={src.color} strokeWidth={2.2} />
              </div>
              <span style={{fontSize: 21, fontWeight: 700, color: C.navy}}>{src.label}</span>
            </div>
          </div>
        );
      })}

      {/* Núcleo IA */}
      <div
        style={{
          position: 'absolute',
          left: CORE[0] - 72,
          top: CORE[1] - 72,
          width: 144,
          height: 144,
          transform: `scale(${(0.4 + 0.6 * coreIn) * (1 + absorbFlash * 0.08)})`,
          opacity: clamp01(coreIn * 1.4),
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: -46,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(123,63,242,${0.3 + absorbFlash * 0.25}) 0%, rgba(59,91,255,0.12) 45%, rgba(59,91,255,0) 70%)`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 42,
            background: `conic-gradient(from ${frame * 7}deg, #22D3FF, #3B5BFF, #7B3FF2, #F0ABFC, #22D3FF)`,
            boxShadow: '0 24px 50px -14px rgba(91,52,200,0.55)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 5,
            borderRadius: 38,
            background: C.white,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          <div style={{transform: `rotate(${processing ? Math.sin(frame * 0.5) * 8 : 0}deg)`}}>
            <Icon name="sparkles" size={52} color={C.violet} strokeWidth={2} fill="rgba(123,63,242,0.12)" />
          </div>
          <div style={{fontSize: 17, fontWeight: 800, color: C.navy, letterSpacing: '0.04em'}}>Aptoa IA</div>
        </div>
      </div>

      {/* Tarjeta de resultado */}
      <div
        style={{
          position: 'absolute',
          left: 980,
          top: 440,
          width: 800,
          opacity: tween(frame, K.countStart - 6, 12),
          transform: `translateY(${(1 - tween(frame, K.countStart - 6, 18)) * 40}px)`,
        }}
      >
        <Card
          radius={28}
          style={{
            padding: '26px 30px 22px',
            boxShadow: done
              ? `${SHADOW.card}, 0 0 0 ${3 * (1 - doneP) + 1}px rgba(16,185,129,${0.6 * (1 - doneP) + 0.25})`
              : SHADOW.card,
          }}
        >
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <div>
              <div style={{fontSize: 17, fontWeight: 700, color: C.muted2, letterSpacing: '0.1em'}}>ALUMNOS IMPORTADOS</div>
              <div style={{display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 4}}>
                <span style={{fontSize: 54, fontWeight: 800, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums'}}>{count}</span>
                <span style={{fontSize: 22, fontWeight: 600, color: C.muted}}>de 200</span>
              </div>
            </div>
            <div style={{transform: `scale(${done ? 0.8 + 0.2 * doneP : 1})`}}>
              {done ? (
                <Chip color={C.green2} bg={C.greenTint} size={20}>
                  <Icon name="checkCircle" size={22} color={C.green} strokeWidth={2.4} />
                  Completado
                </Chip>
              ) : (
                <Chip color={C.violet} bg={C.violetTint} size={20}>
                  <Icon name="sparkles" size={20} color={C.violet} strokeWidth={2.2} />
                  Importando…
                </Chip>
              )}
            </div>
          </div>
          <div style={{height: 10, borderRadius: 99, background: C.blueTint, marginTop: 16, overflow: 'hidden'}}>
            <div
              style={{
                width: `${progress * 100}%`,
                height: '100%',
                borderRadius: 99,
                background: done ? GRAD.green : GRAD.accent,
              }}
            />
          </div>
          <div style={{marginTop: 16, display: 'flex', flexDirection: 'column', gap: 7}}>
            {ROWS.map((r, i) => {
              const at = K.countStart + i * 6;
              const p = tween(frame, at, 16, 0, 1, EXPO_OUT);
              return (
                <div
                  key={r.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '8px 14px',
                    borderRadius: 16,
                    background: C.bg,
                    border: `1px solid ${C.border}`,
                    opacity: p,
                    transform: `translateX(${(1 - p) * 40}px)`,
                  }}
                >
                  <Avatar initials={r.ini} color={r.av} size={42} />
                  <div style={{flex: 1}}>
                    <div style={{fontSize: 20, fontWeight: 800}}>{r.name}</div>
                    <div style={{fontSize: 15, fontWeight: 500, color: C.muted2}}>{r.detail}</div>
                  </div>
                  <Chip color={r.c} bg={r.bg} size={15}>
                    {r.chip}
                  </Chip>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </AbsoluteFill>
  );
};
