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

function normalizePost(row) {
  const profile = row.profiles;
  const cafe = row.cafes;
  const name = profile?.display_name || 'anon';
  return {
    ...row,
    cafeId: row.cafe_id,
    cafeName: cafe?.name || '',
    user: name,
    avatar: name.slice(0, 2).toUpperCase(),
    time: formatRelativeTime(row.created_at),
    likes: 0,
  };
}

export function useCommunityPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('community_posts')
      .select('*, profiles(display_name, avatar_url), cafes(name)')
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data, error }) => {
        if (!error) setPosts((data || []).map(normalizePost));
        setLoading(false);
      });
  }, []);

  return { posts, loading };
}
