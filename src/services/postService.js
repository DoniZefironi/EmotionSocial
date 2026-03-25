import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  onSnapshot,
  getDoc,
  increment,
  where,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { uploadImage } from './imageService';

export async function createPost({ userId, displayName, photoURL, content, emotion, imageUri }) {
  let imageURL = null;
  if (imageUri && !imageUri.startsWith('http')) {
    imageURL = await uploadImage(imageUri);
  } else if (imageUri) {
    imageURL = imageUri;
  }

  const postRef = await addDoc(collection(db, 'posts'), {
    userId,
    displayName,
    photoURL: photoURL || null,
    content,
    emotion: emotion || null,
    imageURL,
    likes: [],
    commentsCount: 0,
    createdAt: serverTimestamp(),
  });

  return postRef.id;
}

export function subscribeToPosts(callback) {
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50));
  return onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate() || new Date(),
    }));
    callback(posts);
  });
}

export function subscribeToUserPosts(userId, callback) {
  const q = query(
    collection(db, 'posts'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate() || new Date(),
    }));
    callback(posts);
  });
}

export async function toggleLike(postId, userId) {
  const postRef = doc(db, 'posts', postId);
  const snap = await getDoc(postRef);
  const likes = snap.data()?.likes || [];
  if (likes.includes(userId)) {
    await updateDoc(postRef, { likes: arrayRemove(userId) });
  } else {
    await updateDoc(postRef, { likes: arrayUnion(userId) });
  }
}

export async function addComment(postId, { userId, displayName, photoURL, content }) {
  await addDoc(collection(db, 'posts', postId, 'comments'), {
    userId,
    displayName,
    photoURL: photoURL || null,
    content,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'posts', postId), { commentsCount: increment(1) });
}

export function subscribeToComments(postId, callback) {
  const q = query(
    collection(db, 'posts', postId, 'comments'),
    orderBy('createdAt', 'asc')
  );
  return onSnapshot(q, (snapshot) => {
    const comments = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate() || new Date(),
    }));
    callback(comments);
  });
}
