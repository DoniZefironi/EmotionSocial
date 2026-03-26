// Карточка поста: аватар, имя, эмоция, текст, фото, лайки, комментарии
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Avatar from './Avatar';
import EmotionBadge from './EmotionBadge';
import { toggleLike } from '../services/postService';
import { useAuth } from '../contexts/AuthContext';
import { formatRelativeTime } from '../utils/emotions';

export default function PostCard({ post, onCommentsPress, onProfilePress, onImagePress }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.likes?.includes(user?.uid));
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);

  // Поставить/снять лайк
  async function handleLike() {
    if (!user) return;
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikesCount((c) => (wasLiked ? c - 1 : c + 1));
    try {
      await toggleLike(post.id, user.uid);
    } catch {
      setLiked(wasLiked);
      setLikesCount((c) => (wasLiked ? c + 1 : c - 1));
    }
  }

  // Перейти в профиль автора
  function handleProfilePress() {
    if (post.userId !== user?.uid) {
      onProfilePress?.(post.userId);
    }
  }

  // Открыть изображение на весь экран
  function handleImagePress() {
    if (post.imageURL) {
      onImagePress?.(post.imageURL);
    }
  }

  const isOwnPost = post.userId === user?.uid;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleProfilePress} disabled={isOwnPost}>
          <Avatar photoURL={post.photoURL} displayName={post.displayName} size={42} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <TouchableOpacity onPress={handleProfilePress} disabled={isOwnPost}>
            <Text style={[styles.name, !isOwnPost && styles.nameLink]}>
              {post.displayName || 'Пользователь'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.time}>{formatRelativeTime(post.createdAt)}</Text>
        </View>
        {post.emotion && <EmotionBadge emotion={post.emotion} size="sm" />}
      </View>

      {post.content ? <Text style={styles.content}>{post.content}</Text> : null}

      {post.imageURL ? (
        <TouchableOpacity onPress={handleImagePress} activeOpacity={0.9}>
          <Image source={{ uri: post.imageURL }} style={styles.image} resizeMode="cover" />
        </TouchableOpacity>
      ) : null}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.action} onPress={handleLike}>
          <Text style={[styles.actionIcon, liked && styles.liked]}>{liked ? '❤️' : '🤍'}</Text>
          <Text style={[styles.actionCount, liked && styles.likedText]}>{likesCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.action} onPress={() => onCommentsPress?.(post)}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionCount}>{post.commentsCount || 0}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 12,
    marginVertical: 6,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  headerText: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: '#2D3436' },
  nameLink: { color: '#6C5CE7' },
  time: { fontSize: 12, color: '#B2BEC3', marginTop: 1 },
  content: { fontSize: 15, color: '#2D3436', lineHeight: 22, marginBottom: 10 },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#F0F0F0',
  },
  actions: { flexDirection: 'row', gap: 20, paddingTop: 6 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionIcon: { fontSize: 20 },
  actionCount: { fontSize: 14, color: '#636E72', fontWeight: '600' },
  liked: {},
  likedText: { color: '#E84393' },
});
