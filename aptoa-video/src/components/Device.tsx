import React from 'react';
import {EXPO_OUT, tween} from '../lib/anim';
import {C, FONT} from '../theme';

/** Puntero de ratón estilo macOS con onda de clic. */
export const Cursor: React.FC<{
  x: number;
  y: number;
  frame: number;
  clickAt?: number;
  opacity?: number;
  scale?: number;
}> = ({x, y, frame, clickAt, opacity = 1, scale = 1}) => {
  let press = 1;
  let ripple = 0;
  if (clickAt !== undefined) {
    const d = frame - clickAt;
    if (d >= -3 && d < 0) press = 1 - ((d + 3) / 3) * 0.18;
    else if (d >= 0 && d < 6) press = 0.82 + (d / 6) * 0.18;
    ripple = d >= 0 ? tween(frame, clickAt, 18, 0, 1, EXPO_OUT) : 0;
  }
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity, pointerEvents: 'none', zIndex: 50}}>
      {ripple > 0 && ripple < 1 ? (
        <div
          style={{
            position: 'absolute',
            left: -40 * ripple,
            top: -40 * ripple,
            width: 80 * ripple,
            height: 80 * ripple,
            borderRadius: 999,
            border: `3px solid rgba(123,63,242,${0.9 * (1 - ripple)})`,
            background: `rgba(123,63,242,${0.18 * (1 - ripple)})`,
          }}
        />
      ) : null}
      <svg
        width={44 * scale}
        height={44 * scale}
        viewBox="0 0 24 24"
        style={{
          position: 'absolute',
          left: -4 * scale,
          top: -2 * scale,
          transform: `scale(${press})`,
          transformOrigin: '20% 10%',
          filter: 'drop-shadow(0 4px 6px rgba(15,19,48,0.35))',
        }}
      >
        <path
          d="M4.5 2.5 L4.5 19.2 L8.9 15.2 L12 21.8 L14.9 20.5 L11.8 14 L17.8 14 Z"
          fill="#111"
          stroke="#fff"
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

/** Marco de iPhone con Dynamic Island y barra de estado. */
export const Phone: React.FC<{
  width: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({width, children, style}) => {
  const h = width * 2.06;
  const bezel = width * 0.034;
  const r = width * 0.17;
  return (
    <div
      style={{
        position: 'relative',
        width,
        height: h,
        borderRadius: r,
        background: 'linear-gradient(145deg, #2B2D3A 0%, #0C0D14 40%, #1D1F2A 100%)',
        padding: bezel,
        boxShadow:
          '0 0 0 1.5px rgba(255,255,255,0.08) inset, 0 2px 4px rgba(15,19,48,0.2), 0 30px 60px -12px rgba(15,19,48,0.45), 0 80px 140px -40px rgba(26,31,78,0.5)',
        ...style,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          borderRadius: r - bezel,
          background: C.white,
          overflow: 'hidden',
          fontFamily: FONT,
          color: C.navy,
        }}
      >
        {/* barra de estado */}
        <div
          style={{
            height: width * 0.15,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `0 ${width * 0.09}px`,
            fontWeight: 700,
            fontSize: width * 0.045,
          }}
        >
          <span>9:41</span>
          <svg width={width * 0.2} height={width * 0.04} viewBox="0 0 60 12">
            <rect x="0" y="7.5" width="3.2" height="4.5" rx="0.7" fill={C.navy} />
            <rect x="4.8" y="5" width="3.2" height="7" rx="0.7" fill={C.navy} />
            <rect x="9.6" y="2.5" width="3.2" height="9.5" rx="0.7" fill={C.navy} />
            <rect x="14.4" y="0" width="3.2" height="12" rx="0.7" fill={C.navy} />
            <path d="M28.5 3.2C30.8 3.2 32.9 4.1 34.4 5.6L35.5 4.5C33.7 2.7 31.2 1.5 28.5 1.5C25.8 1.5 23.3 2.7 21.5 4.5L22.6 5.6C24.1 4.1 26.2 3.2 28.5 3.2Z" fill={C.navy} />
            <path d="M28.5 6.8C29.9 6.8 31.1 7.3 32 8.2L33.1 7.1C31.8 5.9 30.2 5.1 28.5 5.1C26.8 5.1 25.2 5.9 23.9 7.1L25 8.2C25.9 7.3 27.1 6.8 28.5 6.8Z" fill={C.navy} />
            <circle cx="28.5" cy="10.5" r="1.5" fill={C.navy} />
            <rect x="40.5" y="0.5" width="17" height="11" rx="3" stroke={C.navy} strokeOpacity="0.4" fill="none" />
            <rect x="42" y="2" width="14" height="8" rx="1.8" fill={C.navy} />
          </svg>
        </div>
        <div
          style={{
            position: 'absolute',
            top: width * 0.035,
            left: '50%',
            width: width * 0.3,
            height: width * 0.088,
            marginLeft: -width * 0.15,
            borderRadius: 999,
            background: '#07070B',
          }}
        />
        <div style={{position: 'absolute', left: 0, right: 0, top: width * 0.15, bottom: 0}}>{children}</div>
        <div
          style={{
            position: 'absolute',
            bottom: width * 0.025,
            left: '50%',
            width: width * 0.34,
            height: 5,
            marginLeft: -width * 0.17,
            borderRadius: 999,
            background: 'rgba(26,31,78,0.35)',
          }}
        />
      </div>
    </div>
  );
};
