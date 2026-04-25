import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../api/supabase';

export function useSavedCafes(userId) {
  const [savedIds, setSavedIds] = useState(new Set());
  const [savedCafes, setSavedCafes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = useCallback(async () => {
    if (!userId) {
      setSavedIds(new Set());
      setSavedCafes([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('saved_cafes')
      .select('cafe_id, cafes(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSavedIds(new Set(data.map((r) => r.cafe_id)));
      setSavedCafes(data.map((r) => r.cafes).filter(Boolean));
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  const toggleSave = useCallback(async (cafe) => {
    if (!userId) return;
    const isSaved = savedIds.has(cafe.id);

    // Optimistic update
    setSavedIds((prev) => {
      const next = new Set(prev);
      isSaved ? next.delete(cafe.id) : next.add(cafe.id);
      return next;
    });
    setSavedCafes((prev) =>
      isSaved ? prev.filter((c) => c.id !== cafe.id) : [cafe, ...prev],
    );

    if (isSaved) {
      await supabase
        .from('saved_cafes')
        .delete()
        .eq('user_id', userId)
        .eq('cafe_id', cafe.id);
    } else {
      await supabase
        .from('saved_cafes')
        .insert({ user_id: userId, cafe_id: cafe.id });
    }
  }, [userId, savedIds]);

  return { savedIds, savedCafes, loading, toggleSave, refetch: fetchSaved };
}
