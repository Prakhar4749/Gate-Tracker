import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Topic, StatusType } from '../types';

export function useTopics(subjectId?: string) {
  const [data, setData] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchTopics() {
    try {
      setLoading(true);
      let query = supabase.from('topics').select('*, subjects(*)').order('sort_order', { ascending: true });
      if (subjectId) {
        query = query.eq('subject_id', subjectId);
      }
      const { data: topics, error: toperr } = await query;

      if (toperr) throw toperr;
      setData(topics || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTopics();
  }, [subjectId]);

  return { data, loading, error, refetch: fetchTopics };
}

export function useUpdateTopicStatus() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(topicId: string, status: StatusType) {
    try {
      setLoading(true);
      const { error: err } = await supabase
        .from('topics')
        .update({ status, last_studied_at: new Date().toISOString() })
        .eq('id', topicId);
      if (err) throw err;
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }

  return { updateStatus, loading, error };
}

export function useUpdateTopicNotes() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updateNotes(topicId: string, notes: string) {
    try {
      setLoading(true);
      const { error: err } = await supabase
        .from('topics')
        .update({ notes })
        .eq('id', topicId);
      if (err) throw err;
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }

  return { updateNotes, loading, error };
}

export function useUpdateTopicLifecycle() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updateLifecycle(topicId: string, step: number) {
    try {
      setLoading(true);
      const { error: err } = await supabase
        .from('topics')
        .update({ lifecycle_step: step })
        .eq('id', topicId);
      if (err) throw err;
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }

  return { updateLifecycle, loading, error };
}
