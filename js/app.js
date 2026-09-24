// app.js - dashboard, evaluation screens, feedback, profile, supervisor SEF.

// ============================================================
// LOADING SKELETONS
// ------------------------------------------------------------
// Each page fetches from Firestore when it opens. On a slow
// connection that used to leave blank space, stray "—" dashes,
// or the previous page's data until the new data arrived.
// These fill each container with placeholders shaped like the
// real content, and the render function writes over them.
// ============================================================
function _skLine(w, h) {
  return '<span class="skeleton sk-line" style="width:' + (w || '100%') + ';height:' + (h || 12) + 'px;"></span>';
}
function _skCard() {
  return '<div class="sk-card">' +
           '<span class="skeleton sk-avatar"></span>' +
           '<div class="sk-lines">' + _skLine('38%', 10) + _skLine('70%', 14) + _skLine('46%', 10) + '</div>' +
           '<span class="skeleton sk-pill"></span>' +
         '</div>';
}
function _skFill(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

function showSkeleton(page) {
  if (page === 'dashboard') {
    ['dashTotalSubjects', 'dashDone', 'dashPending'].forEach(id =>
      _skFill(id, '<span class="skeleton sk-num"></span>'));
    _skFill('dashPeriodInfo', '<div class="sk-stack">' +
      _skLine('30%', 10) + _skLine('55%', 16) + _skLine('30%', 10) + _skLine('45%', 16) +
      _skLine('28%', 10) + _skLine('50%', 16) + '</div>');
    _skFill('dashSubjectList', _skCard() + _skCard() + _skCard());
  }
  if (page === 'evaluate') _skFill('subjectPicker', _skCard() + _skCard() + _skCard());
  if (page === 'history')  _skFill('historyList',   _skCard() + _skCard() + _skCard());
  if (page === 'feedback') _skFill('feedbackList',
    ['', ''].map(() => '<div class="sk-block">' + _skLine('45%', 14) + _skLine('30%', 10) +
                       '<span class="skeleton sk-quote"></span></div>').join(''));
}

// Boot after login: load the published questions, then the data.
async function initApp(isInactive = false) {
  // The forced password change is handled on index.html, before the redirect
  // here. If an account somehow reaches the dashboard still needing it, send
  // it back rather than letting it through - the gate markup is not on this
  // page.
  if (needsPasswordChange(currentStudent)) { goToLogin('Please set a new password before continuing - sign in again to do it.'); return; }

  document.getElementById('app').style.display = 'flex';

  // Placeholders go up the moment the app is visible. Nothing below renders
  // until the question sets have loaded, so on a slow connection the page
  // otherwise sat on its bare markup - stray dashes - for that whole wait.
  if (currentStudent && currentStudent.userType !== 'supervisor') showSkeleton('dashboard');

  await loadPublishedQuestions();

  const isSupervisor = currentStudent.userType === 'supervisor';

  const initials = currentStudent.name
    ? currentStudent.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : (isSupervisor ? 'SV' : 'S');
  document.getElementById('sidebarAvatar').textContent = initials;
  { const mAv = document.getElementById('mobileAvatar'); if (mAv) mAv.textContent = document.getElementById('sidebarAvatar').textContent; }
  document.getElementById('sidebarName').textContent   = currentStudent.name || '—';
  document.getElementById('sidebarDept').textContent   = isSupervisor
    ? `Supervisor · ${currentStudent.dept || 'No department'}`
    : (currentStudent.dept || 'No department');

  if (isInactive && !isSupervisor) {
    const existing = document.getElementById('inactiveAccountBanner');
    if (!existing) {
      const banner = document.createElement('div');
      banner.id = 'inactiveAccountBanner';
      banner.style.cssText = 'background:#fef3c7;border-bottom:2px solid #fde68a;color:#92400e;padding:10px 20px;font-size:0.8rem;text-align:center;font-weight:600;flex-shrink:0;';
      banner.innerHTML = '⚠️ Your account is currently marked <strong>inactive</strong>. Please contact your administrator to reactivate it.';
      document.getElementById('app').prepend(banner);
    }
  }

  if (isSupervisor) {
    await renderSupervisorHome();
    return;
  }

  try {
    await loadStudentData();
    if (window._loadErrors && window._loadErrors.length) {
      showLoadBanner('Some data could not be loaded. Please refresh the page.');
    }
  } catch (e) {
    console.error('Could not load your subjects/evaluations:', e);
    const msg = (e && e.code === 'permission-denied')
      ? 'Your account does not have permission to read this data. Ask your administrator to check the Firestore rules.'
      : 'Could not load your data. Check your connection and refresh.';
    const host = document.getElementById('page-dashboard');
    if (host) {
      const b = document.createElement('div');
      b.className = 'notice-banner error';
      b.style.cssText = 'margin-bottom:16px;padding:12px 16px;border-radius:10px;'
        + 'background:#fef2f2;color:#991b1b;font-size:0.84rem;border:1px solid #fecaca;';
      b.textContent = msg;
      host.prepend(b);
    }
  }
  renderDashboard();
  showPage('dashboard');
}

function supervisedDeptsOf(person) {
  const home = (person && person.dept || '').trim();
  const extra = Array.isArray(person && person.supervisedDepts) ? person.supervisedDepts : [];
  const list = [home].concat(extra.map(d => (d && d.dept || '').trim()));
  return list.filter((d, i) => d && list.indexOf(d) === i);   // non-empty, de-duplicated, home first
}

// Faculty across every department this supervisor chairs (CMO 9.2, 9.3).
async function loadSupervisorData() {
  const myDepts = supervisedDeptsOf(currentStudent);

  const snap = await db.collection('teachers').get();
  deptFaculty = [];
  snap.forEach(doc => {
    const t = doc.data();
    if (t.deleted) return;
    if ((t.facultyType || 'regular') === 'supervisor') return;   // exclude other supervisors
    if (myDepts.indexOf((t.dept || '').trim()) === -1) return;   // any department they oversee
    deptFaculty.push({ ...t, docId: doc.id });
  });
  deptFaculty.sort((a, b) => {
    const da = myDepts.indexOf((a.dept || '').trim());
    const db_ = myDepts.indexOf((b.dept || '').trim());
    if (da !== db_) return da - db_;
    return (a.name || '').localeCompare(b.name || '');
  });

  const myUid = (fbAuth.currentUser && fbAuth.currentUser.uid) || '';
  mySef = [];
  if (myUid) {
    const sefSnap = await db.collection('evaluations')
      .where('evaluatorUid', '==', myUid)
      .get();
    sefSnap.forEach(doc => {
      const e = doc.data();
      if (e.evaluatorType === 'supervisor') mySef.push({ ...e, docId: doc.id });
    });
  }
}

async function renderSupervisorHome() {
  ['nav-evaluate','nav-history','nav-feedback'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  const firstName = currentStudent.name ? currentStudent.name.split(' ')[0] : 'Supervisor';
  const greet = document.getElementById('dashGreeting');
  if (greet) greet.textContent = `Welcome, ${firstName}! 👋`;
  const sub = document.getElementById('dashSubtitle');
  if (sub) sub.textContent = `Supervisor — ${currentStudent.dept || 'No department'} faculty evaluation (SEF).`;

  const stats = document.getElementById('dashStats');
  if (stats) stats.style.display = 'none';

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-dashboard').classList.add('active');
  const navDash = document.getElementById('nav-dashboard');
  if (navDash) navDash.classList.add('active');

  const sl = document.getElementById('dashSubjectList');
  if (sl) sl.innerHTML = `<div class="empty-state"><div class="empty-icon">🧑‍🏫</div><div class="empty-text">Loading department faculty…</div></div>`;

  try {
    await loadSupervisorData();
  } catch (e) {
    if (sl) sl.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><div class="empty-text">Could not load faculty. Check your connection.</div></div>`;
    console.error(e);
    return;
  }

  const evaluated = mySef.length;
  const period = document.getElementById('dashPeriodInfo');
  if (period) period.innerHTML = `<div style="display:flex; gap:24px; flex-wrap:wrap;">`
    + `<div><div style="font-size:1.4rem; font-weight:800; color:var(--forest);">${deptFaculty.length}</div><div style="font-size:0.74rem; color:var(--muted);">Faculty you evaluate${supervisedDeptsOf(currentStudent).length > 1 ? ` (${supervisedDeptsOf(currentStudent).join(', ')})` : ''}</div></div>`
    + `<div><div style="font-size:1.4rem; font-weight:800; color:var(--emerald);">${evaluated}</div><div style="font-size:0.74rem; color:var(--muted);">Evaluated by you</div></div>`
    + `<div><div style="font-size:1.4rem; font-weight:800; color:#d97706;">${Math.max(0, deptFaculty.length - evaluated)}</div><div style="font-size:0.74rem; color:var(--muted);">Remaining</div></div>`
    + `</div>`;

  const cardHeader = sl ? sl.closest('.card')?.querySelector('.card-header h3') : null;
  if (cardHeader) cardHeader.textContent = '🧑‍🏫 Department Faculty';
  const badge = document.getElementById('dashSubjectCountBadge');
  if (badge) badge.textContent = `${deptFaculty.length} faculty`;

  renderDeptFacultyList();
}

function renderDeptFacultyList() {
  const sl = document.getElementById('dashSubjectList');
  if (!sl) return;

  if (!deptFaculty.length) {
    sl.innerHTML = `<div class="empty-state"><div class="empty-icon">🧑‍🏫</div>`
      + `<div class="empty-text">No faculty found in your department (${currentStudent.dept || 'none set'}).<br>`
      + `Ask your admin to add faculty under this department.</div></div>`;
    return;
  }

  sl.innerHTML = deptFaculty.map(f => {
    const initials = f.name ? f.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'F';
    const done = mySef.find(e => e.teacherId === f.docId);
    const statusPill = done
      ? `<span class="badge badge-success">✅ Evaluated · ${done.totalScore}%</span>`
      : `<span class="badge badge-neutral">Pending</span>`;
    const btnLabel = done ? 'Re-evaluate' : 'Evaluate';
    return `
      <div style="display:flex; align-items:center; gap:12px; padding:12px 4px; border-bottom:1px solid var(--border);">
        <div style="width:42px; height:42px; flex-shrink:0; border-radius:50%; background:linear-gradient(135deg,var(--forest),var(--emerald)); display:flex; align-items:center; justify-content:center; color:#fff; font-weight:700;">${initials}</div>
        <div style="flex:1; min-width:0;">
          <div style="font-weight:700; font-size:0.88rem;">${f.name || '—'}</div>
          <div style="font-size:0.74rem; color:var(--muted);">${f.tid || ''}${f.category ? ' · ' + f.category : ''}</div>
        </div>
        <div style="display:flex; align-items:center; gap:10px; flex-shrink:0;">
          ${statusPill}
          <button class="btn btn-primary" style="padding:7px 14px; font-size:0.78rem;" onclick="startSef('${f.docId}')">${btnLabel}</button>
        </div>
      </div>`;
  }).join('');
}

async function startSef(teacherId) {
  const fac = deptFaculty.find(f => f.docId === teacherId);
  if (!fac) { showToast('Faculty not found.', 'warning'); return; }
  window._sefTeacherId = teacherId;

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-evaluate').classList.add('active');

  const h1 = document.querySelector('#page-evaluate .page-title h1');
  if (h1) h1.textContent = 'Evaluate Faculty (SEF)';
  const pTag = document.querySelector('#page-evaluate .page-title p');
  if (pTag) pTag.textContent = "Supervisor's Evaluation of Faculty — 15 CMO criteria (Annex B).";

  const wrap = document.querySelector('#page-evaluate .subject-select-wrap');
  if (wrap) wrap.style.display = 'none';
  document.getElementById('teacherInitials').textContent = fac.name ? fac.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'F';
  document.getElementById('teacherName').textContent = fac.name || '—';
  document.getElementById('teacherDept').textContent = `${fac.tid || ''} · ${fac.dept || ''}`;
  document.getElementById('teacherInfoCard').style.display = 'flex';

  const already = mySef.some(e => e.teacherId === teacherId);
  document.getElementById('evalBanner').innerHTML =
    `<div class="status-banner open">🧑‍🏫 Evaluating <strong>${fac.name || ''}</strong>.`
    + `${already ? ' You already submitted — submitting again updates your rating.' : ''}</div>`;

  document.getElementById('alreadyEvaluatedMsg').style.display = 'none';
  renderQuestions();
  document.getElementById('evalComment').value = '';
  document.getElementById('evalFormWrap').style.display = 'block';
  window.scrollTo(0, 0);
}

// SEF submit. Doc id includes the term so next semester does not overwrite.
async function submitSef() {
  const teacherId = window._sefTeacherId;
  const fac = deptFaculty.find(f => f.docId === teacherId);
  if (!teacherId || !fac) { showToast('No faculty selected.', 'warning'); return; }

  const QS = Instrument.sef;
  const ratings = {}; let rawTotal = 0; let answered = 0;
  QS.forEach(q => {
    const val = document.querySelector(`input[name="${q.id}"]:checked`)?.value;
    if (val) { ratings[q.id] = parseInt(val); rawTotal += parseInt(val); answered++; }
  });
  if (answered < QS.length) {
    showToast(`Please answer all ${QS.length} questions before submitting.`, 'warning');
    return;
  }

  const gate = await checkCanSubmit();
  if (!gate.ok) { showToast(gate.reason, 'warning'); return; }

  const btn = document.getElementById('submitEvalBtn');
  btn.disabled = true;
  btn.innerHTML = `<svg width="14" height="14" class="spin-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-dasharray="30" stroke-dashoffset="10"/></svg> Submitting…`;

  const finalScore = Number(((rawTotal / (QS.length * 5)) * 100).toFixed(2));
  const _sefTerm = gate.term;

  const rec = {
    id:            `sef_${currentStudent.docId}_${teacherId}_${_sefTerm.year}_${_sefTerm.sem}`.replace(/\s+/g, '-'),
    teacherId:     teacherId,
    supervisorId:  currentStudent.docId,
    supervisorTid: currentStudent.sid || currentStudent.tid || '',
    evaluatorType: 'supervisor',
    evaluatorUid:  (fbAuth.currentUser && fbAuth.currentUser.uid) || '',
    ratings:       ratings,
    totalScore:    finalScore,
    rawScore:      rawTotal,
    maxRaw:        QS.length * 5,
    questionSetId: Instrument.sefId || '',
    comment:       document.getElementById('evalComment').value || '',
    schoolYear:    _sefTerm.year,
    semester:      _sefTerm.sem,
    timestamp:     new Date().toISOString()
  };

  try {
    await db.collection('evaluations').doc(rec.id).set(rec);
    mySef = mySef.filter(e => e.id !== rec.id);
    mySef.push(rec);

    document.getElementById('resultScore').textContent   = finalScore;
    document.getElementById('resultRemarks').textContent = getRemarks(finalScore);
    document.getElementById('resultSubject').textContent = fac.name || '';
    document.getElementById('resultOverlay').classList.add('open');

    window._sefTeacherId = null;
  } catch (e) {
    showToast('Error submitting evaluation. Please try again.', 'error');
    console.error(e);
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Submit Evaluation`;
  }
}

// One banner at the top of the dashboard when a query fails.
function showLoadBanner(msg) {
  const host = document.getElementById('page-dashboard');
  if (!host || host.querySelector('.load-banner')) return;
  const b = document.createElement('div');
  b.className = 'load-banner';
  b.style.cssText = 'margin-bottom:16px;padding:12px 16px;border-radius:10px;'
    + 'background:#fef2f2;color:#991b1b;font-size:0.84rem;border:1px solid #fecaca;';
  b.textContent = msg;
  host.prepend(b);
}

// array-contains query, same as the app. Each query guarded separately.
async function loadStudentData() {
  window._loadErrors = [];
  mySubjects = [];
  try {
    const snapS = await db.collection('subjects')
      .where('enrolledIds', 'array-contains', currentStudent.docId)
      .get();
    mySubjects = snapS.docs.map(doc => ({ ...doc.data(), docId: doc.id }));
    console.info('[load] subjects:', mySubjects.length, 'for docId', currentStudent.docId);
  } catch (err) {
    console.error('[load] subjects query failed:', err.code || '', err.message);
    window._loadErrors.push('subjects: ' + (err.code || err.message));
  }

  const myUid = (fbAuth.currentUser && fbAuth.currentUser.uid) || '';
  myEvals = [];
  const seen = new Set();

  if (myUid) {
    try {
      const snapE = await db.collection('evaluations')
        .where('evaluatorUid', '==', myUid)
        .get();
      snapE.forEach(doc => { seen.add(doc.id); myEvals.push({ ...doc.data(), docId: doc.id }); });
      console.info('[load] evaluations:', myEvals.length);
    } catch (err) {
      console.error('[load] evaluations query failed:', err.code || '', err.message);
      window._loadErrors.push('evaluations: ' + (err.code || err.message));
    }
  }

  try {
    const legacy = await db.collection('evaluations')
      .where('studentId', '==', currentStudent.docId)
      .get();
    legacy.forEach(doc => {
      if (seen.has(doc.id)) return;
      const e = doc.data();
      if (e.evaluatorType === 'supervisor') return;
      myEvals.push({ ...e, docId: doc.id });
    });
  } catch (e) {
    console.info('Older evaluations without evaluatorUid are not readable under '
      + 'the current rules; the history shown may be incomplete.');
  }
}

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  const nav = document.getElementById('nav-' + id);
  if (nav) nav.classList.add('active');
  closeSidebar();

  if (id === 'dashboard') renderDashboard();
  if (id === 'evaluate')  renderEvaluate();
  if (id === 'history')   renderHistory();
  if (id === 'feedback')  renderFeedback();
  if (id === 'profile')   renderProfile();
}

// ============================================================
// MOBILE DRAWER
// ------------------------------------------------------------
// One place sets the open/closed state, so the drawer, the
// backdrop, the page scroll lock and the menu button's
// aria-expanded can never disagree with each other.
// ============================================================
function _setSidebar(open) {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlayBg');
  const btn     = document.getElementById('mobileMenuBtn');
  if (!sidebar) return;

  sidebar.classList.toggle('open', open);
  if (overlay) overlay.classList.toggle('open', open);
  // Stop the page behind the drawer scrolling under a thumb.
  document.body.classList.toggle('drawer-open', open);
  if (btn) {
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  if (open) {
    // Move focus into the drawer so keyboard and screen-reader users land in
    // the menu they just opened, not behind it.
    const first = sidebar.querySelector('.nav-item.active') || sidebar.querySelector('.nav-item');
    if (first) { if (!first.hasAttribute('tabindex')) first.setAttribute('tabindex', '0'); first.focus({ preventScroll: true }); }
  } else if (btn && sidebar.contains(document.activeElement)) {
    // ...and back to the button that opened it when it closes.
    btn.focus({ preventScroll: true });
  }
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  _setSidebar(!(sidebar && sidebar.classList.contains('open')));
}

function closeSidebar() { _setSidebar(false); }

// Escape closes it, as every drawer on the web does.
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && document.body.classList.contains('drawer-open')) closeSidebar();
});

// Rotating the phone or widening the window past the mobile breakpoint would
// otherwise leave the scroll lock and backdrop on with no drawer to close.
window.addEventListener('resize', function () {
  if (window.innerWidth > 768 && document.body.classList.contains('drawer-open')) closeSidebar();
});

// Subject cards, evaluation period, and progress counts.
async function renderDashboard() {
  if (currentStudent && currentStudent.userType === 'supervisor') return;
  showSkeleton('dashboard');
  await loadStudentData();

  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = currentStudent.name ? currentStudent.name.split(' ')[0] : 'Student';
  document.getElementById('dashGreeting').textContent  = `${greet}, ${firstName}! 👋`;
  document.getElementById('dashSubtitle').textContent = `Welcome back to your evaluation portal.`;

  const totalSubjects = mySubjects.length;
  const done     = mySubjects.filter(s => myEvals.some(e => e.subjectId === s.docId)).length;
  const pending  = totalSubjects - done;

  document.getElementById('dashTotalSubjects').textContent = totalSubjects;
  document.getElementById('dashDone').textContent    = done;
  document.getElementById('dashPending').textContent = pending;

  let periodHTML = '<div style="font-size:0.84rem; color:var(--muted);">No active evaluation period.</div>';
  try {
    const sySnap = await db.collection('schoolYears').get();
    let activeSY = null, activeSem = null;
    sySnap.forEach(doc => {
      const sy = doc.data();
      if (sy.semesters) {
        const sem = sy.semesters.find(s => s.active);
        if (sem) { activeSY = sy.year; activeSem = sem; }
      }
    });

    if (activeSY && activeSem) {
      let _period = {};
      try {
        const pSnap = await db.collection('settings').doc('evalPeriod').get();
        if (pSnap.exists) _period = pSnap.data() || {};
      } catch (e) { /* banner falls back to showing no deadline */ }

      const _isOpen = _period.open === true;
      const deadlineDate = _period.deadline ? new Date(_period.deadline) : null;
      const now = new Date();
      const daysLeft = deadlineDate ? Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24)) : null;
      const bannerClass = daysLeft !== null ? (daysLeft <= 3 ? 'warn' : 'open') : 'open';
      const deadlineStr = deadlineDate ? deadlineDate.toLocaleDateString('en-PH', { year:'numeric', month:'long', day:'numeric' }) : 'No deadline set';

      periodHTML = `
        <div style="display:flex; gap:20px; flex-wrap:wrap; align-items:center;">
          <div>
            <div style="font-size:0.7rem; color:var(--muted); text-transform:uppercase; font-weight:700; letter-spacing:0.08em; margin-bottom:3px;">School Year</div>
            <div style="font-size:1rem; font-weight:800; color:var(--ink);">${activeSY}</div>
          </div>
          <div>
            <div style="font-size:0.7rem; color:var(--muted); text-transform:uppercase; font-weight:700; letter-spacing:0.08em; margin-bottom:3px;">Semester</div>
            <div style="font-size:1rem; font-weight:800; color:var(--ink);">${activeSem.label || activeSem.sem}</div>
          </div>
          ${daysLeft !== null ? `
          <div>
            <div style="font-size:0.7rem; color:var(--muted); text-transform:uppercase; font-weight:700; letter-spacing:0.08em; margin-bottom:3px;">Deadline</div>
            <div style="font-size:0.9rem; font-weight:700; color:${daysLeft <= 3 ? 'var(--warning)' : 'var(--success)'};">${deadlineStr}${daysLeft > 0 ? ` (${daysLeft}d left)` : ' <span style="color:var(--danger);">Expired</span>'}</div>
          </div>
          ` : ''}
          <span class="badge ${_isOpen ? 'badge-success' : 'badge-danger'}" style="margin-left:auto;">● Evaluation ${_isOpen ? 'Open' : 'Closed'}</span>
        </div>`;
    }
  } catch(e) {}
  document.getElementById('dashPeriodInfo').innerHTML = periodHTML;

  document.getElementById('dashSubjectCountBadge').textContent = `${totalSubjects} subject${totalSubjects !== 1 ? 's' : ''}`;

  if (!totalSubjects) {
    document.getElementById('dashSubjectList').innerHTML =
      `<div class="empty-state">
         <div class="empty-state-title">No subjects enrolled</div>
         <div class="empty-state-hint">
           You are not enrolled in any class for this semester.
           Contact the designated office if this is incorrect.
           <div style="margin-top:8px;font-size:0.72rem;opacity:0.7;">
             ID: ${escapeHtml(currentStudent.sid || '')} &middot;
             Dept: ${escapeHtml(currentStudent.dept || '—')}
           </div>
         </div>
       </div>`;
    return;
  }

    document.getElementById('dashSubjectList').innerHTML = mySubjects.map(sub => {
    const evaluated = myEvals.some(e => e.subjectId === sub.docId);
    return `
      <div style="display:flex; align-items:center; justify-content:space-between; padding:12px 0; border-bottom:1px solid #f1f5f9; gap:12px; flex-wrap:wrap;">
        <div style="display:flex; align-items:center; gap:11px;">
          <div style="width:36px; height:36px; border-radius:9px; background:${evaluated ? '#f0fdf4' : '#f1f5f9'}; display:flex; align-items:center; justify-content:center; font-size:1rem; flex-shrink:0;">
            ${evaluated ? '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM16.0303 8.96967C16.3232 9.26256 16.3232 9.73744 16.0303 10.0303L11.0303 15.0303C10.7374 15.3232 10.2626 15.3232 9.96967 15.0303L7.96967 13.0303C7.67678 12.7374 7.67678 12.2626 7.96967 11.9697C8.26256 11.6768 8.73744 11.6768 9.03033 11.9697L10.5 13.4393L12.7348 11.2045L14.9697 8.96967C15.2626 8.67678 15.7374 8.67678 16.0303 8.96967Z" fill="#267d57"></path> </g></svg>'
               : 
               '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#50be7a"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M3.75 8C3.75 5.37665 5.87665 3.25 8.5 3.25H18.5C19.4665 3.25 20.25 4.0335 20.25 5V20C20.25 20.9665 19.4665 21.75 18.5 21.75H7.5C5.42893 21.75 3.75 20.0711 3.75 18V8ZM18.75 5V14.25H7.5C6.6558 14.25 5.87675 14.529 5.25 14.9997V8C5.25 6.20507 6.70507 4.75 8.5 4.75H11.7079C11.4446 6.73154 11.4683 8.74229 11.7794 10.72L11.8418 11.1166C11.8865 11.4006 12.0896 11.6341 12.3648 11.7176C12.6399 11.8012 12.9385 11.7201 13.1336 11.5089L14.5 10.0297L15.8664 11.5089C16.0615 11.7201 16.3601 11.8012 16.6353 11.7176C16.9104 11.6341 17.1135 11.4006 17.1582 11.1166L17.2206 10.72C17.5318 8.74228 17.5554 6.73154 17.2921 4.75H18.5C18.6381 4.75 18.75 4.86193 18.75 5ZM15.7779 4.75H13.2221C13.005 6.26418 12.9688 7.79819 13.1139 9.31967L13.7654 8.61431C14.1614 8.1857 14.8386 8.1857 15.2346 8.61431L15.8861 9.31967C16.0312 7.79819 15.995 6.26418 15.7779 4.75ZM7.5 15.75H18.75V20C18.75 20.1381 18.6381 20.25 18.5 20.25H7.5C6.25736 20.25 5.25 19.2426 5.25 18C5.25 16.7574 6.25736 15.75 7.5 15.75Z" fill="#50be7a"></path> </g></svg>'}
          </div>
          <div>
            <div style="font-weight:700; font-size:0.86rem;">${sub.name}</div>
            <div style="font-size:0.72rem; color:var(--muted); font-family:'Sora',monospace;">${sub.code}</div>
          </div>
        </div>
        <span class="badge ${evaluated ? 'badge-success' : 'badge-warning'}">
          ${evaluated ? '✓ Evaluated' : '⏳ Pending'}
        </span>
      </div>`;
  }).join('') + `<div style="height:1px;"></div>`;
}

async function ensureSubjectTeacherNames() {
  const missing = [...new Set(mySubjects
    .filter(s => !s.teacherName && s.teacherId)
    .map(s => s.teacherId))];
  if (!missing.length) return;
  const names = {};
  await Promise.all(missing.map(async id => {
    try {
      const d = await db.collection('teachers').doc(id).get();
      if (d.exists) names[id] = d.data().name || '';
    } catch (e) { /* a missing teacher just leaves the card without a name */ }
  }));
  mySubjects.forEach(s => { if (names[s.teacherId]) s.teacherName = names[s.teacherId]; });
}
async function renderEvaluate() {
  if (currentStudent && currentStudent.userType === 'supervisor') return;
  showSkeleton('evaluate');
  await ensureSubjectTeacherNames();

  const picker = document.getElementById('subjectPicker');
  const doneIds = new Set(myEvals.map(e => e.subjectId));

  picker.innerHTML = mySubjects.map(sub => {
    const done = doneIds.has(sub.docId);
    const teacher = sub.teacherName || sub._teacherName || '';
    const initials = (teacher || sub.code || '?').trim().split(/\s+/)
      .map(w => w[0]).slice(0, 2).join('').toUpperCase();
    return `
      <button type="button" class="subject-card${done ? ' is-done' : ''}"
              data-subid="${escapeHtml(sub.docId)}"
              onclick="selectSubject('${escapeHtml(sub.docId)}')"
              aria-pressed="false">
        <span class="subject-card-avatar">${escapeHtml(initials)}</span>
        <span class="subject-card-main">
          <span class="subject-card-code">${escapeHtml(sub.code || '')}</span>
          <span class="subject-card-name">${escapeHtml(sub.name || '')}</span>
          ${teacher ? `<span class="subject-card-teacher">${escapeHtml(teacher)}</span>` : ''}
        </span>
        <span class="subject-card-status">${done
          ? '<span class="pill pill-done">Evaluated</span>'
          : '<span class="pill pill-pending">Pending</span>'}</span>
      </button>`;
  }).join('');

  if (!mySubjects.length) {
    document.getElementById('evalBanner').innerHTML = `
      <div class="status-banner closed">
        ⚠️ You have no enrolled subjects. Please contact your administrator.
      </div>`;
  } else {
    document.getElementById('evalBanner').innerHTML = `
      <div class="status-banner open">
         Evaluation is currently open. Please rate your teachers honestly.
      </div>`;
  }

  document.getElementById('teacherInfoCard').style.display   = 'none';
  document.getElementById('alreadyEvaluatedMsg').style.display = 'none';
  document.getElementById('evalFormWrap').style.display      = 'none';
}

window._selectedSubjectId = '';

function selectSubject(subId) {
  window._selectedSubjectId = subId;
  document.querySelectorAll('.subject-card').forEach(el => {
    const on = el.getAttribute('data-subid') === subId;
    el.classList.toggle('is-selected', on);
    el.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
  onSubjectChange();
}

async function onSubjectChange() {
  const subId  = window._selectedSubjectId;
  const subObj = mySubjects.find(s => s.docId === subId);

  document.getElementById('teacherInfoCard').style.display    = 'none';
  document.getElementById('alreadyEvaluatedMsg').style.display = 'none';
  document.getElementById('evalFormWrap').style.display       = 'none';

  if (!subId || !subObj) return;

  const alreadyDone = myEvals.some(e => e.subjectId === subId);

  if (subObj.teacherId) {
    try {
      const tSnap = await db.collection('teachers').doc(subObj.teacherId).get();
      if (tSnap.exists) {
        const t = tSnap.data();
        document.getElementById('teacherInitials').textContent = t.name ? t.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase() : 'T';
        document.getElementById('teacherName').textContent     = t.name || '—';
        document.getElementById('teacherDept').textContent     = `${t.tid || ''} · ${t.dept || ''}`;
        document.getElementById('teacherInfoCard').style.display = 'flex';
      }
    } catch(e) {}
  }

  if (alreadyDone) {
    document.getElementById('alreadyEvaluatedMsg').style.display = 'flex';
  } else {
    renderQuestions();
    document.getElementById('evalFormWrap').style.display = 'block';
  }
}

// Annex B for a supervisor, Annex A for a student.
function activeQuestions() {
  return window._sefTeacherId ? Instrument.sef : Instrument.set;
}

// Build the rating grid for whichever instrument is on screen.
function renderQuestions() {
  const container = document.getElementById('questionsContainer');
  const QS = activeQuestions();
  let html = '';
  let currentSec = null;

  QS.forEach((q, i) => {
    if (q.sec !== currentSec) {
      currentSec = q.sec;
      html += `<div class="eval-section-title">Section ${q.sec} — ${SECTIONS[q.sec]}</div>`;
    }

    html += `
      <div class="question-row">
        <div>
          <div class="question-num">Q${i+1}</div>
          <div class="question-text">${q.text}</div>
        </div>
        <div class="rating-group" id="rg_${q.id}">
          ${[1,2,3,4,5].map(n => `
            <label>
              <input type="radio" name="${q.id}" value="${n}" onchange="updateProgress()"/>
              <div class="rating-btn" data-val="${n}">${n}</div>
            </label>
          `).join('')}
        </div>
      </div>`;
  });

  container.innerHTML = html;
  updateProgress();
}

// Answered count for the progress bar.
function updateProgress() {
  const QS = activeQuestions();
  let answered = 0;
  QS.forEach(q => {
    if (document.querySelector(`input[name="${q.id}"]:checked`)) answered++;
  });
  const pct = QS.length ? (answered / QS.length) * 100 : 0;
  document.getElementById('evalProgressFill').style.width  = pct + '%';
  document.getElementById('evalProgressLabel').textContent = `${answered} of ${QS.length} answered`;
}

function clearEvalForm() {
  activeQuestions().forEach(q => {
    document.querySelectorAll(`input[name="${q.id}"]`).forEach(r => r.checked = false);
  });
  document.getElementById('evalComment').value = '';
  updateProgress();
}

// SET submit. Deterministic doc id prevents duplicate submissions.
async function submitEvaluation() {
  if (window._sefTeacherId) { return submitSef(); }
  const subId  = window._selectedSubjectId;
  const subObj = mySubjects.find(s => s.docId === subId);

  if (!subId || !subObj) { showToast('Please select a subject first.', 'warning'); return; }
  if (!subObj.teacherId)  { showToast('This subject has no assigned teacher.', 'warning'); return; }

  const ratings = {};
  let rawTotal  = 0;
  let answered  = 0;

  const QS = Instrument.set;
  QS.forEach(q => {
    const val = document.querySelector(`input[name="${q.id}"]:checked`)?.value;
    if (val) { ratings[q.id] = parseInt(val); rawTotal += parseInt(val); answered++; }
  });

  if (answered < QS.length) {
    showToast(`Please answer all ${QS.length} questions before submitting.`, 'warning');
    return;
  }

  const gate = await checkCanSubmit();
  if (!gate.ok) { showToast(gate.reason, 'warning'); return; }

  const btn = document.getElementById('submitEvalBtn');
  btn.disabled = true;
  btn.innerHTML = `<svg width="14" height="14" class="spin-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-dasharray="30" stroke-dashoffset="10"/></svg> Submitting…`;

  const finalScore = Number(((rawTotal / (QS.length * 5)) * 100).toFixed(2));

  const _term = gate.term;

  const evalRecord = {
    id:            `set_${currentStudent.docId}_${subId}_${_term.year}_${_term.sem}`.replace(/\s+/g, '-'),
    studentId:     currentStudent.docId,
    subjectId:     subId,
    teacherId:     subObj.teacherId,
    evaluatorType: 'student',
    evaluatorUid:  (fbAuth.currentUser && fbAuth.currentUser.uid) || '',
    ratings:       ratings,
    totalScore:    finalScore,
    rawScore:      rawTotal,
    maxRaw:        QS.length * 5,
    questionSetId: Instrument.setId || '',
    comment:       document.getElementById('evalComment').value || '',
    schoolYear:    _term.year,
    semester:      _term.sem,
    timestamp:     new Date().toISOString()
  };

  try {
    await db.collection('evaluations').doc(evalRecord.id).set(evalRecord);
    myEvals.push(evalRecord);

    document.getElementById('resultScore').textContent   = finalScore;
    document.getElementById('resultRemarks').textContent = getRemarks(finalScore);
    document.getElementById('resultSubject').textContent = `${subObj.code}: ${subObj.name}`;
    document.getElementById('resultOverlay').classList.add('open');

    clearEvalForm();
    document.getElementById('evalFormWrap').style.display       = 'none';
    document.getElementById('alreadyEvaluatedMsg').style.display = 'flex';

  } catch(e) {
    showToast('Error submitting evaluation. Please try again.', 'error');
    console.error(e);
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Submit Evaluation`;
  }
}

function closeResult() {
  document.getElementById('resultOverlay').classList.remove('open');
  if (currentStudent && currentStudent.userType === 'supervisor') { renderSupervisorHome(); return; }
  showPage('history');
}

async function renderHistory() {
  showSkeleton('history');
  await loadStudentData();
  // Counted from the enrolled subjects only, so the badge matches the rows
  // below it rather than every evaluation ever submitted.
  const visibleEvals = myEvals.filter(ev => ev.subjectId && mySubjects.some(s => s.docId === ev.subjectId));
  document.getElementById('historyCount').textContent = `${visibleEvals.length} record${visibleEvals.length !== 1 ? 's' : ''}`;

  if (!visibleEvals.length) {
    document.getElementById('historyList').innerHTML = `<div class="empty-state"><div class="empty-icon">📋</div><div class="empty-text">No evaluations submitted yet.</div></div>`;
    return;
  }

  const subMap = {};
  mySubjects.forEach(s => subMap[s.docId] = s);

  // ONLY subjects the student is enrolled in right now.
  //
  // Unenrol someone and the subject leaves this list, even if they had already
  // rated it - the same rule the app follows, and the same rule the SEF side
  // follows for deleted faculty. The evaluation itself stays in Firestore and
  // still counts towards the reports; this page lists what is current, not a
  // permanent record of everything ever submitted.
  const sorted = myEvals
    .filter(ev => ev.subjectId && subMap[ev.subjectId])
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  document.getElementById('historyList').innerHTML = `
    <div class="history-list">
      ${sorted.map(ev => {
        const sub = subMap[ev.subjectId];
        const dateStr = new Date(ev.timestamp).toLocaleDateString('en-PH', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
        const remarks = getRemarks(ev.totalScore);
        const key = escapeHtml(ev.docId || ev.id || '');
        return `
                    <div class="history-item sv-clickable" role="button" tabindex="0"
               onclick="openSubmissionView('${key}')" onkeydown="_svKey(event,'${key}')"
               aria-label="View your ratings for ${escapeHtml(sub ? sub.name : 'this subject')}">
            <div class="history-dot"><svg width="188px" height="188px" viewBox="0 0 24.00 24.00" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#21ba40" stroke-width="0.00024000000000000003"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.144"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M9.94531 1.25H14.0551C15.4227 1.24998 16.525 1.24996 17.3919 1.36652C18.292 1.48754 19.0499 1.74643 19.6518 2.34835C20.2538 2.95027 20.5126 3.70814 20.6337 4.60825C20.7502 5.47522 20.7502 6.57754 20.7502 7.94513V16.0549C20.7502 17.4225 20.7502 18.5248 20.6337 19.3918C20.5126 20.2919 20.2538 21.0497 19.6518 21.6517C19.0499 22.2536 18.292 22.5125 17.3919 22.6335C16.525 22.75 15.4226 22.75 14.0551 22.75H9.94532C8.57773 22.75 7.4754 22.75 6.60844 22.6335C5.70833 22.5125 4.95045 22.2536 4.34854 21.6517C3.74662 21.0497 3.48773 20.2919 3.36671 19.3918C3.32801 19.1039 3.30216 18.7902 3.2849 18.4494C3.24582 18.326 3.23821 18.1912 3.26895 18.0568C3.25016 17.4649 3.25017 16.7991 3.25019 16.0549V7.94513C3.25017 6.57754 3.25015 5.47522 3.36671 4.60825C3.48773 3.70814 3.74662 2.95027 4.34854 2.34835C4.95045 1.74643 5.70833 1.48754 6.60843 1.36652C7.4754 1.24996 8.57772 1.24998 9.94531 1.25ZM4.77694 18.2491C4.79214 18.6029 4.81597 18.914 4.85333 19.1919C4.95199 19.9257 5.13243 20.3142 5.4092 20.591C5.68596 20.8678 6.07453 21.0482 6.80831 21.1469C7.56366 21.2484 8.56477 21.25 10.0002 21.25H14.0002C15.4356 21.25 16.4367 21.2484 17.1921 21.1469C17.9258 21.0482 18.3144 20.8678 18.5912 20.591C18.8679 20.3142 19.0484 19.9257 19.147 19.1919C19.2299 18.5756 19.2462 17.7958 19.2494 16.75H13.7502V19.5309C13.7502 19.5396 13.7502 19.5485 13.7502 19.5578C13.7504 19.6691 13.7506 19.8276 13.7293 19.9638C13.7033 20.1302 13.6177 20.4514 13.2851 20.6468C12.9647 20.8349 12.6513 20.765 12.5024 20.7187C12.3726 20.6783 12.2302 20.6105 12.124 20.56C12.1156 20.556 12.1074 20.5521 12.0995 20.5483L11.0002 20.0261L9.90087 20.5483C9.89294 20.5521 9.88477 20.5559 9.87636 20.56C9.7702 20.6105 9.62782 20.6783 9.49796 20.7187C9.34903 20.765 9.03567 20.8349 8.7153 20.6468C8.38263 20.4514 8.29705 20.1302 8.27104 19.9638C8.24976 19.8276 8.25 19.6691 8.25016 19.5578C8.25017 19.5485 8.25019 19.5396 8.25019 19.5309V16.75H7.89796C6.91971 16.75 6.5777 16.7564 6.31562 16.8267C5.5963 17.0194 5.02286 17.5541 4.77694 18.2491ZM9.75019 16.75V18.9592L10.4995 18.6033C10.5013 18.6024 10.5043 18.6009 10.5083 18.5989C10.5573 18.5738 10.7638 18.4682 11.0002 18.4682C11.2365 18.4682 11.443 18.5738 11.4921 18.5989C11.4961 18.6009 11.499 18.6024 11.5009 18.6033L12.2502 18.9592V16.75H9.75019ZM7.89796 15.25C7.85879 15.25 7.8202 15.25 7.78217 15.25C6.9642 15.2497 6.40605 15.2495 5.92739 15.3778C5.49941 15.4925 5.10242 15.6798 4.75019 15.9259V8C4.75019 6.56458 4.75178 5.56347 4.85333 4.80812C4.95199 4.07435 5.13243 3.68577 5.4092 3.40901C5.68596 3.13225 6.07453 2.9518 6.80831 2.85315C7.56366 2.75159 8.56477 2.75 10.0002 2.75H14.0002C15.4356 2.75 16.4367 2.75159 17.1921 2.85315C17.9258 2.9518 18.3144 3.13225 18.5912 3.40901C18.8679 3.68577 19.0484 4.07435 19.147 4.80812C19.2486 5.56347 19.2502 6.56458 19.2502 8V15.25H7.89796ZM7.25019 7C7.25019 6.58579 7.58597 6.25 8.00019 6.25H16.0002C16.4144 6.25 16.7502 6.58579 16.7502 7C16.7502 7.41421 16.4144 7.75 16.0002 7.75H8.00019C7.58597 7.75 7.25019 7.41421 7.25019 7ZM7.25019 10.5C7.25019 10.0858 7.58597 9.75 8.00019 9.75H13.0002C13.4144 9.75 13.7502 10.0858 13.7502 10.5C13.7502 10.9142 13.4144 11.25 13.0002 11.25H8.00019C7.58597 11.25 7.25019 10.9142 7.25019 10.5Z" fill="#21ba40"></path> </g></svg></div>
            <div style="flex:1;">
              <div class="history-subject">${escapeHtml(sub ? sub.name : 'Unknown Subject')}</div>
              <div class="history-teacher" style="font-family:'Sora';">${escapeHtml(sub ? sub.code : '—')}</div>
              <div class="history-date" style="font-family:'Sora';">${dateStr}</div>
            </div>
            <div style="text-align:right; flex-shrink:0;">
              <div class="score-pill">${ev.totalScore}%</div>
              <div style="font-size:0.68rem; color:var(--muted); margin-top:4px;">${remarks}</div>
            </div>
            <svg class="sv-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg>
          </div>`;
      }).join('')}
    </div>`;
}


// ============================================================
// YOUR SUBMITTED RATINGS
// ------------------------------------------------------------
// The web counterpart of the app's ViewSubmissionScreen. Opened
// from My Evaluations or My Feedback; read-only, since an
// evaluation is final once sent.
//
// Everything comes from Firestore - the record in myEvals was
// loaded from the database, and the subject, teacher and question
// wording are fetched from it when not already on hand.
// ============================================================

// Subjects the student has evaluated but is no longer enrolled in are not in
// mySubjects. Fetch them rather than labelling the row "Unknown Subject".
const _subjectCache = {};
async function _subjectFor(subjectId) {
  const known = mySubjects.find(s => s.docId === subjectId);
  if (known) return known;
  if (_subjectCache[subjectId] !== undefined) return _subjectCache[subjectId];
  try {
    const d = await db.collection('subjects').doc(subjectId).get();
    _subjectCache[subjectId] = d.exists ? Object.assign({ docId: d.id }, d.data()) : null;
  } catch (e) { _subjectCache[subjectId] = null; }
  return _subjectCache[subjectId];
}

const _teacherCache = {};
async function _teacherName(teacherId) {
  if (!teacherId) return '';
  if (_teacherCache[teacherId] !== undefined) return _teacherCache[teacherId];
  try {
    const d = await db.collection('teachers').doc(teacherId).get();
    _teacherCache[teacherId] = d.exists ? (d.data().name || '') : '';
  } catch (e) { _teacherCache[teacherId] = ''; }
  return _teacherCache[teacherId];
}

// The questions as they were WORDED WHEN ANSWERED. A later published version
// may reword an item; showing the current wording beside an old rating would
// misrepresent what the student actually rated.
const _qsetCache = {};
async function _questionsFor(ev) {
  const fallback = Instrument.set;
  const id = ev.questionSetId;
  if (!id || id === Instrument.setId) return fallback;
  if (_qsetCache[id]) return _qsetCache[id];
  try {
    const d = await db.collection('questionSets').doc(id).get();
    const qs = d.exists && Array.isArray(d.data().questions) ? d.data().questions : fallback;
    _qsetCache[id] = qs;
    return qs;
  } catch (e) { return fallback; }
}

async function openSubmissionView(evId) {
  // Loaded records carry docId; one submitted this session carries id.
  const ev = myEvals.find(e => (e.docId || e.id) === evId);
  if (!ev) { showToast('That evaluation could not be found. Please refresh.', 'error'); return; }

  let box = document.getElementById('submissionView');
  if (!box) {
    box = document.createElement('div');
    box.id = 'submissionView';
    box.className = 'sv-overlay';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Your submitted ratings');
    document.body.appendChild(box);
  }
  box.innerHTML = '<div class="sv-sheet"><div class="sv-loading">Loading\u2026</div></div>';
  box.classList.add('open');
  document.body.classList.add('drawer-open');          // same scroll lock as the drawer

  const [sub, questions] = await Promise.all([_subjectFor(ev.subjectId), _questionsFor(ev)]);
  const teacher = (sub && sub.teacherName) || await _teacherName(ev.teacherId || (sub && sub.teacherId));

  // Same rule as the app: the score saved at submission, recomputed only if
  // missing - dividing by the items actually answered.
  const ratings = ev.ratings || {};
  const answered = Object.values(ratings).map(Number).filter(n => !isNaN(n));
  const overall = (Number(ev.totalScore) > 0)
    ? Number(ev.totalScore)
    : (answered.length ? Math.round(answered.reduce((a, b) => a + b, 0) / (answered.length * 5) * 10000) / 100 : 0);

  const dateStr = ev.timestamp
    ? new Date(ev.timestamp).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
    : '\u2014';

  let lastSec = null;
  const rows = questions.map(q => {
    let head = '';
    if (q.sec && q.sec !== lastSec && typeof SECTIONS !== 'undefined' && SECTIONS[q.sec]) {
      head = '<div class="sv-sec">' + escapeHtml(SECTIONS[q.sec]) + '</div>';
      lastSec = q.sec;
    }
    const r = ratings[q.id];
    return head + '<div class="sv-row"><div class="sv-q">' + escapeHtml(q.text) + '</div>' +
      '<div class="sv-badge" data-val="' + (r == null ? '-' : escapeHtml(String(r))) + '">' +
        (r == null ? '\u2013' : escapeHtml(String(r))) + '</div></div>';
  }).join('');

  box.innerHTML =
    '<div class="sv-sheet">' +
      '<div class="sv-bar">' +
        '<button type="button" class="sv-back" id="svClose" aria-label="Back">' +
          '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>' +
        '</button>' +
        '<div class="sv-title">Your Submitted Ratings</div>' +
      '</div>' +
      '<div class="sv-body">' +
        '<div class="sv-summary">' +
          '<div class="sv-subject">' + escapeHtml(sub ? (sub.code + ' \u2014 ' + sub.name) : 'Subject') + '</div>' +
          (teacher ? '<div class="sv-teacher">' + escapeHtml(teacher) + '</div>' : '') +
          '<div class="sv-date">Submitted ' + escapeHtml(dateStr) + '</div>' +
          '<div class="sv-overall">Overall Rating: ' + overall.toFixed(2) + '%</div>' +
          '<div class="sv-remark">' + escapeHtml(getRemarks(overall)) + '</div>' +
        '</div>' +
        rows +
        '<div class="sv-comment-label">Your Comment</div>' +
        '<div class="sv-comment">' + (ev.comment && ev.comment.trim() ? escapeHtml(ev.comment.trim()) : '<span class="sv-none">(none)</span>') + '</div>' +
      '</div>' +
    '</div>';

  const close = document.getElementById('svClose');
  close.onclick = closeSubmissionView;
  close.focus({ preventScroll: true });
}

function closeSubmissionView() {
  const box = document.getElementById('submissionView');
  if (box) box.classList.remove('open');
  document.body.classList.remove('drawer-open');
}

// Escape and a tap on the dimmed edge both close it, like the drawer.
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    const box = document.getElementById('submissionView');
    if (box && box.classList.contains('open')) closeSubmissionView();
  }
});
document.addEventListener('click', function (e) {
  if (e.target && e.target.id === 'submissionView') closeSubmissionView();
});

// Row click / Enter / Space -> open the ratings. Shared by both lists.
function _svKey(e, id) {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openSubmissionView(id); }
}

// Own submitted ratings and comments.
async function renderFeedback() {
  showSkeleton('feedback');
  await loadStudentData();

  const banner    = document.getElementById('feedbackNoticeBanner');
  const listEl    = document.getElementById('feedbackList');
  const countEl   = document.getElementById('feedbackCount');

  let periodOpen = false;
  try {
    const snap = await db.collection('settings').doc('evalPeriod').get();
    if (snap.exists) periodOpen = snap.data().open === true;
  } catch(e) {
    try {
      const local = localStorage.getItem('evalPeriod');
      if (local) periodOpen = JSON.parse(local).open === true;
    } catch(_) {}
  }

  const subMap = {};
  mySubjects.forEach(s => subMap[s.docId] = s);

  // REMOVED: a lookup that fetched subjects missing from the enrolment.
  // It existed to label them instead of showing "Unknown Subject", but it also
  // put unenrolled subjects back into subMap - which would defeat the filter
  // below, since that filter asks whether the subject is still enrolled.

  const teacherMap = {};
  const teacherIds = [...new Set(
    Object.values(subMap).map(sub => sub && sub.teacherId).filter(Boolean)
  )];
  await Promise.all(teacherIds.map(async id => {
    try {
      const d = await db.collection('teachers').doc(id).get();
      if (d.exists) teacherMap[id] = (d.data().name) || '—';
    } catch (e) { /* falls back to a dash */ }
  }));

  // Same rule as My Evaluations: only subjects still on the student's enrolment.
  const withComments = myEvals.filter(e =>
    e.comment && e.comment.trim() !== '' && e.subjectId && subMap[e.subjectId]);
  const sorted       = [...withComments].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  if (periodOpen) {
    banner.style.display = 'block';
    banner.innerHTML = `
      <div style="background:#fef3c7; border:1px solid #fcd34d; border-radius:10px; padding:12px 16px; margin-bottom:16px; font-size:0.8rem; color:#92400e; display:flex; align-items:center; gap:10px;">
        <span style="font-size:1rem;"></span>
        <span>The evaluation period is still <strong>open</strong>. Comments are shown here for your reference but faculty cannot see them yet.</span>
      </div>`;
  } else {
    banner.style.display = 'none';
  }

  countEl.textContent = `${sorted.length} comment${sorted.length !== 1 ? 's' : ''}`;

  if (!sorted.length) {
    listEl.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">💬</div>
        <div class="empty-text">You haven't left any comments yet.<br>
          <span style="font-size:0.75rem;">Comments are optional when submitting an evaluation.</span>
        </div>
      </div>`;
    return;
  }

  listEl.innerHTML = sorted.map(ev => {
    const sub         = subMap[ev.subjectId];
    const subjectName = sub ? sub.name : 'Unknown Subject';
    const subjectCode = sub ? sub.code : '—';
    const teacherName = ev.teacherId && teacherMap[ev.teacherId] ? teacherMap[ev.teacherId] : 'Unknown Teacher';
    const dateStr     = new Date(ev.timestamp).toLocaleDateString('en-PH', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    const score       = ev.totalScore ?? '—';
    const scoreColor  = score >= 90 ? '#16a34a' : score >= 75 ? '#2563eb' : score >= 60 ? '#d97706' : '#dc2626';

    const key = escapeHtml(ev.docId || ev.id || '');
    return `
      <div class="sv-clickable" role="button" tabindex="0"
           onclick="openSubmissionView('${key}')" onkeydown="_svKey(event,'${key}')"
           aria-label="View your full ratings for ${escapeHtml(subjectName)}"
           style="padding:16px 0; border-bottom:1px solid var(--border);">
        <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:12px; flex-wrap:wrap; margin-bottom:10px;">
          <div>
            <div style="font-weight:700; font-size:0.88rem;">${escapeHtml(subjectName)}</div>
            <div style="font-size:0.72rem; color:var(--muted); font-family:'Sora',monospace; margin-top:2px;">${escapeHtml(subjectCode)} · ${escapeHtml(teacherName)}</div>
            <div style="font-size:0.7rem; color:var(--muted); margin-top:2px;">${dateStr}</div>
          </div>
          <div style="text-align:right; flex-shrink:0;">
            <div style="font-size:1.3rem; font-weight:800; color:${scoreColor}; line-height:1;">${score}%</div>
            <div style="font-size:0.65rem; color:var(--muted);">score given</div>
          </div>
        </div>
        <div style="background:#f8fafc; border-left:3px solid var(--emerald); border-radius:0 8px 8px 0; padding:10px 14px;">
          <div style="font-size:0.7rem; font-weight:700; color:var(--emerald); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:5px;">Your Comment</div>
          <div style="font-size:0.83rem; color:var(--slate); line-height:1.6; font-style:italic;">"${escapeHtml(ev.comment.trim())}"</div>
        </div>
        <div class="sv-hint">Tap to see all your ratings</div>
      </div>`;
  }).join('') + '<div style="height:4px;"></div>';
}

async function renderProfile() {
  await loadStudentData();

  const s = currentStudent;
  const initials = s.name ? s.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase() : 'S';

  document.getElementById('profileAvatarLg').textContent = initials;
  document.getElementById('profileName').textContent = s.name || '—';
  document.getElementById('profileSid').textContent  = `ID: ${s.sid || '—'}`;
  document.getElementById('profileStatusBadge').textContent = `● ${s.status === 'active' ? 'Active' : 'Inactive'}`;

  document.getElementById('profileInfoGrid').innerHTML = [
    { label: 'Student ID',   value: s.sid || '—' },
    { label: 'Full Name',    value: s.name || '—' },
    { label: 'Department',   value: s.dept || '—' },
    { label: 'Year Level',   value: s.yearLevel || s.year || '—' },
    { label: 'Course',       value: s.course || s.program || '—' },
    { label: 'Account Status', value: s.status || '—' }
  ].map(item => `
    <div class="info-item">
      <div class="info-label">${item.label}</div>
      <div class="info-value">${item.value}</div>
    </div>`).join('');

  const done    = mySubjects.filter(sub => myEvals.some(e => e.subjectId === sub.docId)).length;
  const pending = mySubjects.length - done;

  document.getElementById('profileEvalSummary').innerHTML = `
    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(140px,1fr)); gap:14px;">
      <div class="info-item" style="text-align:center;">
        <div style="font-size:1.8rem; font-weight:800; color:var(--forest); line-height:1;">${mySubjects.length}</div>
        <div class="info-label" style="margin-top:4px;">Enrolled Subjects</div>
      </div>
      <div class="info-item" style="text-align:center;">
        <div style="font-size:1.8rem; font-weight:800; color:var(--success); line-height:1;">${done}</div>
        <div class="info-label" style="margin-top:4px;">Completed</div>
      </div>
      <div class="info-item" style="text-align:center;">
        <div style="font-size:1.8rem; font-weight:800; color:var(--warning); line-height:1;">${pending}</div>
        <div class="info-label" style="margin-top:4px;">Remaining</div>
      </div>
    </div>`;
}