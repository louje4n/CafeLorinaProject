import { useState, useEffect } from 'react';
import { supabase } from '../api/supabase';

function formatRelativeTime(iso) {
  if (!iso) return '';
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function normalizeReview(row) {
  const profile = row.profiles;
  const name = profile?.display_name || 'anon';
  return {
    ...row,
    cafeId: row.cafe_id,
    user: name,
    avatar: name.slice(0, 2).toUpperCase(),
    studyVibe: row.study_vibe,
    time: formatRelativeTime(row.created_at),
    likes: 0,
  };
}

export function useReviews(cafeId) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cafeId) { setLoading(false); return; }
    setLoading(true);
    supabase
      .from('reviews')
      .select('*, profiles(display_name, avatar_url)')
      .eq('cafe_id', cafeId)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error) setReviews((data || []).map(normalizeReview));
        setLoading(false);
      });
  }, [cafeId]);

  async function submitReview({ cafeId: cid, userId, rating, text, studyVibe = false }) {
    const { data, error } = await supabase
      .from('reviews')
      .insert({ cafe_id: cid, user_id: userId, rating, text, study_vibe: studyVibe })
      .select('*, profiles(display_name, avatar_url)')
      .single();
    if (error) throw error;
    setReviews((prev) => [normalizeReview(data), ...prev]);
  }

  return { reviews, loading, submitReview };
}
