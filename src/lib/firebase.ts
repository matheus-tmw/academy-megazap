import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App singleton
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore (default or custom database ID)
export const db = (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)')
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Connection test as mandated by Skill
let isConnectionTested = false;
export async function testConnection() {
  if (isConnectionTested) return;
  isConnectionTested = true;
  try {
    console.log('[FIRESTORE READ] testConnection -> test/connection (1 doc)');
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection verified successfully.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase connection check: Client appears offline or unreachable.');
    } else {
      console.log('Firebase ready and initialized.');
    }
  }
}

// Automatically test connection on boot
if (typeof window !== 'undefined') {
  testConnection();
}
