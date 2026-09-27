#!/usr/bin/env python3
"""
Voz en off del vídeo (español de España) generada con Kokoro-82M (Apache-2.0)
vía kokoro-onnx. Escribe las locuciones en public/audio/vo/*.wav; el script
generate_soundtrack.py las coloca en los frames de src/cues.json ("vo") y
hace el "ducking" de la música.

  pip install kokoro-onnx soundfile
  python3 scripts/generate_voiceover.py

Los modelos se descargan de las releases de GitHub de kokoro-onnx a
~/.cache/kokoro-onnx si no existen.
"""
import os
import urllib.request

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public', 'audio', 'vo')
CACHE = os.path.expanduser('~/.cache/kokoro-onnx')
BASE = 'https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/'
VOICE = 'ef_dora'

# Guion. Se escribe "éksel", "wásaps" y "Aptóa" para fijar la pronunciación
# (fonemas espeak: ˈeksel, wˈasaps, apːtˈoa).
LINES = {
    # El gancho se locuta en cuatro golpes, cada uno sincronizado con la
    # palabra que aparece en pantalla.
    'l1a': ('Tu autoescuela,', 1.15),
    'l1b': ('sin papeles,', 1.15),
    'l1c': ('ni éksel,', 1.15),
    'l1d': ('ni wásaps.', 1.15),
    'l2a': ('Esto es Aptóa.', 1.0),
    'l2b': ('Todo lo que tu academia necesita, conectado.', 1.0),
    'l3': ('Importa tus datos en segundos, no en semanas.', 1.0),
    'l4': ('Descubre qué alumnos van a abandonar, antes de que ocurra.', 1.0),
    'l5': ('Tus alumnos reservan desde el móvil, y tú confirmas con un clic.', 1.1),
    'l6': ('Con su app, preparan el examen y aprueban de verdad.', 1.0),
    'l7': ('Ya son más de trescientas veinte autoescuelas.', 1.0),
    'l8': ('Pruébalo gratis en aptóa punto es.', 1.0),
}


def ensure_models():
    os.makedirs(CACHE, exist_ok=True)
    for name in ('kokoro-v1.0.onnx', 'voices-v1.0.bin'):
        path = os.path.join(CACHE, name)
        if not os.path.exists(path):
            print('descargando', name)
            urllib.request.urlretrieve(BASE + name, path)
    return os.path.join(CACHE, 'kokoro-v1.0.onnx'), os.path.join(CACHE, 'voices-v1.0.bin')


def trim(x, sr, thr=0.01):
    idx = np.where(np.abs(x) > thr)[0]
    return x[max(0, idx[0] - int(0.01 * sr)): idx[-1] + int(0.05 * sr)]


def fade(x, sr, ms=6):
    n = int(ms / 1000 * sr)
    x = x.copy()
    x[:n] *= np.linspace(0, 1, n)
    x[-n:] *= np.linspace(1, 0, n)
    return x


def main():
    model, voices = ensure_models()
    k = Kokoro(model, voices)
    os.makedirs(OUT, exist_ok=True)

    def synth(text, speed=1.0):
        x, sr = k.create(text, voice=VOICE, speed=speed, lang='es')
        return trim(x, sr), sr

    for key, (text, speed) in LINES.items():
        x, sr = synth(text, speed)
        sf.write(os.path.join(OUT, f'{key}.wav'), fade(x, sr), sr)
        print(key, f'{len(x) / sr:.2f}s')


if __name__ == '__main__':
    main()
