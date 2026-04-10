import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Subject } from '../types';

export function useSubjects() {
  const [data, setData] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchSubjects() {
    try {
      setLoading(true);
      const { data: subjects, error: suberr } = await supabase
        .from('subjects')
        .select('*, topics(*)')
        .order('sort_order', { ascending: true });

      if (suberr) throw suberr;
      setData(subjects || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSubjects();
  }, []);

  return { data, loading, error, refetch: fetchSubjects };
}

export function useSubject(id: string) {
  const [data, setData] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchSubject() {
    if (!id) return;
    try {
      setLoading(true);
      const { data: subject, error: suberr } = await supabase
        .from('subjects')
        .select('*, topics(*)')
        .eq('id', id)
        .single();

      if (suberr) throw suberr;
      setData(subject);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSubject();
  }, [id]);

  return { data, loading, error, refetch: fetchSubject };
}

export function useUpdateSubjectLifecycle() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updateLifecycle(subjectId: string, step: number) {
    if (!subjectId) return { success: false, error: 'Subject ID is required' };
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: err } = await supabase
        .from('subjects')
        .update({ lifecycle_step: step })
        .eq('id', subjectId)
        .select();

      if (err) {
        console.error('Supabase PATCH error:', err);
        throw err;
      }
      
      return { success: true, data };
    } catch (err: any) {
      const msg = err.message || 'Failed to update subject strategy';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }

  return { updateLifecycle, loading, error };
}
