import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { uploadImage } from './imageService';

export async function createUserProfile(uid, { displayName, email }) {
  await setDoc(doc(db, 'users', uid), {
    displayName,
    email,
    photoURL: null,
    bio: '',
    createdAt: serverTimestamp(),
  });
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  if (snap.exists()) return { id: snap.id, ...snap.data() };
  return null;
}

export async function getUserProfileById(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  if (snap.exists()) return { id: snap.id, ...snap.data() };
  return null;
}

export async function updateUserProfile(uid, updates) {
  await updateDoc(doc(db, 'users', uid), updates);
}

export async function uploadAvatar(uid, imageUri) {
  const url = await uploadImage(imageUri);
  await updateDoc(doc(db, 'users', uid), { photoURL: url });
  return url;
}
