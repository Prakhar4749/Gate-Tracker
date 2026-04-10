export const TARGET_SCORE = 750;
export const CURRENT_SCORE = 461;
export const EXAM_DATE = '2027-02-01';
export const START_DATE = '2026-04-10';

export const SCORE_PROJECTION_WEIGHTS = {
  topic_completion: 0.4,
  mock_accuracy: 0.4,
  pyq_accuracy: 0.2,
  aptitude_weight: 0.5
};

export const STUDY_TRACKS = {
  track1: {
    name: 'Track 1 — New Subject Theory',
    description: 'Current new subject being learned (theory + chapter DPPs)',
    color: 'indigo',
    timeAllocation: 'Morning session'
  },
  track2: {
    name: 'Track 2 — Maths (Daily)',
    description: 'EM / DM / Aptitude — done throughout the year, 2–3 hrs/day',
    color: 'emerald',
    timeAllocation: 'Afternoon session',
    subjects: ['Engineering Mathematics', 'Discrete Mathematics', 'General Aptitude']
  },
  track3: {
    name: 'Track 3 — Completed Subject Practice',
    description: 'Revision + workbook practice of already completed subjects',
    color: 'amber',
    timeAllocation: 'Evening/Night session'
  }
};

export const SUBJECT_LIFECYCLE_STEPS = [
  { step: 1, label: 'Theory complete', description: 'Completed full subject theory' },
  { step: 2, label: 'Chapter DPPs done', description: 'Solved PW DPPs chapter-wise while studying' },
  { step: 3, label: 'Full revision done', description: 'Revised entire subject after completion' },
  { step: 4, label: 'Made Easy workbook', description: 'Solved Made Easy workbook without re-revision' },
  { step: 5, label: 'Mistakes noted', description: 'Noted all mistakes and weak topics' },
  { step: 6, label: 'Weak topics revised', description: 'Revised and re-solved weak topics' },
  { step: 7, label: 'Weak lectures watched', description: 'Re-watched lectures for remaining weak topics' },
  { step: 8, label: 'Weak topics re-solved', description: 'Solved weak topic questions again' },
  { step: 9, label: 'Backup teacher (if needed)', description: 'Used backup teacher for persistent weak topics only' },
  { step: 10, label: 'PYQs done → Confident', description: 'Completed PYQs, ready to move to next subject' }
];

export const COMBOS = [
  {
    id: 1, name: 'Combo 1', period: 'Apr–May 2026',
    subjects: ['Programming (C)', 'Data Structures', 'Algorithms'],
    time: { c: '20 days', ds: '20 days', algo: '20 days' },
    status: 'current',
    note: 'DS and Algo are strong — accelerate through these. C needs practice.'
  },
  {
    id: 2, name: 'Combo 2', period: 'May–Jun 2026',
    subjects: ['Digital Logic', 'Computer Organization & Architecture'],
    time: { dl: '15 days', coa: '1.5 months' },
    status: 'upcoming'
  },
  {
    id: 3, name: 'Combo 3', period: 'June 2026',
    subjects: ['DBMS'],
    time: { dbms: '1 month' },
    status: 'upcoming',
    note: 'DBMS is strong — aim to finish fast and bank more time for TOC'
  },
  {
    id: 4, name: 'Combo 4', period: 'Jul–Aug 2026',
    subjects: ['Theory of Computation', 'Compiler Design'],
    time: { toc: '1 month', cd: '15 days' },
    status: 'upcoming',
    note: 'TOC is highest avg weightage (8.5 marks). Do NOT rush this.'
  },
  {
    id: 5, name: 'Combo 5', period: 'Aug–Sep 2026',
    subjects: ['Computer Networks'],
    time: { cn: '1 month 10 days' },
    status: 'upcoming'
  },
  {
    id: 6, name: 'Combo 6', period: 'Sep–Oct 2026',
    subjects: ['Operating Systems'],
    time: { os: '1 month 10 days' },
    status: 'upcoming',
    note: 'OS is consistently 8–10 marks every year. Give full 1.5 months.'
  }
];

export const RANK_VS_SCORE_2024 = [
  { marks: 91.07, rank: 1, score: 1000 },
  { marks: 81.32, rank: 21, score: 936 },
  { marks: 77.62, rank: 51, score: 896 },
  { marks: 74.65, rank: 99, score: 863 },
  { marks: 68.88, rank: 280, score: 800 },
  { marks: 67.02, rank: 365, score: 780 },
  { marks: 65.19, rank: 468, score: 760 },
  { marks: 63.51, rank: 593, score: 742 },
  { marks: 62.04, rank: 722, score: 726 },
  { marks: 60.82, rank: 820, score: 712 },
  { marks: 55.00, rank: 1800, score: 650 },
  { marks: 50.00, rank: 3500, score: 580 },
  { marks: 45.00, rank: 6200, score: 510 },
  { marks: 42.00, rank: 8500, score: 470 },
  { marks: 40.00, rank: 9800, score: 450 },
  { marks: 39.50, rank: 10200, score: 445 },
  { marks: 35.00, rank: 15000, score: 390 },
  { marks: 30.00, rank: 22000, score: 330 },
];

export const GATE_WEIGHTAGE_HISTORY = {
  years: ['2017-1', '2018', '2019', '2020', '2021-1', '2021-2', '2022', '2023', '2024-1', '2024-2'],
  subjects: {
    'TOC': [12, 8, 8, 9, 8, 11, 8, 9, 5, 7],
    'OS': [6, 9, 10, 10, 6, 8, 10, 9, 10, 10],
    'CD': [6, 5, 6, 4, 7, 6, 4, 7, 10, 8],
    'COA': [10, 8, 4, 9, 5, 6, 7, 10, 8, 8],
    'ALGO': [6, 8, 6, 8, 9, 10, 6, 6, 9, 6],
    'PROG': [9, 8, 8, 3, 4, 6, 5, 1, 4, 4],
    'DS': [3, 2, 4, 7, 6, 2, 4, 8, 2, 4],
    'DL': [3, 6, 8, 6, 6, 7, 5, 6, 6, 6],
    'DBMS': [8, 6, 8, 8, 8, 7, 7, 5, 8, 8],
    'CN': [8, 7, 9, 6, 9, 7, 10, 8, 9, 9],
  }
};
