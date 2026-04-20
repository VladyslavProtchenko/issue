'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/app/lib/supabase/client';

export type Label = { id: string; name: string; color: string };

export function useLabels() {
  const [labels, setLabels] = useState<Label[]>([]);

  useEffect(() => {
    const supabase = getSupabaseClient();

    supabase
      .from('labels')
      .select('id, name, color')
      .then(({ data }) => { if (data) setLabels(data); });

    const channel = supabase
      .channel('labels-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'labels' }, (payload) => {
        const row = payload.new as Label;
        setLabels((prev) => [...prev, row]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'labels' }, (payload) => {
        const row = payload.new as Label;
        setLabels((prev) => prev.map((l) => (l.id === row.id ? row : l)));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'labels' }, (payload) => {
        const row = payload.old as { id: string };
        setLabels((prev) => prev.filter((l) => l.id !== row.id));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return labels;
}
