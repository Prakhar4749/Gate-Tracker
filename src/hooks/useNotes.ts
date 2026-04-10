import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Note } from '../types';

export function useNotes(filters?: { subject_id?: string; topic_id?: string; tag?: string; note_type?: string }) {
  const [data, setData] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchNotes() {
    try {
      setLoading(true);
      let query = supabase.from('notes').select('*, subjects(*), topics(*)').order('created_at', { ascending: false });
      
      if (filters?.subject_id) query = query.eq('subject_id', filters.subject_id);
      if (filters?.topic_id) query = query.eq('topic_id', filters.topic_id);
      if (filters?.note_type) query = query.eq('note_type', filters.note_type);
      if (filters?.tag) query = query.contains('tags', [filters.tag]);

      const { data: notes, error: noteerr } = await query;

      if (noteerr) throw noteerr;
      setData(notes || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNotes();
  }, [filters?.subject_id, filters?.topic_id, filters?.tag, filters?.note_type]);

  return { data, loading, error, refetch: fetchNotes };
}

export function useCreateNote() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createNote(note: Omit<Note, 'id' | 'created_at' | 'updated_at'>) {
    try {
      setLoading(true);
      const { data: newNote, error: err } = await supabase
        .from('notes')
        .insert(note)
        .select()
        .single();
      if (err) throw err;
      return { success: true, data: newNote };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }

  return { createNote, loading, error };
}

export function useUpdateNote() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updateNote(id: string, note: Partial<Note>) {
    try {
      setLoading(true);
      const { data: updatedNote, error: err } = await supabase
        .from('notes')
        .update({ ...note, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (err) throw err;
      return { success: true, data: updatedNote };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }

  return { updateNote, loading, error };
}

export function useDeleteNote() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function deleteNote(id: string) {
    try {
      setLoading(true);
      const { error: err } = await supabase.from('notes').delete().eq('id', id);
      if (err) throw err;
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }

  return { deleteNote, loading, error };
}

export function useTogglePin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function togglePin(id: string, currentStatus: boolean) {
    try {
      setLoading(true);
      const { error: err } = await supabase
        .from('notes')
        .update({ is_pinned: !currentStatus })
        .eq('id', id);
      if (err) throw err;
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }

  return { togglePin, loading, error };
}
