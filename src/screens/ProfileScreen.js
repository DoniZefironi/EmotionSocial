import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Avatar from '../components/Avatar';
import PostCard from '../components/PostCard';
import EmotionBadge from '../components/EmotionBadge';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToUserPosts } from '../services/postService';
import { updateUserProfile, uploadAvatar } from '../services/userService';
import { EMOTIONS } from '../utils/emotions';

export default function ProfileScreen({ navigation }) {
  const { user, userProfile, signOut, refreshProfile } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBio, setEditingBio] = useState(false);
  const [bio, setBio] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToUserPosts(user.uid, (data) => {
      setPosts(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  useEffect(() => {
    setBio(userProfile?.bio || '');
  }, [userProfile]);

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

  async function handlePickAvatar() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Нет доступа', 'Разрешите доступ к галерее');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled) {
      setUploadingAvatar(true);
      try {
        await uploadAvatar(user.uid, result.assets[0].uri);
        await refreshProfile();
      } catch (err) {
        Alert.alert('Ошибка', 'Не удалось загрузить фото: ' + err.message);
      } finally {
        setUploadingAvatar(false);
      }
    }
  }

  async function saveBio() {
    await updateUserProfile(user.uid, { bio: bio.trim() });
    await refreshProfile();
    setEditingBio(false);
  }

  async function handleSignOut() {
    Alert.alert('Выход', 'Вы уверены?', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Выйти', style: 'destructive', onPress: signOut },
    ]);
  }

  function handleProfilePress(userId) {
    if (userId !== user.uid) {
      navigation.navigate('OtherProfile', { userId });
    }
  }

  function handleImagePress(imageUrl) {
    navigation.navigate('ImageModal', { imageUrl });
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePickAvatar} disabled={uploadingAvatar}>
          <View style={styles.avatarWrapper}>
            <Avatar
              photoURL={userProfile?.photoURL || user?.photoURL}
              displayName={user?.displayName}
              size={88}
            />
            {uploadingAvatar && (
              <View style={styles.avatarLoading}>
                <ActivityIndicator color="#fff" />
              </View>
            )}
            <View style={styles.avatarEdit}>
              <Text style={styles.avatarEditIcon}>📷</Text>
            </View>
          </View>
        </TouchableOpacity>

        <Text style={styles.displayName}>{user?.displayName || 'Пользователь'}</Text>
        <Text style={styles.email}>{user?.email}</Text>

        {editingBio ? (
          <View style={styles.bioEdit}>
            <TextInput
              style={styles.bioInput}
              value={bio}
              onChangeText={setBio}
              placeholder="Расскажите о себе..."
              multiline
              maxLength={150}
              autoFocus
            />
            <View style={styles.bioButtons}>
              <TouchableOpacity onPress={() => setEditingBio(false)} style={styles.bioCancelBtn}>
                <Text style={styles.bioCancelText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveBio} style={styles.bioSaveBtn}>
                <Text style={styles.bioSaveText}>Сохранить</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setEditingBio(true)}>
            <Text style={styles.bio}>
              {userProfile?.bio || '+ Добавить описание'}
            </Text>
          </TouchableOpacity>
        )}
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
          <Text style={styles.sectionTitle}>Мои эмоции</Text>
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
        <Text style={styles.sectionTitle}>Мои посты</Text>
        {loading ? (
          <ActivityIndicator color="#6C5CE7" style={{ marginTop: 20 }} />
        ) : posts.length === 0 ? (
          <Text style={styles.noPosts}>Вы ещё не публиковали посты</Text>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} onProfilePress={handleProfilePress} onImagePress={handleImagePress} />)
        )}
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Выйти из аккаунта</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5' },
  inner: { paddingBottom: 32 },
  header: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  avatarWrapper: { position: 'relative', marginBottom: 12 },
  avatarLoading: {
    position: 'absolute',
    inset: 0,
    borderRadius: 44,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEdit: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6C5CE7',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarEditIcon: { fontSize: 13 },
  displayName: { fontSize: 22, fontWeight: '800', color: '#2D3436' },
  email: { fontSize: 13, color: '#B2BEC3', marginTop: 2, marginBottom: 10 },
  bio: { fontSize: 14, color: '#636E72', textAlign: 'center', lineHeight: 20 },
  bioEdit: { width: '100%', marginTop: 4 },
  bioInput: {
    borderWidth: 1.5,
    borderColor: '#DFE6E9',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#2D3436',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  bioButtons: { flexDirection: 'row', gap: 8, marginTop: 8, justifyContent: 'flex-end' },
  bioCancelBtn: { paddingVertical: 8, paddingHorizontal: 14 },
  bioCancelText: { color: '#636E72', fontWeight: '600' },
  bioSaveBtn: {
    backgroundColor: '#6C5CE7',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  bioSaveText: { color: '#fff', fontWeight: '700' },
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
  signOutButton: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FF6B6B',
    alignItems: 'center',
  },
  signOutText: { color: '#FF6B6B', fontWeight: '700', fontSize: 15 },
});
