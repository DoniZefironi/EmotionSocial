import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Avatar from '../components/Avatar';
import PostCard from '../components/PostCard';
import EmotionBadge from '../components/EmotionBadge';
import { getUserProfileById } from '../services/userService';
import { subscribeToUserPosts } from '../services/postService';

export default function OtherProfileScreen({ route, navigation }) {
  const { userId } = route.params;
  const [userProfile, setUserProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  function handleImagePress(imageUrl) {
    navigation.navigate('ImageModal', { imageUrl });
  }

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await getUserProfileById(userId);
        setUserProfile(profile);
      } catch (err) {
        console.error('Ошибка загрузки профиля:', err);
      }
    }
    loadProfile();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    const unsubscribe = subscribeToUserPosts(userId, (data) => {
      setPosts(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [userId]);

  // Подсчёт статистики эмоций
  const emotionStats = posts.reduce((acc, post) => {
    if (post.emotion) {
      acc[post.emotion] = (acc[post.emotion] || 0) + 1;
    }
    return acc;
  }, {});

  const topEmotions = Object.entries(emotionStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  if (!userProfile) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6C5CE7" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      {/* Header */}
      <View style={styles.header}>
        <Avatar
          photoURL={userProfile?.photoURL}
          displayName={userProfile?.displayName}
          size={88}
        />

        <Text style={styles.displayName}>{userProfile?.displayName || 'Пользователь'}</Text>

        {userProfile?.bio ? (
          <Text style={styles.bio}>{userProfile.bio}</Text>
        ) : null}
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{posts.length}</Text>
          <Text style={styles.statLabel}>Постов</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {posts.reduce((sum, p) => sum + (p.likes?.length || 0), 0)}
          </Text>
          <Text style={styles.statLabel}>Лайков</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {posts.reduce((sum, p) => sum + (p.commentsCount || 0), 0)}
          </Text>
          <Text style={styles.statLabel}>Комментов</Text>
        </View>
      </View>

      {/* Emotion Stats */}
      {topEmotions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Эмоции пользователя</Text>
          <View style={styles.emotionStats}>
            {topEmotions.map(([key, count]) => (
              <View key={key} style={styles.emotionStatItem}>
                <EmotionBadge emotion={key} size="sm" />
                <Text style={styles.emotionCount}>{count}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Posts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Посты</Text>
        {loading ? (
          <ActivityIndicator color="#6C5CE7" style={{ marginTop: 20 }} />
        ) : posts.length === 0 ? (
          <Text style={styles.noPosts}>У пользователя ещё нет постов</Text>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} onImagePress={handleImagePress} />)
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5' },
  inner: { paddingBottom: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  displayName: { fontSize: 22, fontWeight: '800', color: '#2D3436', marginTop: 12 },
  bio: { fontSize: 14, color: '#636E72', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 12,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', color: '#6C5CE7' },
  statLabel: { fontSize: 12, color: '#636E72', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#F0F0F0' },
  section: { marginHorizontal: 0, marginBottom: 12 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2D3436',
    marginHorizontal: 16,
    marginBottom: 10,
  },
  emotionStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
  },
  emotionStatItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  emotionCount: { fontSize: 13, fontWeight: '700', color: '#636E72' },
  noPosts: { fontSize: 14, color: '#B2BEC3', textAlign: 'center', marginTop: 20 },
});
