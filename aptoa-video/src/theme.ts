// Paleta, tipografía y sombras extraídas de aptoa.es
export const C = {
  navy: '#1A1F4E',
  navyDeep: '#0F1330',
  navyInk: '#0B0E26',
  ink2: '#3A3F5C',
  muted: '#5A5F7A',
  muted2: '#7A7F96',
  muted3: '#9AA0B6',
  border: '#ECEDF5',
  border2: '#E4E5EF',
  bg: '#F7F8FC',
  bg2: '#F2F3F9',
  white: '#FFFFFF',
  violet: '#7B3FF2',
  blue: '#3B5BFF',
  indigo: '#4A4FC2',
  peri: '#5B6CFF',
  cyan: '#1FD0FF',
  green: '#10B981',
  green2: '#0E9E70',
  amber: '#F59E0B',
  red: '#EF4444',
  violetTint: '#F1ECFE',
  greenTint: '#E7F6EF',
  amberTint: '#FFF3E0',
  blueTint: '#EEF0FB',
  redTint: '#FDECEC',
  whatsapp: '#25D366',
  excel: '#1D6F42',
} as const;

export const GRAD = {
  accent: 'linear-gradient(90deg, #3B5BFF 0%, #7B3FF2 100%)',
  accentLight: 'linear-gradient(90deg, #6FE3FF 0%, #8F9BFF 45%, #B794FF 100%)',
  brand: 'linear-gradient(135deg, #22D3FF 0%, #1E6BFF 48%, #6A2CF5 100%)',
  button: 'linear-gradient(90deg, #1A1F4E 0%, #7B3FF2 100%)',
  cta: 'linear-gradient(118deg, #161A45 0%, #252A7A 38%, #4A30B8 72%, #6D3AE0 100%)',
  green: 'linear-gradient(135deg, #16C08A 0%, #0E9E70 100%)',
  red: 'linear-gradient(135deg, #F25C5C 0%, #D93636 100%)',
  navyBlue: 'linear-gradient(135deg, #3B5BFF 0%, #1A1F4E 100%)',
} as const;

export const FONT = "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif";
export const HAND = "'Caveat', 'Plus Jakarta Sans', cursive";

export const SHADOW = {
  card: '0 1px 2px rgba(26,31,78,0.05), 0 10px 24px -8px rgba(26,31,78,0.12), 0 36px 80px -24px rgba(26,31,78,0.28)',
  soft: '0 1px 2px rgba(26,31,78,0.05), 0 8px 20px -6px rgba(26,31,78,0.12)',
  float: '0 2px 4px rgba(26,31,78,0.06), 0 20px 40px -12px rgba(26,31,78,0.25), 0 60px 120px -30px rgba(26,31,78,0.35)',
  paper: '0 1px 2px rgba(26,31,78,0.08), 0 14px 28px -10px rgba(26,31,78,0.22)',
} as const;

export const W = 1920;
export const H = 1080;
