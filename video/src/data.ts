// Made-up demo data only: no real names, IDs or ratings.
export const STUDENT = { name: 'Ana', id: '2023-04512', section: 'BSIT 3A', term: '1st Sem · SY 2026–2027' };

export const TEACHERS = [
  { code: 'IT 311', subject: 'Systems Integration', teacher: 'Prof. R. Dela Cruz' },
  { code: 'IT 312', subject: 'Web Development', teacher: 'Prof. L. Mercado' },
  { code: 'IT 313', subject: 'Information Assurance', teacher: 'Prof. J. Villanueva' },
  { code: 'GE 105', subject: 'Ethics', teacher: 'Prof. M. Rosales' },
];

// Statements from Annex A (SET) and Annex B (SEF) of CMO No. 19, as used by the app.
export const SET_ITEMS = [
  { n: 1, text: 'Comes to class on time.' },
  { n: 3, text: 'Maximizes the allocated time/learning hours effectively.' },
  { n: 8, text: 'Simplifies complex ideas in the lesson for ease of understanding.' },
  { n: 14, text: 'Provides immediate feedback on student outputs and performance.' },
];

export const SEF_ITEMS = [
  { n: 2, text: 'Submits updated syllabus, grade sheets, and other required reports on time.' },
  { n: 7, text: 'Demonstrates extensive and broad knowledge of the subject/course.' },
  { n: 9, text: 'Integrates contemporary issues and developments in the discipline in the syllabus.' },
];

export const SECTIONS = [
  { key: 'A', name: 'Management of Teaching and Learning' },
  { key: 'B', name: 'Content Knowledge, Pedagogy & Technology' },
  { key: 'C', name: 'Commitment and Transparency' },
];

export const ANNEX_C = { rows: [4.58, 4.49, 4.62], overall: 4.56, pct: 91.2, respondents: 38 };
export const ANNEX_D = { rows: [4.6, 4.53, 4.67], overall: 4.6, pct: 92.0, evaluator: 'Program Chair' };
export const FINAL = { pct: 91.6, remarks: 'Outstanding' };

export const SIGNATORIES = {
  prepared: { name: 'A. REYES', role: 'Evaluation Office' },
  reviewed: { name: 'D. SANTOS', role: 'Dean, CCIS' },
};
