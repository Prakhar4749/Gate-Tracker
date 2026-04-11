import { useAppData, useNotesCtx } from '../context/AppDataContext';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import type { Note } from '../types';

export const useNotes = useNotesCtx;

export function useCreateNote() {
  const { refresh } = useAppData();
  return async (note: Omit<Note, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase.from('notes').insert(note).select().single();
    if (error) { 
      toast.error('Failed to create note'); 
      return { success: false, error: error.message }; 
    }
    await refresh('notes');
    return { success: true, data };
  };
}

export function useUpdateNote() {
  const { optimisticUpdate } = useAppData();
  return async (id: string, updates: Partial<Note>) => {
    const now = new Date().toISOString();
    optimisticUpdate('notes', prev =>
      prev.map(n => n.id === id ? { ...n, ...updates, updated_at: now } : n)
    );
    const { error, data } = await supabase
      .from('notes').update({ ...updates, updated_at: now }).eq('id', id).select().single();
    if (error) {
      toast.error('Failed to save note');
      return { success: false, error: error.message };
    }
    return { success: true, data };
  };
}

export function useDeleteNote() {
  const { refresh, optimisticUpdate } = useAppData();
  return async (id: string) => {
    optimisticUpdate('notes', prev => prev.filter(n => n.id !== id));
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) { toast.error('Failed to delete'); await refresh('notes'); }
    return !error;
  };
}

export function useTogglePin() {
  const { optimisticUpdate } = useAppData();
  return async (id: string, currentPinned: boolean) => {
    optimisticUpdate('notes', prev =>
      prev.map(n => n.id === id ? { ...n, is_pinned: !currentPinned } : n)
    );
    await supabase.from('notes').update({ is_pinned: !currentPinned }).eq('id', id);
  };
}
