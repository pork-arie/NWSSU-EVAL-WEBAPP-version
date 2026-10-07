import React from 'react';
import { C, fontFamily } from '../theme';
import { sealSrc } from './Ui';

export const NAV = ['Dashboard', 'Evaluation Control', 'Teachers', 'Students', 'Reports & Analytics', 'Department', 'Feedback', 'Settings'];

// Browser window holding the web admin dashboard.
export const Browser: React.FC<{
  width: number;
  height: number;
  active: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ width, height, active, children, style }) => (
  <div
    style={{
      width, height, borderRadius: 18, overflow: 'hidden', background: C.white, fontFamily,
      boxShadow: '0 40px 100px rgba(6,78,59,0.22), 0 10px 30px rgba(0,0,0,0.12)', border: `1px solid ${C.border}`, ...style,
    }}
  >
    <div style={{ height: 50, background: '#e9eef3', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 9 }}>
      {['#f87171', '#fbbf24', '#34d399'].map((c) => (
        <div key={c} style={{ width: 13, height: 13, borderRadius: 7, background: c }} />
      ))}
      <div style={{ marginLeft: 22, flex: 1, maxWidth: 520, height: 30, borderRadius: 8, background: C.white, color: C.muted, fontSize: 15, display: 'flex', alignItems: 'center', padding: '0 14px' }}>
        NwSSU Faculty Evaluation · Admin
      </div>
    </div>
    <div style={{ display: 'flex', height: height - 50 }}>
      <div style={{ width: 250, background: C.forest, color: C.white, padding: '22px 14px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 8px 22px' }}>
          <div style={{ width: 42, height: 42, borderRadius: 21, background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={sealSrc()} style={{ width: 36, height: 36 }} />
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.2 }}>NwSSU<br /><span style={{ fontWeight: 500, opacity: 0.75, fontSize: 13 }}>Evaluation Office</span></div>
        </div>
        {NAV.map((n) => (
          <div
            key={n}
            style={{
              padding: '11px 14px', borderRadius: 10, fontSize: 15, fontWeight: n === active ? 700 : 500, marginBottom: 4,
              background: n === active ? 'rgba(255,255,255,0.14)' : 'transparent', opacity: n === active ? 1 : 0.78,
              borderLeft: n === active ? `4px solid ${C.mint}` : '4px solid transparent',
            }}
          >
            {n}
          </div>
        ))}
      </div>
      <div style={{ flex: 1, background: C.bg, position: 'relative', overflow: 'hidden' }}>{children}</div>
    </div>
  </div>
);

export const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', ...style }}>{children}</div>
);
