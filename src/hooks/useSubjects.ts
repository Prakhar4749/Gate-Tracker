import { useAppData, useSubjectsCtx, useTopicsCtx } from '../context/AppDataContext';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export const useSubjects = useSubjectsCtx;
export const useTopics = useTopicsCtx;

export function useUpdateSubjectLifecycle() {
  const { refresh, optimisticUpdate } = useAppData();

  const updateLifecycle = async (subjectId: string, step: number) => {
    // Optimistic update
    optimisticUpdate('subjects', prev => 
      prev.map(s => s.id === subjectId ? { ...s, lifecycle_step: step } : s)
    );

    const { error } = await supabase
      .from('subjects')
      .update({ lifecycle_step: step })
      .eq('id', subjectId);

    if (error) {
      toast.error('Failed to update strategy');
      await refresh('subjects'); // rollback
      return { success: false, error: error.message };
    }

    await refresh('subjects');
    return { success: true };
  };

  return { updateLifecycle };
}
