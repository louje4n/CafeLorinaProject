/**
 * CommunityScreen
 *
 * Two sections:
 *   1. Report card — pick a cafe and its current busyness level to submit
 *      a live community update (with a 2.5s success confirmation)
 *   2. Feed — recent busyness posts from other users
 *
 * Safe area: header paddingTop uses insets.top.
 */
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  Animated,
  Easing,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  PanResponder,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Avi, BusynessChip } from '../components/SharedUI';
import { useCafes } from '../hooks/useCafes';
import { useCommunityPosts } from '../hooks/useCommunityPosts';
import { fetchLiveMessages, sendMessage } from '../api/liveChat';
import { pickChatPhoto } from '../utils/imagePicker';
import { supabase } from '../api/supabase';

const BUSYNESS_OPTS = [
  { key: 'quiet',    label: 'Quiet',    sub: 'Plenty of seats', col: '#10B981' },
  { key: 'moderate', label: 'Moderate', sub: 'Getting busy',    col: '#F59E0B' },
  { key: 'busy',     label: 'Busy',     sub: 'Almost full',     col: '#EF4444' },
];

export default function CommunityScreen({ navigation }) {
  const { T } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { cafes } = useCafes();
  const { posts, refreshing: postsRefreshing, refetch: refetchPosts } = useCommunityPosts();
  const [activeCafe, setActiveCafe] = useState(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetTab, setSheetTab] = useState('updates');
  const [selectedBusyness, setSelectedBusyness] = useState(null);
  const [draftText, setDraftText] = useState('');
  const [draftPhoto, setDraftPhoto] = useState(null);
  const [showPostedState, setShowPostedState] = useState(false);
  const [composerError, setComposerError] = useState('');
  const [refreshCountdown, setRefreshCountdown] = useState(15 * 60);
  const [showRefreshed, setShowRefreshed] = useState(false);
  const slideY = useRef(new Animated.Value(1)).current;
  const dragY = useRef(new Animated.Value(0)).current;
  const livePulse = useRef(new Animated.Value(1)).current;

  // Full-screen image viewer — for the main feed (outside sheet)
  const [viewingImage, setViewingImage] = useState(null);
  const imgFade  = useRef(new Animated.Value(0)).current;
  const imgScale = useRef(new Animated.Value(0.88)).current;

  function openImage(url) {
    setViewingImage(url);
    Animated.parallel([
      Animated.timing(imgFade,  { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.spring(imgScale, { toValue: 1, tension: 80, friction: 9, useNativeDriver: true }),
    ]).start();
  }

  function closeImage() {
    Animated.parallel([
      Animated.timing(imgFade,  { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(imgScale, { toValue: 0.88, duration: 200, useNativeDriver: true }),
    ]).start(() => setViewingImage(null));
  }

  // Separate image viewer for INSIDE the sheet — can't stack two Modals on iOS
  const [sheetViewingImage, setSheetViewingImage] = useState(null);
  const sheetImgFade  = useRef(new Animated.Value(0)).current;
  const sheetImgScale = useRef(new Animated.Value(0.88)).current;

  function openSheetImage(url) {
    setSheetViewingImage(url);
    Animated.parallel([
      Animated.timing(sheetImgFade,  { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.spring(sheetImgScale, { toValue: 1, tension: 80, friction: 9, useNativeDriver: true }),
    ]).start();
  }

  function closeSheetImage() {
    Animated.parallel([
      Animated.timing(sheetImgFade,  { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(sheetImgScale, { toValue: 0.88, duration: 200, useNativeDriver: true }),
    ]).start(() => setSheetViewingImage(null));
  }
  const windowHeight = Dimensions.get('window').height;
  const sheetHeight = Math.round(windowHeight * 0.82);

  const { data: liveUpdates = [] } = useQuery({
    queryKey: ['live-chat', activeCafe?.id],
    queryFn: () => fetchLiveMessages(activeCafe.id),
    refetchInterval: 15 * 60 * 1000,
    enabled: !!activeCafe?.id && sheetVisible,
  });

  const normalizedUpdates = useMemo(
    () => liveUpdates.map((item) => ({
      ...item,
      user: toHandle(item.displayName),
      avatar: initialsFromName(item.displayName),
      time: formatRelativeTime(item.createdAt),
      busyness: item.busyness || activeCafe?.busyness || 'quiet',
      likes: item.likes || 0,
    })),
    [liveUpdates, activeCafe],
  );

  const photoPosts = useMemo(
    () => normalizedUpdates.filter((item) => item.photoUrl),
    [normalizedUpdates],
  );

  useEffect(() => {
    if (!sheetVisible || !activeCafe?.id) return undefined;
    setRefreshCountdown(15 * 60);
    const tick = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          queryClient.invalidateQueries({ queryKey: ['live-chat', activeCafe.id] });
          setShowRefreshed(true);
          setTimeout(() => setShowRefreshed(false), 1000);
          return 15 * 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [sheetVisible, activeCafe, queryClient]);

  useEffect(() => {
    if (!sheetVisible || !activeCafe?.id) return undefined;

    const channel = supabase
      .channel(`live-buzz-sync-${activeCafe.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'cafe_live_chats', filter: `cafe_id=eq.${activeCafe.id}` },
        () => queryClient.invalidateQueries({ queryKey: ['live-chat', activeCafe.id] }),
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'cafe_live_chats', filter: `cafe_id=eq.${activeCafe.id}` },
        () => queryClient.invalidateQueries({ queryKey: ['live-chat', activeCafe.id] }),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sheetVisible, activeCafe, queryClient]);

  useEffect(() => {
    Animated.spring(slideY, {
      toValue: sheetVisible ? 0 : 1,
      useNativeDriver: true,
      damping: 20,
      mass: 0.9,
      stiffness: 170,
    }).start();
  }, [sheetVisible, slideY]);

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(livePulse, { toValue: 1.5, duration: 700, useNativeDriver: true }),
        Animated.timing(livePulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [livePulse]);

  const onCloseSheet = useCallback(() => {
    setSheetVisible(false);
    setDraftPhoto(null);
    setDraftText('');
    setSelectedBusyness(null);
    setComposerError('');
    setShowPostedState(false);
    setSheetTab('updates');
  }, []);

  const onOpenCafe = useCallback((cafe) => {
    setActiveCafe(cafe);
    setSheetVisible(true);
    setRefreshCountdown(15 * 60);
  }, []);

  const handlePickPhoto = useCallback(async () => {
    const uri = await pickChatPhoto();
    if (uri) setDraftPhoto(uri);
  }, []);

  const hasDraft = !!selectedBusyness || !!draftPhoto || !!draftText.trim();

  const handleSend = useCallback(async () => {
    if (!user) {
      setComposerError('Please sign in to post updates.');
      navigation.navigate('Welcome');
      return;
    }
    if (!activeCafe?.id || !hasDraft) return;
    const optimistic = {
      id: `local-${Date.now()}`,
      cafeId: activeCafe.id,
      userId: 'anon-local',
      message: draftText.trim() || null,
      photoUrl: draftPhoto,
      createdAt: new Date().toISOString(),
      displayName: 'you',
      avatarUrl: null,
      busyness: selectedBusyness || activeCafe.busyness || 'quiet',
      likes: 0,
    };

    setComposerError('');
    queryClient.setQueryData(['live-chat', activeCafe.id], (old = []) => [...old, optimistic]);
    setSelectedBusyness(null);
    setDraftText('');
    setDraftPhoto(null);

    try {
      await sendMessage({
        cafeId: activeCafe.id,
        userId: user.id,
        message: optimistic.message,
        photoUri: optimistic.photoUrl,
      });
      setShowPostedState(true);
      setTimeout(() => setShowPostedState(false), 2000);
      queryClient.invalidateQueries({ queryKey: ['live-chat', activeCafe.id] });
    } catch (err) {
      queryClient.setQueryData(['live-chat', activeCafe.id], (old = []) =>
        old.filter((item) => item.id !== optimistic.id),
      );
      setComposerError(err?.message || 'Could not share update right now.');
      console.warn('Live tab send failed:', err?.message);
      queryClient.invalidateQueries({ queryKey: ['live-chat', activeCafe.id] });
    }
  }, [activeCafe, hasDraft, draftText, draftPhoto, selectedBusyness, queryClient, user, navigation]);

  const sheetPanResponder = useMemo(
    () => PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          dragY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 140 || gestureState.vy > 1.2) {
          dragY.setValue(0);
          onCloseSheet();
          return;
        }
        Animated.timing(dragY, {
          toValue: 0,
          duration: 180,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }).start();
      },
      onPanResponderTerminate: () => {
        Animated.timing(dragY, {
          toValue: 0,
          duration: 120,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }).start();
      },
    }),
    [dragY, onCloseSheet],
  );

  const sheetTranslateY = Animated.add(
    slideY.interpolate({
      inputRange: [0, 1],
      outputRange: [0, sheetHeight],
    }),
    dragY,
  );

  return (
    <View style={[styles.flex, { backgroundColor: T.bg }]}>
      {/* Header — insets.top replaces hardcoded top padding */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 14, borderBottomColor: T.border },
        ]}
      >
        <Text style={[styles.title, { color: T.text }]}>Live Updates</Text>
        <Text style={[styles.subtitle, { color: T.sub }]}>
          Community-sourced café status
        </Text>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={postsRefreshing} onRefresh={refetchPosts} tintColor={T.primary} colors={[T.primary]} />
        }
      >
        {/* What's buzzing */}
        <View style={[styles.reportCard, { backgroundColor: T.card, borderColor: T.border }]}>
          <View style={styles.sectionHeadingRow}>
            <Text style={[styles.sectionLabel, { color: T.sub }]}>What's buzzing?</Text>
            <Text style={[styles.sectionHint, { color: T.sub }]}>tap a cafe for live updates</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.cafeScroll}
            contentContainerStyle={styles.cafeScrollContent}
          >
            {cafes.map((c) => {
              const busynessMeta = BUSYNESS_OPTS.find((opt) => opt.key === c.busyness) || BUSYNESS_OPTS[0];
              return (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => onOpenCafe(c)}
                  style={[
                    styles.cafePill,
                    {
                      borderColor: T.border,
                      backgroundColor: T.surf,
                    },
                  ]}
                >
                  <View style={[styles.busynessDot, { backgroundColor: busynessMeta.col }]} />
                  <Text
                    style={[
                      styles.cafePillText,
                      {
                        color: T.text,
                        fontFamily: 'DMSans_500Medium',
                      },
                    ]}
                  >
                    {c.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <Text style={[styles.feedLabel, { color: T.sub }]}>RECENT</Text>
        {posts.map((p) => (
          <View
            key={p.id}
            style={[styles.postCard, { backgroundColor: T.card, borderColor: T.border }]}
          >
            <View style={styles.postHeader}>
              <Avi initials={p.avatar} size={32} color={T.primary} />
              <View style={styles.flex}>
                <Text style={[styles.postUser, { color: T.text }]}>@{p.user}</Text>
                <Text style={[styles.postMeta, { color: T.sub }]}>
                  at {p.cafeName} · {p.time}
                </Text>
              </View>
              <BusynessChip level={p.busyness} mini />
            </View>
            <Text style={[styles.postText, { color: T.text }]}>{p.text}</Text>
            {p.photoUrl ? (
              <TouchableOpacity onPress={() => openImage(p.photoUrl)} activeOpacity={0.9}>
                <Image source={{ uri: p.photoUrl }} style={styles.feedPhoto} resizeMode="cover" />
              </TouchableOpacity>
            ) : null}
          </View>
        ))}
      </ScrollView>

      <Modal visible={sheetVisible} transparent animationType="none" onRequestClose={onCloseSheet}>
        <Pressable style={styles.overlay} onPress={onCloseSheet} />
        <Animated.View
          style={[
            styles.sheetWrap,
            {
              height: sheetHeight,
              backgroundColor: T.card,
              borderColor: T.border,
              transform: [{ translateY: sheetTranslateY }],
            },
          ]}
          {...sheetPanResponder.panHandlers}
        >
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={[styles.sheetHandle, { backgroundColor: T.border }]} />

            <View style={styles.sheetHeader}>
              <View style={styles.flex}>
                <Text style={[styles.sheetTitle, { color: T.text }]}>
                  {activeCafe?.name || 'Cafe'}
                </Text>
                <View style={styles.sheetMetaRow}>
                  <BusynessChip level={activeCafe?.busyness || 'quiet'} />
                  <Text style={[styles.dotDivider, { color: T.sub }]}>·</Text>
                  <Text style={[styles.sheetMetaText, { color: T.sub }]}>
                    {activeCafe?.suburb || 'Sydney'}
                  </Text>
                </View>
              </View>
              <View style={styles.sheetHeaderRight}>
                <TouchableOpacity
                  onPress={onCloseSheet}
                  style={[styles.closeBtn, { backgroundColor: T.surf, borderColor: T.border }]}
                >
                  <Text style={[styles.closeBtnText, { color: T.sub }]}>×</Text>
                </TouchableOpacity>
                <Text style={[styles.refreshText, { color: showRefreshed ? '#10B981' : T.sub }]}>
                  {showRefreshed ? 'Refreshed ✓' : `refreshes in ${formatCountdown(refreshCountdown)}`}
                </Text>
              </View>
            </View>

            <View style={[styles.livePill, { backgroundColor: T.surf }]}>
              <Animated.View
                style={[
                  styles.liveDot,
                  { transform: [{ scale: livePulse }], opacity: livePulse.interpolate({ inputRange: [1, 1.5], outputRange: [1, 0.65] }) },
                ]}
              />
              <Text style={styles.livePillText}>LIVE · last 15 min</Text>
            </View>

            <View style={[styles.tabsRow, { borderBottomColor: T.border }]}>
              <TouchableOpacity
                style={[styles.tabBtn, sheetTab === 'updates' && { borderBottomColor: T.primary }]}
                onPress={() => setSheetTab('updates')}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: sheetTab === 'updates' ? T.primary : T.sub },
                  ]}
                >
                  Updates
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabBtn, sheetTab === 'photos' && { borderBottomColor: T.primary }]}
                onPress={() => setSheetTab('photos')}
              >
                <Text style={[styles.tabText, { color: sheetTab === 'photos' ? T.primary : T.sub }]}>
                  Photos
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.flex}
              contentContainerStyle={{ padding: 14, paddingBottom: sheetTab === 'updates' ? 190 : 110 }}
              showsVerticalScrollIndicator={false}
            >
              {sheetTab === 'updates' ? (
                normalizedUpdates.length ? (
                  normalizedUpdates
                    .slice()
                    .reverse()
                    .map((item) => (
                      <View
                        key={item.id}
                        style={[styles.postCard, { backgroundColor: T.card, borderColor: T.border }]}
                      >
                        <View style={styles.postHeader}>
                          <Avi initials={item.avatar} size={30} color={T.primary} />
                          <View style={styles.flex}>
                            <Text style={[styles.postUser, { color: T.text }]}>@{item.user}</Text>
                            <Text style={[styles.postMeta, { color: T.sub }]}>{item.time}</Text>
                          </View>
                          <BusynessChip level={item.busyness} mini />
                        </View>
                        {item.message ? (
                          <Text style={[styles.postText, { color: T.text }]}>{item.message}</Text>
                        ) : null}
                        {item.photoUrl ? (
                          <TouchableOpacity onPress={() => openSheetImage(item.photoUrl)} activeOpacity={0.9}>
                            <Image source={{ uri: item.photoUrl }} style={styles.updatePhoto} resizeMode="cover" />
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    ))
                ) : (
                  <Text style={[styles.emptyUpdateText, { color: T.sub }]}>
                    No updates yet — be the first!
                  </Text>
                )
              ) : (
                <View style={styles.photoGrid}>
                  {photoPosts.length ? (
                    photoPosts
                      .slice()
                      .reverse()
                      .map((item) => (
                        <TouchableOpacity key={item.id} onPress={() => openSheetImage(item.photoUrl)} activeOpacity={0.9}>
                          <Image source={{ uri: item.photoUrl }} style={styles.photoTile} />
                        </TouchableOpacity>
                      ))
                  ) : (
                    <Text style={[styles.emptyUpdateText, { color: T.sub }]}>
                      No photos yet.
                    </Text>
                  )}
                </View>
              )}
            </ScrollView>

            {sheetTab === 'updates' ? (
              <View
                style={[
                  styles.composerWrap,
                  { borderTopColor: T.border, backgroundColor: T.card, paddingBottom: insets.bottom + 8 },
                ]}
              >
                {showPostedState ? (
                  <View style={[styles.postedBanner, { backgroundColor: T.surf }]}>
                    <Text style={[styles.postedText, { color: T.primary }]}>Update shared — thanks! ✓</Text>
                  </View>
                ) : (
                  <>
                    <View style={styles.busynessRow}>
                      {BUSYNESS_OPTS.map((opt) => {
                        const active = selectedBusyness === opt.key;
                        return (
                          <TouchableOpacity
                            key={opt.key}
                            onPress={() => setSelectedBusyness(active ? null : opt.key)}
                            style={[
                              styles.busynessPillBtn,
                              {
                                borderColor: active ? opt.col : T.border,
                                backgroundColor: active ? `${opt.col}1C` : T.surf,
                              },
                            ]}
                          >
                            <View style={[styles.busynessDot, { backgroundColor: opt.col }]} />
                            <Text style={[styles.busynessPillText, { color: active ? opt.col : T.sub }]}>
                              {opt.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {draftPhoto ? (
                      <View style={styles.photoPreviewStrip}>
                        <Image source={{ uri: draftPhoto }} style={styles.previewPhoto} />
                        <TouchableOpacity style={styles.removePhotoBtn} onPress={() => setDraftPhoto(null)}>
                          <Text style={styles.removePhotoTxt}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ) : null}

                    <View style={styles.inputRow}>
                      <TouchableOpacity
                        onPress={handlePickPhoto}
                        style={[
                          styles.iconBtn,
                          {
                            borderColor: draftPhoto ? T.primary : T.border,
                            backgroundColor: draftPhoto ? `${T.primary}22` : 'transparent',
                          },
                        ]}
                      >
                        <Text style={[styles.iconBtnTxt, { color: draftPhoto ? T.primary : T.sub }]}>🖼</Text>
                      </TouchableOpacity>

                      <TextInput
                        style={[styles.composerInput, { color: T.text, borderColor: T.border, backgroundColor: T.surf }]}
                        value={draftText}
                        onChangeText={setDraftText}
                        placeholder="What's the vibe right now?"
                        placeholderTextColor={T.sub}
                        multiline
                        maxLength={280}
                        textAlignVertical="top"
                      />

                      <TouchableOpacity
                        onPress={handleSend}
                        disabled={!hasDraft}
                        style={[
                          styles.sendRoundBtn,
                          {
                            borderColor: hasDraft ? T.primary : T.border,
                            backgroundColor: hasDraft ? T.primary : 'transparent',
                            opacity: hasDraft ? 1 : 0.4,
                          },
                        ]}
                      >
                        <Text style={[styles.sendRoundTxt, { color: hasDraft ? '#fff' : T.sub }]}>➤</Text>
                      </TouchableOpacity>
                    </View>
                    {composerError ? (
                      <Text style={styles.errorText}>{composerError}</Text>
                    ) : null}
                  </>
                )}
              </View>
            ) : null}
          </KeyboardAvoidingView>
        </Animated.View>

        {/* In-sheet image viewer — sibling to sheet container, fills the full Modal */}
        {!!sheetViewingImage && (
          <Animated.View style={[styles.sheetImgOverlay, { opacity: sheetImgFade }]}>
            <Pressable style={StyleSheet.absoluteFill} onPress={closeSheetImage} />
            <Animated.Image
              source={{ uri: sheetViewingImage }}
              style={[styles.sheetImgFull, { transform: [{ scale: sheetImgScale }] }]}
              resizeMode="contain"
            />
            <Animated.View style={[styles.sheetImgCloseBtn, { opacity: sheetImgFade }]}>
              <TouchableOpacity onPress={closeSheetImage} style={styles.sheetImgCloseBtnInner}>
                <Text style={styles.sheetImgCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        )}
      </Modal>

      {/* ── Full-screen image viewer — rendered last so it sits above the sheet ── */}
      <Modal visible={!!viewingImage} transparent animationType="none" statusBarTranslucent onRequestClose={closeImage}>
        <Animated.View style={[styles.imgOverlay, { opacity: imgFade }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeImage} />
          <Animated.Image
            source={{ uri: viewingImage ?? undefined }}
            style={[styles.imgFull, { transform: [{ scale: imgScale }] }]}
            resizeMode="contain"
          />
          <Animated.View style={[styles.imgCloseBtn, { opacity: imgFade }]}>
            <TouchableOpacity onPress={closeImage} style={styles.imgCloseBtnInner}>
              <Text style={styles.imgCloseBtnText}>✕</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Modal>
    </View>
  );
}

function formatRelativeTime(iso) {
  const diffMins = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const hrs = Math.floor(diffMins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function initialsFromName(name = 'AN') {
  const bits = name.trim().split(' ').filter(Boolean);
  if (!bits.length) return 'AN';
  return bits.slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

function toHandle(name = 'anon') {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 16) || 'anon';
}

function formatCountdown(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexShrink: 0,
  },
  title: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 21,
  },
  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    marginTop: 2,
    letterSpacing: 0.2,
  },

  content: {
    padding: 18,
    paddingBottom: 30,
  },

  // Report card
  reportCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  sectionLabel: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },
  sectionHint: { fontFamily: 'DMSans_400Regular', fontSize: 10 },
  cafeScroll: { marginBottom: 12 },
  cafeScrollContent: { gap: 6, paddingBottom: 2 },
  cafePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cafePillText: {
    fontSize: 11,
  },

  busynessRow: {
    flexDirection: 'row',
    gap: 7,
    marginBottom: 10,
  },
  busynessDot: { width: 7, height: 7, borderRadius: 3.5 },
  busynessPillBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 999,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  busynessPillText: { fontFamily: 'DMSans_500Medium', fontSize: 11 },

  postedBanner: {
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postedText: { fontFamily: 'DMSans_600SemiBold', fontSize: 12 },

  // Feed
  feedLabel: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  postCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    paddingHorizontal: 14,
    marginBottom: 9,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 9,
  },
  postUser: { fontFamily: 'DMSans_700Bold', fontSize: 12 },
  postMeta: { fontFamily: 'DMSans_400Regular', fontSize: 10 },
  postText: { fontFamily: 'DMSans_400Regular', fontSize: 12, lineHeight: 19 },
  feedPhoto: {
    width: '100%',
    height: 90,
    borderRadius: 8,
    marginTop: 8,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 10,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { fontFamily: 'DMSans_400Regular', fontSize: 11 },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  sheetWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  sheetHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 10,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  sheetTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 33,
  },
  sheetMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  sheetMetaText: { fontFamily: 'DMSans_500Medium', fontSize: 12 },
  dotDivider: { fontFamily: 'DMSans_400Regular', fontSize: 13 },
  sheetHeaderRight: { alignItems: 'flex-end', gap: 8 },
  closeBtn: {
    width: 33,
    height: 33,
    borderRadius: 16.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  closeBtnText: { fontSize: 18, lineHeight: 18 },
  refreshText: { fontFamily: 'DMSans_400Regular', fontSize: 11 },
  livePill: {
    marginHorizontal: 14,
    borderRadius: 999,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    height: 26,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  livePillText: { fontFamily: 'DMSans_600SemiBold', fontSize: 11, color: '#A53F2B' },
  tabsRow: {
    marginTop: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    gap: 22,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tabBtn: {
    paddingBottom: 9,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: { fontFamily: 'DMSans_600SemiBold', fontSize: 17 },
  updatePhoto: {
    width: '100%',
    height: 90,
    borderRadius: 10,
    marginTop: 8,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  photoTile: {
    width: '48%',
    height: 100,
    borderRadius: 10,
  },
  emptyUpdateText: {
    marginTop: 24,
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
  },
  composerWrap: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
    paddingHorizontal: 12,
  },
  photoPreviewStrip: {
    marginBottom: 9,
  },
  previewPhoto: {
    width: '100%',
    height: 72,
    borderRadius: 12,
  },
  removePhotoBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removePhotoTxt: { color: '#fff', fontSize: 14, lineHeight: 14 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  iconBtnTxt: { fontSize: 15 },
  composerInput: {
    flex: 1,
    minHeight: 36,
    maxHeight: 88,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
  },
  sendRoundBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  sendRoundTxt: {
    fontSize: 14,
    fontFamily: 'DMSans_700Bold',
    marginLeft: 1,
  },
  errorText: {
    marginTop: 8,
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: '#DC2626',
  },

  // Image viewer for the main feed (outside sheet) — inside its own Modal
  imgOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imgFull: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.78,
  },
  imgCloseBtn: {
    position: 'absolute',
    top: 56,
    right: 20,
  },
  imgCloseBtnInner: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imgCloseBtnText: { color: '#fff', fontSize: 15 },

  // Image viewer for inside the sheet — fills the full Modal (sibling to sheet container)
  sheetImgOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  sheetImgFull: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.78,
  },
  sheetImgCloseBtn: {
    position: 'absolute',
    top: 56,
    right: 20,
  },
  sheetImgCloseBtnInner: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetImgCloseBtnText: { color: '#fff', fontSize: 15 },
});
