import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { FavoriteRecord } from '../types/backend';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

/**
 * Service for Managing User Favorites.
 * Subcollection: users/{uid}/favorites/{lessonId}
 */

export async function addFavorite(uid: string, lessonId: string): Promise<void> {
  const favDocRef = doc(db, 'users', uid, 'favorites', lessonId);
  const data: FavoriteRecord = {
    lessonId,
    createdAt: serverTimestamp() as any,
  };

  try {
    await setDoc(favDocRef, data);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `users/${uid}/favorites/${lessonId}`);
  }
}

export async function removeFavorite(uid: string, lessonId: string): Promise<void> {
  const favDocRef = doc(db, 'users', uid, 'favorites', lessonId);
  try {
    await deleteDoc(favDocRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${uid}/favorites/${lessonId}`);
  }
}

export async function getUserFavorites(uid: string): Promise<string[]> {
  const path = `users/${uid}/favorites`;
  try {
    const snapshot = await getDocs(collection(db, 'users', uid, 'favorites'));
    return snapshot.docs.map(docSnap => docSnap.id);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export function listenToUserFavorites(uid: string, callback: (favoriteIds: string[]) => void) {
  const path = `users/${uid}/favorites`;
  return onSnapshot(
    collection(db, 'users', uid, 'favorites'),
    (snapshot) => {
      const ids = snapshot.docs.map(docSnap => docSnap.id);
      callback(ids);
    },
    (error) => {
      console.warn(`Favorites subscription notice for ${path}:`, error?.message || error);
    }
  );
}
