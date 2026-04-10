import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { PracticeResource } from '../types';

export function usePracticeResources(subjectId?: string) {
  const [data, setData] = useState<PracticeResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchResources() {
    try {
      setLoading(true);
      
      // Fetch resources
      let query = supabase
        .from('practice_resources')
        .select('*, subjects(*)')
        .order('sort_order', { ascending: true });
      
      if (subjectId && subjectId !== 'all') {
        query = query.eq('subject_id', subjectId);
      }
      
      const { data: resources, error: resErr } = await query;
      if (resErr) throw resErr;

      // Fetch watched status
      const { data: watched, error: watchErr } = await supabase
        .from('watched_resources')
        .select('resource_id');
      
      if (watchErr) throw watchErr;

      const watchedIds = new Set(watched.map(w => w.resource_id));

      const merged = (resources || []).map(res => ({
        ...res,
        is_watched: watchedIds.has(res.id)
      }));

      setData(merged);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchResources();
  }, [subjectId]);

  return { resources: data, loading, error, refetch: fetchResources };
}

export function useWatchedResources() {
  const [watched, setWatched] = useState<Set<string>>(new Set());

  useEffect(() => {
    supabase.from('watched_resources').select('resource_id').then(({ data }) => {
      if (data) setWatched(new Set(data.map(r => r.resource_id)));
    });
  }, []);

  const toggleWatched = async (resourceId: string) => {
    if (watched.has(resourceId)) {
      await supabase.from('watched_resources').delete().eq('resource_id', resourceId);
      setWatched(prev => { const next = new Set(prev); next.delete(resourceId); return next; });
    } else {
      await supabase.from('watched_resources').insert({ resource_id: resourceId });
      setWatched(prev => new Set([...prev, resourceId]));
    }
  };

  return { watched, toggleWatched };
}

export function useToggleResourceWatched() {
  const [loading, setLoading] = useState(false);

  async function toggleWatched(resourceId: string, currentlyWatched: boolean) {
    try {
      setLoading(true);
      if (currentlyWatched) {
        const { error } = await supabase
          .from('watched_resources')
          .delete()
          .eq('resource_id', resourceId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('watched_resources')
          .insert({ resource_id: resourceId });
        if (error) throw error;
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }

  return { toggleWatched, loading };
}
