import { useAppData, usePracticeResourcesCtx } from '../context/AppDataContext';
import { supabase } from '../lib/supabase';

export const usePracticeResources = usePracticeResourcesCtx;

export function useWatchedResources() {
  const { data, optimisticUpdate } = useAppData();

  const toggleWatched = async (resourceId: string) => {
    const isWatched = data.watchedResourceIds.has(resourceId);
    // Optimistic update
    optimisticUpdate('watchedResourceIds', prev => {
      const next = new Set(prev);
      isWatched ? next.delete(resourceId) : next.add(resourceId);
      return next;
    });
    if (isWatched) {
      await supabase.from('watched_resources').delete().eq('resource_id', resourceId);
    } else {
      await supabase.from('watched_resources').insert({ resource_id: resourceId });
    }
  };

  return {
    watchedIds: data.watchedResourceIds,
    toggleWatched,
  };
}
