import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { DailyLog } from '../types';

export function useDailyLogs() {
  const [data, setData] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchLogs() {
    try {
      setLoading(true);
      const { data: logs, error: logerr } = await supabase
        .from('daily_logs')
        .select('*, subjects(*), topics(*)')
        .order('log_date', { ascending: false });

      if (logerr) throw logerr;
      setData(logs || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLogs();
  }, []);

  return { data, loading, error, refetch: fetchLogs };
}

export function useDailyLog(date: string) {
  const [data, setData] = useState<DailyLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchLog() {
    if (!date) return;
    try {
      setLoading(true);
      const { data: log, error: logerr } = await supabase
        .from('daily_logs')
        .select('*, subjects(*), topics(*)')
        .eq('log_date', date)
        .single();

      if (logerr && logerr.code !== 'PGRST116') throw logerr;
      setData(log || null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLog();
  }, [date]);

  return { data, loading, error, refetch: fetchLog };
}

export function useCreateDailyLog() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createLog(log: Omit<DailyLog, 'id' | 'created_at'>) {
    try {
      setLoading(true);
      const { data: newLog, error: err } = await supabase
        .from('daily_logs')
        .insert(log)
        .select()
        .single();
      if (err) throw err;
      return { success: true, data: newLog };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }

  return { createLog, loading, error };
}

export function useUpdateDailyLog() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updateLog(id: string, log: Partial<DailyLog>) {
    try {
      setLoading(true);
      const { data: updatedLog, error: err } = await supabase
        .from('daily_logs')
        .update(log)
        .eq('id', id)
        .select()
        .single();
      if (err) throw err;
      return { success: true, data: updatedLog };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }

  return { updateLog, loading, error };
}
