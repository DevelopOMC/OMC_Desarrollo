#!/usr/bin/env python3
"""
Banda sonora + diseño sonoro del vídeo de Aptoa, sintetizados desde cero
(sin samples ni música de terceros) y sincronizados con los mismos cues que
usa la animación (src/cues.json).

  120 BPM · La menor → Do mayor · 30 s · 48 kHz estéreo

Salida: public/audio/aptoa-soundtrack.wav
"""
import json
import os

import numpy as np
from scipy import signal

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CUES = json.load(open(os.path.join(ROOT, 'src', 'cues.json')))
OUT = os.path.join(ROOT, 'public', 'audio', 'aptoa-soundtrack.wav')

SR = 48000
FPS = CUES['fps']
DUR = CUES['duration'] / FPS
N = int(DUR * SR)
BEAT = 60.0 / CUES['bpm']
BAR = BEAT * 4
GRID = CUES['gridStart'] / FPS  # 4.5 s: primer tiempo fuerte tras el impacto
GROOVE = CUES['grooveStart'] / FPS  # 6.5 s: entra la batería

rng = np.random.default_rng(20260926)


def fr(frame):
    return frame / FPS


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


# ------------------------------------------------------------------ buses
class Bus:
    def __init__(self, name):
        self.name = name
        self.buf = np.zeros((2, N), dtype=np.float64)

    def add(self, sig, t0, gain=1.0, pan=0.0):
        """Mezcla una señal mono (o estéreo 2xN) en el instante t0 (s)."""
        i0 = int(round(t0 * SR))
        if sig.ndim == 1:
            p = (pan + 1) * np.pi / 4
            st = np.vstack([sig * np.cos(p), sig * np.sin(p)])
        else:
            st = sig
        if i0 < 0:
            st = st[:, -i0:]
            i0 = 0
        n = min(st.shape[1], N - i0)
        if n <= 0:
            return
        self.buf[:, i0:i0 + n] += st[:, :n] * gain


drums = Bus('drums')
bass = Bus('bass')
pads = Bus('pads')
plucks = Bus('plucks')
sfx = Bus('sfx')
fx = Bus('fx')  # whooshes / risers / impactos
bells = Bus('bells')


# ------------------------------------------------------------------ utilidades DSP
def env_exp(n, tau):
    t = np.arange(n) / SR
    return np.exp(-t / tau)


def adsr(n, a=0.005, d=0.1, s=0.7, r=0.1):
    e = np.ones(n) * s
    na, nd, nr = int(a * SR), int(d * SR), int(r * SR)
    na = max(1, min(na, n))
    e[:na] = np.linspace(0, 1, na)
    nd = max(1, min(nd, n - na))
    e[na:na + nd] = np.linspace(1, s, nd)
    nr = max(1, min(nr, n))
    e[-nr:] *= np.linspace(1, 0, nr)
    return e


def sos(kind, f, order=2):
    if kind == 'bp':
        return signal.butter(order, [f[0] / (SR / 2), f[1] / (SR / 2)], btype='band', output='sos')
    return signal.butter(order, f / (SR / 2), btype=kind, output='sos')


def filt(x, kind, f, order=2):
    return signal.sosfilt(sos(kind, f, order), x)


def noise(n):
    return rng.standard_normal(n)


def polyblep_saw(freq, n, phase0=0.0):
    """Diente de sierra limitado en banda (PolyBLEP), freq puede ser array."""
    f = np.broadcast_to(np.asarray(freq, dtype=np.float64), (n,))
    dt = f / SR
    ph = (phase0 + np.cumsum(dt)) % 1.0
    y = 2 * ph - 1
    m1 = ph < dt
    t1 = ph[m1] / dt[m1]
    y[m1] -= t1 + t1 - t1 * t1 - 1
    m2 = ph > 1 - dt
    t2 = (ph[m2] - 1) / dt[m2]
    y[m2] -= t2 * t2 + t2 + t2 + 1
    return y


def sine(freq, n, phase0=0.0):
    f = np.broadcast_to(np.asarray(freq, dtype=np.float64), (n,))
    return np.sin(2 * np.pi * (np.cumsum(f) / SR) + phase0)


def spectral_sweep(n, f_start, f_end, width_oct=0.9, shape=None):
    """Ruido filtrado por una banda que se desplaza (STFT) — whooshes y risers."""
    x = noise(n + 2048)
    nper = 1024
    f, t, Z = signal.stft(x, fs=SR, nperseg=nper, noverlap=nper * 3 // 4)
    tt = np.clip(t / (n / SR), 0, 1)
    if shape is not None:
        tt = shape(tt)
    fc = np.exp(np.log(f_start) + (np.log(f_end) - np.log(f_start)) * tt)
    lf = np.log2(np.maximum(f, 1.0))[:, None]
    mask = np.exp(-0.5 * ((lf - np.log2(fc)[None, :]) / (width_oct / 2)) ** 2)
    _, y = signal.istft(Z * mask, fs=SR, nperseg=nper, noverlap=nper * 3 // 4)
    y = y[:n]
    return y / (np.max(np.abs(y)) + 1e-9)


def make_ir(seconds, damp_hz=6000, predelay=0.012, seed=1):
    r = np.random.default_rng(seed)
    n = int(seconds * SR)
    t = np.arange(n) / SR
    decay = np.exp(-6.9 * t / seconds)
    ir = r.standard_normal((2, n)) * decay
    ir = signal.sosfilt(sos('lp', damp_hz), ir, axis=1)
    ir = signal.sosfilt(sos('hp', 180), ir, axis=1)
    pd = int(predelay * SR)
    ir = np.concatenate([np.zeros((2, pd)), ir], axis=1)
    return ir / np.sqrt(np.sum(ir ** 2) / 2)


def reverb(st, ir, mix):
    wet = np.vstack([signal.fftconvolve(st[0], ir[0])[:N], signal.fftconvolve(st[1], ir[1])[:N]])
    return wet * mix


def pingpong(st, delay_s, fb=0.35, repeats=4, lp=5000):
    out = np.zeros_like(st)
    d = int(delay_s * SR)
    src = signal.sosfilt(sos('lp', lp), st.mean(axis=0))
    g = 1.0
    for k in range(1, repeats + 1):
        g *= fb
        ch = k % 2
        shifted = np.zeros(N)
        shifted[k * d:] = src[:N - k * d]
        out[ch] += shifted * g
    return out


def cubic_bezier(p1x, p1y, p2x, p2y):
    def fx(t):
        return 3 * p1x * (1 - t) ** 2 * t + 3 * p2x * (1 - t) * t ** 2 + t ** 3

    def fy(t):
        return 3 * p1y * (1 - t) ** 2 * t + 3 * p2y * (1 - t) * t ** 2 + t ** 3

    def solve(x):
        lo, hi = 0.0, 1.0
        for _ in range(40):
            mid = (lo + hi) / 2
            if fx(mid) < x:
                lo = mid
            else:
                hi = mid
        return fy((lo + hi) / 2)

    return solve


EXPO_OUT = cubic_bezier(0.16, 1, 0.3, 1)


# ------------------------------------------------------------------ instrumentos
def kick(punch=1.0, length=0.45):
    n = int(length * SR)
    t = np.arange(n) / SR
    f = 46 + 110 * np.exp(-t / 0.035) * punch + 40 * np.exp(-t / 0.006)
    body = sine(f, n) * np.exp(-t / 0.22)
    click = filt(noise(n), 'hp', 2500) * np.exp(-t / 0.004) * 0.35
    y = np.tanh((body + click) * 1.6)
    return y


def clap():
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    nz = filt(noise(n), 'bp', (900, 5200))
    e = np.zeros(n)
    for k, off in enumerate([0.0, 0.009, 0.018]):
        i = int(off * SR)
        e[i:] += np.exp(-(t[: n - i]) / 0.006) * (0.8 if k < 2 else 1.0)
    e += np.exp(-t / 0.11) * 0.55 * (t > 0.018)
    return nz * e


def hat(open_=False):
    n = int((0.32 if open_ else 0.06) * SR)
    t = np.arange(n) / SR
    y = filt(noise(n), 'hp', 7200, 4)
    metal = sum(np.sign(np.sin(2 * np.pi * f0 * t)) for f0 in (3150, 4270, 5190, 6040)) * 0.08
    y = filt(y + metal, 'hp', 6000)
    return y * np.exp(-t / (0.09 if open_ else 0.014))


def snare(tone=1.0):
    n = int(0.22 * SR)
    t = np.arange(n) / SR
    nz = filt(noise(n), 'bp', (1400, 9000)) * np.exp(-t / 0.07)
    body = sine(185 * tone + 60 * np.exp(-t / 0.01), n) * np.exp(-t / 0.05)
    return nz * 0.8 + body * 0.6


def crash(length=2.2):
    n = int(length * SR)
    t = np.arange(n) / SR
    nz = filt(noise(n), 'hp', 3800, 2)
    partials = sum(np.sin(2 * np.pi * f0 * t + rng.uniform(0, 6.28)) for f0 in rng.uniform(3000, 9000, 24)) / 24
    y = (nz + partials * 0.6) * np.exp(-t / 0.65)
    return filt(y, 'lp', 12000)


def supersaw_chord(notes, length, cutoff=2600, detune=0.12, voices=5):
    n = int(length * SR)
    y = np.zeros(n)
    for m in notes:
        f0 = midi(m)
        for v in range(voices):
            cents = (v - (voices - 1) / 2) / ((voices - 1) / 2) * detune * 100 if voices > 1 else 0
            y += polyblep_saw(f0 * 2 ** (cents / 1200), n, rng.uniform()) / voices
    y /= max(1, len(notes))
    y = filt(y, 'lp', cutoff, 2)
    return y


def pad_stereo(notes, length, cutoff=2400, attack=0.25, release=0.6, level=1.0):
    n = int(length * SR)
    L = supersaw_chord(notes, length, cutoff)
    R = supersaw_chord(notes, length, cutoff)
    e = adsr(n, attack, 0.3, 0.85, release)
    return np.vstack([L * e, R * e]) * level


def pluck(m, length=0.32, bright=1.0, decay=0.16):
    n = int(length * SR)
    t = np.arange(n) / SR
    f0 = midi(m)
    y = np.zeros(n)
    for k in range(1, 18):
        fk = f0 * k
        if fk > SR / 2.4:
            break
        amp = (1.0 / k) * (1 if k % 2 else 0.55)
        y += amp * np.sin(2 * np.pi * fk * t) * np.exp(-t * (1 / decay + k * 9 / bright))
    y *= np.minimum(1, t / 0.002)
    return y * 0.9


def bell(m, length=1.6, index=2.2, ratio=3.5, decay=0.5):
    n = int(length * SR)
    t = np.arange(n) / SR
    f = midi(m)
    I = index * np.exp(-t / 0.25)
    y = np.sin(2 * np.pi * f * t + I * np.sin(2 * np.pi * f * ratio * t))
    y += 0.3 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t / 0.2)
    return y * np.exp(-t / decay) * np.minimum(1, t / 0.003)


def bass_note(m, length=0.22):
    n = int(length * SR)
    t = np.arange(n) / SR
    f = midi(m)
    saw = polyblep_saw(f, n)
    # filtro con envolvente (bloques)
    y = np.zeros(n)
    blk = 256
    zi = None
    for i in range(0, n, blk):
        fc = 280 + 1300 * np.exp(-(i / SR) / 0.05)
        s_ = sos('lp', fc)
        if zi is None:
            zi = signal.sosfilt_zi(s_) * 0
        y[i:i + blk], zi = signal.sosfilt(s_, saw[i:i + blk], zi=zi)
    sub = sine(f, n) * 0.9
    e = adsr(n, 0.003, 0.08, 0.75, 0.05)
    return np.tanh((y * 0.8 + sub) * 1.3) * e


def sub_boom(length=2.2, f_start=62, f_end=30):
    n = int(length * SR)
    t = np.arange(n) / SR
    f = f_end + (f_start - f_end) * np.exp(-t / 0.35)
    return np.tanh(sine(f, n) * np.exp(-t / 0.7) * 1.8) * 0.9


def pop(f_hi=900, f_lo=260, length=0.09):
    n = int(length * SR)
    t = np.arange(n) / SR
    f = f_lo + (f_hi - f_lo) * np.exp(-t / 0.012)
    return sine(f, n) * np.exp(-t / 0.028) * np.minimum(1, t / 0.001)


def tick(freq=3200, length=0.03):
    n = int(length * SR)
    t = np.arange(n) / SR
    return (sine(freq, n) * 0.7 + filt(noise(n), 'hp', 4000) * 0.3) * np.exp(-t / 0.004)


def mouse_click():
    n = int(0.09 * SR)
    t = np.arange(n) / SR
    y = np.zeros(n)
    for off, g in ((0.0, 1.0), (0.055, 0.6)):
        i = int(off * SR)
        m = n - i
        y[i:] += filt(noise(m), 'bp', (1800, 7000)) * np.exp(-t[:m] / 0.0025) * g
        y[i:] += sine(2100, m) * np.exp(-t[:m] / 0.003) * 0.4 * g
    return y


def whoosh(length=0.55, f0=500, f1=4000, peak=0.6, width=1.1):
    n = int(length * SR)
    y = spectral_sweep(n, f0, f1, width)
    t = np.linspace(0, 1, n)
    e = np.where(t < peak, (t / peak) ** 2.2, ((1 - t) / (1 - peak)) ** 1.6)
    return y * e


def pan_sweep(sig, p0, p1):
    n = len(sig)
    p = (np.linspace(p0, p1, n) + 1) * np.pi / 4
    return np.vstack([sig * np.cos(p), sig * np.sin(p)])


def riser(length, f0=300, f1=6000):
    n = int(length * SR)
    t = np.linspace(0, 1, n)
    nz = spectral_sweep(n, f0, f1, 1.2, shape=lambda x: x ** 1.6)
    tone = polyblep_saw(180 * 2 ** (t * 2.5), n) * 0.25
    tone = filt(tone, 'lp', 3000)
    e = t ** 2.4
    return (nz + tone) * e


def notif_ding(m1=88, m2=93):
    a = bell(m1, 0.5, index=1.2, ratio=2.0, decay=0.12)
    b = bell(m2, 0.7, index=1.2, ratio=2.0, decay=0.18)
    y = np.zeros(int(0.8 * SR))
    y[: len(a)] += a
    i = int(0.075 * SR)
    y[i:i + len(b)] += b[: len(y) - i]
    return y


def buzz(length=0.35):
    n = int(length * SR)
    t = np.arange(n) / SR
    y = np.tanh(np.sin(2 * np.pi * 155 * t) * 4) * (0.5 + 0.5 * np.sin(2 * np.pi * 24 * t))
    y = filt(y, 'lp', 900)
    return y * adsr(n, 0.01, 0.05, 0.9, 0.05)


def flutter(length=0.5):
    n = int(length * SR)
    t = np.arange(n) / SR
    nz = filt(noise(n), 'bp', (900, 6000))
    am = np.abs(np.sin(2 * np.pi * (18 + 10 * t) * t)) ** 3
    return nz * am * np.exp(-t / 0.25)


def scribble(length=0.3):
    n = int(length * SR)
    t = np.arange(n) / SR
    nz = filt(noise(n), 'bp', (2500, 7000))
    am = 0.6 + 0.4 * np.sin(2 * np.pi * 34 * t)
    return nz * am * adsr(n, 0.01, 0.05, 0.8, 0.08)


# ------------------------------------------------------------------ música
BAR_CHORDS = [  # desde 6.5 s, un compás cada uno
    ('Am', [52, 57, 60, 64], 33, [69, 72, 76, 79]),
    ('F', [53, 57, 60, 64], 29, [65, 69, 72, 76]),
    ('C', [52, 55, 60, 64], 36, [67, 72, 76, 79]),
    ('G', [50, 55, 59, 62], 31, [67, 71, 74, 79]),
    ('Am', [52, 57, 60, 64], 33, [69, 72, 76, 79]),
    ('F', [53, 57, 60, 64], 29, [65, 69, 72, 76]),
    ('C', [52, 55, 60, 64], 36, [67, 72, 76, 79]),
    ('G', [50, 55, 59, 62], 31, [67, 71, 74, 79]),
    ('F', [53, 57, 60, 64], 29, [65, 69, 72, 76]),
    ('G', [50, 55, 59, 62], 31, [67, 71, 74, 79]),  # build
    ('C', [48, 55, 60, 64, 67], 36, [72, 76, 79, 84]),  # impacto CTA
]
ARP = [0, 2, 1, 3, 2, 1, 3, 2, 0, 2, 1, 3, None, 2, 3, 1]

kick_times = []

# --- Intro "caos" (0 – 4.5 s): ostinato en La menor + tic-tac
ost = [57, 64, 57, 64, 60, 64, 57, 65]
for i in range(int(4.2 / (BEAT / 2))):
    t0 = i * BEAT / 2
    m = ost[i % len(ost)]
    lvl = 0.5 + 0.5 * min(1, t0 / 3.5)
    plucks.add(pluck(m, 0.3, bright=0.7, decay=0.1), t0, 0.7 * lvl, pan=-0.25 if i % 2 else 0.25)
for i in range(int(4.3 / (BEAT / 4))):
    t0 = i * BEAT / 4
    drums.add(tick(4200 if i % 2 == 0 else 3300, 0.025), t0, 0.1 + (0.06 if i % 4 == 0 else 0), pan=0.35 if i % 2 else -0.35)
for i in range(9):
    t0 = i * BEAT
    bass.add(sine(midi(33), int(0.18 * SR)) * env_exp(int(0.18 * SR), 0.06), t0, 0.8)
    # latido tenso: bombo filtrado en cada negra
    drums.add(filt(kick(0.6, 0.3), 'lp', 900), t0, 0.35 + 0.25 * min(1, t0 / 4.0))
    if i % 2 == 1:
        drums.add(filt(clap(), 'bp', (700, 3000)), t0, 0.12)

# --- Logo (4.5 – 6.5 s): pad Cmaj9 soñador
pads.add(pad_stereo([48, 55, 59, 62, 64], 2.6, cutoff=1800, attack=0.02, release=0.9), GRID, 0.55)

# --- Groove (6.5 – 30 s)
for b, (name, chord, root, tones) in enumerate(BAR_CHORDS):
    t_bar = GROOVE + b * BAR
    if t_bar >= DUR:
        break
    last = b == len(BAR_CHORDS) - 1
    build = b == 9
    length = BAR if not last else DUR - t_bar
    # pad
    cutoff = 2600 if not build else 2200
    pads.add(pad_stereo(chord, length + (1.2 if last else 0.15), cutoff=cutoff, attack=0.03, release=0.5 if not last else 1.2), t_bar, 0.5 if not last else 0.62)
    # bajo en contratiempos
    if not last:
        for k in range(4):
            if build and k >= 2:
                continue
            bass.add(bass_note(root + 12, 0.24), t_bar + k * BEAT + BEAT / 2, 0.55)
            bass.add(bass_note(root, 0.24), t_bar + k * BEAT + BEAT / 2, 0.35)
    else:
        bass.add(bass_note(root, 1.4), t_bar, 0.7)
    # arpegio
    if b >= 1 and not last:
        for s, idx in enumerate(ARP):
            if idx is None:
                continue
            if build and s >= 8:
                break
            t0 = t_bar + s * BEAT / 4
            m = tones[idx]
            plucks.add(pluck(m, 0.34, bright=1.2, decay=0.13), t0, 0.33 + (0.08 if s % 4 == 0 else 0), pan=-0.3 if s % 2 else 0.3)
    # batería
    for k in range(4):
        tb = t_bar + k * BEAT
        if last and k > 0:
            break
        if build and k >= 2:
            continue
        drums.add(kick(), tb, 0.95)
        kick_times.append(tb)
        if k in (1, 3):
            drums.add(clap(), tb, 0.42, pan=0.05)
        if b >= 2 and not last:
            drums.add(hat(True), tb + BEAT / 2, 0.13, pan=0.2)
    if not last and not build:
        for s in range(16 if b >= 1 else 8):
            step = BEAT / 4 if b >= 1 else BEAT / 2
            if b >= 1 and s % 2 == 0 and s % 4 != 2:
                continue
            drums.add(hat(False), t_bar + s * step, 0.16 if s % 4 == 2 else 0.09, pan=-0.2)

# Crashes en los compases de cambio
for t0 in [GROOVE, GROOVE + 3 * BAR, GROOVE + 5 * BAR, GROOVE + 7 * BAR, GROOVE + 10 * BAR]:
    drums.add(crash(2.4), t0, 0.22, pan=0.1)

# Redoble de preparación (24.5 – 26.4 s)
t_build = GROOVE + 9 * BAR
steps = []
t = t_build
while t < t_build + BEAT * 2:
    steps.append(t)
    t += BEAT / 4
while t < t_build + BEAT * 3.6:
    steps.append(t)
    t += BEAT / 8
for i, t0 in enumerate(steps):
    k = i / len(steps)
    drums.add(snare(1 + k * 0.6), t0, 0.16 + 0.62 * k ** 1.3, pan=0.1 * np.sin(i))
fx.add(pan_sweep(riser(BEAT * 3.8, 250, 7000), -0.4, 0.4), t_build, 0.62)
rev2 = crash(1.2)[::-1] * np.linspace(0, 1, int(1.2 * SR)) ** 2
fx.add(rev2, fr(CUES['cta']['impact']) - 1.2, 0.4)

# Impactos: logo (4.5 s) y CTA (26.5 s)
for t_imp, g in [(fr(CUES['brand']['impact']), 1.0), (fr(CUES['cta']['impact']), 0.9)]:
    fx.add(sub_boom(2.4), t_imp, 0.75 * g)
    fx.add(filt(noise(int(0.8 * SR)), 'lp', 3000) * env_exp(int(0.8 * SR), 0.12), t_imp, 0.45 * g)
    drums.add(crash(2.6), t_imp, 0.3 * g)
    drums.add(kick(1.3, 0.6), t_imp, 0.9 * g)
    kick_times.append(t_imp)
    for j, m in enumerate([72, 76, 79, 83, 86]):
        bells.add(bell(m, 2.4, index=1.6, ratio=3.5, decay=0.9), t_imp + j * 0.012, 0.16 * g, pan=(j - 2) * 0.25)

# Riser + "succión" hacia el iris del gancho (3.3 – 4.5 s)
t_r0 = fr(CUES['hook']['whatsapps'] + 10)
fx.add(pan_sweep(riser(fr(CUES['brand']['impact']) - t_r0, 200, 8000), 0.5, -0.1), t_r0, 0.45)
rev_crash = crash(1.4)[::-1] * np.linspace(0, 1, int(1.4 * SR)) ** 2
fx.add(rev_crash, fr(CUES['brand']['impact']) - 1.4, 0.35)

# Pre-drop hacia el hub (6.0 – 6.5 s)
fx.add(pan_sweep(whoosh(0.7, 300, 5000, 0.85), -0.6, 0.6), GROOVE - 0.6, 0.35)

# ------------------------------------------------------------------ diseño sonoro (SFX)
H = CUES['hook']
prop_kinds = ['paper', 'window', 'chat', 'paper', 'paper', 'chat', 'chat', 'paper', 'calls', 'paper', 'chat', 'paper']
for f, kind in zip(H['props'], prop_kinds):
    t0 = fr(f + 1)
    pan = rng.uniform(-0.6, 0.6)
    if kind == 'chat':
        sfx.add(notif_ding(88 + rng.integers(-2, 3), 93), t0, 0.12, pan=0.5)
        sfx.add(pop(1100, 380), t0, 0.22, pan=0.5)
    elif kind == 'window':
        sfx.add(pop(700, 200, 0.12), t0, 0.35, pan=0.6)
    elif kind == 'calls':
        sfx.add(pop(800, 260), t0, 0.25, pan=-0.1)
    else:
        sfx.add(flutter(0.25), t0, 0.18, pan=pan - 0.3)
        sfx.add(pop(600, 220), t0, 0.2, pan=pan - 0.3)
for a, b in [(12, 34), (64, 84)]:
    t0 = fr(a)
    while t0 < fr(b):
        sfx.add(buzz(0.28), t0, 0.12, pan=-0.05)
        t0 += 0.42
# "sin papeles": ráfaga de papeles
sfx.add(pan_sweep(whoosh(0.6, 3000, 600, 0.35, 1.3), 0.2, -0.9), fr(H['papeles']) - 0.05, 0.5)
sfx.add(flutter(0.6), fr(H['papeles']), 0.3, pan=-0.6)
# "ni Excel": implosión
sfx.add(pan_sweep(whoosh(0.4, 400, 3500, 0.9), 0.6, 0.5), fr(H['excel']) - 0.05, 0.4)
sfx.add(pop(300, 90, 0.2), fr(H['excel'] + 11), 0.55, pan=0.5)
# "ni WhatsApps": burbujas que estallan
for i in range(5):
    sfx.add(pop(1500 - i * 90, 500, 0.07), fr(H['whatsapps'] + 2 + i * 1.5), 0.28, pan=0.55 - i * 0.12)
# el punto final aparece y rebota
sfx.add(pop(1400, 700, 0.06), fr(H['whatsapps'] + 8), 0.3, pan=0.3)
bells.add(bell(84, 0.8, index=0.8, ratio=2.0, decay=0.25), fr(H['dotBounce']), 0.1, pan=0.3)

B = CUES['brand']
# destello del logotipo
for j, m in enumerate([84, 88, 91, 96, 100]):
    bells.add(bell(m, 1.2, index=1.0, ratio=2.0, decay=0.35), fr(B['wordmark']) + j * 0.035, 0.07, pan=-0.5 + j * 0.25)
fx.add(pan_sweep(whoosh(0.8, 2500, 9000, 0.5, 1.0), -0.3, 0.3), fr(B['tagline']) - 0.15, 0.12)
# nodos del hub
for j, f in enumerate(B['nodes']):
    plucks.add(pluck([76, 79, 81, 84][j], 0.5, bright=1.5, decay=0.2), fr(f), 0.3, pan=[-0.6, 0.6, -0.6, 0.6][j])

# whooshes de transición
for key, tr in CUES['transitions'].items():
    t_cut = fr(tr['at'])
    if tr['kind'] == 'whipLeft':
        fx.add(pan_sweep(whoosh(0.6, 250, 6000, 0.62, 1.2), 0.8, -0.8), t_cut - 0.37, 0.55)
    elif tr['kind'] == 'whipUp':
        fx.add(pan_sweep(whoosh(0.6, 200, 5000, 0.62, 1.4), -0.2, 0.2), t_cut - 0.37, 0.5)
    elif tr['kind'] == 'zoomThrough':
        fx.add(pan_sweep(whoosh(0.7, 150, 7000, 0.7, 1.0), 0, 0), t_cut - 0.49, 0.5)
    elif tr['kind'] == 'iris':
        fx.add(pan_sweep(whoosh(0.5, 300, 8000, 0.95, 1.0), -0.3, 0.3), t_cut - 0.45, 0.4)

I = CUES['import']
for f in I['chips']:
    sfx.add(pop(900, 300), fr(f + 1), 0.22, pan=0.4)
for f in I['absorb']:
    sfx.add(pan_sweep(whoosh(0.3, 800, 5000, 0.85, 0.8), 0.4, 0.1), fr(f), 0.18)
    sfx.add(pop(1300, 600, 0.06), fr(f + 10), 0.18, pan=0.15)


def counter_ticks(start, end, total, step, pitch0=2600, pitch1=4200, gain=0.12, pan=0.2):
    last = 0
    for fi in np.arange(start, end + 0.001, 0.25):
        p = EXPO_OUT(min(1, max(0, (fi - start) / (end - start))))
        v = int(round(p * total))
        if v // step > last // step:
            k = v / total
            sfx.add(tick(pitch0 + (pitch1 - pitch0) * k, 0.03), fr(fi), gain, pan=pan)
            last = v


counter_ticks(I['countStart'], I['countEnd'], 200, 10, pan=0.25)
sfx.add(scribble(0.28), fr(I['strike']), 0.2, pan=-0.4)
for j, m in enumerate([84, 88, 91]):
    bells.add(bell(m, 1.0, index=1.0, ratio=2.0, decay=0.3), fr(I['done']) + j * 0.05, 0.13, pan=0.3)

D = CUES['driveiq']
counter_ticks(D['kpiStart'], D['kpiEnd'], 78, 6, 2400, 3600, 0.1, 0.3)
for f in D['rows']:
    fx.add(pan_sweep(whoosh(0.25, 1200, 5000, 0.6, 0.8), 0.5, 0.3), fr(f), 0.07)
for f in D['chips']:
    sfx.add(pop(1000, 400), fr(f + 1), 0.14, pan=-0.4)
# alerta de abandono: ding-dong descendente
bells.add(bell(83, 1.2, index=1.4, ratio=3.0, decay=0.4), fr(D['alert']), 0.2, pan=0.3)
bells.add(bell(79, 1.4, index=1.4, ratio=3.0, decay=0.5), fr(D['alert']) + 0.16, 0.2, pan=0.3)
sfx.add(pop(900, 300), fr(D['alert']), 0.2, pan=0.3)

R = CUES['routebook']
for i in range(14):
    sfx.add(tick(1800 + rng.uniform(-200, 400), 0.02), fr(R['slotsStart'] + i * 2.3 + rng.uniform(0, 1)), 0.07, pan=-0.5 + rng.uniform(-0.2, 0.2))
sfx.add(notif_ding(86, 91), fr(R['request']), 0.12, pan=-0.2)
sfx.add(pop(900, 300), fr(R['request']), 0.22, pan=-0.2)
fx.add(pan_sweep(whoosh(0.45, 900, 3500, 0.7, 0.8), 0.6, 0.0), fr(R['cursorStart']) + 0.1, 0.06)
sfx.add(mouse_click(), fr(R['click']), 0.4, pan=0.0)
plucks.add(pluck(79, 0.5, bright=1.5, decay=0.2), fr(R['confirm']), 0.3, pan=-0.2)
plucks.add(pluck(84, 0.6, bright=1.5, decay=0.25), fr(R['confirm']) + 0.07, 0.3, pan=-0.2)
fx.add(pan_sweep(whoosh(0.35, 700, 3000, 0.7, 0.9), -0.3, -0.3), fr(R['toast']) - 0.1, 0.1)

A = CUES['app']
for j, f in enumerate(A['phones']):
    fx.add(pan_sweep(whoosh(0.4, 250, 2500, 0.8, 1.0), [0, -0.5, 0.5][j], [0, -0.5, 0.5][j]), fr(f), 0.12)
ring_n = int(1.1 * SR)
ring_t = np.arange(ring_n) / SR
ring = sine(500 + 700 * (ring_t / 1.1) ** 0.6, ring_n) * np.sin(np.pi * ring_t / 1.1) ** 2
sfx.add(ring, fr(A['ring']), 0.035)
bells.add(bell(88, 0.8, index=0.9, ratio=2.0, decay=0.2), fr(A['answer']), 0.14, pan=-0.5)
bells.add(bell(95, 1.0, index=0.9, ratio=2.0, decay=0.3), fr(A['answer']) + 0.08, 0.14, pan=-0.5)
sfx.add(tick(2600, 0.03), fr(A['tap']), 0.25, pan=0.5)
for j, m in enumerate([79, 84, 88]):
    bells.add(bell(m, 1.0, index=1.0, ratio=2.0, decay=0.3), fr(A['booked']) + j * 0.05, 0.12, pan=0.5)

P = CUES['proof']
counter_ticks(P['countStart'], P['countEnd'], 320, 16, 2200, 4400, 0.11, -0.3)
fx.add(pan_sweep(whoosh(0.5, 400, 4000, 0.7, 1.0), 0.8, 0.3), fr(P['card']) - 0.2, 0.14)
for j, f in enumerate(P['stars']):
    plucks.add(pluck([84, 86, 88, 91, 93][j], 0.5, bright=1.8, decay=0.18), fr(f + 1), 0.26, pan=-0.4 + j * 0.05)

Cc = CUES['cta']
sfx.add(pop(800, 260, 0.12), fr(Cc['button'] + 1), 0.28)
for j, f in enumerate(Cc['checks'][:3]):
    plucks.add(pluck([79, 84, 88][j], 0.4, bright=1.4, decay=0.15), fr(f + 1), 0.18, pan=[-0.4, 0, 0.4][j])
sfx.add(mouse_click(), fr(Cc['click']), 0.45, pan=0.25)
# ------------------------------------------------------------------ voz en off
from scipy.io import wavfile  # noqa: E402

VO_DIR = os.path.join(ROOT, 'public', 'audio', 'vo')
vo = np.zeros(N)
vo_mask = np.zeros(N)
vo_end = 0.0


def peaking(x, f0, gain_db, q=0.9):
    a = 10 ** (gain_db / 40)
    w = 2 * np.pi * f0 / SR
    al = np.sin(w) / (2 * q)
    b = [1 + al * a, -2 * np.cos(w), 1 - al * a]
    aa = [1 + al / a, -2 * np.cos(w), 1 - al / a]
    return signal.lfilter(b, aa, x)


def compress(x, thr_db=-20, ratio=3.0, att=0.004, rel=0.12):
    env = np.abs(signal.hilbert(x))
    sm = np.zeros_like(env)
    ka, kr = np.exp(-1 / (att * SR)), np.exp(-1 / (rel * SR))
    lvl = 0.0
    for i, e in enumerate(env):
        k = ka if e > lvl else kr
        lvl = k * lvl + (1 - k) * e
        sm[i] = lvl
    db = 20 * np.log10(sm + 1e-9)
    over = np.maximum(0, db - thr_db)
    return x * 10 ** (-(over - over / ratio) / 20)


for key, frame in CUES.get('vo', {}).items():
    path = os.path.join(VO_DIR, f'{key}.wav')
    if not os.path.exists(path):
        continue
    sr_v, v = wavfile.read(path)
    v = v.astype(np.float64)
    if v.dtype.kind == 'i' or np.max(np.abs(v)) > 2:
        v /= 32768.0
    if v.ndim > 1:
        v = v.mean(axis=1)
    v = signal.resample_poly(v, SR, sr_v)
    v = filt(v, 'hp', 85)
    v = peaking(v, 3200, 3.0)
    v = peaking(v, 220, -2.0, 1.2)
    v = compress(v / (np.max(np.abs(v)) + 1e-9))
    v /= np.sqrt(np.mean(v[np.abs(v) > 0.02] ** 2)) + 1e-9  # RMS de voz = 1
    i0 = int(round(fr(frame) * SR))
    n = min(len(v), N - i0)
    vo[i0:i0 + n] += v[:n]
    vo_mask[max(0, i0 - int(0.08 * SR)): min(N, i0 + n + int(0.18 * SR))] = 1
    vo_end = max(vo_end, (i0 + n) / SR)

# sintonía final (sonic logo) cuando termina la locución
for j, m in enumerate([79, 84, 88, 91]):
    bells.add(bell(m, 2.2, index=1.3, ratio=3.5, decay=0.8), vo_end + 0.03 + j * 0.08, 0.11, pan=-0.3 + j * 0.2)

# ------------------------------------------------------------------ mezcla
t_axis = np.arange(N) / SR
side = np.ones(N)
for tk in kick_times:
    i0 = int(tk * SR)
    n = min(int(0.35 * SR), N - i0)
    if n <= 0:
        continue
    tt = np.arange(n) / SR
    side[i0:i0 + n] = np.minimum(side[i0:i0 + n], 1 - 0.55 * np.exp(-tt / 0.09))

hall = make_ir(2.6, 7000, 0.02, seed=3)
room = make_ir(0.7, 9000, 0.005, seed=5)

pads.buf *= side
bass.buf *= (0.35 + 0.65 * side)
plucks.buf *= (0.55 + 0.45 * side)

mix = np.zeros((2, N))
mix += drums.buf + reverb(drums.buf, room, 0.12)
mix += bass.buf
mix += pads.buf * 0.9 + reverb(pads.buf, hall, 0.35)
plk = plucks.buf + pingpong(plucks.buf, BEAT * 0.75, 0.33, 4)
mix += plk * 0.9 + reverb(plk, hall, 0.25)
mix += bells.buf + reverb(bells.buf, hall, 0.45)
mix += sfx.buf * 1.25 + reverb(sfx.buf, room, 0.15)
mix += fx.buf + reverb(fx.buf, hall, 0.2)

# limpieza de graves y brillo general
mix = signal.sosfilt(sos('hp', 28), mix, axis=1)

# ducking: la música baja ~7 dB mientras habla la locutora
win = int(0.12 * SR)
duck_env = np.convolve(vo_mask, np.hanning(win) / np.sum(np.hanning(win)), mode='same')
mix *= 1 - 0.55 * duck_env
bed_rms = np.sqrt(np.mean(mix[:, vo_mask > 0] ** 2))
vo_st = np.vstack([vo, vo]) * bed_rms * 10 ** (9 / 20)
mix += vo_st + reverb(vo_st, room, 0.05)

# fundido final y micro-fades
fade = np.ones(N)
f_out = int(0.7 * SR)
fade[-f_out:] = np.linspace(1, 0, f_out) ** 1.5
fade[: int(0.004 * SR)] = np.linspace(0, 1, int(0.004 * SR))
mix *= fade

# limitador suave
mix /= np.max(np.abs(mix)) + 1e-9
mix = np.tanh(mix * 1.25) / np.tanh(1.25)
peak = 10 ** (-1.0 / 20)
mix *= peak / (np.max(np.abs(mix)) + 1e-9)

out = (mix.T * 32767).astype(np.int16)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
wavfile.write(OUT, SR, out)
rms = np.sqrt(np.mean(mix ** 2))
print(f'OK {OUT}  dur={N / SR:.2f}s  rms={20 * np.log10(rms):.1f} dBFS')
