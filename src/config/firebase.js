import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAUFgP8wKNwBy2cr1AECcKzESdCpQ3_-fQ",
  authDomain: "emotionsocial-a649c.firebaseapp.com",
  projectId: "emotionsocial-a649c",
  storageBucket: "emotionsocial-a649c.firebasestorage.app",
  messagingSenderId: "1002823158806",
  appId: "1:1002823158806:web:5364a42fa2eb2012b7f937",
  measurementId: "G-P069WZ3KB7"
};
const app = initializeApp(firebaseConfig);

let auth;

// Определяем платформу
const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';

if (isWeb) {
  // Для веба используем browserLocalPersistence
  const { getAuth } = require('firebase/auth');
  auth = getAuth(app, {
    persistence: browserLocalPersistence,
  });
  console.log('🌐 Firebase Auth: веб-версия (browserLocalPersistence)');
} else {
  // Для React Native используем AsyncStorage
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
  console.log('📱 Firebase Auth: мобильная версия (AsyncStorage)');
}

const db = getFirestore(app);

export { auth, db };
export default app;
