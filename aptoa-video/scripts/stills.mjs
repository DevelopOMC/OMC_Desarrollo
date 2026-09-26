// Renderiza fotogramas sueltos para revisión: node scripts/stills.mjs 30 120 450 ...
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition, ensureBrowser} from '@remotion/renderer';
import path from 'node:path';

const frames = process.argv.slice(2).map(Number);
const outDir = process.env.OUT_DIR || 'out/stills';
const browserExecutable = process.env.BROWSER_EXECUTABLE || null;
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public')});
const composition = await selectComposition({serveUrl, id: 'AptoaPromo', browserExecutable});
for (const frame of frames) {
  const output = path.join(outDir, `f${String(frame).padStart(3, '0')}.png`);
  await renderStill({composition, serveUrl, frame, output, browserExecutable, scale: Number(process.env.SCALE || 0.5)});
  console.log('rendered', output);
}
