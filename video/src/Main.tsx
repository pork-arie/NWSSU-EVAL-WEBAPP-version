import React from 'react';
import { AbsoluteFill, Audio, interpolate, staticFile, useVideoConfig } from 'remotion';
import { C, fontFamily } from './theme';
import { iv, pop } from './anim';
import { Scene, Place } from './components/Scene';
import { Caption, Chip, DarkBg, Fill, GreenBg, LightBg, Seal, SideText } from './components/Ui';
import { Phone, Screen, Tap, pressScale, SCREEN_W } from './components/Phone';
import { Calculator, Calendar, PaperPile, Splash } from './screens/Props';
import { SignInScreens } from './screens/SignIn';
import { EvalHeader, EvaluateScreens, Success } from './screens/Evaluate';
import { SefScreens } from './screens/Sef';
import { OfflineScreens, isAirplane } from './screens/Offline';
import { LiveDashboard } from './screens/Admin';
import { ReportsView } from './screens/Reports';
import { TEACHERS } from './data';

export const MAIN_SECONDS = 90;

const PHONE_X = 330;
const PHONE_Y = 118;
const PHONE_S = 0.96;
const TEXT_X = 900;

const Headline: React.FC<{ t: number; chip: string; title: string; at?: number }> = ({ t, chip, title, at = 0.2 }) => (
  <div style={{ position: 'absolute', left: 120, top: 64, display: 'flex', alignItems: 'center', gap: 28, opacity: iv(t, at, at + 0.5), transform: `translateY(${iv(t, at, at + 0.6, -20, 0)}px)` }}>
    <Chip>{chip}</Chip>
    <div style={{ fontSize: 62, fontWeight: 800, color: C.forest, letterSpacing: -1.2 }}>{title}</div>
  </div>
);

const Hook = (t: number) => (
  <>
    <DarkBg />
    <Fill style={{ transform: `scale(${1 + t * 0.012})` }}>
      <Place x={980} y={250}>
        <PaperPile t={t} />
      </Place>
      <div style={{ position: 'absolute', left: 160, top: 400, color: C.white, fontSize: 104, fontWeight: 800, letterSpacing: -2, opacity: iv(t, 1.0, 1.6), transform: `translateY(${iv(t, 1.0, 1.7, 30, 0)}px)` }}>
        Every semester…
      </div>
    </Fill>
    <Caption t={t} text="Every semester, thousands of paper evaluation forms." from={0.6} />
  </>
);

const Problem = (t: number) => (
  <>
    <DarkBg />
    <div style={{ position: 'absolute', top: 110, left: 0, right: 0, textAlign: 'center', color: C.white, fontSize: 92, fontWeight: 800, letterSpacing: -2, opacity: iv(t, 0.2, 0.7) }}>
      Weeks of tallying
    </div>
    <Place x={470} y={330} style={{ opacity: iv(t, 0.3, 0.8), transform: `translateY(${iv(t, 0.3, 0.9, 40, 0)}px)` }}>
      <Calculator t={t} />
    </Place>
    <Place x={1080} y={340} style={{ opacity: iv(t, 0.6, 1.1) }}>
      <Calendar t={t} />
    </Place>
    {[
      { label: 'Lost forms', at: 3.0, x: 870, y: 360 },
      { label: 'Late results', at: 4.0, x: 880, y: 700 },
    ].map((c) => (
      <div key={c.label} style={{ position: 'absolute', left: c.x, top: c.y, transform: `scale(${pop(t, c.at)}) rotate(-4deg)`, background: C.danger, color: C.white, fontSize: 30, fontWeight: 800, padding: '12px 24px', borderRadius: 12, boxShadow: '0 12px 30px rgba(0,0,0,0.4)' }}>
        {c.label}
      </div>
    ))}
    <Caption t={t} text="Weeks of tallying. Lost forms. Results that arrive too late to help anyone." />
  </>
);

const Reveal = (t: number) => {
  const rise = pop(t, 0.1, 30, 16);
  return (
    <>
      <LightBg />
      <Place x={PHONE_X} y={PHONE_Y + (1 - rise) * 700} scale={PHONE_S}>
        <Phone darkStatus>
          <Splash t={t - 0.3} />
        </Phone>
      </Place>
      <div style={{ position: 'absolute', left: TEXT_X, top: 360, opacity: iv(t, 1.4, 1.9), transform: `translateY(${iv(t, 1.4, 2.0, 30, 0)}px)` }}>
        <div style={{ fontSize: 40, fontWeight: 600, color: C.emerald }}>Meet the</div>
        <div style={{ fontSize: 92, fontWeight: 800, color: C.forest, lineHeight: 1.04, letterSpacing: -2, marginTop: 8 }}>
          NwSSU Faculty<br />Evaluation System
        </div>
        <div style={{ fontSize: 34, color: C.muted, marginTop: 24, opacity: iv(t, 2.4, 2.9) }}>Faculty evaluation, from paper to phone.</div>
      </div>
      <Caption t={t} text="Meet the NwSSU Faculty Evaluation System." from={0.8} />
    </>
  );
};

const PhoneScene: React.FC<{ t: number; children: React.ReactNode; airplane?: boolean; darkStatus?: boolean }> = ({ t, children, airplane, darkStatus = true }) => (
  <Place x={PHONE_X} y={PHONE_Y + iv(t, -0.2, 0.4, 30, 0)} scale={PHONE_S}>
    <Phone airplane={airplane} darkStatus={darkStatus}>{children}</Phone>
  </Place>
);

const SignIn = (t: number) => (
  <>
    <LightBg />
    <PhoneScene t={t} darkStatus={t > 7.3}>
      <SignInScreens t={t} />
    </PhoneScene>
    <SideText t={t} chip="EASY" title={<>Sign in with your<br />Student ID</>} sub="Students see every teacher they need to rate this semester." style={{ left: TEXT_X, top: 330 }} />
    <Caption t={t} text="Students sign in with their ID and see every teacher they need to rate this semester." />
  </>
);

const Evaluate = (t: number) => (
  <>
    <LightBg />
    <PhoneScene t={t}>
      <EvaluateScreens t={t} />
    </PhoneScene>
    <SideText t={t} chip="SECURE & ANONYMOUS" title={<>Anonymous.<br />One per class.</>} sub="A few taps per teacher. Faculty never see who rated them." style={{ left: TEXT_X, top: 330 }} />
    <Caption t={t} text="A few taps per teacher. Every answer is anonymous, and each class can be rated only once." />
  </>
);

const MiniSubmit: React.FC<{ t: number; at: number }> = ({ t, at }) => {
  const x = TEACHERS[3];
  return (
    <>
      <Screen t={t} from={-1} to={at + 0.35}>
        <EvalHeader title="Evaluate" name={x.teacher} sub={`${x.code} · ${x.subject}`} />
        <div style={{ position: 'absolute', top: 200, left: 18, right: 18, background: C.white, borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.emerald, letterSpacing: 1 }}>READY TO SUBMIT</div>
          <div style={{ fontSize: 16, color: C.ink, marginTop: 8, fontWeight: 600 }}>15 of 15 statements answered</div>
        </div>
        <div style={{ position: 'absolute', left: 18, right: 18, bottom: 26, height: 58, borderRadius: 14, background: C.forest, color: C.white, fontSize: 19, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pressScale(t, at)})` }}>
          Submit evaluation
        </div>
        <Tap t={t} at={at} x={SCREEN_W / 2} y={725} />
      </Screen>
      <Screen t={t} from={at + 0.35} to={99}>
        <Success t={t - at - 0.35} title="Evaluation submitted" sub="Sent to the evaluation office." />
      </Screen>
    </>
  );
};

const Live = (t: number) => (
  <>
    <LightBg />
    <Headline t={t} chip="FAST" title="Results in real time" />
    <Place x={110} y={250 + iv(t, -0.2, 0.4, 30, 0)} scale={0.78}>
      <Phone darkStatus>
        <MiniSubmit t={t} at={1.1} />
      </Phone>
    </Place>
    <Place x={500} y={220} style={{ opacity: iv(t, 0.1, 0.5) }}>
      <LiveDashboard t={t} width={1320} height={720} />
    </Place>
    <Caption t={t} text="The moment it's submitted, the evaluation office sees it. No tallying." />
  </>
);

const Sef = (t: number) => (
  <>
    <LightBg />
    <PhoneScene t={t}>
      <SefScreens t={t} />
    </PhoneScene>
    <SideText t={t} chip="SUPERVISORS" title={<>Supervisor's Evaluation<br />of Faculty</>} titleSize={70} sub="Deans and program chairs complete the SEF on the same app." style={{ left: TEXT_X, top: 330 }} />
    <Caption t={t} text="Deans and program chairs complete the SEF on the same app." />
  </>
);

const Reports = (t: number) => (
  <>
    <LightBg />
    <Headline t={t} chip="CMO NO. 19" title="Annex C · Annex D · FER" />
    <Place x={160} y={210} style={{ opacity: iv(t, 0.1, 0.5) }}>
      <ReportsView t={t} width={1600} height={720} />
    </Place>
    <Caption t={t} text="Weighted SET, SEF, Annex C, Annex D and the FER are computed for you, following CHED CMO No. 19, ready to print." />
  </>
);

const Reliable = (t: number) => (
  <>
    <LightBg />
    <PhoneScene t={t} airplane={isAirplane(t)}>
      <OfflineScreens t={t} />
    </PhoneScene>
    <div style={{ position: 'absolute', left: TEXT_X, top: 330 }}>
      <SideText t={t} chip="RELIABLE" title="Works on weak signal" style={{ position: 'relative' }} />
      <div style={{ marginTop: 22, fontSize: 78, fontWeight: 800, color: C.emerald, letterSpacing: -1.5, opacity: iv(t, 6.6, 7.1), transform: `translateY(${iv(t, 6.6, 7.2, 30, 0)}px)` }}>
        Reminds you on time
      </div>
    </div>
    <Caption t={t} text="Weak signal? It sends when you're back online, and reminders keep everyone on time." />
  </>
);

const Close = (t: number) => {
  const words = ['Rate.', 'Reflect.', 'Rise.'];
  return (
    <>
      <GreenBg />
      <Fill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: C.white }}>
        <Seal size={250} style={{ transform: `scale(${pop(t, 0.2, 30, 12)})` }} />
        <div style={{ marginTop: 40, fontSize: 52, fontWeight: 700, opacity: iv(t, 1.0, 1.5) }}>NwSSU Faculty Evaluation System</div>
        <div style={{ display: 'flex', gap: 34, marginTop: 26 }}>
          {words.map((w, i) => (
            <div key={w} style={{ fontSize: 110, fontWeight: 800, color: C.mint, letterSpacing: -2, opacity: iv(t, 2.2 + i * 0.6, 2.6 + i * 0.6), transform: `translateY(${iv(t, 2.2 + i * 0.6, 2.8 + i * 0.6, 40, 0)}px)` }}>
              {w}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 50, fontSize: 30, fontWeight: 500, opacity: iv(t, 5.0, 5.6) * 0.9, textAlign: 'center', lineHeight: 1.5 }}>
          A capstone project of BSIT, CCIS
          <br />
          Northwest Samar State University
        </div>
      </Fill>
      <Fill style={{ background: '#000', opacity: iv(t, 9.0, 10) }} />
    </>
  );
};

const SCENES: { start: number; dur: number; render: (t: number) => React.ReactNode }[] = [
  { start: 0, dur: 7, render: Hook },
  { start: 7, dur: 7, render: Problem },
  { start: 14, dur: 6, render: Reveal },
  { start: 20, dur: 11, render: SignIn },
  { start: 31, dur: 12, render: Evaluate },
  { start: 43, dur: 8, render: Live },
  { start: 51, dur: 7, render: Sef },
  { start: 58, dur: 12, render: Reports },
  { start: 70, dur: 10, render: Reliable },
  { start: 80, dur: 10, render: Close },
];

export const Music: React.FC<{ seconds: number; volume?: number }> = ({ seconds, volume = 0.55 }) => {
  const { fps } = useVideoConfig();
  return (
    <Audio
      src={staticFile('music.mp3')}
      volume={(f) => interpolate(f, [0, fps * 1.5, (seconds - 3) * fps, seconds * fps], [0, volume, volume, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
    />
  );
};

export const NwssuPromo: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg, fontFamily }}>
    {SCENES.map((s, i) => (
      <Scene key={s.start} start={s.start} dur={s.dur} render={s.render} first={i === 0} last={i === SCENES.length - 1} />
    ))}
    <Music seconds={MAIN_SECONDS} />
  </AbsoluteFill>
);
