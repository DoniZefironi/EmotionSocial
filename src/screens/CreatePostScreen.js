// Создание поста. Текст + фото + выбор эмоции
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { createPost } from '../services/postService';
import { useAuth } from '../contexts/AuthContext';
import EmotionBadge from '../components/EmotionBadge';
import { EMOTIONS } from '../utils/emotions';

export default function CreatePostScreen({ route, navigation }) {
  const { emotion: initialEmotion, photoUri: initialPhoto } = route.params || {};
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [emotion, setEmotion] = useState(initialEmotion || null);
  const [imageUri, setImageUri] = useState(initialPhoto || null);
  const [loading, setLoading] = useState(false);
  const [showEmotionPicker, setShowEmotionPicker] = useState(false);

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Нет доступа', 'Разрешите доступ к галерее');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  }

  async function handlePost() {
    if (!content.trim() && !imageUri) {
      Alert.alert('', 'Напишите что-нибудь или добавьте фото');
      return;
    }

    setLoading(true);
    try {
      await createPost({
        userId: user.uid,
        displayName: user.displayName || 'Пользователь',
        photoURL: user.photoURL || null,
        content: content.trim(),
        emotion,
        imageUri: imageUri && !imageUri.startsWith('http') ? imageUri : null,
      });
      navigation.goBack();
    } catch (err) {
      Alert.alert('Ошибка', 'Не удалось создать пост: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <TextInput
          style={styles.textInput}
          placeholder="Что у вас на душе?"
          placeholderTextColor="#B2BEC3"
          value={content}
          onChangeText={setContent}
          multiline
          maxLength={500}
          autoFocus
        />

        <Text style={styles.charCount}>{content.length}/500</Text>

        {imageUri ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
            <TouchableOpacity style={styles.removeImage} onPress={() => setImageUri(null)}>
              <Text style={styles.removeImageText}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.emotionSection}>
          <Text style={styles.sectionLabel}>Настроение</Text>
          {emotion ? (
            <TouchableOpacity onPress={() => setShowEmotionPicker(true)}>
              <EmotionBadge emotion={emotion} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.addEmotionButton}
              onPress={() => setShowEmotionPicker(true)}
            >
              <Text style={styles.addEmotionText}>+ Добавить эмоцию</Text>
            </TouchableOpacity>
          )}
        </View>

        {showEmotionPicker && (
          <View style={styles.emotionPicker}>
            <Text style={styles.pickerTitle}>Выберите эмоцию</Text>
            <View style={styles.emotionGrid}>
              {Object.entries(EMOTIONS).map(([key, info]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.emotionOption,
                    { backgroundColor: info.bgColor },
                    emotion === key && styles.emotionOptionSelected,
                  ]}
                  onPress={() => {
                    setEmotion(key);
                    setShowEmotionPicker(false);
                  }}
                >
                  <Text style={styles.emotionOptionEmoji}>{info.emoji}</Text>
                  <Text style={[styles.emotionOptionLabel, { color: info.color }]}>
                    {info.label}
                  </Text>
                </TouchableOpacity>
              ))}
              {emotion && (
                <TouchableOpacity
                  style={styles.clearEmotion}
                  onPress={() => {
                    setEmotion(null);
                    setShowEmotionPicker(false);
                  }}
                >
                  <Text style={styles.clearEmotionText}>✕ Убрать</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        <View style={styles.toolbar}>
          <TouchableOpacity style={styles.toolButton} onPress={pickImage}>
            <Text style={styles.toolButtonText}>🖼 Фото</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toolButton}
            onPress={() => navigation.navigate('CameraTab', { screen: 'Camera' })}
          >
            <Text style={styles.toolButtonText}>📷 Камера</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.postButton, loading && styles.postButtonDisabled]}
          onPress={handlePost}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.postButtonText}>Опубликовать 🚀</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { padding: 16, paddingBottom: 24 },
  textInput: {
    fontSize: 17,
    color: '#2D3436',
    lineHeight: 26,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: { fontSize: 12, color: '#B2BEC3', textAlign: 'right', marginBottom: 12 },
  imageContainer: { position: 'relative', marginBottom: 16 },
  image: { width: '100%', height: 200, borderRadius: 12 },
  removeImage: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  emotionSection: { marginBottom: 16 },
  sectionLabel: { fontSize: 13, color: '#636E72', fontWeight: '600', marginBottom: 8 },
  addEmotionButton: {
    borderWidth: 1.5,
    borderColor: '#DFE6E9',
    borderStyle: 'dashed',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  addEmotionText: { color: '#6C5CE7', fontWeight: '600', fontSize: 14 },
  emotionPicker: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  pickerTitle: { fontSize: 14, fontWeight: '700', color: '#2D3436', marginBottom: 12 },
  emotionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emotionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  emotionOptionSelected: {
    borderWidth: 2,
    borderColor: '#6C5CE7',
  },
  emotionOptionEmoji: { fontSize: 18 },
  emotionOptionLabel: { fontSize: 13, fontWeight: '600' },
  clearEmotion: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFE8E8',
  },
  clearEmotionText: { fontSize: 13, color: '#FF6B6B', fontWeight: '600' },
  toolbar: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  toolButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#F8F9FA',
    gap: 6,
  },
  toolButtonText: { fontSize: 14, color: '#636E72', fontWeight: '600' },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#fff',
  },
  postButton: {
    backgroundColor: '#6C5CE7',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  postButtonDisabled: { opacity: 0.6 },
  postButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
