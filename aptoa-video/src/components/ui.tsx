import React from 'react';
import {EXPO_OUT, tween} from '../lib/anim';
import {C, FONT, SHADOW} from '../theme';
import {Icon, IconName} from './Icons';

export const Card: React.FC<{
  style?: React.CSSProperties;
  children?: React.ReactNode;
  radius?: number;
}> = ({style, children, radius = 24}) => (
  <div
    style={{
      background: C.white,
      borderRadius: radius,
      border: `1px solid ${C.border}`,
      boxShadow: SHADOW.card,
      fontFamily: FONT,
      color: C.navy,
      ...style,
    }}
  >
    {children}
  </div>
);

/** Pastilla de sección (eyebrow) como en la web. */
export const Eyebrow: React.FC<{
  frame: number;
  at: number;
  children: React.ReactNode;
  color?: string;
  icon?: IconName;
  style?: React.CSSProperties;
}> = ({frame, at, children, color = C.violet, icon, style}) => {
  const p = tween(frame, at, 18, 0, 1, EXPO_OUT);
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: 22,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color,
        opacity: p,
        transform: `translateY(${(1 - p) * 18}px)`,
        ...style,
      }}
    >
      {icon ? <Icon name={icon} size={24} color={color} strokeWidth={2.2} /> : null}
      <span style={{letterSpacing: `${0.16 + (1 - p) * 0.25}em`}}>{children}</span>
    </div>
  );
};

/** Pastilla con insignia de letra ("R RouteBook", "D DriveIQ"). */
export const ProductBadge: React.FC<{
  frame: number;
  at: number;
  letter: string;
  label: string;
  color: string;
}> = ({frame, at, letter, label, color}) => {
  const p = tween(frame, at, 20, 0, 1, EXPO_OUT);
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 14,
        padding: '10px 26px 10px 10px',
        background: C.white,
        borderRadius: 999,
        border: `1px solid ${C.border}`,
        boxShadow: SHADOW.soft,
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: 28,
        color: C.navy,
        opacity: p,
        transform: `translateY(${(1 - p) * 20}px) scale(${0.9 + 0.1 * p})`,
        transformOrigin: 'left center',
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 999,
          background: color,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
          fontWeight: 800,
        }}
      >
        {letter}
      </div>
      {label}
    </div>
  );
};

export const Avatar: React.FC<{initials: string; color: string; size?: number; ring?: string}> = ({
  initials,
  color,
  size = 44,
  ring,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: 999,
      background: `${color}1F`,
      color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: FONT,
      fontWeight: 800,
      fontSize: size * 0.36,
      flexShrink: 0,
      boxShadow: ring ? `0 0 0 3px ${ring}` : undefined,
    }}
  >
    {initials}
  </div>
);

export const Chip: React.FC<{
  children: React.ReactNode;
  color: string;
  bg: string;
  size?: number;
  style?: React.CSSProperties;
}> = ({children, color, bg, size = 16, style}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: `${size * 0.35}px ${size * 0.8}px`,
      borderRadius: 999,
      background: bg,
      color,
      fontFamily: FONT,
      fontWeight: 700,
      fontSize: size,
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {children}
  </div>
);

/** Número animado con cifras tabulares. */
export const Counter: React.FC<{
  frame: number;
  start: number;
  end: number;
  from?: number;
  to: number;
  prefix?: string;
  suffix?: string;
  style?: React.CSSProperties;
}> = ({frame, start, end, from = 0, to, prefix = '', suffix = '', style}) => {
  const v = tween(frame, start, end - start, from, to, EXPO_OUT);
  return (
    <span style={{fontVariantNumeric: 'tabular-nums', ...style}}>
      {prefix}
      {Math.round(v)}
      {suffix}
    </span>
  );
};

export const Stars: React.FC<{frame: number; at: number[]; size?: number}> = ({frame, at, size = 34}) => (
  <div style={{display: 'flex', gap: 6}}>
    {at.map((s, i) => {
      const p = tween(frame, s, 14, 0, 1, EXPO_OUT);
      const pop = Math.sin(Math.min(1, p) * Math.PI) * 0.25;
      return (
        <div key={i} style={{transform: `scale(${p + pop}) rotate(${(1 - p) * -40}deg)`, opacity: Math.min(1, p * 2)}}>
          <Icon name="star" size={size} color={C.amber} fill={C.amber} strokeWidth={1.5} />
        </div>
      );
    })}
  </div>
);
