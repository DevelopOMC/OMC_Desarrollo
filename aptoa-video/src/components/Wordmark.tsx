import React from 'react';

/*
 * Logotipo "APTOΛ" reconstruido en vectorial a partir de assets/aptoa-logo.png
 * (355x72) para que se vea nítido a cualquier tamaño y poder animarlo.
 * La geometría está calibrada píxel a píxel sobre el PNG original.
 */

const lam = (dx: number) =>
  `M ${11.3 + dx} 57.5 L ${30.7 + dx} 16.08 Q ${36.2 + dx} 4.3 ${42.0 + dx} 15.92 L ${62.75 + dx} 57.5`;

const GLYPHS = [
  {
    key: 'p',
    fill: 'M 84 5 H 118.5 A 19.5 19.5 0 0 1 118.5 44 H 93.5 V 57.25 A 6.25 6.25 0 0 1 81 57.25 V 8 A 3 3 0 0 1 84 5 Z M 93.5 15.5 V 33.5 H 118.5 A 9 9 0 0 0 118.5 15.5 Z',
    center: 'M 87.25 57.25 V 10.25 H 118.5 A 14.25 14.25 0 0 1 118.5 38.75 H 87.25',
    w: 11.5,
  },
  {
    key: 't',
    fill: 'M 149.2 5 H 201.3 A 3.2 3.2 0 0 1 204.5 8.2 V 12.3 A 3.2 3.2 0 0 1 201.3 15.5 H 180.5 V 57.5 A 5.75 5.75 0 0 1 169 57.5 V 15.5 H 149.2 A 3.2 3.2 0 0 1 146 12.3 V 8.2 A 3.2 3.2 0 0 1 149.2 5 Z',
    center: 'M 151.5 10.25 H 199 M 174.75 10.25 V 57.5',
    w: 11.5,
  },
  {
    key: 'o',
    fill: 'M 211 33.75 A 33 29.75 0 1 0 277 33.75 A 33 29.75 0 1 0 211 33.75 Z M 223.25 34 A 20.75 18.25 0 1 1 264.75 34 A 20.75 18.25 0 1 1 223.25 34 Z',
    center: 'M 217.1 33.9 A 26.9 23.9 0 1 0 270.9 33.9 A 26.9 23.9 0 1 0 217.1 33.9 Z',
    w: 12,
  },
];

export const Wordmark: React.FC<{
  id: string;
  width: number;
  variant?: 'light' | 'dark';
  /** 0..1 trazado de las dos "Λ" */
  draw?: number;
  /** 0..1 aparición de P, T, O */
  letters?: [number, number, number];
  style?: React.CSSProperties;
}> = ({id, width, variant = 'light', draw = 1, letters = [1, 1, 1], style}) => {
  const dark = variant === 'dark';
  const height = (width * 72) / 355;
  const base0 = dark ? '#FFFFFF' : '#23286A';
  const base1 = dark ? '#EEF0FB' : '#10133D';
  const base2 = dark ? '#D5D8EE' : '#060720';

  const lambda = (dx: number, k: string) => {
    const hidden = draw <= 0.001;
    return (
      <g key={k} opacity={hidden ? 0 : 1}>
        <mask id={`${id}m${k}`} maskUnits="userSpaceOnUse" x="-10" y="-10" width="375" height="92">
          <path
            d={lam(dx)}
            fill="none"
            stroke="#fff"
            strokeWidth={12.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - draw}
          />
        </mask>
        <g mask={`url(#${id}m${k})`}>
          <path d={lam(dx)} fill="none" stroke={`url(#${id}lg)`} strokeWidth={12.4} strokeLinecap="round" strokeLinejoin="round" />
          <path
            d={lam(dx)}
            transform="translate(1.6 1.4)"
            fill="none"
            stroke="#2A0E9C"
            strokeOpacity={0.35}
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#${id}b16)`}
          />
          <path
            d={lam(dx)}
            transform="translate(-2.2 -1.2)"
            fill="none"
            stroke="#fff"
            strokeOpacity={0.55}
            strokeWidth={3.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#${id}b12)`}
          />
        </g>
      </g>
    );
  };

  return (
    <svg
      viewBox="0 0 355 72"
      width={width}
      height={height}
      style={{overflow: 'visible', display: 'block', ...style}}
    >
      <defs>
        <linearGradient id={`${id}lg`} gradientUnits="userSpaceOnUse" x1="0" y1="4" x2="0" y2="63">
          <stop offset="0" stopColor="#4DECFF" />
          <stop offset="0.28" stopColor="#0FC6FF" />
          <stop offset="0.55" stopColor="#1579FF" />
          <stop offset="0.8" stopColor="#3A36FB" />
          <stop offset="1" stopColor="#5E1CEB" />
        </linearGradient>
        <linearGradient id={`${id}dk`} gradientUnits="userSpaceOnUse" x1="0" y1="4" x2="0" y2="64">
          <stop offset="0" stopColor={base0} />
          <stop offset="0.5" stopColor={base1} />
          <stop offset="1" stopColor={base2} />
        </linearGradient>
        <linearGradient id={`${id}rim`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="72">
          <stop offset="0" stopColor={dark ? '#FFFFFF' : '#9A9DD6'} stopOpacity={dark ? 1 : 0.75} />
          <stop offset="0.6" stopColor={dark ? '#FFFFFF' : '#6D70A8'} stopOpacity={dark ? 0.8 : 0.45} />
          <stop offset="1" stopColor={dark ? '#FFFFFF' : '#4B4E86'} stopOpacity={dark ? 0.6 : 0.35} />
        </linearGradient>
        <filter id={`${id}b09`} x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur stdDeviation="0.9" />
        </filter>
        <filter id={`${id}b12`} x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
        <filter id={`${id}b16`} x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
        <filter id={`${id}b20`} x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
        <filter id={`${id}sh`} x="-10%" y="-25%" width="120%" height="170%">
          <feDropShadow
            dx="0"
            dy={dark ? 2.4 : 1.8}
            stdDeviation={dark ? 2.6 : 1.3}
            floodColor={dark ? '#05061A' : '#1A1F4E'}
            floodOpacity={dark ? 0.45 : 0.22}
          />
        </filter>
        {GLYPHS.map((g) => (
          <clipPath key={g.key} id={`${id}c${g.key}`}>
            <path d={g.fill} fillRule="evenodd" />
          </clipPath>
        ))}
      </defs>
      <g filter={`url(#${id}sh)`}>
        {lambda(0, 'l1')}
        {lambda(281, 'l2')}
        {GLYPHS.map((g, i) => {
          const p = letters[i];
          if (p <= 0.001) return null;
          return (
            <g key={g.key} opacity={Math.min(1, p * 1.6)} transform={`translate(0 ${(1 - p) * 26})`}>
              <g clipPath={`url(#${id}c${g.key})`}>
                <path d={g.fill} fillRule="evenodd" fill={`url(#${id}dk)`} />
                <path d={g.fill} fill="none" stroke={`url(#${id}rim)`} strokeWidth={dark ? 3.2 : 3.6} filter={`url(#${id}b09)`} />
                <path
                  d={g.center}
                  fill="none"
                  stroke={dark ? '#B9BDE3' : '#02030E'}
                  strokeOpacity={dark ? 0.35 : 0.55}
                  strokeWidth={g.w * 0.55}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter={`url(#${id}b20)`}
                />
                <path
                  d={g.center}
                  transform="translate(-0.6 -2.2)"
                  fill="none"
                  stroke="#fff"
                  strokeOpacity={dark ? 0.8 : 0.16}
                  strokeWidth={2.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter={`url(#${id}b12)`}
                />
              </g>
            </g>
          );
        })}
      </g>
    </svg>
  );
};
