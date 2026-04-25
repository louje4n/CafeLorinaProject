import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  Image, KeyboardAvoidingView, Platform, StyleSheet,
  ActivityIndicator, Modal, Animated, Dimensions, Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../api/supabase';
import { fetchLiveMessages, sendMessage } from '../api/liveChat';
import { pickChatPhoto } from '../utils/imagePicker';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const MSG_LIMIT = 5;

export default function LiveChatScreen({ route, navigation }) {
  const { T } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const cafe = route?.params?.cafe;
  const cafeId = cafe?.id;
  const queryClient = useQueryClient();
  const listRef = useRef(null);

  const [text, setText] = useState('');
  const [pendingPhoto, setPendingPhoto] = useState(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');

  // Full-screen image viewer
  const [viewingImage, setViewingImage] = useState(null);
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.88)).current;

  function openImage(url) {
    setViewingImage(url);
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 80, friction: 9, useNativeDriver: true }),
    ]).start();
  }

  function closeImage() {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0.88, duration: 200, useNativeDriver: true }),
    ]).start(() => setViewingImage(null));
  }

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['live-chat', cafeId],
    queryFn: () => fetchLiveMessages(cafeId),
    refetchInterval: 30_000,
    enabled: !!cafeId,
  });

  // Count messages sent by this user in the last 15 min
  const myMsgCount = user
    ? messages.filter(
        (m) =>
          m.userId === user.id &&
          Date.now() - new Date(m.createdAt).getTime() < 15 * 60 * 1000,
      ).length
    : 0;
  const atLimit = myMsgCount >= MSG_LIMIT;

  // Realtime subscription
  useEffect(() => {
    if (!cafeId) return;
    const channel = supabase
      .channel(`live-chat-${cafeId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'cafe_live_chats', filter: `cafe_id=eq.${cafeId}` },
        () => queryClient.invalidateQueries({ queryKey: ['live-chat', cafeId] }),
      )
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'cafe_live_chats', filter: `cafe_id=eq.${cafeId}` },
        () => queryClient.invalidateQueries({ queryKey: ['live-chat', cafeId] }),
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [cafeId, queryClient]);

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
    if (!user) {
      navigation.navigate('Welcome');
      return;
    }
    if (atLimit) return;
    if ((!text.trim() && !pendingPhoto) || sending) return;
    setSendError('');
    setSending(true);
    try {
      await sendMessage({
        cafeId,
        userId: user.id,
        message: text.trim() || null,
        photoUri: pendingPhoto,
      });
      setText('');
      setPendingPhoto(null);
    } catch (e) {
      setSendError('Failed to send. Please try again.');
      console.warn('Send failed:', e.message);
    } finally {
      setSending(false);
    }
  }, [cafeId, text, pendingPhoto, sending, user, navigation, atLimit]);

  function formatTime(iso) {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function renderItem({ item }) {
    const isOwn = item.userId === user?.id;
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
            <TouchableOpacity onPress={() => openImage(item.photoUrl)} activeOpacity={0.9}>
              <Image source={{ uri: item.photoUrl }} style={styles.msgPhoto} resizeMode="cover" />
            </TouchableOpacity>
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

  const canSend = (text.trim() || pendingPhoto) && !sending && !atLimit;

  return (
    <>
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
          <View style={[styles.limitBadge, { backgroundColor: atLimit ? '#E0525214' : T.surf, borderColor: atLimit ? '#E05252' : T.border }]}>
            <Text style={[styles.limitBadgeText, { color: atLimit ? '#E05252' : T.sub }]}>
              {myMsgCount}/{MSG_LIMIT}
            </Text>
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

        {/* Rate limit banner */}
        {atLimit && (
          <View style={[styles.limitBanner, { backgroundColor: '#E0525210', borderTopColor: '#E05252' }]}>
            <Text style={styles.limitBannerText}>
              You've sent {MSG_LIMIT} messages this session. New messages unlock as older ones expire.
            </Text>
          </View>
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
          <TouchableOpacity
            onPress={handlePickPhoto}
            disabled={atLimit}
            style={[styles.photoBtn, { borderColor: T.border, opacity: atLimit ? 0.4 : 1 }]}
          >
            <Text style={[styles.photoBtnText, { color: T.sub }]}>📷</Text>
          </TouchableOpacity>
          <TextInput
            style={[styles.input, { backgroundColor: T.surf, color: T.text, borderColor: T.border, opacity: atLimit ? 0.5 : 1 }]}
            value={text}
            onChangeText={setText}
            placeholder={atLimit ? 'Message limit reached' : 'Share the vibe...'}
            placeholderTextColor={T.sub}
            multiline
            maxLength={280}
            editable={!atLimit}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!canSend}
            style={[styles.sendBtn, { backgroundColor: canSend ? T.primary : T.surf }]}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={[styles.sendBtnText, { color: canSend ? '#fff' : T.sub }]}>Send</Text>
            )}
          </TouchableOpacity>
        </View>

        {sendError ? (
          <Text style={styles.sendError}>{sendError}</Text>
        ) : null}
      </KeyboardAvoidingView>

      {/* ── Full-screen image viewer ── */}
      <Modal visible={!!viewingImage} transparent animationType="none" statusBarTranslucent>
        <Animated.View style={[styles.imageOverlay, { opacity: fadeAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeImage} />
          <Animated.Image
            source={{ uri: viewingImage ?? undefined }}
            style={[styles.fullImage, { transform: [{ scale: scaleAnim }] }]}
            resizeMode="contain"
          />
          <Animated.View style={[styles.closeBtn, { opacity: fadeAnim }]}>
            <TouchableOpacity onPress={closeImage} style={styles.closeBtnInner}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Modal>
    </>
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
    gap: 10,
  },
  backBtn: { padding: 4 },
  backArrow: { fontSize: 20, lineHeight: 24 },
  headerCenter: { flex: 1 },
  headerTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 16 },
  headerSub:   { fontFamily: 'DMSans_400Regular', fontSize: 10, marginTop: 1 },

  limitBadge: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  limitBadgeText: { fontFamily: 'DMSans_700Bold', fontSize: 11 },

  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  listContent: { padding: 14, gap: 10 },
  empty: { flex: 1, alignItems: 'center', paddingTop: 60 },
  emptyText: { fontFamily: 'DMSans_400Regular', fontSize: 13 },

  limitBanner: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  limitBannerText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: '#E05252',
    textAlign: 'center',
  },

  msgRow:    { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  msgRowOwn: { flexDirection: 'row-reverse' },
  avatar: {
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  avatarText: { fontFamily: 'DMSans_700Bold', fontSize: 12 },
  bubble: { maxWidth: '75%', borderRadius: 14, padding: 10, paddingHorizontal: 13 },
  senderName: { fontFamily: 'DMSans_700Bold', fontSize: 10, marginBottom: 4 },
  msgPhoto: { width: 200, height: 150, borderRadius: 8, marginBottom: 6 },
  msgText:  { fontFamily: 'DMSans_400Regular', fontSize: 13, lineHeight: 19 },
  msgTime:  { fontFamily: 'DMSans_400Regular', fontSize: 9, marginTop: 4, alignSelf: 'flex-end' },

  photoPreview: {
    padding: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  previewImg: { width: 60, height: 60, borderRadius: 8 },
  removePhoto: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center', justifyContent: 'center',
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
    width: 40, height: 40, borderRadius: 20, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, marginBottom: 1,
  },
  photoBtnText: { fontSize: 16 },
  input: {
    flex: 1, borderRadius: 20, borderWidth: 1,
    paddingHorizontal: 14, paddingVertical: 10,
    fontFamily: 'DMSans_400Regular', fontSize: 13, maxHeight: 100,
  },
  sendBtn: {
    height: 40, paddingHorizontal: 16, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, marginBottom: 1,
  },
  sendBtnText: { fontFamily: 'DMSans_600SemiBold', fontSize: 13 },
  sendError: {
    fontFamily: 'DMSans_400Regular', fontSize: 11,
    color: '#DC2626', marginHorizontal: 12, marginBottom: 8,
  },

  // Image viewer
  imageOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullImage: {
    width: SCREEN_W,
    height: SCREEN_H * 0.75,
  },
  closeBtn: {
    position: 'absolute',
    top: 56,
    right: 20,
  },
  closeBtnInner: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { color: '#fff', fontSize: 15 },
});
