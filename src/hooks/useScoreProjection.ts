import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Subject, Topic, ScoreProjection } from '../types';

export function useScoreProjection() {
  const [projectedScore, setProjectedScore] = useState(0);
  const [breakdown, setBreakdown] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function calculateProjection() {
    try {
      setLoading(true);
      
      // 1. Fetch subjects with topics
      const { data: subjects, error: suberr } = await supabase
        .from('subjects')
        .select('*, topics(*)');
      if (suberr) throw suberr;

      // 2. Fetch mock tests
      const { data: mocks, error: mockerr } = await supabase
        .from('mock_tests')
        .select('*')
        .order('test_date', { ascending: false });
      if (mockerr) throw mockerr;

      let totalScore = 0;
      const subjectBreakdown: Record<string, number> = {};

      subjects?.forEach((subject: Subject & { topics: Topic[] }) => {
        // a. Topic completion % (micro-completion)
        const totalTopics = subject.topics?.length || 0;
        const completedTopics = subject.topics?.filter(t => t.status === 'completed').length || 0;
        const topicCompletionPct = totalTopics > 0 ? completedTopics / totalTopics : 0;

        // b. Lifecycle strategy completion (macro-completion)
        const strategyPct = (subject.lifecycle_step || 0) / 10;

        // c. Mock accuracy (performance)
        const relevantMocks = mocks?.filter((m: any) => m.subject_scores?.[subject.short_code] !== undefined).slice(0, 3) || [];
        
        let avgMockAccuracy = 0.5; // default to 50% if no data
        
        if (relevantMocks.length > 0) {
          avgMockAccuracy = relevantMocks.reduce((acc: number, m: any) => {
            const subjectScore = m.subject_scores[subject.short_code] || 0;
            const maxMarks = subject.gate_weightage_marks || 10;
            return acc + (subjectScore / Math.max(maxMarks, 1));
          }, 0) / relevantMocks.length;
        } else if (mocks && mocks.length > 0) {
          avgMockAccuracy = mocks.reduce((acc, m) => acc + (m.scored_marks / Math.max(m.total_marks, 1)), 0) / mocks.length;
        }

        if (isNaN(avgMockAccuracy)) avgMockAccuracy = 0.5;

        // Realistic Formula: 30% Topics + 30% Strategy + 40% Mock Performance
        const readiness = (
          0.3 * topicCompletionPct +
          0.3 * strategyPct +
          0.4 * avgMockAccuracy
        );

        const subjectProjected = readiness * subject.gate_weightage_marks;
        totalScore += subjectProjected;
        subjectBreakdown[subject.short_code] = subjectProjected;
      });

      setProjectedScore(Math.round(totalScore));
      setBreakdown(subjectBreakdown);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    calculateProjection();
  }, []);

  return { projectedScore, breakdown, loading, error, refetch: calculateProjection };
}

export function useSaveProjection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveProjection(projection: Omit<ScoreProjection, 'id' | 'recorded_at'>) {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('score_projections')
        .insert(projection as any)
        .select()
        .single();
      if (err) throw err;
      return { success: true, data };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }

  return { saveProjection, loading, error };
}
