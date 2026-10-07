import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

// Scene-local time in seconds.
export const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};

const smooth = Easing.bezier(0.4, 0, 0.2, 1);

// Eased, clamped interpolation over [a, b] seconds.
export const iv = (t: number, a: number, b: number, from = 0, to = 1) =>
  interpolate(t, [a, b], [from, to], {
    easing: smooth,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

// Fade in at `a`, fade out at `b`.
export const fade = (t: number, a: number, b: number, d = 0.35) =>
  Math.min(iv(t, a, a + d), 1 - iv(t, b - d, b));

// Spring that starts at `at` seconds.
export const pop = (t: number, at: number, fps = 30, damping = 14) =>
  spring({ frame: Math.max(0, (t - at) * fps), fps, config: { damping, mass: 0.8 } });

// Text typed out between a and b.
export const typed = (text: string, t: number, a: number, b: number) =>
  text.slice(0, Math.round(iv(t, a, b, 0, text.length)));

export const caret = (t: number) => (Math.floor(t * 2) % 2 === 0 ? '|' : '');

// Deterministic pseudo-random in [0, 1).
export const rand = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

export const fmt = (n: number) => n.toLocaleString('en-US');
