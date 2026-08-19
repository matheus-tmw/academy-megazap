import { initializeApp, getApps, deleteApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updatePassword,
  signOut
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { normalizeAuthIdentifier } from '../utils/userIdentifiers';

/**
 * Generates a clean, memorable, secure temporary password with <= 10 characters.
 * Format examples: Zap4829@, Mega3918!, Mz7461#, Fox2819$
 */
export function generateTemporaryPassword(): string {
  const prefixes = ['Zap', 'Mz', 'Mega', 'Fox', 'Top'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const randomNum = Math.floor(1000 + Math.random() * 9000); // 4 digits
  const specials = ['@', '#', '!', '$', '%'];
  const special = specials[Math.floor(Math.random() * specials.length)];
  const result = `${prefix}${randomNum}${special}`;
  // Ensure maximum of 10 characters
  return result.substring(0, 10);
}

/**
 * Provisions a user in Firebase Authentication with an initial password (defaults to 'Acesso01')
 * using an isolated secondary Firebase App instance so the currently logged-in Admin is NEVER disconnected.
 */
export async function provisionFirebaseAuthUser(
  emailOrUsername: string, 
  initialPassword = 'Acesso01'
): Promise<{ success: boolean; uid?: string; alreadyExists?: boolean; error?: string }> {
  const normalizedEmail = normalizeAuthIdentifier(emailOrUsername);
  const tempAppName = `auth-provision-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  let tempApp: any = null;

  try {
    tempApp = initializeApp(firebaseConfig, tempAppName);
    const tempAuth = getAuth(tempApp);

    const userCred = await createUserWithEmailAndPassword(tempAuth, normalizedEmail, initialPassword);
    const uid = userCred.user.uid;
    
    await signOut(tempAuth).catch(() => {});
    await deleteApp(tempApp).catch(() => {});

    return { success: true, uid };
  } catch (error: any) {
    if (tempApp) {
      await deleteApp(tempApp).catch(() => {});
    }

    if (error?.code === 'auth/email-already-in-use') {
      return { success: true, alreadyExists: true };
    }

    return { 
      success: false, 
      error: error?.message || 'Falha ao provisionar credenciais no Firebase Auth.' 
    };
  }
}

/**
 * Attempts to re-sync or update a user's password in Firebase Auth via secondary auth.
 */
export async function syncUserAuthPassword(
  emailOrUsername: string,
  currentKnownPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const normalizedEmail = normalizeAuthIdentifier(emailOrUsername);
  const tempAppName = `auth-sync-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  let tempApp: any = null;

  try {
    tempApp = initializeApp(firebaseConfig, tempAppName);
    const tempAuth = getAuth(tempApp);

    // Sign in with current known password
    const userCred = await signInWithEmailAndPassword(tempAuth, normalizedEmail, currentKnownPassword);
    await updatePassword(userCred.user, newPassword);

    await signOut(tempAuth).catch(() => {});
    await deleteApp(tempApp).catch(() => {});

    return { success: true };
  } catch (error: any) {
    if (tempApp) {
      await deleteApp(tempApp).catch(() => {});
    }
    return { success: false, error: error?.message || 'Não foi possível sincronizar no Firebase Auth.' };
  }
}
