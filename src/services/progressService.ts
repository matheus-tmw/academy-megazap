import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ProgressRecord } from '../types/backend';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { 
  logFirestoreRead, 
  logFirestoreWrite, 
  logFirestoreListenerStart, 
  logFirestoreListenerStop 
} from '../lib/firestore-logger';

/**
 * Service for Recording and Synchronizing User Progress.
 * Subcollection: users/{uid}/progress/{lessonId}
 */

export async function saveLessonProgress(
  uid: string, 
  params: {
    lessonId: string;
    courseId: string;
    moduleId: string;
    progressPercent: number;
    completed?: boolean;
  }
): Promise<void> {
  const { lessonId, courseId, moduleId, progressPercent, completed = false } = params;
  const progressDocRef = doc(db, 'users', uid, 'progress', lessonId);

  try {
    logFirestoreRead('saveLessonProgress (check existing)', `users/${uid}/progress/${lessonId}`, 1);
    const existingDoc = await getDoc(progressDocRef);
    if (!existingDoc.exists()) {
      const record: ProgressRecord = {
        lessonId,
        courseId,
        moduleId,
        completed,
        progressPercent: Math.min(100, Math.max(0, Math.round(progressPercent))),
        startedAt: serverTimestamp() as any,
        completedAt: completed ? (serverTimestamp() as any) : null,
        lastWatchedAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any,
      };
      logFirestoreWrite('saveLessonProgress', `users/${uid}/progress/${lessonId}`, 'setDoc');
      await setDoc(progressDocRef, record);
    } else {
      const isAlreadyCompleted = existingDoc.data()?.completed || false;
      const shouldMarkCompleted = completed || isAlreadyCompleted || progressPercent >= 95;

      logFirestoreWrite('saveLessonProgress', `users/${uid}/progress/${lessonId}`, 'updateDoc');
      await updateDoc(progressDocRef, {
        progressPercent: Math.min(100, Math.max(0, Math.round(progressPercent))),
        completed: shouldMarkCompleted,
        completedAt: shouldMarkCompleted && !isAlreadyCompleted ? serverTimestamp() : existingDoc.data()?.completedAt || null,
        lastWatchedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}/progress/${lessonId}`);
  }
}

export async function getUserProgress(uid: string): Promise<Record<string, ProgressRecord>> {
  const path = `users/${uid}/progress`;
  try {
    const snapshot = await getDocs(collection(db, 'users', uid, 'progress'));
    logFirestoreRead('getUserProgress', path, snapshot.docs.length);
    const progressMap: Record<string, ProgressRecord> = {};
    snapshot.docs.forEach(docSnap => {
      progressMap[docSnap.id] = docSnap.data() as ProgressRecord;
    });
    return progressMap;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export function listenToUserProgress(
  uid: string, 
  callback: (progressMap: Record<string, ProgressRecord>) => void
) {
  const path = `users/${uid}/progress`;
  logFirestoreListenerStart('listenToUserProgress', path);
  const unsubscribe = onSnapshot(
    collection(db, 'users', uid, 'progress'),
    (snapshot) => {
      logFirestoreRead('listenToUserProgress (onSnapshot update)', path, snapshot.docs.length);
      const progressMap: Record<string, ProgressRecord> = {};
      snapshot.docs.forEach(docSnap => {
        progressMap[docSnap.id] = docSnap.data() as ProgressRecord;
      });
      callback(progressMap);
    },
    (error) => {
      console.warn(`Progress subscription notice for ${path}:`, error?.message || error);
    }
  );

  return () => {
    logFirestoreListenerStop('listenToUserProgress', path);
    unsubscribe();
  };
}
