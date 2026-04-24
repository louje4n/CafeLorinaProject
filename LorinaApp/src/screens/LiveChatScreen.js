import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  Image, KeyboardAvoidingView, Platform, StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../api/supabase';
import { fetchLiveMessages, sendMessage } from '../api/liveChat';
import { pickChatPhoto } from '../utils/imagePicker';

const ANON_USER_ID = 'anon-local';

export default function LiveChatScreen({ route, navigation }) {
  const { T } = useTheme();
  const insets = useSafeAreaInsets();
  const cafe = route?.params?.cafe;
  const cafeId = cafe?.id;
  const queryClient = useQueryClient();
  const listRef = useRef(null);

  const [text, setText] = useState('');
  const [pendingPhoto, setPendingPhoto] = useState(null);
  const [sending, setSending] = useState(false);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['live-chat', cafeId],
    queryFn: () => fetchLiveMessages(cafeId),
    refetchInterval: 30_000,
    enabled: !!cafeId,
  });

  // Realtime subscription
  useEffect(() => {
    if (!cafeId) return;

    const channel = supabase
      .channel(`live-chat-${cafeId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'cafe_live_chats', filter: `cafe_id=eq.${cafeId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['live-chat', cafeId] });
        },
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'cafe_live_chats', filter: `cafe_id=eq.${cafeId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['live-chat', cafeId] });
        },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [cafeId, queryClient]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const handlePickPhoto = useCallback(async () => {
    const uri = await pickChatPhoto();
    if (uri) setPendingPhoto(uri);
  }, []);

  const handleSend = useCallback(async () => {
    if ((!text.trim() && !pendingPhoto) || sending) return;
    setSending(true);
    try {
      await sendMessage({
        cafeId,
        userId: ANON_USER_ID,
        message: text.trim() || null,
        photoUri: pendingPhoto,
      });
      setText('');
      setPendingPhoto(null);
    } catch (e) {
      console.warn('Send failed:', e.message);
    } finally {
      setSending(false);
    }
  }, [cafeId, text, pendingPhoto, sending]);

  function formatTime(iso) {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function renderItem({ item }) {
    const isOwn = item.userId === ANON_USER_ID;
    return (
      <View style={[styles.msgRow, isOwn && styles.msgRowOwn]}>
        {!isOwn && (
          <View style={[styles.avatar, { backgroundColor: T.primary + '22' }]}>
            <Text style={[styles.avatarText, { color: T.primary }]}>
              {(item.displayName?.[0] ?? 'A').toUpperCase()}
            </Text>
          </View>
        )}
        <View style={[
          styles.bubble,
          isOwn
            ? { backgroundColor: T.primary }
            : { backgroundColor: T.card, borderColor: T.border, borderWidth: 1 },
        ]}>
          {!isOwn && (
            <Text style={[styles.senderName, { color: T.primary }]}>{item.displayName}</Text>
          )}
          {item.photoUrl ? (
            <Image source={{ uri: item.photoUrl }} style={styles.msgPhoto} resizeMode="cover" />
          ) : null}
          {item.message ? (
            <Text style={[styles.msgText, { color: isOwn ? '#fff' : T.text }]}>{item.message}</Text>
          ) : null}
          <Text style={[styles.msgTime, { color: isOwn ? 'rgba(255,255,255,0.7)' : T.sub }]}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  }

  if (!cafe) return null;

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: T.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10, backgroundColor: T.card, borderBottomColor: T.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backArrow, { color: T.text }]}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: T.text }]} numberOfLines={1}>{cafe.name}</Text>
          <Text style={[styles.headerSub, { color: T.sub }]}>Live Vibe Check · msgs expire in 15 min</Text>
        </View>
      </View>

      {/* Message list */}
      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={T.primary} />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={renderItem}
          contentContainerStyle={[styles.listContent, { paddingBottom: 8 }]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: T.sub }]}>No vibes yet — be the first!</Text>
            </View>
          }
        />
      )}

      {/* Pending photo preview */}
      {pendingPhoto && (
        <View style={[styles.photoPreview, { backgroundColor: T.surf, borderTopColor: T.border }]}>
          <Image source={{ uri: pendingPhoto }} style={styles.previewImg} />
          <TouchableOpacity onPress={() => setPendingPhoto(null)} style={styles.removePhoto}>
            <Text style={styles.removePhotoText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Input bar */}
      <View style={[
        styles.inputBar,
        { backgroundColor: T.card, borderTopColor: T.border, paddingBottom: insets.bottom + 8 },
      ]}>
        <TouchableOpacity onPress={handlePickPhoto} style={[styles.photoBtn, { borderColor: T.border }]}>
          <Text style={[styles.photoBtnText, { color: T.sub }]}>📷</Text>
        </TouchableOpacity>
        <TextInput
          style={[styles.input, { backgroundColor: T.surf, color: T.text, borderColor: T.border }]}
          value={text}
          onChangeText={setText}
          placeholder="Share the vibe..."
          placeholderTextColor={T.sub}
          multiline
          maxLength={280}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={(!text.trim() && !pendingPhoto) || sending}
          style={[
            styles.sendBtn,
            { backgroundColor: (text.trim() || pendingPhoto) && !sending ? T.primary : T.surf },
          ]}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={[styles.sendBtnText, { color: (text.trim() || pendingPhoto) ? '#fff' : T.sub }]}>
              Send
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  backBtn: { padding: 4 },
  backArrow: { fontSize: 20, lineHeight: 24 },
  headerCenter: { flex: 1 },
  headerTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 16,
  },
  headerSub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 10,
    marginTop: 1,
  },

  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  listContent: {
    padding: 14,
    gap: 10,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
  },

  msgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  msgRowOwn: {
    flexDirection: 'row-reverse',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: 14,
    padding: 10,
    paddingHorizontal: 13,
  },
  senderName: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 10,
    marginBottom: 4,
  },
  msgPhoto: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginBottom: 6,
  },
  msgText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    lineHeight: 19,
  },
  msgTime: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 9,
    marginTop: 4,
    alignSelf: 'flex-end',
  },

  photoPreview: {
    padding: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  previewImg: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  removePhoto: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removePhotoText: { color: '#fff', fontSize: 12 },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  photoBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginBottom: 1,
  },
  photoBtnText: { fontSize: 16 },
  input: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    maxHeight: 100,
  },
  sendBtn: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginBottom: 1,
  },
  sendBtnText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 13,
  },
});
