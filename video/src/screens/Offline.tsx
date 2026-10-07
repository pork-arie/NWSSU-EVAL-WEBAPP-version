import React from 'react';
import { C } from '../theme';
import { iv, pop } from '../anim';
import { Tap, pressScale, SCREEN_W } from '../components/Phone';
import { Check, CloudOff, Plane } from '../components/Icons';
import { EvalHeader } from './Evaluate';
import { sealSrc } from '../components/Ui';
import { TEACHERS } from '../data';

export const AIRPLANE_ON = 0.6;
export const AIRPLANE_OFF = 5.0;

const Notification: React.FC<{ t: number; at: number; title: string; body: string; top: number }> = ({ t, at, title, body, top }) => {
  const s = pop(t, at, 30, 16);
  return (
    <div
      style={{
        position: 'absolute', left: 12, right: 12, top: top - 140 * (1 - s), opacity: Math.min(1, s * 1.5), zIndex: 70,
        background: 'rgba(255,255,255,0.97)', borderRadius: 20, padding: '14px 16px', display: 'flex', gap: 12,
        boxShadow: '0 12px 30px rgba(15,23,42,0.25)',
      }}
    >
      <div style={{ width: 40, height: 40, borderRadius: 10, background: C.forest, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <img src={sealSrc()} style={{ width: 32, height: 32 }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.muted, fontWeight: 600 }}>
          <span>NwSSU Evaluation</span>
          <span>now</span>
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginTop: 2 }}>{title}</div>
        <div style={{ fontSize: 13, color: C.slate, marginTop: 1, lineHeight: 1.35 }}>{body}</div>
      </div>
    </div>
  );
};

// Submitting with no signal, the queued send, then notifications. Runs about 10 s.
export const OfflineScreens: React.FC<{ t: number }> = ({ t }) => {
  const teacher = TEACHERS[2];
  const queued = t > 2.1;
  const sent = t > 5.7;
  const toast = Math.min(iv(t, AIRPLANE_ON, AIRPLANE_ON + 0.25), 1 - iv(t, 1.6, 1.9));
  return (
    <div style={{ position: 'absolute', inset: 0, background: C.bg }}>
      <EvalHeader title="Evaluate" name={teacher.teacher} sub={`${teacher.code} · ${teacher.subject}`} />
      <div style={{ position: 'absolute', top: 200, left: 18, right: 18, background: C.white, borderRadius: 16, padding: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.emerald, letterSpacing: 1 }}>READY TO SUBMIT</div>
        <div style={{ fontSize: 16, color: C.ink, marginTop: 8, fontWeight: 600 }}>15 of 15 statements answered</div>
        <div style={{ fontSize: 14, color: C.muted, marginTop: 4 }}>Comment added</div>
      </div>
      {queued && (
        <div
          style={{
            position: 'absolute', top: 330, left: 18, right: 18, borderRadius: 16, padding: 18, display: 'flex', gap: 14, alignItems: 'center',
            background: sent ? 'rgba(22,163,74,0.1)' : 'rgba(217,119,6,0.1)', border: `2px solid ${sent ? 'rgba(22,163,74,0.4)' : 'rgba(217,119,6,0.4)'}`,
            opacity: iv(t, 2.1, 2.4), transform: `scale(${0.9 + 0.1 * pop(t, 2.1)})`,
          }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 22, background: sent ? C.success : C.warning, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {sent ? <Check size={26} color={C.white} stroke={3} /> : <CloudOff size={24} color={C.white} />}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: sent ? C.success : C.warning }}>{sent ? 'Sent' : 'Saved on this phone'}</div>
            <div style={{ fontSize: 13, color: C.slate, marginTop: 2, lineHeight: 1.4 }}>
              {sent ? 'Your evaluation reached the evaluation office.' : "No signal. It will send automatically when you're back online."}
            </div>
          </div>
        </div>
      )}
      <div style={{ position: 'absolute', left: 18, right: 18, bottom: 26, height: 58, borderRadius: 14, background: queued ? '#94a3b8' : C.forest, color: C.white, fontSize: 19, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pressScale(t, 1.9)})` }}>
        {queued ? (sent ? 'Submitted' : 'Waiting for signal…') : 'Submit anyway'}
      </div>
      <Tap t={t} at={1.9} x={SCREEN_W / 2} y={725} />
      <div style={{ position: 'absolute', top: 56, left: '50%', transform: 'translateX(-50%)', opacity: toast, zIndex: 70, background: 'rgba(15,23,42,0.9)', color: C.white, borderRadius: 999, padding: '9px 16px', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
        <Plane size={16} color={C.white} /> Airplane mode on
      </div>
      <Notification t={t} at={5.6} top={52} title="Your evaluation has been sent" body={`${teacher.teacher} · ${teacher.code}`} />
      <Notification t={t} at={7.6} top={150} title="Faculty evaluation is now open" body="Deadline: Oct 24. You have 2 teachers left to rate." />
    </div>
  );
};

export const isAirplane = (t: number) => t > AIRPLANE_ON && t < AIRPLANE_OFF;
