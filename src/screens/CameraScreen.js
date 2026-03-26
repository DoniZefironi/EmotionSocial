// Камера для распознавания эмоций. expo-camera
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { detectEmotion } from '../services/emotionService';
import { getDominantEmotion, getEmotionInfo } from '../utils/emotions';
import { IS_DEMO_MODE } from '../config/faceConfig';

export default function CameraScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState(null);
  const [emotion, setEmotion] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [facing, setFacing] = useState('front');
  const cameraRef = useRef(null);

  // Нет доступа к камере
  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionEmoji}>📷</Text>
        <Text style={styles.permissionTitle}>Нужен доступ к камере</Text>
        <Text style={styles.permissionText}>
          Для распознавания эмоций нам нужна ваша камера
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Разрешить</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Сделать снимок и распознать эмоцию
  async function takePicture() {
    if (!cameraRef.current || detecting) return;
    try {
      setDetecting(true);
      const snap = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.6 });
      setPhoto(snap.uri);

      const result = await detectEmotion(snap.base64);
      if (!result) {
        Alert.alert('Лицо не найдено', 'Убедитесь, что ваше лицо хорошо видно на камере');
        setPhoto(null);
        return;
      }

      const dominant = getDominantEmotion(result.emotions);
      setEmotion(dominant);
    } catch (err) {
      Alert.alert('Ошибка', 'Не удалось определить эмоцию: ' + err.message);
      setPhoto(null);
    } finally {
      setDetecting(false);
    }
  }

  // Сбросить фото и эмоцию для нового снимка
  function retake() {
    setPhoto(null);
    setEmotion(null);
  }

  // Перейти на экран создания поста с фото и эмоцией
  function createPost() {
    navigation.navigate('CreatePost', { emotion, photoUri: photo });
  }

  // Просмотр результата (фото + эмоция)
  if (photo) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: photo }} style={styles.preview} resizeMode="cover" />

        <View style={styles.resultOverlay}>
          {detecting ? (
            <View style={styles.detectingBox}>
              <ActivityIndicator color="#fff" size="large" />
              <Text style={styles.detectingText}>Анализирую эмоцию...</Text>
            </View>
          ) : emotion ? (
            <View style={styles.emotionResult}>
              <Text style={styles.emotionResultEmoji}>{getEmotionInfo(emotion).emoji}</Text>
              <Text style={styles.emotionResultLabel}>{getEmotionInfo(emotion).label}</Text>
              {IS_DEMO_MODE && (
                <Text style={styles.demoLabel}>Демо-режим (настройте Face++ API)</Text>
              )}
              <View style={styles.resultButtons}>
                <TouchableOpacity style={styles.retakeButton} onPress={retake}>
                  <Text style={styles.retakeButtonText}>↩ Переснять</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.postButton} onPress={createPost}>
                  <Text style={styles.postButtonText}>Создать пост 🚀</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </View>
      </View>
    );
  }

  // Камера активна (основной режим)
  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        <View style={styles.cameraOverlay}>
          <View style={styles.faceGuide} />

          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.flipButton}
              onPress={() => setFacing((f) => (f === 'front' ? 'back' : 'front'))}
            >
              <Text style={styles.flipButtonText}>🔄</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.captureButton, detecting && styles.captureDisabled]}
              onPress={takePicture}
              disabled={detecting}
            >
              <View style={styles.captureInner} />
            </TouchableOpacity>

            <View style={{ width: 56 }} />
          </View>

          <Text style={styles.hint}>Направьте камеру на лицо и нажмите кнопку</Text>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
  },
  faceGuide: {
    position: 'absolute',
    top: '15%',
    width: 200,
    height: 240,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    borderStyle: 'dashed',
  },
  cameraControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 12,
  },
  flipButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipButtonText: { fontSize: 24 },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureDisabled: { opacity: 0.5 },
  captureInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
  },
  hint: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 8 },
  preview: { flex: 1, width: '100%' },
  resultOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
  },
  detectingBox: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  detectingText: { color: '#fff', fontSize: 16 },
  emotionResult: {
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  emotionResultEmoji: { fontSize: 64 },
  emotionResultLabel: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginTop: 8,
    marginBottom: 4,
  },
  demoLabel: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 8 },
  resultButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  retakeButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  retakeButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  postButton: {
    backgroundColor: '#6C5CE7',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  postButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#F0F2F5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  permissionEmoji: { fontSize: 64, marginBottom: 16 },
  permissionTitle: { fontSize: 22, fontWeight: '800', color: '#2D3436', marginBottom: 8 },
  permissionText: { fontSize: 14, color: '#636E72', textAlign: 'center', marginBottom: 24 },
  permissionButton: {
    backgroundColor: '#6C5CE7',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  permissionButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
