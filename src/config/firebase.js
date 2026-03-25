import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Вставьте свои настройки Firebase сюда
// Firebase Console → Project Settings → Your apps → SDK setup
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
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  const { getAuth } = require('firebase/auth');
  auth = getAuth(app);
}

const db = getFirestore(app);

export { auth, db };
export default app;
