import { supabase } from './supabase';

const BUCKET = 'chat-photos';

export async function fetchLiveMessages(cafeId) {
  const cutoff = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('cafe_live_chats')
    .select('id, cafe_id, user_id, message, photo_url, created_at, profiles(display_name, avatar_url)')
    .eq('cafe_id', cafeId)
    .gte('created_at', cutoff)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []).map(normalizeMsg);
}

export async function sendMessage({ cafeId, userId, message, photoUri }) {
  let photo_url = null;

  if (photoUri) {
    photo_url = await uploadChatPhoto(userId, photoUri);
  }

  const { data, error } = await supabase
    .from('cafe_live_chats')
    .insert({ cafe_id: cafeId, user_id: userId, message: message || null, photo_url })
    .select('id, cafe_id, user_id, message, photo_url, created_at, profiles(display_name, avatar_url)')
    .single();

  if (error) throw error;
  return normalizeMsg(data);
}

export async function uploadChatPhoto(userId, uri) {
  const filename = `${userId}/${Date.now()}.jpg`;
  const formData = new FormData();
  formData.append('file', { uri, name: filename, type: 'image/jpeg' });

  const { error } = await supabase.storage.from(BUCKET).upload(filename, formData, { upsert: true });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}

function normalizeMsg(row) {
  return {
    id: row.id,
    cafeId: row.cafe_id,
    userId: row.user_id,
    message: row.message,
    photoUrl: row.photo_url,
    createdAt: row.created_at,
    displayName: row.profiles?.display_name ?? 'Anon',
    avatarUrl: row.profiles?.avatar_url ?? null,
  };
}
