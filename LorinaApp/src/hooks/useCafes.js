import { useState, useEffect } from 'react';
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

export function useCafes() {
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    supabase
      .from('cafes')
      .select('*')
      .order('name')
      .then(({ data, error: err }) => {
        if (err) setError(err);
        else setCafes((data || []).map(normalizeCafe));
        setLoading(false);
      });
  }, []);

  return { cafes, loading, error };
}
