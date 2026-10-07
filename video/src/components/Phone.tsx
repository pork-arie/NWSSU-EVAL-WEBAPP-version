import React from 'react';
import { C, fontFamily } from '../theme';
import { Plane, Wifi } from './Icons';

export const SCREEN_W = 372;
export const SCREEN_H = 780;

export const StatusBar: React.FC<{ dark?: boolean; airplane?: boolean }> = ({ dark, airplane }) => {
  const col = dark ? C.white : C.ink;
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 26px', color: col, fontSize: 15, fontWeight: 600, zIndex: 50 }}>
      <span>9:41</span>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {airplane ? <Plane size={17} color={col} /> : <Wifi size={17} color={col} />}
        <div style={{ width: 25, height: 12, border: `1.5px solid ${col}`, borderRadius: 3, padding: 1.5 }}>
          <div style={{ width: '80%', height: '100%', background: col, borderRadius: 1 }} />
        </div>
      </div>
    </div>
  );
};

// Phone frame. Children are laid out on a 372 x 780 screen.
export const Phone: React.FC<{
  children: React.ReactNode;
  scale?: number;
  style?: React.CSSProperties;
  darkStatus?: boolean;
  airplane?: boolean;
}> = ({ children, scale = 1, style, darkStatus, airplane }) => (
  <div
    style={{
      width: SCREEN_W + 28,
      height: SCREEN_H + 28,
      borderRadius: 58,
      background: '#0b1220',
      padding: 14,
      boxShadow: '0 40px 90px rgba(6,78,59,0.28), 0 12px 30px rgba(0,0,0,0.25), inset 0 0 0 2px #334155',
      transform: `scale(${scale})`,
      transformOrigin: 'center center',
      fontFamily,
      ...style,
    }}
  >
    <div style={{ position: 'relative', width: SCREEN_W, height: SCREEN_H, borderRadius: 44, overflow: 'hidden', background: C.bg }}>
      {children}
      <StatusBar dark={darkStatus} airplane={airplane} />
      <div style={{ position: 'absolute', top: 10, left: '50%', marginLeft: -55, width: 110, height: 30, borderRadius: 20, background: '#0b1220', zIndex: 60 }} />
    </div>
  </div>
);

// A screen inside the phone that slides in from the right and out to the left.
export const Screen: React.FC<{
  t: number;
  from: number;
  to: number;
  children: React.ReactNode;
  bg?: string;
}> = ({ t, from, to, children, bg = C.bg }) => {
  const d = 0.35;
  if (t < from - d || t > to + d) return null;
  const inP = Math.min(1, Math.max(0, (t - from + d) / d));
  const outP = Math.min(1, Math.max(0, (t - to) / d));
  const ease = (x: number) => 1 - Math.pow(1 - x, 3);
  const x = (1 - ease(inP)) * SCREEN_W - ease(outP) * SCREEN_W * 0.3;
  return (
    <div style={{ position: 'absolute', inset: 0, background: bg, transform: `translateX(${x}px)`, opacity: 1 - outP }}>
      {children}
    </div>
  );
};

// Finger-tap ripple at (x, y) on the screen.
export const Tap: React.FC<{ t: number; at: number; x: number; y: number }> = ({ t, at, x, y }) => {
  const p = (t - at) / 0.55;
  if (p < -0.25 || p > 1) return null;
  const pre = p < 0 ? 1 + p * 4 : 1;
  const s = p < 0 ? 0.7 : 0.7 + p * 0.9;
  const o = p < 0 ? 0.55 * pre : 0.55 * (1 - p);
  return (
    <div
      style={{
        position: 'absolute', left: x - 30, top: y - 30, width: 60, height: 60, borderRadius: 30,
        background: 'rgba(15,23,42,0.35)', border: '3px solid rgba(255,255,255,0.9)',
        transform: `scale(${s})`, opacity: o, zIndex: 40, pointerEvents: 'none',
      }}
    />
  );
};

// Press feedback for a button tapped at `at`.
export const pressScale = (t: number, at: number) => {
  const d = Math.abs(t - at - 0.05);
  return d < 0.15 ? 0.95 + (d / 0.15) * 0.05 : 1;
};
