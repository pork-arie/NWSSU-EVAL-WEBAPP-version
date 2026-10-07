import React from 'react';
import { C } from '../theme';
import { iv, pop, rand } from '../anim';
import { Seal } from '../components/Ui';

const Sheet: React.FC<{ seed: number }> = ({ seed }) => (
  <div style={{ width: 340, height: 440, background: '#fdfcf7', borderRadius: 4, padding: '24px 26px', boxShadow: '0 6px 20px rgba(0,0,0,0.35)', fontFamily: 'serif' }}>
    <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#334155', letterSpacing: 1 }}>FACULTY EVALUATION FORM</div>
    <div style={{ height: 2, background: '#94a3b8', margin: '10px 0 14px' }} />
    {Array.from({ length: 11 }).map((_, r) => (
      <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 11 }}>
        <div style={{ flex: 1, height: 6, background: '#cbd5e1', borderRadius: 3, marginRight: 10 * rand(seed * 31 + r) }} />
        {[0, 1, 2, 3, 4].map((c) => {
          const tick = Math.floor(rand(seed * 97 + r * 7) * 5) === c;
          return (
            <div key={c} style={{ width: 14, height: 14, border: '1.5px solid #64748b', fontSize: 12, lineHeight: '12px', textAlign: 'center', color: '#1d4ed8', fontWeight: 700 }}>
              {tick ? '✓' : ''}
            </div>
          );
        })}
      </div>
    ))}
  </div>
);

// Paper evaluation forms dropping onto a pile.
export const PaperPile: React.FC<{ t: number; count?: number; every?: number }> = ({ t, count = 16, every = 0.22 }) => (
  <div style={{ position: 'relative', width: 700, height: 700 }}>
    {Array.from({ length: count }).map((_, i) => {
      const at = 0.1 + i * every;
      const s = pop(t, at, 30, 15);
      const rot = (rand(i + 1) - 0.5) * 34;
      const dx = (rand(i + 50) - 0.5) * 180;
      const dy = (rand(i + 90) - 0.5) * 110 - i * 3;
      return (
        <div
          key={i}
          style={{
            position: 'absolute', left: 180 + dx, top: 130 + dy, opacity: t > at ? 1 : 0,
            transform: `translateY(${(1 - s) * -520}px) rotate(${rot + (1 - s) * 25}deg)`,
          }}
        >
          <Sheet seed={i + 3} />
        </div>
      );
    })}
  </div>
);

export const Calculator: React.FC<{ t: number }> = ({ t }) => {
  const value = 3482.5 + t * 917.25;
  const pressed = Math.floor(t * 5) % 16;
  const keys = ['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '−', '0', '.', '=', '+'];
  return (
    <div style={{ width: 360, background: '#1f2937', borderRadius: 30, padding: 26, boxShadow: '0 30px 70px rgba(0,0,0,0.5)' }}>
      <div style={{ height: 96, borderRadius: 12, background: '#a7b8a0', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 18px', fontFamily: 'monospace', fontSize: 50, color: '#1f2937', fontWeight: 700 }}>
        {value.toFixed(2)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginTop: 22 }}>
        {keys.map((k, i) => (
          <div key={k} style={{ height: 62, borderRadius: 14, background: i === pressed ? '#64748b' : i % 4 === 3 ? '#b45309' : '#374151', color: '#f8fafc', fontSize: 26, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${i === pressed ? 0.92 : 1})` }}>
            {k}
          </div>
        ))}
      </div>
    </div>
  );
};

export const Calendar: React.FC<{ t: number }> = ({ t }) => {
  const per = 1.0;
  const week = Math.min(6, Math.floor(t / per) + 1);
  const flip = iv(t - (week - 1) * per, 0, 0.3);
  return (
    <div style={{ width: 380, height: 420, perspective: 1000 }}>
      <div style={{ width: '100%', height: '100%', background: C.white, borderRadius: 18, overflow: 'hidden', boxShadow: '0 30px 70px rgba(0,0,0,0.5)', transform: `rotateX(${(1 - flip) * -70}deg)`, transformOrigin: 'top center' }}>
        <div style={{ height: 96, background: C.danger, color: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, fontWeight: 800, letterSpacing: 4 }}>TALLYING</div>
        <div style={{ textAlign: 'center', marginTop: 40, fontSize: 30, fontWeight: 700, color: C.muted, letterSpacing: 3 }}>WEEK</div>
        <div style={{ textAlign: 'center', fontSize: 170, fontWeight: 800, color: C.ink, lineHeight: 1 }}>{week}</div>
      </div>
    </div>
  );
};

// App splash: green with the seal on a white circle.
export const Splash: React.FC<{ t: number }> = ({ t }) => {
  const s = pop(t, 0.5, 30, 12);
  return (
    <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 40%, ${C.emerald}, ${C.forest} 75%)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Seal size={190} style={{ transform: `scale(${s})` }} />
      <div style={{ marginTop: 34, color: C.white, fontSize: 24, fontWeight: 800, opacity: iv(t, 1.1, 1.5), textAlign: 'center', lineHeight: 1.25 }}>
        NwSSU<br />Faculty Evaluation
      </div>
      <div style={{ position: 'absolute', bottom: 60, width: 120, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.25)', overflow: 'hidden', opacity: iv(t, 1.3, 1.6) }}>
        <div style={{ width: `${iv(t, 1.4, 3.5) * 100}%`, height: '100%', background: C.mint }} />
      </div>
    </div>
  );
};
