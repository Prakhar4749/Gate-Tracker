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
