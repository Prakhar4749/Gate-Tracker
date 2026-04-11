import { useAppData, useNotesCtx } from '../context/AppDataContext';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import type { Note } from '../types';

export const useNotes = useNotesCtx;

export function useCreateNote() {
  const { refresh } = useAppData();

  // Return the function DIRECTLY — not wrapped in an object
  return async (note: Omit<Note, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('notes')
      .insert({
        ...note,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) {
      toast.error('Failed to create note: ' + error.message);
      return null;
    }
    await refresh('notes');
    return data;
  };
}

export function useUpdateNote() {
  const { optimisticUpdate } = useAppData();

  return async (id: string, updates: Partial<Note>) => {
    const now = new Date().toISOString();
    optimisticUpdate('notes', prev =>
      prev.map(n => n.id === id ? { ...n, ...updates, updated_at: now } : n)
    );
    const { error } = await supabase
      .from('notes')
      .update({ ...updates, updated_at: now })
      .eq('id', id);
    if (error) {
      toast.error('Failed to save note');
      return false;
    }
    return true;
  };
}

export function useDeleteNote() {
  const { refresh, optimisticUpdate } = useAppData();

  return async (id: string) => {
    optimisticUpdate('notes', prev => prev.filter(n => n.id !== id));
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete note');
      await refresh('notes');
      return false;
    }
    return true;
  };
}

export function useTogglePin() {
  const { optimisticUpdate } = useAppData();

  return async (id: string, currentPinned: boolean) => {
    optimisticUpdate('notes', prev =>
      prev.map(n => n.id === id ? { ...n, is_pinned: !currentPinned } : n)
    );
    await supabase
      .from('notes')
      .update({ is_pinned: !currentPinned })
      .eq('id', id);
  };
}
