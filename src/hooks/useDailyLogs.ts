import { useAppData, useDailyLogsCtx } from '../context/AppDataContext';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import type { DailyLog } from '../types';

export const useDailyLogs = useDailyLogsCtx;

export function useCreateDailyLog() {
  const { refresh, optimisticUpdate } = useAppData();

  return async (log: Omit<DailyLog, 'id' | 'created_at'>) => {
    const tempId = `temp-${Date.now()}`;
    optimisticUpdate('dailyLogs', prev => [
      { ...log, id: tempId, created_at: new Date().toISOString() } as DailyLog,
      ...prev,
    ]);

    const { error, data } = await supabase.from('daily_logs').insert(log).select().single();

    if (error) {
      toast.error('Failed to save log');
      await refresh('dailyLogs'); // rollback
      return null;
    }
    await refresh('dailyLogs');
    return data;
  };
}

export function useUpdateDailyLog() {
  const { refresh, optimisticUpdate } = useAppData();

  return async (id: string, log: Partial<DailyLog>) => {
    optimisticUpdate('dailyLogs', prev =>
      prev.map(l => l.id === id ? { ...l, ...log } : l)
    );

    const { error, data } = await supabase.from('daily_logs').update(log).eq('id', id).select().single();

    if (error) {
      toast.error('Failed to update log');
      await refresh('dailyLogs'); // rollback
      return null;
    }
    await refresh('dailyLogs');
    return data;
  };
}

export function useDeleteDailyLog() {
  const { refresh, optimisticUpdate } = useAppData();

  return async (id: string) => {
    optimisticUpdate('dailyLogs', prev => prev.filter(l => l.id !== id));
    const { error } = await supabase.from('daily_logs').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete log');
      await refresh('dailyLogs');
      return false;
    }
    toast.success('Log deleted');
    return true;
  };
}
