"""Synthesise the royalty-free background track (public/music.mp3).

Calm, uplifting I-V-vi-IV loop at 110 BPM that builds over 90 seconds.
Needs numpy and ffmpeg:  python3 scripts/make-music.py
"""
import os
import subprocess
import wave

import numpy as np

SR = 44100
BPM = 110
BEAT = 60 / BPM
BAR = 4 * BEAT
LENGTH = 92.0

n = int(SR * LENGTH)
mix = np.zeros((n, 2))


def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def add(sig, start, gain=1.0, pan=0.0):
    i = int(start * SR)
    if i >= n:
        return
    sig = sig[: n - i] * gain
    mix[i : i + len(sig), 0] += sig * (1 - pan) / 2 * 2 ** 0.5
    mix[i : i + len(sig), 1] += sig * (1 + pan) / 2 * 2 ** 0.5


def tone(freq, dur, attack=0.01, decay=None, harmonics=(1.0, 0.25, 0.08), detune=0.0):
    t = np.arange(int(dur * SR)) / SR
    s = np.zeros_like(t)
    for k, a in enumerate(harmonics, start=1):
        s += a * np.sin(2 * np.pi * freq * k * t)
        if detune:
            s += a * np.sin(2 * np.pi * freq * k * (1 + detune) * t)
    env = np.minimum(1, t / attack)
    if decay:
        env *= np.exp(-t / decay)
    else:
        rel = min(0.6, dur / 3)
        env *= np.clip((dur - t) / rel, 0, 1)
    return s * env


# C - G - Am - F, voiced around middle C.
CHORDS = [
    (48, [60, 64, 67, 72]),
    (43, [59, 62, 67, 71]),
    (45, [60, 64, 69, 72]),
    (41, [60, 65, 69, 72]),
]

bars = int(LENGTH / BAR)
for b in range(bars):
    t0 = b * BAR
    root, notes = CHORDS[b % 4]
    last = b >= bars - 2
    if last:
        root, notes = CHORDS[0]
    build = min(1.0, b / 24)

    # Pad
    for m in notes:
        add(tone(hz(m), BAR + 0.5, attack=0.6, harmonics=(1.0, 0.12), detune=0.003), t0, 0.05, pan=(m - 66) / 12)

    # Bass from bar 4
    if b >= 4:
        for beat in (0, 2.5) if not last else (0,):
            add(tone(hz(root), BEAT * 1.5, attack=0.01, decay=0.45, harmonics=(1.0, 0.35, 0.1)), t0 + beat * BEAT, 0.16)

    # Arpeggio from bar 6
    if b >= 6 and not last:
        pattern = [0, 1, 2, 3, 2, 1, 2, 3]
        for k, p in enumerate(pattern):
            m = notes[p] + 12
            add(tone(hz(m), 0.6, attack=0.005, decay=0.18, harmonics=(1.0, 0.3, 0.1)), t0 + k * BEAT / 2, 0.035 + 0.03 * build, pan=0.35 if k % 2 else -0.35)

    # Soft kick from bar 10, hats from bar 14
    if b >= 10 and not last:
        for beat in range(4):
            t = np.arange(int(0.35 * SR)) / SR
            f = 50 + 70 * np.exp(-t * 25)
            kick = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)
            add(kick, t0 + beat * BEAT, 0.22)
    if b >= 14 and not last:
        rng = np.random.default_rng(b)
        for beat in range(4):
            t = np.arange(int(0.08 * SR)) / SR
            hat = rng.standard_normal(len(t)) * np.exp(-t * 60)
            hat = np.diff(hat, prepend=0)
            add(hat, t0 + (beat + 0.5) * BEAT, 0.025, pan=0.3)

# Simple stereo reverb: feedback comb filters, y[i] = x[i - k] + g * y[i - k].
wet = np.zeros_like(mix)
for d, g in ((0.0297, 0.72), (0.0371, 0.7), (0.0411, 0.68), (0.0437, 0.66)):
    k = int(d * SR)
    for ch in range(2):
        x = mix[:, ch]
        y = np.zeros(n)
        for i in range(k, n, k):
            j = min(n, i + k)
            y[i:j] = x[i - k : j - k] + g * y[i - k : j - k]
        wet[:, ch if d < 0.04 else 1 - ch] += y * 0.06
mix = mix + wet

mix /= np.max(np.abs(mix)) * 1.12
fade = int(SR * 1.5)
mix[-fade:] *= np.linspace(1, 0, fade)[:, None]

here = os.path.dirname(os.path.abspath(__file__))
wav = os.path.join(here, 'music.wav')
with wave.open(wav, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
out = os.path.join(here, '..', 'public', 'music.mp3')
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-b:a', '160k', out], check=True)
os.remove(wav)
print('wrote', os.path.normpath(out))
