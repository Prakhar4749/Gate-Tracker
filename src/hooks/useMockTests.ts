import { useAppData, useMockTestsCtx } from '../context/AppDataContext';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import type { MockTest } from '../types';

export const useMockTests = useMockTestsCtx;

export function useCreateMockTest() {
  const { refresh, optimisticUpdate } = useAppData();
  return async (mock: Omit<MockTest, 'id' | 'created_at'>) => {
    const tempId = `temp-${Date.now()}`;
    optimisticUpdate('mockTests', prev => [
      { ...mock, id: tempId, created_at: new Date().toISOString() } as MockTest,
      ...prev,
    ]);
    const { error, data } = await supabase.from('mock_tests').insert(mock).select().single();
    if (error) {
      toast.error('Failed to save mock test');
      optimisticUpdate('mockTests', prev => prev.filter(m => m.id !== tempId));
      return { success: false, error: error.message };
    }
    await refresh('mockTests');
    return { success: true, data };
  };
}

export function useDeleteMockTest() {
  const { refresh, optimisticUpdate } = useAppData();
  return async (id: string) => {
    optimisticUpdate('mockTests', prev => prev.filter(m => m.id !== id));
    const { error } = await supabase.from('mock_tests').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete');
      await refresh('mockTests');
      return false;
    }
    toast.success('Deleted');
    return true;
  };
}
