import { useAppData, useScoreProjectionCtx } from '../context/AppDataContext';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { useState } from 'react';
import type { ScoreProjection } from '../types';

export const useScoreProjection = () => {
  const ctx = useScoreProjectionCtx();
  return {
    ...ctx,
    breakdown: ctx.subjectProjections.reduce((acc, sp) => {
      acc[sp.subject.short_code] = sp.projectedMarks;
      return acc;
    }, {} as Record<string, number>)
  };
};

export function useSaveProjection() {
  const { refresh, optimisticUpdate } = useAppData();
  const [loading, setLoading] = useState(false);

  const saveProjection = async (projection: Omit<ScoreProjection, 'id' | 'recorded_at'>) => {
    setLoading(true);
    const tempId = `temp-${Date.now()}`;
    const newRecord = { 
      ...projection, 
      id: tempId, 
      recorded_at: new Date().toISOString() 
    } as ScoreProjection;

    optimisticUpdate('scoreProjections', prev => [newRecord, ...prev]);

    const { error, data } = await supabase
      .from('score_projections')
      .insert(projection)
      .select()
      .single();

    setLoading(false);

    if (error) {
      toast.error('Failed to save projection');
      await refresh('scoreProjections'); // rollback
      return { success: false, error: error.message };
    }

    await refresh('scoreProjections');
    return { success: true, data };
  };

  return { saveProjection, loading };
}
