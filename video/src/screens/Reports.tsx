import React from 'react';
import { C } from '../theme';
import { iv, pop } from '../anim';
import { Browser, Card } from '../components/Browser';
import { pressScale } from '../components/Phone';
import { sealSrc } from '../components/Ui';
import { ANNEX_C, ANNEX_D, FINAL, SECTIONS, SIGNATORIES, TEACHERS } from '../data';

export type ReportTimes = { annexD: number; fer: number; generate: number };
export const DEFAULT_TIMES: ReportTimes = { annexD: 4.0, fer: 7.5, generate: 8.6 };

const TABS = ['Annex C', 'Annex D', 'FER'];

const Bars: React.FC<{ t: number; at: number; rows: number[]; overall: number; pct: number; foot: string }> = ({ t, at, rows, overall, pct, foot }) => (
  <>
    {SECTIONS.map((s, i) => {
      const g = iv(t, at + 0.1 + i * 0.12, at + 0.8 + i * 0.12);
      return (
        <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 20 }}>
          <div style={{ width: 380, fontSize: 16, fontWeight: 600, color: C.slate }}>{s.key}. {s.name}</div>
          <div style={{ flex: 1, height: 16, borderRadius: 8, background: C.bg, overflow: 'hidden' }}>
            <div style={{ width: `${(rows[i] / 5) * 100 * g}%`, height: '100%', borderRadius: 8, background: `linear-gradient(90deg, ${C.forest}, ${C.emerald})` }} />
          </div>
          <div style={{ width: 60, textAlign: 'right', fontSize: 18, fontWeight: 800, color: C.ink }}>{(rows[i] * g).toFixed(2)}</div>
        </div>
      );
    })}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 26, paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 15, color: C.muted }}>{foot}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: C.forest }}>
        Mean {overall.toFixed(2)} · {pct.toFixed(1)}%
      </div>
    </div>
  </>
);

const Pdf: React.FC<{ t: number }> = ({ t }) => {
  const f = TEACHERS[1];
  const Sign: React.FC<{ label: string; name: string; role: string }> = ({ label, name, role }) => (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 11, color: C.muted }}>{label}</div>
      <div style={{ marginTop: 26, borderTop: `1.5px solid ${C.ink}`, paddingTop: 4, fontSize: 12.5, fontWeight: 800, color: C.ink, textAlign: 'center' }}>{name}</div>
      <div style={{ fontSize: 11, color: C.muted, textAlign: 'center' }}>{role}</div>
    </div>
  );
  const row = (k: string, v: string, bold = false) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 10px', borderBottom: `1px solid ${C.border}`, fontSize: 13, fontWeight: bold ? 800 : 500, color: C.ink }}>
      <span>{k}</span>
      <span>{v}</span>
    </div>
  );
  return (
    <div style={{ width: 500, height: 690, background: C.white, borderRadius: 6, padding: '30px 34px', boxShadow: '0 30px 80px rgba(15,23,42,0.35)', opacity: Math.min(1, t * 4) }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, borderBottom: `2px solid ${C.forest}`, paddingBottom: 12 }}>
        <img src={sealSrc()} style={{ width: 54, height: 54 }} />
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.forest, letterSpacing: 0.5 }}>NORTHWEST SAMAR STATE UNIVERSITY</div>
          <div style={{ fontSize: 11.5, color: C.muted }}>Office of Faculty Evaluation · CHED CMO No. 19, s. 2025</div>
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: 18, fontSize: 18, fontWeight: 800, color: C.ink, letterSpacing: 1 }}>FACULTY EVALUATION REPORT</div>
      <div style={{ textAlign: 'center', fontSize: 12, color: C.muted, marginTop: 2 }}>1st Semester, School Year 2026–2027</div>
      <div style={{ marginTop: 18, fontSize: 13, color: C.slate, lineHeight: 1.7 }}>
        <div><b>Faculty:</b> {f.teacher}</div>
        <div><b>College:</b> College of Computing and Information Sciences</div>
      </div>
      <div style={{ marginTop: 14, border: `1px solid ${C.border}`, borderRadius: 6 }}>
        {row('Student Evaluation of Teachers (SET)', `${ANNEX_C.pct.toFixed(1)}%`)}
        {row("Supervisor's Evaluation of Faculty (SEF)", `${ANNEX_D.pct.toFixed(1)}%`)}
        {row('Final weighted rating', `${FINAL.pct.toFixed(1)}%`, true)}
        {row('Remarks', FINAL.remarks, true)}
      </div>
      <div style={{ display: 'flex', gap: 30, marginTop: 44 }}>
        <Sign label="Prepared by:" name={SIGNATORIES.prepared.name} role={SIGNATORIES.prepared.role} />
        <Sign label="Reviewed by:" name={SIGNATORIES.reviewed.name} role={SIGNATORIES.reviewed.role} />
      </div>
    </div>
  );
};

// Reports & Analytics: Annex C, Annex D, FER, then the generated PDF.
export const ReportsView: React.FC<{ t: number; width: number; height: number; times?: ReportTimes; showPdf?: boolean }> = ({
  t, width, height, times = DEFAULT_TIMES, showPdf = true,
}) => {
  const tab = t >= times.fer ? 2 : t >= times.annexD ? 1 : 0;
  const tabAt = [0, times.annexD, times.fer][tab];
  const f = TEACHERS[1];
  const pdfP = pop(t, times.generate + 0.35, 30, 18);
  return (
    <div style={{ position: 'relative', width, height }}>
      <Browser width={width} height={height} active="Reports & Analytics">
        <div style={{ padding: '26px 32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: C.ink }}>Reports & Analytics</div>
              <div style={{ fontSize: 15, color: C.muted, marginTop: 2 }}>{f.teacher} · CCIS · 1st Sem SY 2026–2027</div>
            </div>
            <div style={{ display: 'flex', gap: 8, background: C.white, padding: 6, borderRadius: 12, border: `1px solid ${C.border}` }}>
              {TABS.map((x, i) => (
                <div key={x} style={{ padding: '10px 22px', borderRadius: 8, fontSize: 15, fontWeight: 700, background: i === tab ? C.forest : 'transparent', color: i === tab ? C.white : C.muted }}>
                  {x}
                </div>
              ))}
            </div>
          </div>
          <Card style={{ marginTop: 22, padding: '24px 30px', opacity: iv(t, tabAt, tabAt + 0.3), transform: `translateY(${iv(t, tabAt, tabAt + 0.35, 14, 0)}px)` }}>
            {tab === 0 && (
              <>
                <div style={{ fontSize: 20, fontWeight: 800, color: C.ink }}>Annex C · Summary of Student Evaluation of Teachers (SET)</div>
                <Bars t={t} at={tabAt} rows={ANNEX_C.rows} overall={ANNEX_C.overall} pct={ANNEX_C.pct} foot={`${ANNEX_C.respondents} student respondents · 5-point scale`} />
              </>
            )}
            {tab === 1 && (
              <>
                <div style={{ fontSize: 20, fontWeight: 800, color: C.ink }}>Annex D · Summary of Supervisor's Evaluation of Faculty (SEF)</div>
                <Bars t={t} at={tabAt} rows={ANNEX_D.rows} overall={ANNEX_D.overall} pct={ANNEX_D.pct} foot={`Rated by: ${ANNEX_D.evaluator}`} />
              </>
            )}
            {tab === 2 && (
              <>
                <div style={{ fontSize: 20, fontWeight: 800, color: C.ink }}>Faculty Evaluation Report (FER)</div>
                <div style={{ display: 'flex', gap: 18, marginTop: 20 }}>
                  {[
                    { k: 'SET', v: `${ANNEX_C.pct.toFixed(1)}%` },
                    { k: 'SEF', v: `${ANNEX_D.pct.toFixed(1)}%` },
                    { k: 'Final weighted rating', v: `${FINAL.pct.toFixed(1)}%` },
                  ].map((x, i) => (
                    <div key={x.k} style={{ flex: 1, padding: '18px 20px', borderRadius: 12, background: i === 2 ? 'rgba(5,150,105,0.1)' : C.bg }}>
                      <div style={{ fontSize: 14, color: C.muted, fontWeight: 600 }}>{x.k}</div>
                      <div style={{ fontSize: 34, fontWeight: 800, color: i === 2 ? C.forest : C.ink, marginTop: 4 }}>{x.v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
                  <div style={{ fontSize: 16, color: C.slate }}>
                    Remarks: <b style={{ color: C.forest }}>{FINAL.remarks}</b>
                  </div>
                  <div style={{ padding: '14px 26px', borderRadius: 12, background: C.forest, color: C.white, fontSize: 16, fontWeight: 700, transform: `scale(${pressScale(t, times.generate)})`, boxShadow: `0 0 0 ${6 * (1 - iv(t, times.generate, times.generate + 0.6))}px rgba(5,150,105,0.3)` }}>
                    Generate FER · Export PDF
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      </Browser>
      {showPdf && t > times.generate + 0.3 && (
        <div style={{ position: 'absolute', right: 60, top: 40 + (1 - pdfP) * 500, transform: `rotate(${(1 - pdfP) * 4}deg)` }}>
          <Pdf t={t - times.generate - 0.3} />
        </div>
      )}
    </div>
  );
};
