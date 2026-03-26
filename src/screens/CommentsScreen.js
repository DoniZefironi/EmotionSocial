// Комментарии к посту. Список + форма отправки
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Avatar from '../components/Avatar';
import { addComment, subscribeToComments } from '../services/postService';
import { useAuth } from '../contexts/AuthContext';
import { formatRelativeTime } from '../utils/emotions';

export default function CommentsScreen({ route, navigation }) {
  const { postId } = route.params;
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const inputRef = useRef(null);

  function handleProfilePress(userId) {
    if (userId !== user.uid) {
      navigation.navigate('OtherProfile', { userId });
    }
  }

  useEffect(() => {
    const unsubscribe = subscribeToComments(postId, (data) => {
      setComments(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [postId]);

  async function handleSend() {
    if (!text.trim() || sending) return;
    setSending(true);
    const content = text.trim();
    setText('');
    try {
      await addComment(postId, {
        userId: user.uid,
        displayName: user.displayName || 'Пользователь',
        photoURL: user.photoURL || null,
        content,
      });
    } catch {
      setText(content);
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6C5CE7" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.comment}>
            <TouchableOpacity onPress={() => handleProfilePress(item.userId)} disabled={item.userId === user.uid}>
              <Avatar photoURL={item.photoURL} displayName={item.displayName} size={36} />
            </TouchableOpacity>
            <View style={styles.commentBody}>
              <View style={styles.commentBubble}>
                <TouchableOpacity onPress={() => handleProfilePress(item.userId)} disabled={item.userId === user.uid}>
                  <Text style={[styles.commentName, item.userId !== user.uid && styles.commentNameLink]}>
                    {item.displayName}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.commentText}>{item.content}</Text>
              </View>
              <Text style={styles.commentTime}>{formatRelativeTime(item.createdAt)}</Text>
            </View>
          </View>
        )}
        contentContainerStyle={comments.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Пока нет комментариев. Будьте первым! 💬</Text>
          </View>
        }
      />

      <View style={styles.inputRow}>
        <Avatar photoURL={user?.photoURL} displayName={user?.displayName} size={36} />
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Написать комментарий..."
          value={text}
          onChangeText={setText}
          multiline
          maxLength={300}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!text.trim() || sending) && styles.sendDisabled]}
          onPress={handleSend}
          disabled={!text.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.sendIcon}>➤</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 12 },
  emptyContainer: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 60 },
  emptyText: { fontSize: 14, color: '#636E72', textAlign: 'center' },
  comment: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  commentBody: { flex: 1 },
  commentBubble: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderTopLeftRadius: 4,
    padding: 12,
  },
  commentName: { fontSize: 13, fontWeight: '700', color: '#2D3436', marginBottom: 2 },
  commentNameLink: { color: '#6C5CE7' },
  commentText: { fontSize: 14, color: '#2D3436', lineHeight: 20 },
  commentTime: { fontSize: 11, color: '#B2BEC3', marginTop: 4, marginLeft: 4 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    gap: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#DFE6E9',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
    backgroundColor: '#F8F9FA',
    color: '#2D3436',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6C5CE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: { backgroundColor: '#DFE6E9' },
  sendIcon: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
