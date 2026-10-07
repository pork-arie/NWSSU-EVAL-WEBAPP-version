import React from 'react';
import { C, fontFamily } from '../theme';
import { staticFile } from 'remotion';
import { iv } from '../anim';

export const Fill: React.FC<{ children?: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ position: 'absolute', inset: 0, fontFamily, ...style }}>{children}</div>
);

export const LightBg: React.FC = () => (
  <Fill style={{ background: C.bg }}>
    <div style={{ position: 'absolute', width: 1100, height: 1100, borderRadius: '50%', left: -300, top: -420, background: 'radial-gradient(circle, rgba(5,150,105,0.16), rgba(5,150,105,0) 65%)' }} />
    <div style={{ position: 'absolute', width: 1000, height: 1000, borderRadius: '50%', right: -320, bottom: -460, background: 'radial-gradient(circle, rgba(110,231,183,0.22), rgba(110,231,183,0) 65%)' }} />
  </Fill>
);

export const DarkBg: React.FC = () => (
  <Fill style={{ background: 'radial-gradient(ellipse at 60% 40%, #334155 0%, #1e293b 45%, #0b1220 100%)' }} />
);

export const GreenBg: React.FC = () => (
  <Fill style={{ background: `radial-gradient(ellipse at 50% 35%, ${C.emerald} 0%, ${C.forest} 60%, #022c22 100%)` }} />
);

export const Chip: React.FC<{ children: React.ReactNode; dark?: boolean; style?: React.CSSProperties }> = ({ children, dark, style }) => (
  <div
    style={{
      display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 22px', borderRadius: 999,
      background: dark ? 'rgba(110,231,183,0.15)' : 'rgba(5,150,105,0.12)',
      color: dark ? C.mint : C.emerald, fontSize: 24, fontWeight: 700, letterSpacing: 2.5, ...style,
    }}
  >
    {children}
  </div>
);

// Key message chip, headline and supporting line, animated in at `at`.
export const SideText: React.FC<{
  t: number;
  chip: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
  at?: number;
  style?: React.CSSProperties;
  titleSize?: number;
}> = ({ t, chip, title, sub, at = 0.3, style, titleSize = 78 }) => {
  const a = (k: number) => ({
    opacity: iv(t, at + k * 0.18, at + k * 0.18 + 0.5),
    transform: `translateY(${iv(t, at + k * 0.18, at + k * 0.18 + 0.6, 30, 0)}px)`,
  });
  return (
    <div style={{ position: 'absolute', ...style }}>
      <div style={a(0)}><Chip>{chip}</Chip></div>
      <div style={{ ...a(1), marginTop: 28, fontSize: titleSize, fontWeight: 800, color: C.forest, lineHeight: 1.08, letterSpacing: -1.5 }}>{title}</div>
      {sub && <div style={{ ...a(2), marginTop: 26, fontSize: 34, fontWeight: 500, color: C.muted, lineHeight: 1.4, maxWidth: 780 }}>{sub}</div>}
    </div>
  );
};

// Burned-in caption for the narration line.
export const Caption: React.FC<{ t: number; text: string; from?: number; to?: number; bottom?: number; size?: number; maxWidth?: number }> = ({
  t, text, from = 0.2, to = 999, bottom = 56, size = 34, maxWidth = 1500,
}) => {
  const o = Math.min(iv(t, from, from + 0.3), 1 - iv(t, to - 0.3, to));
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom, display: 'flex', justifyContent: 'center', opacity: o, zIndex: 100 }}>
      <div style={{ maxWidth, padding: '14px 30px', borderRadius: 14, background: 'rgba(15,23,42,0.78)', color: C.white, fontSize: size, fontWeight: 500, lineHeight: 1.35, textAlign: 'center' }}>
        {text}
      </div>
    </div>
  );
};

export const Seal: React.FC<{ size: number; style?: React.CSSProperties; ring?: number }> = ({ size, style, ring = 0.1 }) => (
  <div style={{ width: size, height: size, borderRadius: '50%', background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.25)', ...style }}>
    <img src={sealSrc()} style={{ width: size * (1 - ring * 2), height: size * (1 - ring * 2) }} />
  </div>
);

export const sealSrc = () => staticFile('seal.png');

// Five rating circles, `value` selected (0 = none).
export const RatingRow: React.FC<{ value: number; size?: number; gap?: number }> = ({ value, size = 46, gap = 12 }) => (
  <div style={{ display: 'flex', gap }}>
    {[1, 2, 3, 4, 5].map((n) => (
      <div
        key={n}
        style={{
          width: size, height: size, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: size * 0.4, fontWeight: 700,
          background: value === n ? C.emerald : C.white,
          color: value === n ? C.white : C.muted,
          border: `2px solid ${value === n ? C.emerald : C.border}`,
        }}
      >
        {n}
      </div>
    ))}
  </div>
);
