import { useState, useEffect, useCallback } from 'react';
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
    busyness: row.busyness || cafe?.busyness || 'quiet',
    user: name,
    avatar: name.slice(0, 2).toUpperCase(),
    time: formatRelativeTime(row.created_at),
    text: row.message || row.text || '',
    photoUrl: row.photo_url || null,
    likes: 0,
  };
}

export function useCommunityPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = useCallback(async () => {
    // Proactively purge expired rows on every fetch
    supabase.rpc('purge_expired_live_chats').then(() => {});

    // Only show posts from the last 2 hours — belt-and-suspenders filter
    const cutoff = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('cafe_live_chats')
      .select('id, cafe_id, message, photo_url, created_at, profiles(display_name, avatar_url), cafes(name)')
      .gte('created_at', cutoff)
      .order('created_at', { ascending: false })
      .limit(80);

    if (!error) {
      const normalized = (data || []).map(normalizePost).filter((p) => p.text || p.photoUrl);
      setPosts(diversifyRecentFeed(normalized).slice(0, 20));
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  const manualRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    fetchPosts();

    const channel = supabase
      .channel('community-live-recent')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'cafe_live_chats' },
        () => fetchPosts(),
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'cafe_live_chats' },
        () => fetchPosts(),
      )
      .subscribe();

    const interval = setInterval(fetchPosts, 30 * 60 * 1000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [fetchPosts]);

  return { posts, loading, refreshing, refetch: manualRefresh };
}

function diversifyRecentFeed(posts) {
  const byCafe = new Map();
  posts.forEach((post) => {
    if (!byCafe.has(post.cafeId)) byCafe.set(post.cafeId, []);
    byCafe.get(post.cafeId).push(post);
  });

  const cafePools = Array.from(byCafe.values()).map((items) => shuffle(items));
  const diversified = [];

  let hasItems = true;
  while (hasItems) {
    hasItems = false;
    cafePools.forEach((pool) => {
      if (pool.length) {
        diversified.push(pool.shift());
        hasItems = true;
      }
    });
    shuffleInPlace(cafePools);
  }

  return diversified;
}

function shuffle(arr) {
  const copy = [...arr];
  shuffleInPlace(copy);
  return copy;
}

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
