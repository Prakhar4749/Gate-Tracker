import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { MockTest } from '../types';

export function useMockTests() {
  const [data, setData] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchMocks() {
    try {
      setLoading(true);
      const { data: mocks, error: mockerr } = await supabase
        .from('mock_tests')
        .select('*')
        .order('test_date', { ascending: false });

      if (mockerr) throw mockerr;
      setData(mocks || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMocks();
  }, []);

  return { data, loading, error, refetch: fetchMocks };
}

export function useCreateMockTest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createMock(mock: Omit<MockTest, 'id' | 'created_at'>) {
    try {
      setLoading(true);
      const { data: newMock, error: err } = await supabase
        .from('mock_tests')
        .insert(mock)
        .select()
        .single();
      if (err) throw err;
      return { success: true, data: newMock };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }

  return { createMock, loading, error };
}

export function useDeleteMockTest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function deleteMock(id: string) {
    try {
      setLoading(true);
      const { error: err } = await supabase
        .from('mock_tests')
        .delete()
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

  return { deleteMock, loading, error };
}
