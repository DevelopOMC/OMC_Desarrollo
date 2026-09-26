import React from 'react';
import {AbsoluteFill, random, useVideoConfig} from 'remotion';
import cues from '../cues.json';
import {LightBackground} from '../components/Backgrounds';
import {Cursor} from '../components/Device';
import {Icon} from '../components/Icons';
import {RevealText} from '../components/RevealText';
import {Avatar, Card, ProductBadge} from '../components/ui';
import {EXPO_IN, EXPO_IN_OUT, EXPO_OUT, bezier, clamp01, springAt, tween} from '../lib/anim';
import {C, FONT, GRAD, SHADOW} from '../theme';

const K = cues.routebook;

type Slot = null | 'libre' | {n: string; plate: string; c: 'blue' | 'green'};
const DAYS = ['L', 'M', 'X', 'J', 'V'];
const HOURS = ['09:00', '11:00', '13:00', '16:00'];
const GRID: Slot[][] = [
  [{n: 'D. Ruiz', plate: '1234 BCD', c: 'blue'}, null, {n: 'L. Marín', plate: '5678 FGH', c: 'green'}, 'libre', {n: 'S. Castro', plate: '1234 BCD', c: 'blue'}],
  ['libre', {n: 'A. Gil', plate: '5678 FGH', c: 'green'}, null, 'libre', 'libre'],
  [{n: 'J. Vega', plate: '5678 FGH', c: 'green'}, 'libre', {n: 'R. Soto', plate: '1234 BCD', c: 'blue'}, null, {n: 'P. Roca', plate: '5678 FGH', c: 'green'}],
  [null, {n: 'C. Méndez', plate: '1234 BCD', c: 'blue'}, 'libre', {n: 'E. Soler', plate: '5678 FGH', c: 'green'}, null],
];
const TARGET = {row: 1, col: 3};

const CARD = {x: 120, y: 196, w: 950};
const GX = CARD.x + 36 + 96; // inicio de columnas
const GY = CARD.y + 172; // inicio de filas
const CW = 150;
const CH = 104;
const GAP = 12;

const cellPos = (row: number, col: number) => ({x: GX + col * (CW + GAP), y: GY + row * (CH + GAP)});

const slotColors = {
  blue: {bg: 'linear-gradient(145deg, #5B7BFF 0%, #3B5BFF 100%)', sh: 'rgba(59,91,255,0.45)'},
  green: {bg: 'linear-gradient(145deg, #26CF98 0%, #10B981 100%)', sh: 'rgba(16,185,129,0.45)'},
};

export const RouteBookScene: React.FC<{frame: number}> = ({frame}) => {
  const {fps} = useVideoConfig();
  const cardIn = tween(frame, K.title - 6, 34, 0, 1, EXPO_OUT);

  // Solicitud + cursor
  const req = springAt(frame, fps, K.request, {damping: 13, stiffness: 190});
  const reqOut = tween(frame, K.confirm, 8, 0, 1, EXPO_IN);
  const tcell = cellPos(TARGET.row, TARGET.col);
  const popW = 420;
  const popH = 214;
  const popX = tcell.x + CW / 2 - popW / 2;
  const popY = tcell.y - popH - 22;
  const btn: [number, number] = [popX + popW - 112, popY + popH - 48];
  const cm = tween(frame, K.cursorStart, K.click - 3 - K.cursorStart, 0, 1, EXPO_IN_OUT);
  const [curX, curY] = bezier(cm, [1330, 1010], [1250, 760], [btn[0] + 160, btn[1] + 40], btn);
  const cursorOut = tween(frame, K.click + 8, 14, 0, 1, EXPO_IN_OUT);
  const cursorAway = tween(frame, K.click + 5, 20, 0, 1, EXPO_IN_OUT);
  const filled = springAt(frame, fps, K.confirm, {damping: 9, stiffness: 200, mass: 0.7});
  const toast = springAt(frame, fps, K.toast, {damping: 14, stiffness: 170});

  return (
    <AbsoluteFill style={{overflow: 'hidden', fontFamily: FONT}}>
      <LightBackground frame={frame} tint="lavender" />

      {/* Calendario */}
      <div style={{position: 'absolute', left: CARD.x, top: CARD.y, perspective: 2200}}>
        <div
          style={{
            transform: `translateX(${(1 - cardIn) * -200}px) rotateY(${16 - 13 * cardIn}deg) rotateX(${7 - 5.5 * cardIn}deg)`,
            transformOrigin: 'right center',
            opacity: clamp01(cardIn * 1.6),
            position: 'relative',
          }}
        >
          <Card radius={32} style={{width: CARD.w, height: 690}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '30px 36px 0'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 16,
                    background: C.blueTint,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="calendar" size={28} color={C.blue} strokeWidth={2.1} />
                </div>
                <div>
                  <div style={{fontSize: 29, fontWeight: 800, letterSpacing: '-0.02em'}}>Lun 24 – Vie 28 marzo</div>
                  <div style={{fontSize: 17, color: C.muted2, fontWeight: 500}}>4 vehículos · 6 profesores</div>
                </div>
              </div>
              <div style={{display: 'flex', background: C.bg2, borderRadius: 14, padding: 5, fontSize: 18, fontWeight: 700}}>
                <div style={{background: '#fff', borderRadius: 10, padding: '8px 18px', boxShadow: SHADOW.soft}}>Semana</div>
                <div style={{padding: '8px 18px', color: C.muted3}}>Mes</div>
              </div>
            </div>
          </Card>

      {/* Cabeceras + celdas (coordenadas relativas a la tarjeta) */}
      <div style={{position: 'absolute', left: -CARD.x, top: -CARD.y, width: 1920, height: 1080}}>
        {DAYS.map((d, i) => (
          <div
            key={d}
            style={{
              position: 'absolute',
              left: GX + i * (CW + GAP),
              top: GY - 44,
              width: CW,
              textAlign: 'center',
              fontSize: 19,
              fontWeight: 700,
              color: C.muted2,
            }}
          >
            {d}
          </div>
        ))}
        {HOURS.map((h, r) => (
          <div
            key={h}
            style={{position: 'absolute', left: CARD.x + 34, top: GY + r * (CH + GAP) + CH / 2 - 12, fontSize: 18, fontWeight: 600, color: C.muted3}}
          >
            {h}
          </div>
        ))}
        {GRID.map((row, r) =>
          row.map((slot, c) => {
            const pos = cellPos(r, c);
            const at = K.slotsStart + (r + c) * 2.4 + random(`s${r}${c}`) * 2;
            const p = tween(frame, at, 16, 0, 1, EXPO_OUT);
            const isTarget = r === TARGET.row && c === TARGET.col;
            const base: React.CSSProperties = {
              position: 'absolute',
              left: pos.x,
              top: pos.y,
              width: CW,
              height: CH,
              borderRadius: 18,
              opacity: p,
              transform: `scale(${0.7 + 0.3 * p})`,
            };
            if (isTarget && frame >= K.confirm) {
              return (
                <div
                  key={`${r}${c}`}
                  style={{
                    ...base,
                    transform: `scale(${0.6 + 0.4 * filled})`,
                    background: slotColors.green.bg,
                    boxShadow: `0 14px 26px -10px ${slotColors.green.sh}, 0 0 0 ${8 * (1 - clamp01(filled))}px rgba(16,185,129,0.25)`,
                    padding: '14px 16px',
                    color: '#fff',
                  }}
                >
                  <div style={{fontSize: 21, fontWeight: 800}}>M. Pons</div>
                  <div style={{fontSize: 15, fontWeight: 600, opacity: 0.85}}>1234 BCD</div>
                  <div style={{position: 'absolute', right: 12, bottom: 12}}>
                    <Icon name="checkCircle" size={24} color="#fff" strokeWidth={2.3} />
                  </div>
                </div>
              );
            }
            if (slot === null) {
              return <div key={`${r}${c}`} style={{...base, background: C.bg, border: `1px solid ${C.border}`}} />;
            }
            if (slot === 'libre') {
              const pulse = isTarget && frame >= K.request - 6 ? 0.5 + 0.5 * Math.sin(frame * 0.4) : 0;
              return (
                <div
                  key={`${r}${c}`}
                  style={{
                    ...base,
                    border: `2px dashed ${isTarget && pulse > 0 ? C.violet : '#CBCFE0'}`,
                    background: isTarget && pulse > 0 ? `rgba(123,63,242,${0.05 + 0.06 * pulse})` : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    fontWeight: 700,
                    color: isTarget && pulse > 0 ? C.violet : C.muted3,
                  }}
                >
                  Libre
                </div>
              );
            }
            const col = slotColors[slot.c];
            return (
              <div
                key={`${r}${c}`}
                style={{
                  ...base,
                  background: col.bg,
                  boxShadow: `0 12px 24px -12px ${col.sh}`,
                  padding: '14px 16px',
                  color: '#fff',
                }}
              >
                <div style={{fontSize: 21, fontWeight: 800}}>{slot.n}</div>
                <div style={{fontSize: 15, fontWeight: 600, opacity: 0.85}}>{slot.plate}</div>
              </div>
            );
          }),
        )}
      </div>
        </div>
      </div>

      {/* Solicitud entrante */}
      {frame >= K.request && reqOut < 1 ? (
        <div
          style={{
            position: 'absolute',
            left: popX,
            top: popY,
            width: popW,
            transform: `translateY(${(1 - req) * 30}px) scale(${(0.85 + 0.15 * req) * (1 - 0.1 * reqOut)})`,
            transformOrigin: '50% 100%',
            opacity: clamp01(req * 1.5) * (1 - reqOut),
          }}
        >
          <div
            style={{
              background: C.white,
              borderRadius: 24,
              boxShadow: SHADOW.float,
              border: `1px solid ${C.border}`,
              padding: 22,
              height: popH,
              position: 'relative',
            }}
          >
            <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
              <Avatar initials="MP" color={C.violet} size={52} />
              <div>
                <div style={{fontSize: 14, fontWeight: 800, color: C.violet, letterSpacing: '0.1em'}}>NUEVA SOLICITUD</div>
                <div style={{fontSize: 23, fontWeight: 800, color: C.navy}}>Marta Pons</div>
              </div>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 18, fontWeight: 600, color: C.muted}}>
              <Icon name="clock" size={19} color={C.muted2} />
              Jueves 27 · 11:00 – 12:00
              <span style={{color: C.muted3}}>·</span>
              <Icon name="car" size={20} color={C.muted2} />
              1234 BCD
            </div>
            <div style={{display: 'flex', gap: 12, marginTop: 16}}>
              <div
                style={{
                  flex: 1,
                  height: 52,
                  borderRadius: 14,
                  border: `1.5px solid ${C.border2}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 19,
                  fontWeight: 700,
                  color: C.muted,
                }}
              >
                Rechazar
              </div>
              <div
                style={{
                  flex: 1.25,
                  height: 52,
                  borderRadius: 14,
                  background: GRAD.button,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  fontSize: 19,
                  fontWeight: 800,
                  color: '#fff',
                  transform: `scale(${frame >= K.click - 2 && frame < K.click + 4 ? 0.94 : 1})`,
                  boxShadow: '0 12px 24px -10px rgba(123,63,242,0.6)',
                }}
              >
                <Icon name="check" size={21} color="#fff" strokeWidth={2.8} />
                Confirmar
              </div>
            </div>
            <div
              style={{
                position: 'absolute',
                left: popW / 2 - 12,
                bottom: -11,
                width: 24,
                height: 24,
                background: C.white,
                transform: 'rotate(45deg)',
                borderRight: `1px solid ${C.border}`,
                borderBottom: `1px solid ${C.border}`,
              }}
            />
          </div>
        </div>
      ) : null}

      {/* Destellos al confirmar */}
      {frame >= K.confirm && frame < K.confirm + 20
        ? new Array(10).fill(0).map((_, i) => {
            const p = tween(frame, K.confirm, 18, 0, 1, EXPO_OUT);
            const a = (i / 10) * Math.PI * 2;
            const d = 70 + 60 * p;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: tcell.x + CW / 2 + Math.cos(a) * d - 4,
                  top: tcell.y + CH / 2 + Math.sin(a) * d * 0.8 - 4,
                  width: 8,
                  height: 8,
                  borderRadius: 99,
                  background: i % 2 ? C.green : C.violet,
                  opacity: 1 - p,
                }}
              />
            );
          })
        : null}

      {/* Toast de confirmación */}
      {frame >= K.toast ? (
        <div
          style={{
            position: 'absolute',
            left: CARD.x + CARD.w / 2 - 250,
            top: 912,
            transform: `translateY(${(1 - toast) * 50}px)`,
            opacity: clamp01(toast * 1.5),
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              background: C.navy,
              color: '#fff',
              borderRadius: 22,
              padding: '16px 28px 16px 16px',
              boxShadow: SHADOW.float,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 99,
                background: C.green,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="check" size={26} color="#fff" strokeWidth={3} />
            </div>
            <div>
              <div style={{fontSize: 22, fontWeight: 800}}>Clase confirmada</div>
              <div style={{fontSize: 17, fontWeight: 500, opacity: 0.72}}>Marta ha recibido una notificación en su app</div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Texto */}
      <div style={{position: 'absolute', left: 1170, top: 300, width: 660}}>
        <ProductBadge frame={frame} at={K.title} letter="R" label="RouteBook" color={C.blue} />
        <RevealText
          frame={frame}
          start={K.title + 3}
          stagger={2.5}
          dur={20}
          segments={[{t: 'Tu flota y tus'}, {t: 'clases,', br: true}, {t: 'solas.', gradient: GRAD.accent}]}
          style={{marginTop: 34, fontSize: 92, fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1.04, color: C.navy}}
        />
        <div
          style={{
            marginTop: 30,
            fontSize: 30,
            lineHeight: 1.45,
            color: C.muted,
            fontWeight: 500,
            opacity: tween(frame, K.title + 14, 20),
            transform: `translateY(${(1 - tween(frame, K.title + 14, 20)) * 16}px)`,
          }}
        >
          Tus alumnos reservan desde el móvil. Tú solo confirmas con un clic.
        </div>
      </div>

      {frame >= K.cursorStart && cursorOut < 1 ? (
        <Cursor
          x={curX + cursorAway * 70}
          y={curY + cursorAway * 120}
          frame={frame}
          clickAt={K.click}
          opacity={clamp01((frame - K.cursorStart) / 4) * (1 - cursorOut)}
        />
      ) : null}
    </AbsoluteFill>
  );
};
