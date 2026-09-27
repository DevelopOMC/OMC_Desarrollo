/**
 * Genera la pista PROVISIONAL public/audio/musica-corporativa.mp3
 * (30 s, 120 BPM, up-tempo corporativo) sintetizada por código, sin samples
 * de terceros. Sirve para montar el timing: sustitúyela por la pista con
 * licencia definitiva manteniendo el mismo nombre de archivo.
 *
 * A 120 BPM y 30 fps, 1 compás = 60 frames: los cortes de escena
 * (frames 120, 300, 480, 660 y 810) caen en compás o medio compás.
 *
 * Uso: npm run generate:music
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SAMPLE_RATE = 44100;
const DURATION = 30;
const BPM = 120;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const LENGTH = Math.round(SAMPLE_RATE * DURATION);

const left = new Float32Array(LENGTH);
const right = new Float32Array(LENGTH);

// Ruido determinista (mulberry32) para que el archivo sea reproducible.
let seed = 20260927;
const noise = () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 2147483648 - 1;
};

const midiToHz = (note) => 440 * 2 ** ((note - 69) / 12);
const onePoleCoefficient = (cutoff) =>
  1 - Math.exp((-2 * Math.PI * cutoff) / SAMPLE_RATE);

const add = (time, samples, gain = 1, pan = 0) => {
  const start = Math.round(time * SAMPLE_RATE);
  const gl = gain * Math.cos(((pan + 1) * Math.PI) / 4);
  const gr = gain * Math.sin(((pan + 1) * Math.PI) / 4);
  for (let i = 0; i < samples.length; i++) {
    const index = start + i;
    if (index < 0 || index >= LENGTH) continue;
    left[index] += samples[i] * gl;
    right[index] += samples[i] * gr;
  }
};

// --- Instrumentos -----------------------------------------------------------
const kick = () => {
  const n = Math.round(0.4 * SAMPLE_RATE);
  const out = new Float32Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const freq = 46 + 120 * Math.exp(-t / 0.028);
    phase += (2 * Math.PI * freq) / SAMPLE_RATE;
    const click = i < 90 ? noise() * (1 - i / 90) * 0.35 : 0;
    out[i] = Math.sin(phase) * Math.exp(-t / 0.2) + click;
  }
  return out;
};

const clap = () => {
  const n = Math.round(0.35 * SAMPLE_RATE);
  const out = new Float32Array(n);
  const hp = onePoleCoefficient(900);
  const lp = onePoleCoefficient(3200);
  let low = 0;
  let band = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const burst =
      t < 0.03
        ? Math.exp(-((t * 1000) % 10) / 2.5)
        : Math.exp(-(t - 0.03) / 0.11);
    const x = noise() * burst;
    low += hp * (x - low);
    band += lp * (x - low - band);
    out[i] = band * 1.6;
  }
  return out;
};

const hat = (decay) => {
  const n = Math.round(decay * 6 * SAMPLE_RATE);
  const out = new Float32Array(n);
  const lp = onePoleCoefficient(7000);
  let low = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const x = noise();
    low += lp * (x - low);
    out[i] = (x - low) * Math.exp(-t / decay);
  }
  return out;
};

const crash = () => {
  const n = Math.round(2.2 * SAMPLE_RATE);
  const out = new Float32Array(n);
  const lp = onePoleCoefficient(4500);
  let low = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const x = noise();
    low += lp * (x - low);
    out[i] = (x - low) * Math.exp(-t / 0.7);
  }
  return out;
};

const riser = (duration) => {
  const n = Math.round(duration * SAMPLE_RATE);
  const out = new Float32Array(n);
  let low = 0;
  for (let i = 0; i < n; i++) {
    const p = i / n;
    const x = noise();
    low += onePoleCoefficient(400 + 7000 * p * p) * (x - low);
    out[i] = low * p * p;
  }
  return out;
};

/** Sierra con filtro paso bajo y envolvente: bajo, acordes y arpegio. */
const synth = ({
  note,
  duration,
  cutoff,
  decay,
  detune = 0,
  attack = 0.004,
}) => {
  const n = Math.round((duration + 0.05) * SAMPLE_RATE);
  const out = new Float32Array(n);
  const freq = midiToHz(note) * 2 ** (detune / 1200);
  let phase = 0;
  let low = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    phase = (phase + freq / SAMPLE_RATE) % 1;
    const saw = 2 * phase - 1;
    const env =
      Math.min(1, t / attack) *
      Math.exp(-t / decay) *
      (t > duration ? Math.max(0, 1 - (t - duration) / 0.05) : 1);
    const filterEnv = cutoff * (0.35 + 0.65 * Math.exp(-t / (decay * 0.6)));
    low += onePoleCoefficient(filterEnv) * (saw - low);
    out[i] = low * env;
  }
  return out;
};

const pad = (notes, time, duration, gain) => {
  for (const [index, note] of notes.entries()) {
    for (const detune of [-8, 8]) {
      add(
        time,
        synth({ note, duration, cutoff: 1400, decay: 6, detune, attack: 0.25 }),
        gain,
        detune < 0 ? -0.5 + index * 0.1 : 0.5 - index * 0.1,
      );
    }
  }
};

// --- Arreglo -------------------------------------------------------------
const KICK = kick();
const CLAP = clap();
const CLOSED_HAT = hat(0.022);
const OPEN_HAT = hat(0.09);
const CRASH = crash();

// Progresión I–V–vi–IV en Do mayor, con voicings cercanos.
const CHORDS = [
  { bass: 36, notes: [60, 64, 67], arp: [72, 76, 79, 84] }, // C
  { bass: 43, notes: [59, 62, 67], arp: [71, 74, 79, 83] }, // G
  { bass: 45, notes: [60, 64, 69], arp: [72, 76, 81, 84] }, // Am
  { bass: 41, notes: [60, 65, 69], arp: [72, 77, 81, 84] }, // F
];

// Sidechain: la música "respira" con cada bombo.
const kickTimes = [];

// Intro (0–4 s, escena del caos): pulso tenso en La menor + redoble.
for (let step = 0; step < 16; step++) {
  const t = step * (BEAT / 2);
  add(t, synth({ note: 33, duration: 0.2, cutoff: 500, decay: 0.16 }), 0.5);
  add(t + BEAT / 4, CLOSED_HAT, 0.12, 0.3);
}
pad([57, 60, 64], 0, 3.9, 0.05);
add(2.5, riser(1.5), 0.3);
for (let step = 0; step < 8; step++) {
  add(3 + step * (BEAT / 4), CLAP, 0.12 + step * 0.03, 0);
}

// Cuerpo (4–26 s), subida (26–27 s) y final en tónica (27–30 s).
const grooveEnd = 26;
const finalHit = 27;
const chordAt = (t) => {
  if (t >= finalHit) return CHORDS[0];
  if (t >= grooveEnd) return CHORDS[3];
  return CHORDS[Math.floor((t - 4) / BAR) % CHORDS.length];
};

for (let t = 4; t < DURATION - 0.6; t += BEAT) {
  const chord = chordAt(t);
  const beat = Math.round((t - 4) / BEAT) % 4;
  const inBuild = t >= grooveEnd && t < finalHit;
  if (!inBuild) {
    add(t, KICK, 0.9);
    kickTimes.push(t);
    if (beat % 2 === 1) add(t, CLAP, 0.26, 0.05);
    add(t + BEAT / 2, OPEN_HAT, 0.08, -0.25);
    add(t + BEAT / 4, CLOSED_HAT, 0.05, 0.35);
    add(t + (BEAT * 3) / 4, CLOSED_HAT, 0.05, 0.35);
  }
  // Bajo en corcheas.
  for (const offset of [0, BEAT / 2]) {
    add(
      t + offset,
      synth({ note: chord.bass, duration: 0.22, cutoff: 700, decay: 0.2 }),
      inBuild ? 0.3 : 0.42,
    );
  }
  // Stabs de acorde a contratiempo.
  for (const [index, note] of chord.notes.entries()) {
    for (const detune of [-7, 7]) {
      add(
        t + BEAT / 2,
        synth({ note, duration: 0.16, cutoff: 2600, decay: 0.14, detune }),
        0.11,
        detune < 0 ? -0.45 + index * 0.15 : 0.45 - index * 0.15,
      );
    }
  }
  // Arpegio en semicorcheas desde la escena 3 (10 s) hasta la subida.
  if (t >= 10 && t < grooveEnd) {
    for (let step = 0; step < 4; step++) {
      const note = chord.arp[(beat * 4 + step) % chord.arp.length];
      add(
        t + step * (BEAT / 4),
        synth({ note, duration: 0.1, cutoff: 5200, decay: 0.07 }),
        0.07,
        step % 2 === 0 ? -0.35 : 0.35,
      );
    }
  }
}

// Colchón armónico por tramos de acorde.
for (let t = 4; t < grooveEnd; t += BAR) {
  pad(
    chordAt(t).notes.map((n) => n - 12),
    t,
    BAR,
    0.035,
  );
}
pad(
  CHORDS[3].notes.map((n) => n - 12),
  grooveEnd,
  finalHit - grooveEnd,
  0.03,
);
pad(
  CHORDS[0].notes.map((n) => n - 12),
  finalHit,
  DURATION - 1.5 - finalHit,
  0.035,
);

// Remates: caída tras la intro, subida antes del CTA y golpe final.
add(4, CRASH, 0.2);
add(grooveEnd, riser(1), 0.32);
for (let step = 0; step < 8; step++) {
  add(grooveEnd + 0.5 + step * (BEAT / 8), CLAP, 0.1 + step * 0.035, 0);
}
add(finalHit, CRASH, 0.24);
pad([48, 55, 60, 64, 67], DURATION - 1.5, 1.5, 0.06);

// --- Mezcla -------------------------------------------------------------
const duck = new Float32Array(LENGTH).fill(1);
for (const t of kickTimes) {
  const start = Math.round(t * SAMPLE_RATE);
  for (let i = 0; i < SAMPLE_RATE * 0.25 && start + i < LENGTH; i++) {
    const amount = 1 - 0.35 * Math.exp(-i / (SAMPLE_RATE * 0.07));
    duck[start + i] = Math.min(duck[start + i], amount);
  }
}

let peak = 0;
for (let i = 0; i < LENGTH; i++) {
  const t = i / SAMPLE_RATE;
  const fade = Math.min(1, t / 0.02, (DURATION - t) / 1.2);
  left[i] = Math.tanh(left[i] * duck[i] * 1.3) * fade;
  right[i] = Math.tanh(right[i] * duck[i] * 1.3) * fade;
  peak = Math.max(peak, Math.abs(left[i]), Math.abs(right[i]));
}

const pcm = Buffer.alloc(44 + LENGTH * 4);
pcm.write("RIFF", 0);
pcm.writeUInt32LE(36 + LENGTH * 4, 4);
pcm.write("WAVEfmt ", 8);
pcm.writeUInt32LE(16, 16);
pcm.writeUInt16LE(1, 20);
pcm.writeUInt16LE(2, 22);
pcm.writeUInt32LE(SAMPLE_RATE, 24);
pcm.writeUInt32LE(SAMPLE_RATE * 4, 28);
pcm.writeUInt16LE(4, 32);
pcm.writeUInt16LE(16, 34);
pcm.write("data", 36);
pcm.writeUInt32LE(LENGTH * 4, 40);
const gain = 0.89 / peak;
for (let i = 0; i < LENGTH; i++) {
  pcm.writeInt16LE(Math.round(left[i] * gain * 32767), 44 + i * 4);
  pcm.writeInt16LE(Math.round(right[i] * gain * 32767), 46 + i * 4);
}

const projectRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const output = path.join(
  projectRoot,
  "public",
  "audio",
  "musica-corporativa.mp3",
);
const workDir = mkdtempSync(path.join(tmpdir(), "aquillega-music-"));
const wav = path.join(workDir, "musica.wav");
writeFileSync(wav, pcm);
execFileSync(
  "npx",
  [
    "remotion",
    "ffmpeg",
    "-y",
    "-loglevel",
    "error",
    "-i",
    wav,
    "-c:a",
    "libmp3lame",
    "-b:a",
    "192k",
    output,
  ],
  { cwd: projectRoot, stdio: "inherit" },
);
rmSync(workDir, { recursive: true, force: true });
console.log(
  `Pista provisional generada: ${path.relative(projectRoot, output)}`,
);
