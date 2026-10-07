import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, fontFamily } from './theme';
import { iv, pop } from './anim';
import { Scene, Place } from './components/Scene';
import { DarkBg, Fill, GreenBg, LightBg, Seal } from './components/Ui';
import { Phone } from './components/Phone';
import { PaperPile, Splash } from './screens/Props';
import { SignInScreens } from './screens/SignIn';
import { EvaluateScreens } from './screens/Evaluate';
import { LiveDashboard } from './screens/Admin';
import { ReportsView } from './screens/Reports';
import { Music } from './Main';

export const SHORT_SECONDS = 30;

// Big burned-in caption; most people watch muted.
const Cap: React.FC<{ t: number; text: string; top?: number; dark?: boolean }> = ({ t, text, top = 190, dark }) => (
  <div style={{ position: 'absolute', top, left: 70, right: 70, display: 'flex', justifyContent: 'center', opacity: iv(t, 0, 0.3), transform: `scale(${0.85 + 0.15 * pop(t, 0, 30, 13)})` }}>
    <div style={{ background: dark ? C.white : C.forest, color: dark ? C.forest : C.white, fontSize: 66, fontWeight: 800, lineHeight: 1.15, textAlign: 'center', padding: '26px 40px', borderRadius: 28, letterSpacing: -1, textWrap: 'balance', boxShadow: '0 20px 50px rgba(0,0,0,0.25)' }}>
      {text}
    </div>
  </div>
);

const PhoneAt: React.FC<{ t: number; children: React.ReactNode }> = ({ t, children }) => (
  <Place x={(1080 - 400 * 1.5) / 2} y={560 + iv(t, -0.2, 0.3, 40, 0)} scale={1.5}>
    <Phone darkStatus>{children}</Phone>
  </Place>
);

const SCENES: { start: number; dur: number; render: (t: number) => React.ReactNode }[] = [
  {
    start: 0, dur: 3,
    render: (t) => (
      <>
        <DarkBg />
        <Place x={60} y={620} scale={1.4 + t * 0.06}><PaperPile t={t * 2.2} count={12} /></Place>
        <Cap t={t} text="Still evaluating teachers on paper?" dark />
      </>
    ),
  },
  {
    start: 3, dur: 3,
    render: (t) => (
      <>
        <LightBg />
        <PhoneAt t={t}><Splash t={t} /></PhoneAt>
        <Cap t={t - 0.2} text="There's an app for that." />
      </>
    ),
  },
  {
    start: 6, dur: 6,
    render: (t) => (
      <>
        <LightBg />
        <PhoneAt t={t}><SignInScreens t={t * 1.75} /></PhoneAt>
        <Cap t={t} text="Sign in with your Student ID" />
      </>
    ),
  },
  {
    start: 12, dur: 6,
    render: (t) => (
      <>
        <LightBg />
        <PhoneAt t={t}><EvaluateScreens t={t * 1.9} /></PhoneAt>
        <Cap t={t} text="Rate your teachers in minutes, anonymously" />
      </>
    ),
  },
  {
    start: 18, dur: 5,
    render: (t) => (
      <>
        <LightBg />
        <Place x={25} y={600} scale={0.78}><LiveDashboard t={t} width={1320} height={760} bumps={[0.6, 1.3, 1.9, 2.6, 3.2, 3.9]} /></Place>
        <Cap t={t} text="Results reach the office instantly" />
      </>
    ),
  },
  {
    start: 23, dur: 4,
    render: (t) => (
      <>
        <LightBg />
        <Place x={25} y={500} scale={0.64}><ReportsView t={t} width={1610} height={1260} times={{ annexD: 1.0, fer: 1.9, generate: 2.4 }} /></Place>
        <Cap t={t} text="CMO No. 19 reports, ready to print" />
      </>
    ),
  },
  {
    start: 27, dur: 3,
    render: (t) => (
      <>
        <GreenBg />
        <Fill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: C.white }}>
          <Seal size={340} style={{ transform: `scale(${pop(t, 0.05, 30, 12)})` }} />
          {['Rate.', 'Reflect.', 'Rise.'].map((w, i) => (
            <div key={w} style={{ fontSize: 150, fontWeight: 800, color: C.mint, lineHeight: 1.05, marginTop: i === 0 ? 70 : 0, letterSpacing: -3, opacity: iv(t, 0.5 + i * 0.4, 0.8 + i * 0.4), transform: `translateX(${iv(t, 0.5 + i * 0.4, 0.9 + i * 0.4, -60, 0)}px)` }}>
              {w}
            </div>
          ))}
          <div style={{ marginTop: 60, fontSize: 38, fontWeight: 600, opacity: iv(t, 1.5, 1.9) }}>NwSSU Faculty Evaluation System</div>
        </Fill>
      </>
    ),
  },
];

export const NwssuShort: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg, fontFamily }}>
    {SCENES.map((s, i) => (
      <Scene key={s.start} start={s.start} dur={s.dur} render={s.render} first={i === 0} last={i === SCENES.length - 1} />
    ))}
    <Music seconds={SHORT_SECONDS} volume={0.6} />
  </AbsoluteFill>
);
