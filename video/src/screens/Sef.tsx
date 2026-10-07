import React from 'react';
import { C } from '../theme';
import { iv } from '../anim';
import { Screen, Tap, pressScale, SCREEN_W } from '../components/Phone';
import { EvalHeader, ItemCard, Success, circleX } from './Evaluate';
import { SEF_ITEMS, TEACHERS } from '../data';

const FACULTY = [
  { name: TEACHERS[0].teacher, done: true },
  { name: TEACHERS[1].teacher, done: true },
  { name: TEACHERS[2].teacher, done: false },
  { name: TEACHERS[3].teacher, done: false },
];

const PICKS = [5, 4, 5];
const TAPS = [3.0, 3.8, 4.6];
const STEP = 186;

// Supervisor's SEF list, rating one faculty member, then done. Runs about 7 s.
export const SefScreens: React.FC<{ t: number }> = ({ t }) => {
  let scroll = 0;
  TAPS.forEach((at) => (scroll += iv(t, at + 0.25, at + 0.6, 0, STEP)));
  const current = TAPS.filter((at) => t > at + 0.4).length;
  return (
    <>
      <Screen t={t} from={-1} to={2.2}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 170, background: `linear-gradient(135deg, ${C.forest}, ${C.emerald})`, color: C.white }}>
          <div style={{ position: 'absolute', top: 66, left: 26, right: 26 }}>
            <div style={{ fontSize: 13, opacity: 0.85, fontWeight: 600, letterSpacing: 1 }}>SUPERVISOR · SEF</div>
            <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>Faculty to evaluate</div>
            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 2 }}>College of Computing and Information Sciences</div>
          </div>
        </div>
        {FACULTY.map((f, i) => (
          <div
            key={f.name}
            style={{
              position: 'absolute', top: 196 + i * 88, left: 18, right: 18, height: 74, background: C.white, borderRadius: 14, display: 'flex',
              alignItems: 'center', padding: '0 16px', gap: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              border: `2px solid ${i === 2 && t > 1.4 ? C.emerald : 'transparent'}`, transform: `scale(${i === 2 ? pressScale(t, 1.6) : 1})`,
            }}
          >
            <div style={{ width: 42, height: 42, borderRadius: 21, background: 'rgba(5,150,105,0.14)', color: C.forest, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>
              {f.name.split(' ').slice(1).map((s) => s[0]).join('')}
            </div>
            <div style={{ flex: 1, fontSize: 15, fontWeight: 700, color: C.ink }}>{f.name}</div>
            <div style={{ fontSize: 12, fontWeight: 700, padding: '5px 10px', borderRadius: 999, background: f.done ? 'rgba(22,163,74,0.12)' : 'rgba(217,119,6,0.12)', color: f.done ? C.success : C.warning }}>
              {f.done ? 'Done' : 'Pending'}
            </div>
          </div>
        ))}
        <Tap t={t} at={1.6} x={SCREEN_W / 2} y={196 + 2 * 88 + 37} />
      </Screen>
      <Screen t={t} from={2.2} to={5.8}>
        <EvalHeader title="SEF" name={FACULTY[2].name} sub="15 CMO criteria (Annex B)" badge="Confidential" />
        <div style={{ position: 'absolute', inset: 0, transform: `translateY(${-scroll}px)` }}>
          {SEF_ITEMS.map((it, i) => (
            <ItemCard key={it.n} n={it.n} text={it.text} value={t > TAPS[i] + 0.05 ? PICKS[i] : 0} top={200 + i * STEP} active={i === current} />
          ))}
        </div>
        <div style={{ position: 'absolute', left: 18, right: 18, bottom: 26, height: 58, borderRadius: 14, background: C.forest, color: C.white, fontSize: 19, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pressScale(t, 5.4)})`, zIndex: 6 }}>
          Submit SEF
        </div>
        {TAPS.map((at, i) => (
          <Tap key={at} t={t} at={at} x={circleX(PICKS[i])} y={327} />
        ))}
        <Tap t={t} at={5.4} x={SCREEN_W / 2} y={725} />
      </Screen>
      <Screen t={t} from={5.8} to={99}>
        <Success t={t - 5.8} title="SEF submitted" sub="Sent straight to the evaluation office." />
      </Screen>
    </>
  );
};
