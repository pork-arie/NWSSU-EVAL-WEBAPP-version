import React from 'react';
import { C } from '../theme';
import { caret, iv, pop, typed } from '../anim';
import { Screen, Tap, pressScale, SCREEN_W } from '../components/Phone';
import { Back, Check, Lock } from '../components/Icons';
import { RatingRow } from '../components/Ui';
import { SET_ITEMS, TEACHERS } from '../data';

export const EvalHeader: React.FC<{ title: string; name: string; sub: string; badge?: string }> = ({ title, name, sub, badge = 'Anonymous' }) => (
  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 178, background: `linear-gradient(135deg, ${C.forest}, ${C.emerald})`, color: C.white, zIndex: 5 }}>
    <div style={{ position: 'absolute', top: 54, left: 18, display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 600, opacity: 0.9 }}>
      <Back size={20} color={C.white} /> {title}
    </div>
    <div style={{ position: 'absolute', top: 88, left: 26, right: 26 }}>
      <div style={{ fontSize: 22, fontWeight: 800 }}>{name}</div>
      <div style={{ fontSize: 13, opacity: 0.85, marginTop: 2 }}>{sub}</div>
    </div>
    <div style={{ position: 'absolute', top: 52, right: 18, display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, padding: '5px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.18)' }}>
      <Lock size={13} color={C.white} /> {badge}
    </div>
  </div>
);

export const ItemCard: React.FC<{ n: number; text: string; value: number; top: number; active?: boolean }> = ({ n, text, value, top, active }) => (
  <div style={{ position: 'absolute', top, left: 18, right: 18, height: 170, background: C.white, borderRadius: 16, padding: '18px 18px', border: `2px solid ${active ? 'rgba(5,150,105,0.45)' : 'transparent'}`, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
    <div style={{ fontSize: 12, fontWeight: 700, color: C.emerald, letterSpacing: 1 }}>STATEMENT {n}</div>
    <div style={{ fontSize: 16, fontWeight: 600, color: C.ink, marginTop: 6, lineHeight: 1.35, height: 44 }}>{text}</div>
    <div style={{ position: 'absolute', left: 18, bottom: 18 }}><RatingRow value={value} size={50} gap={13} /></div>
  </div>
);

export const Success: React.FC<{ t: number; title: string; sub: string }> = ({ t, title, sub }) => {
  const s = pop(t, 0.1);
  return (
    <div style={{ position: 'absolute', inset: 0, background: C.white, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 30, textAlign: 'center' }}>
      <div style={{ width: 132, height: 132, borderRadius: 66, background: C.emerald, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${s})`, boxShadow: '0 16px 40px rgba(5,150,105,0.35)' }}>
        <Check size={74} color={C.white} stroke={3} />
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: C.forest, marginTop: 34, opacity: iv(t, 0.4, 0.7) }}>{title}</div>
      <div style={{ fontSize: 16, color: C.muted, marginTop: 10, lineHeight: 1.45, whiteSpace: 'pre-line', opacity: iv(t, 0.6, 0.9) }}>{sub}</div>
    </div>
  );
};

// x of rating circle n (1..5) on the screen.
export const circleX = (n: number) => 18 + 2 + 18 + 25 + (n - 1) * 63;

const PICKS = [5, 4, 5, 5];
const TAPS = [1.0, 2.0, 3.0, 4.0];
const CARD_TOP = 200;
const STEP = 186;
const COMMENT = 'Very clear lessons and helpful examples.';

// Rating one teacher, then the success screen. Runs about 12 s.
export const EvaluateScreens: React.FC<{ t: number }> = ({ t }) => {
  const teacher = TEACHERS[1];
  let scroll = 0;
  TAPS.forEach((at) => (scroll += iv(t, at + 0.3, at + 0.75, 0, STEP)));
  const current = TAPS.filter((at) => t > at + 0.5).length;
  const commentTop = CARD_TOP + SET_ITEMS.length * STEP;
  return (
    <>
      <Screen t={t} from={-1} to={8.6}>
        <EvalHeader title="Evaluate" name={teacher.teacher} sub={`${teacher.code} · ${teacher.subject}`} />
        <div style={{ position: 'absolute', inset: 0, transform: `translateY(${-scroll}px)` }}>
          {SET_ITEMS.map((it, i) => (
            <ItemCard key={it.n} n={it.n} text={it.text} value={t > TAPS[i] + 0.05 ? PICKS[i] : 0} top={CARD_TOP + i * STEP} active={i === current} />
          ))}
          <div style={{ position: 'absolute', top: commentTop, left: 18, right: 18, background: C.white, borderRadius: 16, padding: 18, border: `2px solid ${t > 5 && t < 7.8 ? 'rgba(5,150,105,0.45)' : 'transparent'}` }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.emerald, letterSpacing: 1 }}>COMMENT (OPTIONAL)</div>
            <div style={{ fontSize: 16, color: C.ink, marginTop: 10, minHeight: 72, lineHeight: 1.4 }}>
              {typed(COMMENT, t, 5.2, 7.4)}
              {t > 5 && t < 7.8 ? caret(t) : ''}
            </div>
          </div>
        </div>
        <div style={{ position: 'absolute', left: 18, right: 18, bottom: 26, height: 58, borderRadius: 14, background: t > 7.6 ? C.forest : '#94a3b8', color: C.white, fontSize: 19, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pressScale(t, 8.2)})`, zIndex: 6 }}>
          Submit evaluation
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 92, textAlign: 'center', fontSize: 12, color: C.muted, zIndex: 6 }}>
          {Math.min(15, 10 + current)} of 15 answered
        </div>
        {TAPS.map((at, i) => (
          <Tap key={at} t={t} at={at} x={circleX(PICKS[i])} y={CARD_TOP + 127} />
        ))}
        <Tap t={t} at={5.0} x={SCREEN_W / 2} y={CARD_TOP + 60} />
        <Tap t={t} at={8.2} x={SCREEN_W / 2} y={780 - 55} />
      </Screen>
      <Screen t={t} from={8.6} to={99}>
        <Success t={t - 8.6} title="Evaluation submitted" sub={'Thank you! Your answers are anonymous.\nEach class can be rated only once.'} />
      </Screen>
    </>
  );
};
