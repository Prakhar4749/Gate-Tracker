import {
  createContext, useContext, useEffect, useRef,
  useState, useCallback, ReactNode
} from 'react';
import { supabase } from '../lib/supabase';
import type {
  Subject, Topic, DailyLog, MockTest,
  Note, ScoreProjection, PracticeResource
} from '../types';
import { 
  marksToGateScore, 
  marksToRank, 
  getReachableIITs, 
  getConfidenceLevel, 
  marksGapToScore 
} from '../lib/utils';

// ── Types ──────────────────────────────────────────────────────────────────

interface AppData {
  subjects: Subject[];
  topics: Topic[];
  dailyLogs: DailyLog[];
  mockTests: MockTest[];
  notes: Note[];
  scoreProjections: ScoreProjection[];
  practiceResources: PracticeResource[];
  watchedResourceIds: Set<string>;
}

type TableKey = keyof AppData;

interface AppDataContextValue {
  data: AppData;
  isInitialLoad: boolean;
  loadingTables: Set<TableKey>;
  refresh: (table: TableKey) => Promise<void>;
  optimisticUpdate: <K extends TableKey>(
    table: K,
    updater: (prev: AppData[K]) => AppData[K]
  ) => void;
}

// ── Defaults ───────────────────────────────────────────────────────────────

const defaultData: AppData = {
  subjects: [], topics: [], dailyLogs: [],
  mockTests: [], notes: [], scoreProjections: [],
  practiceResources: [], watchedResourceIds: new Set(),
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

// ── Fetchers ───────────────────────────────────────────────────────────────

const fetchers: Record<TableKey, () => Promise<AppData[TableKey]>> = {
  subjects: async () => {
    const { data } = await supabase.from('subjects').select('*').order('sort_order');
    return data ?? [];
  },
  topics: async () => {
    const { data } = await supabase.from('topics').select('*').order('sort_order');
    return data ?? [];
  },
  dailyLogs: async () => {
    const { data } = await supabase
      .from('daily_logs').select('*')
      .order('log_date', { ascending: false }).limit(365);
    return data ?? [];
  },
  mockTests: async () => {
    const { data } = await supabase
      .from('mock_tests').select('*')
      .order('test_date', { ascending: false });
    return data ?? [];
  },
  notes: async () => {
    const { data } = await supabase
      .from('notes').select('*')
      .order('is_pinned', { ascending: false })
      .order('updated_at', { ascending: false });
    return data ?? [];
  },
  scoreProjections: async () => {
    const { data } = await supabase
      .from('score_projections').select('*')
      .order('recorded_at', { ascending: false }).limit(50);
    return data ?? [];
  },
  practiceResources: async () => {
    const { data } = await supabase
      .from('practice_resources')
      .select('*, subjects(name, short_code, color_hex)')
      .order('sort_order');
    return data ?? [];
  },
  watchedResourceIds: async () => {
    const { data } = await supabase.from('watched_resources').select('resource_id');
    return new Set((data ?? []).map((r: any) => r.resource_id));
  },
};

// ── Provider ───────────────────────────────────────────────────────────────

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(defaultData);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [loadingTables, setLoadingTables] = useState<Set<TableKey>>(
    new Set(Object.keys(defaultData) as TableKey[])
  );
  const lastFetched = useRef<Partial<Record<TableKey, number>>>({});

  const setTableLoading = (table: TableKey, value: boolean) =>
    setLoadingTables(prev => {
      const next = new Set(prev);
      value ? next.add(table) : next.delete(table);
      return next;
    });

  const refresh = useCallback(async (table: TableKey) => {
    setTableLoading(table, true);
    try {
      const result = await fetchers[table]();
      setData(prev => ({ ...prev, [table]: result }));
      lastFetched.current[table] = Date.now();
    } catch (err) {
      console.error(`Failed to refresh ${table}:`, err);
    } finally {
      setTableLoading(table, false);
    }
  }, []);

  const optimisticUpdate = useCallback(<K extends TableKey>(
    table: K,
    updater: (prev: AppData[K]) => AppData[K]
  ) => {
    setData(prev => ({ ...prev, [table]: updater(prev[table] as AppData[K]) }));
  }, []);

  // Initial fetch — subjects + topics first, rest in parallel
  useEffect(() => {
    (async () => {
      // Priority fetch
      const [subjects, topics] = await Promise.all([
        fetchers.subjects(), fetchers.topics()
      ]);
      setData(prev => ({ ...prev, subjects, topics }));
      setTableLoading('subjects', false);
      setTableLoading('topics', false);
      lastFetched.current.subjects = Date.now();
      lastFetched.current.topics = Date.now();

      // Rest in parallel
      const keys: TableKey[] = [
        'dailyLogs', 'mockTests', 'notes',
        'practiceResources', 'watchedResourceIds'
      ];
      const results = await Promise.all(keys.map(k => fetchers[k]()));
      const updates: Partial<AppData> = {};
      keys.forEach((k, i) => {
        updates[k] = results[i] as any;
        lastFetched.current[k] = Date.now();
      });
      setData(prev => ({ ...prev, ...updates }));
      keys.forEach(k => setTableLoading(k, false));
      setIsInitialLoad(false);
    })();
  }, []);

  return (
    <AppDataContext.Provider value={{
      data, isInitialLoad, loadingTables, refresh, optimisticUpdate
    }}>
      {children}
    </AppDataContext.Provider>
  );
}

// ── Base hook ──────────────────────────────────────────────────────────────

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used inside <AppDataProvider>');
  return ctx;
}

// ── Selector hooks (read from context, zero network calls) ─────────────────

export function useSubjectsCtx() {
  const { data, loadingTables, refresh } = useAppData();
  const subjectsWithTopics = data.subjects.map(s => ({
    ...s,
    topics: data.topics.filter(t => t.subject_id === s.id),
  }));

  return {
    data: subjectsWithTopics,
    subjects: data.subjects,
    loading: loadingTables.has('subjects') || loadingTables.has('topics'),
    refetch: () => Promise.all([refresh('subjects'), refresh('topics')]),
    subjectsWithTopics,
  };
}

export function useTopicsCtx(subjectId?: string) {
  const { data, loadingTables, refresh } = useAppData();
  const topics = subjectId
    ? data.topics.filter(t => t.subject_id === subjectId)
    : data.topics;

  return {
    data: topics,
    topics,
    loading: loadingTables.has('topics'),
    refetch: () => refresh('topics'),
  };
}

export function useDailyLogsCtx() {
  const { data, loadingTables, refresh } = useAppData();
  return {
    data: data.dailyLogs,
    dailyLogs: data.dailyLogs,
    loading: loadingTables.has('dailyLogs'),
    refetch: () => refresh('dailyLogs'),
    // Today's log helper
    todayLog: data.dailyLogs.find(
      l => l.log_date === new Date().toISOString().split('T')[0]
    ) ?? null,
    // Get log by specific date
    getLogByDate: (date: string) =>
      data.dailyLogs.find(l => l.log_date === date) ?? null,
    // Dates that have logs (for calendar highlighting)
    studiedDates: new Set(data.dailyLogs.map(l => l.log_date)),
  };
}

export function useMockTestsCtx() {
  const { data, loadingTables, refresh } = useAppData();
  return {
    data: data.mockTests,
    mockTests: data.mockTests,
    loading: loadingTables.has('mockTests'),
    refetch: () => refresh('mockTests'),
    latestMock: data.mockTests[0] ?? null,
    averageScore: data.mockTests.length > 0
      ? Math.round(
          data.mockTests.reduce((a, m) => a + (m.scored_marks / m.total_marks) * 100, 0)
          / data.mockTests.length
        )
      : 0,
  };
}

export function useNotesCtx(filters?: {
  subjectId?: string;
  topicId?: string;
  search?: string;
  pinned?: boolean;
  noteType?: string;
}) {
  const { data, loadingTables, refresh } = useAppData();
  let notes = data.notes;
  if (filters?.subjectId) notes = notes.filter(n => n.subject_id === filters.subjectId);
  if (filters?.topicId)   notes = notes.filter(n => n.topic_id === filters.topicId);
  if (filters?.pinned)    notes = notes.filter(n => n.is_pinned);
  if (filters?.noteType)  notes = notes.filter(n => (n as any).note_type === filters.noteType);
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    notes = notes.filter(n =>
      n.title.toLowerCase().includes(q) ||
      (n.content ?? '').toLowerCase().includes(q) ||
      (n.tags ?? []).some(t => t.toLowerCase().includes(q))
    );
  }
  return { 
    data: notes,
    notes, 
    loading: loadingTables.has('notes'),
    refetch: () => refresh('notes'),
  };
}

export function usePracticeResourcesCtx(subjectId?: string) {
  const { data, loadingTables, refresh } = useAppData();
  const resources = subjectId
    ? data.practiceResources.filter(r => r.subject_id === subjectId)
    : data.practiceResources;

  return {
    data: resources,
    resources,
    watchedIds: data.watchedResourceIds,
    loading: loadingTables.has('practiceResources'),
    refetch: () => refresh('practiceResources'),
  };
}

export function useScoreProjectionCtx() {
  const { data, loadingTables, refresh } = useAppData();
  const { subjects, topics, mockTests, dailyLogs } = data;

  // ── Per-subject readiness calculation ──────────────────────────────────

  const subjectProjections = subjects.map(subject => {
    const subjectTopics = topics.filter(t => t.subject_id === subject.id);
    const totalTopics = subjectTopics.length || 1;

    // 1. Topic completion (30% weight)
    const completedTopics = subjectTopics.filter(
      t => t.status === 'completed' || t.status === 'needs_revision'
    ).length;
    const inProgressTopics = subjectTopics.filter(t => t.status === 'in_progress').length;
    // In-progress counts as 50% complete
    const topicCompletion = (completedTopics + inProgressTopics * 0.5) / totalTopics;

    // 2. Mock accuracy (50% weight) — most reliable signal
    const subjectMocks = mockTests.filter(
      m => m.subject_scores && m.subject_scores[subject.short_code] !== undefined
    );
    const mockAccuracy = subjectMocks.length > 0
      ? subjectMocks.reduce((acc, m) => {
          const scored = m.subject_scores[subject.short_code] ?? 0;
          return acc + scored / Math.max(subject.gate_weightage_marks, 1);
        }, 0) / subjectMocks.length
      : null; // null = no mock data

    // 3. PYQ accuracy (20% weight) — from daily logs, excluding theory-only
    const pyqLogs = dailyLogs.filter(
      l => l.subject_id === subject.id &&
           l.pyqs_solved !== null && (l.pyqs_solved ?? 0) > 0
    );
    const pyqAccuracy = pyqLogs.length > 0
      ? pyqLogs.reduce((acc, l) =>
          acc + (l.pyqs_correct ?? 0) / Math.max(l.pyqs_solved ?? 1, 1), 0
        ) / pyqLogs.length
      : null; // null = no PYQ data

    // 4. Composite readiness
    let readiness: number;
    if (mockAccuracy === null && pyqAccuracy === null) {
      readiness = topicCompletion * 0.4;
    } else if (mockAccuracy === null) {
      readiness = 0.5 * topicCompletion + 0.5 * (pyqAccuracy ?? 0);
    } else if (pyqAccuracy === null) {
      readiness = 0.4 * topicCompletion + 0.6 * mockAccuracy;
    } else {
      readiness = 0.3 * topicCompletion + 0.5 * mockAccuracy + 0.2 * pyqAccuracy;
    }

    readiness = Math.max(0, Math.min(1, readiness));
    const projectedMarks = readiness * subject.gate_weightage_marks;

    return {
      subject,
      topicCompletion,
      mockAccuracy,
      pyqAccuracy,
      readiness,
      projectedMarks: Math.round(projectedMarks * 10) / 10,
      maxMarks: subject.gate_weightage_marks,
      gap: Math.max(0, subject.gate_weightage_marks - projectedMarks),
      hasMockData: mockAccuracy !== null,
      hasPYQData: pyqAccuracy !== null,
    };
  });

  // ── Total raw marks estimate (out of 100) ─────────────────────────────

  const estimatedRawMarks = Math.round(
    subjectProjections.reduce((acc, s) => acc + s.projectedMarks, 0) * 10
  ) / 10;

  // ── Convert to GATE Score and Rank using official formula ─────────────

  const gateScore = marksToGateScore(estimatedRawMarks);
  const estimatedRank = marksToRank(estimatedRawMarks);
  const reachableIITs = getReachableIITs(gateScore);

  // ── Confidence level ──────────────────────────────────────────────────

  const topicsStarted = topics.filter(t => t.status !== 'not_started').length;
  const confidence = getConfidenceLevel(mockTests.length, topicsStarted, topics.length);

  // ── Target gap analysis ───────────────────────────────────────────────

  const targetScore = 750;
  const targetMarks = marksGapToScore(targetScore);
  const marksNeeded = Math.max(0, targetMarks - estimatedRawMarks);

  const topGapSubjects = [...subjectProjections]
    .sort((a, b) => (b.gap * b.maxMarks) - (a.gap * a.maxMarks))
    .slice(0, 5);

  return {
    estimatedRawMarks,
    gateScore,
    estimatedRank,
    confidence,
    subjectProjections,
    reachableIITs,
    topGapSubjects,
    targetScore,
    targetMarks,
    marksNeeded,
    scoreGap: Math.max(0, targetScore - gateScore),
    mockCount: mockTests.length,
    topicsStarted,
    totalTopics: topics.length,
    loading: loadingTables.has('subjects') || loadingTables.has('topics') || loadingTables.has('mockTests'),
    savedProjections: data.scoreProjections,
    refetch: () => Promise.all([refresh('subjects'), refresh('topics'), refresh('mockTests'), refresh('scoreProjections')]),
    
    // For compatibility
    data: {
      projectedScore: gateScore,
      estimatedRawMarks,
      estimatedRank,
      confidence,
    }
  };
}
