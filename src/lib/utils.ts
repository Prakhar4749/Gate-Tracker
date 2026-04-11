import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { RANK_VS_SCORE_2024 } from "./constants";

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date));
}

export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

export function getStrengthColor(strength: string): string {
  const map: Record<string, string> = {
    strong: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400',
    focus: 'text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-400',
    build: 'text-rose-600 bg-rose-50 dark:bg-rose-950 dark:text-rose-400',
  };
  return map[strength] ?? 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400';
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    completed: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400',
    in_progress: 'text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400',
    needs_revision: 'text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-400',
    not_started: 'text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400',
  };
  return map[status] ?? 'text-slate-500 bg-slate-100';
}

export function interpolateRank(marks: number): number {
  const data = RANK_VS_SCORE_2024; // sorted by marks desc
  // Find the two surrounding points and linear interpolate
  for (let i = 0; i < data.length - 1; i++) {
    if (marks <= data[i].marks && marks >= data[i+1].marks) {
      const ratio = (data[i].marks - marks) / (data[i].marks - data[i+1].marks);
      return Math.round(data[i].rank + ratio * (data[i+1].rank - data[i].rank));
    }
  }
  if (marks >= data[0].marks) return 1;
  // If marks are lower than the last data point, provide a rough estimate
  const lastPoint = data[data.length - 1];
  if (marks < lastPoint.marks) {
    // Extrapolation: roughly 10k rank for 40 marks, 20k for 30 marks
    if (marks <= 0) return 100000;
    const diff = lastPoint.marks - marks;
    return Math.round(lastPoint.rank + (diff * 2000)); 
  }
  return data[data.length-1].rank;
}

export function extractYoutubeId(url: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    // Standard watch URL: youtube.com/watch?v=VIDEO_ID
    if (u.searchParams.get('v')) return u.searchParams.get('v');
    // Short URL: youtu.be/VIDEO_ID
    if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('?')[0];
    // Live URL: youtube.com/live/VIDEO_ID
    if (u.pathname.startsWith('/live/')) return u.pathname.split('/live/')[1].split('?')[0];
    // Playlist: show a generic playlist thumbnail
    if (u.searchParams.get('list')) return null; // playlist — no single thumbnail
  } catch { return null; }
  return null;
}

export function getYoutubeThumbnail(url: string | null): string {
  if (!url) return '';
  const id = extractYoutubeId(url);
  if (id) return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
  return ''; // playlist fallback — use a colored placeholder
}

// ── GATE 2026 CSE: Official marks vs rank lookup table ────────────────────
export const GATE_2026_CSE_MARKS_RANK: Array<{ marks: number; rank: number; score: number }> = [
  { marks: 100, rank: 1,     score: 1000 },
  { marks: 90,  rank: 3,     score: 1000 },
  { marks: 85,  rank: 8,     score: 970  },
  { marks: 80,  rank: 30,    score: 913  },
  { marks: 75,  rank: 75,    score: 854  },
  { marks: 72,  rank: 125,   score: 820  },
  { marks: 70,  rank: 175,   score: 795  },
  { marks: 68,  rank: 240,   score: 772  },
  { marks: 65,  rank: 340,   score: 736  },
  { marks: 62,  rank: 500,   score: 701  },
  { marks: 58,  rank: 750,   score: 654  },
  { marks: 55,  rank: 1050,  score: 619  },
  { marks: 52,  rank: 1500,  score: 583  },
  { marks: 50,  rank: 2100,  score: 560  },
  { marks: 45,  rank: 3200,  score: 501  },
  { marks: 40,  rank: 5500,  score: 442  },
  { marks: 35,  rank: 9500,  score: 383  },
  { marks: 30,  rank: 16000, score: 350  },
  { marks: 25,  rank: 30000, score: 0    },
];

// ── Convert raw marks → GATE Score (official formula) ────────────────────
export function marksToGateScore(rawMarks: number): number {
  const Mq = 30;  // CSE 2026 qualifying marks
  const Mt = 85;  // Mean of top 0.1%
  const Sq = 350; // Score at qualifying mark
  const St = 900; // Score at top 0.1% mean
  if (rawMarks < Mq) return 0;
  const score = Sq + ((St - Sq) / (Mt - Mq)) * (rawMarks - Mq);
  return Math.round(Math.min(Math.max(score, 0), 1000));
}

// ── Interpolate rank from raw marks ──────────────────────────────────────
export function marksToRank(marks: number): number {
  const table = GATE_2026_CSE_MARKS_RANK;
  if (marks >= table[0].marks) return 1;
  if (marks <= table[table.length - 1].marks) return 50000;
  for (let i = 0; i < table.length - 1; i++) {
    const high = table[i];
    const low  = table[i + 1];
    if (marks <= high.marks && marks >= low.marks) {
      const ratio = (high.marks - marks) / (high.marks - low.marks);
      return Math.round(high.rank + ratio * (low.rank - high.rank));
    }
  }
  return 50000;
}

// ── IIT admission cutoffs ─────────────────────────────────────────────────
export const IIT_CUTOFFS = [
  { name: 'IIT Bombay',    minScore: 800, maxScore: 870, minMarks: 68 },
  { name: 'IIT Delhi',     minScore: 800, maxScore: 860, minMarks: 68 },
  { name: 'IIT Madras',    minScore: 780, maxScore: 840, minMarks: 66 },
  { name: 'IIT Kanpur',    minScore: 750, maxScore: 820, minMarks: 63 },
  { name: 'IIT Kharagpur', minScore: 720, maxScore: 800, minMarks: 61 },
  { name: 'IIT Roorkee',   minScore: 700, maxScore: 780, minMarks: 59 },
  { name: 'IIT Guwahati',  minScore: 650, maxScore: 730, minMarks: 54 },
  { name: 'IIT Hyderabad', minScore: 650, maxScore: 720, minMarks: 54 },
  { name: 'NIT Trichy',    minScore: 680, maxScore: 750, minMarks: 57 },
  { name: 'NIT Surathkal', minScore: 640, maxScore: 720, minMarks: 53 },
];

// ── Which IITs are reachable at this score ────────────────────────────────
export function getReachableIITs(gateScore: number) {
  return IIT_CUTOFFS.map(iit => ({
    ...iit,
    reachable: gateScore >= iit.minScore,
    borderline: gateScore >= iit.minScore - 50 && gateScore < iit.minScore,
    gap: Math.max(0, iit.minScore - gateScore),
  }));
}

// ── Confidence level ──────────────────────────────────────────────────────
export function getConfidenceLevel(
  mockCount: number,
  topicsStarted: number,
  _totalTopics: number
): 'very_low' | 'low' | 'medium' | 'high' {
  if (mockCount === 0 && topicsStarted === 0) return 'very_low';
  if (mockCount === 0) return 'low';
  if (mockCount < 3) return 'medium';
  return 'high';
}

// ── Marks gap to target ───────────────────────────────────────────────────
export function marksGapToScore(targetScore: number): number {
  // Given a target GATE score, what raw marks are needed?
  const Mq = 30; const Mt = 85; const Sq = 350; const St = 900;
  if (targetScore <= Sq) return Mq;
  const marks = Mq + ((targetScore - Sq) * (Mt - Mq)) / (St - Sq);
  return Math.round(Math.min(Math.max(marks, 0), 100));
}
