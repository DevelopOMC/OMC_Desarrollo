import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// Plus Jakarta Sans es la tipografía de aptoa.es (variable 200-800)
loadFont({
  family: 'Plus Jakarta Sans',
  url: staticFile('fonts/plus-jakarta-sans-latin-wght-normal.woff2'),
  weight: '200 800',
  format: 'woff2',
});

// Caveat para las notas manuscritas del "caos" inicial
loadFont({
  family: 'Caveat',
  url: staticFile('fonts/caveat-latin-700-normal.woff2'),
  weight: '700',
  format: 'woff2',
});
