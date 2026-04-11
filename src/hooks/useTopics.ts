import { useAppData, useTopicsCtx } from '../context/AppDataContext';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export const useTopics = useTopicsCtx;

export function useUpdateTopicStatus() {
  const { optimisticUpdate, refresh } = useAppData();
  return async (topicId: string, status: string) => {
    optimisticUpdate('topics', prev =>
      prev.map(t => t.id === topicId
        ? { ...t, status, last_studied_at: new Date().toISOString() }
        : t
      )
    );
    const { error } = await supabase
      .from('topics')
      .update({ status, last_studied_at: new Date().toISOString() })
      .eq('id', topicId);
    if (error) { toast.error('Failed to update'); await refresh('topics'); }
  };
}

export function useUpdateTopicNotes() {
  const { optimisticUpdate } = useAppData();
  return async (topicId: string, notes: string) => {
    optimisticUpdate('topics', prev =>
      prev.map(t => t.id === topicId ? { ...t, notes } : t)
    );
    await supabase.from('topics').update({ notes }).eq('id', topicId);
  };
}
