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
      await setDoc(progressDocRef, record);
    } else {
      const isAlreadyCompleted = existingDoc.data()?.completed || false;
      const shouldMarkCompleted = completed || isAlreadyCompleted || progressPercent >= 95;

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
  return onSnapshot(
    collection(db, 'users', uid, 'progress'),
    (snapshot) => {
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
}
