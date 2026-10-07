import React from 'react';
import { C } from '../theme';
import { caret, iv, typed } from '../anim';
import { Screen, Tap, pressScale, SCREEN_W } from '../components/Phone';
import { Eye, EyeOff } from '../components/Icons';
import { sealSrc } from '../components/Ui';
import { STUDENT, TEACHERS } from '../data';

const Field: React.FC<{ label: string; value: string; focused?: boolean; right?: React.ReactNode; top: number }> = ({ label, value, focused, right, top }) => (
  <div style={{ position: 'absolute', left: 28, right: 28, top }}>
    <div style={{ fontSize: 14, fontWeight: 600, color: C.slate, marginBottom: 8 }}>{label}</div>
    <div style={{ height: 54, borderRadius: 12, background: C.white, border: `2px solid ${focused ? C.emerald : C.border}`, display: 'flex', alignItems: 'center', padding: '0 16px', fontSize: 19, color: C.ink, fontWeight: 500, letterSpacing: 0.5 }}>
      <span style={{ flex: 1 }}>{value}</span>
      {right}
    </div>
  </div>
);

const Button: React.FC<{ label: string; top: number; t: number; at: number }> = ({ label, top, t, at }) => (
  <div style={{ position: 'absolute', left: 28, right: 28, top, height: 56, borderRadius: 14, background: C.forest, color: C.white, fontSize: 19, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pressScale(t, at)})` }}>
    {label}
  </div>
);

const dots = (n: number) => '•'.repeat(n);

// Sign-in, choose a password, then the student dashboard. Runs about 11 s.
export const SignInScreens: React.FC<{ t: number }> = ({ t }) => {
  const id = typed(STUDENT.id, t, 0.8, 2.2);
  const pw = Math.round(iv(t, 2.5, 3.3, 0, 10));
  const newPw = typed('Rise2026!', t, 4.9, 6.0);
  const shown = t > 6.45;
  return (
    <>
      <Screen t={t} from={0} to={4.5} bg={C.white}>
        <div style={{ position: 'absolute', top: 92, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <img src={sealSrc()} style={{ width: 96, height: 96 }} />
        </div>
        <div style={{ position: 'absolute', top: 206, left: 28, right: 28, textAlign: 'center' }}>
          <div style={{ fontSize: 27, fontWeight: 800, color: C.forest }}>Welcome back</div>
          <div style={{ fontSize: 15, color: C.muted, marginTop: 6 }}>Sign in with your Student ID</div>
        </div>
        <Field top={300} label="Student ID" value={id + (t > 0.6 && t < 2.4 ? caret(t) : '')} focused={t > 0.6 && t < 2.4} />
        <Field top={400} label="Password" value={dots(pw) + (t > 2.4 && t < 3.6 ? caret(t) : '')} focused={t > 2.4 && t < 3.6} />
        <Button top={520} label="Sign in" t={t} at={3.9} />
        <Tap t={t} at={3.9} x={SCREEN_W / 2} y={548} />
      </Screen>

      <Screen t={t} from={4.5} to={7.5} bg={C.white}>
        <div style={{ position: 'absolute', top: 96, left: 28, right: 28 }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: C.forest, lineHeight: 1.2 }}>Choose a new password</div>
          <div style={{ fontSize: 15, color: C.muted, marginTop: 10, lineHeight: 1.45 }}>Your password is still your Student ID. Make it yours before you continue.</div>
        </div>
        <Field
          top={250}
          label="New password"
          value={(shown ? newPw : dots(newPw.length)) + (t < 6.1 ? caret(t) : '')}
          focused
          right={shown ? <Eye size={24} color={C.emerald} /> : <EyeOff size={24} color={C.muted} />}
        />
        <div style={{ position: 'absolute', top: 350, left: 28, fontSize: 14, color: C.success, fontWeight: 600, opacity: iv(t, 6.0, 6.3) }}>✓ Strong password</div>
        <Button top={420} label="Save password" t={t} at={7.1} />
        <Tap t={t} at={6.45} x={SCREEN_W - 58} y={304} />
        <Tap t={t} at={7.1} x={SCREEN_W / 2} y={448} />
      </Screen>

      <Screen t={t} from={7.5} to={99}>
        <Dashboard t={t - 7.5} evaluated={0} />
      </Screen>
    </>
  );
};

export const Dashboard: React.FC<{ t: number; evaluated: number }> = ({ t, evaluated }) => (
  <>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 210, background: `linear-gradient(135deg, ${C.forest}, ${C.emerald})`, borderRadius: '0 0 28px 28px' }}>
      <div style={{ position: 'absolute', top: 70, left: 26, color: C.white }}>
        <div style={{ fontSize: 15, opacity: 0.8 }}>Good morning,</div>
        <div style={{ fontSize: 28, fontWeight: 800 }}>{STUDENT.name}</div>
        <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>{STUDENT.section} · {STUDENT.term}</div>
      </div>
    </div>
    <div style={{ position: 'absolute', top: 172, left: 22, right: 22, display: 'flex', gap: 12 }}>
      {[
        { k: 'Evaluated', v: evaluated, c: C.emerald },
        { k: 'Remaining', v: TEACHERS.length - evaluated, c: C.warning },
      ].map((s) => (
        <div key={s.k} style={{ flex: 1, background: C.white, borderRadius: 16, padding: '14px 16px', boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}>
          <div style={{ fontSize: 30, fontWeight: 800, color: s.c }}>{s.v}</div>
          <div style={{ fontSize: 13, color: C.muted, fontWeight: 600 }}>{s.k}</div>
        </div>
      ))}
    </div>
    <div style={{ position: 'absolute', top: 284, left: 24, fontSize: 16, fontWeight: 700, color: C.slate }}>Your teachers this semester</div>
    {TEACHERS.map((x, i) => {
      const a = 0.25 + i * 0.18;
      const done = i < evaluated;
      return (
        <div
          key={x.code}
          style={{
            position: 'absolute', top: 318 + i * 92, left: 20, right: 20, height: 80, background: C.white, borderRadius: 14,
            display: 'flex', alignItems: 'center', padding: '0 16px', gap: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            opacity: iv(t, a, a + 0.35), transform: `translateY(${iv(t, a, a + 0.4, 24, 0)}px)`,
          }}
        >
          <div style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(5,150,105,0.12)', color: C.forest, fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', lineHeight: 1.1 }}>
            {x.code.split(' ')[0]}<br />{x.code.split(' ')[1]}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>{x.teacher}</div>
            <div style={{ fontSize: 13, color: C.muted }}>{x.subject}</div>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, padding: '5px 10px', borderRadius: 999, background: done ? 'rgba(22,163,74,0.12)' : 'rgba(217,119,6,0.12)', color: done ? C.success : C.warning }}>
            {done ? 'Done' : 'Pending'}
          </div>
        </div>
      );
    })}
  </>
);
