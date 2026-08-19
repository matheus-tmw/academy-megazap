import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CourseDocument, ModuleDocument, LessonDocument } from '../types/backend';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

/**
 * Service for Managing MegaZap Academy Courses, Modules & Lessons.
 * Structure:
 * courses/{courseId}
 * courses/{courseId}/modules/{moduleId}
 * courses/{courseId}/modules/{moduleId}/lessons/{lessonId}
 */

export async function listPublishedCourses(): Promise<CourseDocument[]> {
  const path = 'courses';
  try {
    const q = query(
      collection(db, path),
      where('status', '==', 'published'),
      orderBy('order', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as CourseDocument));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function getCourse(courseId: string): Promise<CourseDocument | null> {
  const docRef = doc(db, 'courses', courseId);
  try {
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as CourseDocument;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `courses/${courseId}`);
  }
}

export async function saveCourse(courseId: string, data: Omit<CourseDocument, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
  const docRef = doc(db, 'courses', courseId);
  try {
    await setDoc(docRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `courses/${courseId}`);
  }
}

export async function saveModule(
  courseId: string, 
  moduleId: string, 
  data: Omit<ModuleDocument, 'id'>
): Promise<void> {
  const docRef = doc(db, 'courses', courseId, 'modules', moduleId);
  try {
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `courses/${courseId}/modules/${moduleId}`);
  }
}

export async function saveLesson(
  courseId: string, 
  moduleId: string, 
  lessonId: string, 
  data: Omit<LessonDocument, 'id' | 'createdAt' | 'updatedAt'>
): Promise<void> {
  const docRef = doc(db, 'courses', courseId, 'modules', moduleId, 'lessons', lessonId);
  try {
    await setDoc(docRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`);
  }
}
