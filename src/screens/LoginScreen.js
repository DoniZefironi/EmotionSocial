// Вход/регистрация. Email + пароль + имя
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Ошибка', 'Заполните email и пароль');
      return;
    }
    if (isRegister && !displayName.trim()) {
      Alert.alert('Ошибка', 'Введите имя');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await signUp(email.trim(), password, displayName.trim());
      } else {
        await signIn(email.trim(), password);
      }
    } catch (err) {
      const msg = {
        'auth/email-already-in-use': 'Email уже используется',
        'auth/invalid-email': 'Неверный email',
        'auth/weak-password': 'Пароль должен быть минимум 6 символов',
        'auth/user-not-found': 'Пользователь не найден',
        'auth/wrong-password': 'Неверный пароль',
        'auth/invalid-credential': 'Неверный email или пароль',
      }[err.code] || err.message;
      Alert.alert('Ошибка', msg);
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
        <View style={styles.logo}>
          <Text style={styles.logoText}>😊</Text>
          <Text style={styles.appName}>EmotionSocial</Text>
          <Text style={styles.tagline}>Делись своими эмоциями</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>{isRegister ? 'Регистрация' : 'Вход'}</Text>

          {isRegister && (
            <TextInput
              style={styles.input}
              placeholder="Ваше имя"
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Пароль"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{isRegister ? 'Зарегистрироваться' : 'Войти'}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsRegister(!isRegister)} style={styles.toggle}>
            <Text style={styles.toggleText}>
              {isRegister ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#6C5CE7' },
  inner: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logo: { alignItems: 'center', marginBottom: 32 },
  logoText: { fontSize: 64 },
  appName: { fontSize: 28, fontWeight: '800', color: '#fff', marginTop: 8 },
  tagline: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  title: { fontSize: 22, fontWeight: '800', color: '#2D3436', marginBottom: 20 },
  input: {
    borderWidth: 1.5,
    borderColor: '#DFE6E9',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    marginBottom: 12,
    color: '#2D3436',
    backgroundColor: '#F8F9FA',
  },
  button: {
    backgroundColor: '#6C5CE7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  toggle: { marginTop: 16, alignItems: 'center' },
  toggleText: { color: '#6C5CE7', fontWeight: '600', fontSize: 14 },
});
