import React from 'react';
import { C } from '../theme';
import { fmt, iv, pop } from '../anim';
import { Browser, Card } from '../components/Browser';

const TOTAL = 2000;
const BASE = 1247;

// Times (s) at which a new submission arrives.
export const DEFAULT_BUMPS = [1.6, 3.0, 3.9, 4.8, 5.9, 6.8];

const SECTIONS = [
  { name: 'BSIT 3A', done: 38, of: 42, live: true },
  { name: 'BSIT 3B', done: 35, of: 40 },
  { name: 'BSIS 2A', done: 29, of: 37 },
  { name: 'BSCS 1A', done: 22, of: 45 },
  { name: 'BSIT 4A', done: 31, of: 33 },
];

const Kpi: React.FC<{ label: string; value: string; accent: string; flash: number; sub: string }> = ({ label, value, accent, flash, sub }) => (
  <Card style={{ flex: 1, padding: '20px 22px', position: 'relative', overflow: 'hidden', boxShadow: flash > 0 ? `0 0 0 ${3 * flash}px rgba(5,150,105,${0.35 * flash})` : undefined }}>
    <div style={{ fontSize: 14, color: C.muted, fontWeight: 600 }}>{label}</div>
    <div style={{ fontSize: 40, fontWeight: 800, color: accent, marginTop: 6, letterSpacing: -1 }}>{value}</div>
    <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{sub}</div>
  </Card>
);

// Admin Dashboard with live submission count and Submission Tracking.
export const LiveDashboard: React.FC<{ t: number; width: number; height: number; bumps?: number[] }> = ({ t, width, height, bumps = DEFAULT_BUMPS }) => {
  const n = bumps.filter((b) => t >= b).length;
  const last = [...bumps].reverse().find((b) => t >= b);
  const flash = last !== undefined ? 1 - iv(t, last, last + 0.8) : 0;
  const count = BASE + n;
  const pulse = 0.5 + 0.5 * Math.sin(t * 6);
  return (
    <Browser width={width} height={height} active="Dashboard">
      <div style={{ padding: '26px 30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, color: C.ink }}>Dashboard</div>
            <div style={{ fontSize: 15, color: C.muted, marginTop: 2 }}>1st Semester · SY 2026–2027 · Evaluation period open</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 700, color: C.danger, background: 'rgba(220,38,38,0.08)', padding: '8px 14px', borderRadius: 999 }}>
            <div style={{ width: 10, height: 10, borderRadius: 5, background: C.danger, opacity: 0.4 + 0.6 * pulse }} /> LIVE
          </div>
        </div>
        <div style={{ display: 'flex', gap: 18, marginTop: 22 }}>
          <Kpi label="Evaluations submitted" value={fmt(count)} accent={C.forest} flash={flash} sub={n > 0 ? `+${n} in the last minute` : 'Updated live'} />
          <Kpi label="Completion" value={`${((count / TOTAL) * 100).toFixed(1)}%`} accent={C.emerald} flash={0} sub={`of ${fmt(TOTAL)} expected`} />
          <Kpi label="Pending" value={fmt(TOTAL - count)} accent={C.warning} flash={0} sub="Deadline: Oct 24, 2026" />
        </div>
        <Card style={{ marginTop: 22, padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.ink }}>Evaluation Control · Submission Tracking</div>
            <div style={{ fontSize: 13, color: C.muted }}>By section</div>
          </div>
          {SECTIONS.map((s, i) => {
            const done = s.live ? s.done + (t >= bumps[0] ? 1 : 0) : s.done + (i === 1 && t >= bumps[2] ? 1 : 0) + (i === 3 && t >= bumps[4] ? 1 : 0);
            const hl = s.live ? 1 - iv(t, bumps[0], bumps[0] + 1.4) : 0;
            const on = s.live && t >= bumps[0];
            return (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 14, padding: '6px 10px', borderRadius: 10, background: on ? `rgba(5,150,105,${0.14 * hl})` : 'transparent' }}>
                <div style={{ width: 100, fontSize: 15, fontWeight: 700, color: C.slate }}>{s.name}</div>
                <div style={{ flex: 1, height: 12, borderRadius: 6, background: C.bg, overflow: 'hidden' }}>
                  <div style={{ width: `${(done / s.of) * 100}%`, height: '100%', borderRadius: 6, background: `linear-gradient(90deg, ${C.emerald}, ${C.mint})` }} />
                </div>
                <div style={{ width: 70, textAlign: 'right', fontSize: 15, fontWeight: 700, color: C.ink }}>{done}/{s.of}</div>
              </div>
            );
          })}
        </Card>
      </div>
      {last !== undefined && (
        <div style={{ position: 'absolute', right: 30, bottom: 26, opacity: Math.min(iv(t, last, last + 0.2), 1 - iv(t, last + 1.1, last + 1.4)), transform: `translateY(${(1 - pop(t, last)) * 20}px)`, background: C.forest, color: C.white, borderRadius: 12, padding: '12px 18px', fontSize: 15, fontWeight: 600, boxShadow: '0 10px 24px rgba(0,0,0,0.2)' }}>
          New evaluation received · just now
        </div>
      )}
    </Browser>
  );
};
