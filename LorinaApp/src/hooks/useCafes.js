import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../api/supabase';

function normalizeCafe(row) {
  return {
    ...row,
    rating: parseFloat(row.rating) || 0,
    reviewCount: row.review_count,
    seatsAvail: row.seats_avail,
    seatsTotal: row.seats_total,
    studyScore: parseFloat(row.study_score) || 0,
    bg: row.bg_color || '#F5F5F5',
  };
}

async function loadCafes() {
  const { data, error } = await supabase.from('cafes').select('*').order('name');
  if (error) throw error;
  return (data || []).map(normalizeCafe);
}

export function useCafes() {
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCafes()
      .then(setCafes)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  const refetch = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await loadCafes();
      setCafes(data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  return { cafes, loading, refreshing, refetch, error };
}
