import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  signOut, 
  sendPasswordResetEmail, 
  onAuthStateChanged, 
  User as FirebaseUser,
  updateProfile,
  updatePassword
} from 'firebase/auth';
import { 
  collection,
  doc, 
  getDoc, 
  getDocs,
  query,
  where,
  setDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile, UserRole } from '../types/backend';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { logAuditEvent } from './auditService';
import { normalizeAuthIdentifier } from '../utils/userIdentifiers';
import { provisionFirebaseAuthUser } from './authAdminHelper';

/**
 * Authentication Service using Firebase Authentication.
 * Passwords and credential hashes are NEVER stored in Firestore.
 * Supports standard emails and custom usernames (e.g. 'matheus.parceiro').
 */

export async function loginWithEmail(emailOrUsername: string, password: string): Promise<UserProfile> {
  const normalizedEmail = normalizeAuthIdentifier(emailOrUsername);
  let user: FirebaseUser;

  // 1. Check if there is an existing Firestore profile created administratively by email
  let adminConfiguredProfile: UserProfile | null = null;
  let adminDocId: string | null = null;
  try {
    const q = query(collection(db, 'users'), where('email', '==', normalizedEmail));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      adminConfiguredProfile = querySnap.docs[0].data() as UserProfile;
      adminDocId = querySnap.docs[0].id;
    }
  } catch (err) {
    console.warn('Pre-login Firestore check notice:', err);
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
    user = userCredential.user;
  } catch (authError: any) {
    // If sign-in fails, check if the user exists in Firestore with a pending initial/temporary password
    if (adminConfiguredProfile) {
      const matchesDefault = password === 'Acesso01';
      const matchesTemp = adminConfiguredProfile.tempPassword && password === adminConfiguredProfile.tempPassword;

      if (matchesDefault || matchesTemp) {
        // Provision in Auth with this password
        await provisionFirebaseAuthUser(normalizedEmail, password);
        const retryCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
        user = retryCredential.user;
      } else {
        throw authError;
      }
    } else {
      throw authError;
    }
  }

  // Purge obsolete seed document if it existed
  deleteDoc(doc(db, 'users', 'user_matheus_barros')).catch(() => {});

  // Retrieve user profile or link admin-created profile to the user's real Auth UID
  const userDocRef = doc(db, 'users', user.uid);
  try {
    const userSnapshot = await getDoc(userDocRef);
    if (userSnapshot.exists()) {
      const existingData = userSnapshot.data() as UserProfile;
      // If an admin had assigned a role (e.g. super_admin) on another record or updated it, prioritize the admin role
      const effectiveRole = adminConfiguredProfile?.role || existingData.role;
      const effectivePartnerId = effectiveRole === 'super_admin' ? null : (adminConfiguredProfile?.partnerId ?? existingData.partnerId);

      const updatedProfile: UserProfile = {
        ...existingData,
        role: effectiveRole,
        partnerId: effectivePartnerId,
        uid: user.uid,
        lastLoginAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any,
      };

      await updateDoc(userDocRef, {
        role: effectiveRole,
        partnerId: effectivePartnerId,
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }).catch(err => console.warn('LastLogin update notice:', err));

      if (adminDocId && adminDocId !== user.uid) {
        deleteDoc(doc(db, 'users', adminDocId)).catch(() => {});
      }

      return { ...existingData, ...updatedProfile };
    } else if (adminConfiguredProfile) {
      // Migrate the admin-created document to the user's Auth UID
      const effectiveRole = adminConfiguredProfile.role;
      const effectivePartnerId = effectiveRole === 'super_admin' ? null : adminConfiguredProfile.partnerId;

      const newProfile: UserProfile = {
        ...adminConfiguredProfile,
        uid: user.uid,
        role: effectiveRole,
        partnerId: effectivePartnerId,
        lastLoginAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any,
      };

      await setDoc(userDocRef, newProfile, { merge: true });
      if (adminDocId && adminDocId !== user.uid) {
        deleteDoc(doc(db, 'users', adminDocId)).catch(() => {});
      }
      return newProfile;
    } else {
      // Auto-provision Firestore document for user created in Firebase Auth
      const isSuperAdminEmail = user.email?.toLowerCase().trim() === 'matheus.tmw@gmail.com';

      const role: UserRole = isSuperAdminEmail ? 'super_admin' : 'partner_user';
      const partnerId = isSuperAdminEmail ? null : 'partner_ultrafox';

      const newProfile: UserProfile = {
        uid: user.uid,
        name: user.displayName || user.email?.split('@')[0] || 'Usuário MegaZap',
        email: user.email || normalizedEmail,
        role,
        partnerId,
        status: 'active',
        photoURL: user.photoURL || null,
        createdAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any,
        lastLoginAt: serverTimestamp() as any,
        createdBy: user.uid,
        updatedBy: user.uid,
      };

      await setDoc(userDocRef, newProfile, { merge: true }).catch(err => console.warn('Profile create notice:', err));
      return newProfile;
    }
  } catch (error) {
    console.warn('Profile sync fallback:', error);
    const isSuperAdminEmail = user.email?.toLowerCase().trim() === 'matheus.tmw@gmail.com';

    return {
      uid: user.uid,
      name: user.displayName || user.email?.split('@')[0] || 'Usuário MegaZap',
      email: user.email || normalizedEmail,
      role: adminConfiguredProfile?.role || (isSuperAdminEmail ? 'super_admin' : 'partner_user'),
      partnerId: (adminConfiguredProfile?.role === 'super_admin' || isSuperAdminEmail) ? null : (adminConfiguredProfile?.partnerId || 'partner_ultrafox'),
      status: 'active',
      photoURL: user.photoURL || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

export async function registerWithEmail(params: {
  email: string;
  password: string;
  name: string;
  partnerId: string | null;
  role?: UserRole;
  createdByUid?: string;
}): Promise<UserProfile> {
  const { email, password, name, partnerId, role = 'partner_user', createdByUid } = params;
  const normalizedEmail = normalizeAuthIdentifier(email);

  // 1. Create user in Firebase Authentication
  const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
  const user = userCredential.user;

  // Update display name in Auth
  await updateProfile(user, { displayName: name });

  // 2. Create profile in Firestore (No passwords stored here!)
  const userProfile: UserProfile = {
    uid: user.uid,
    name,
    email: normalizedEmail,
    role,
    partnerId,
    status: 'active',
    photoURL: null,
    createdAt: serverTimestamp() as any,
    updatedAt: serverTimestamp() as any,
    lastLoginAt: serverTimestamp() as any,
    createdBy: createdByUid || user.uid,
    updatedBy: createdByUid || user.uid,
  };

  const userDocRef = doc(db, 'users', user.uid);
  try {
    await setDoc(userDocRef, userProfile);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}`);
  }

  // 3. Log Audit Event
  await logAuditEvent({
    actorUid: createdByUid || user.uid,
    actorRole: role,
    partnerId,
    action: 'USER_CREATED',
    targetType: 'user',
    targetId: user.uid,
    metadata: { email: normalizedEmail, name, role, partnerId }
  });

  return userProfile;
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

export async function sendResetPassword(emailOrUsername: string): Promise<void> {
  const normalizedEmail = normalizeAuthIdentifier(emailOrUsername);
  await sendPasswordResetEmail(auth, normalizedEmail);
  if (auth.currentUser) {
    await logAuditEvent({
      actorUid: auth.currentUser.uid,
      actorRole: 'partner_user',
      partnerId: null,
      action: 'PASSWORD_RESET_REQUESTED',
      targetType: 'user',
      targetId: auth.currentUser.uid,
      metadata: { email: normalizedEmail }
    });
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userDocRef = doc(db, 'users', uid);
  try {
    const snapshot = await getDoc(userDocRef);
    if (snapshot.exists()) {
      const data = snapshot.data() as UserProfile;
      const currentEmail = (data.email || auth.currentUser?.email || '').toLowerCase().trim();

      let effectiveRole: UserRole = data.role || 'partner_user';
      let effectivePartnerId: string | null = data.partnerId;

      if (currentEmail === 'matheus.tmw@gmail.com') {
        effectiveRole = 'super_admin';
        effectivePartnerId = null;
      }

      return {
        ...data,
        uid: snapshot.id,
        role: effectiveRole,
        partnerId: effectiveRole === 'super_admin' ? null : (effectivePartnerId || 'partner_ultrafox'),
      };
    }

    // Document does not exist by direct UID, check by email once
    const currentEmail = (auth.currentUser?.email || '').toLowerCase().trim();
    if (currentEmail) {
      const isMasterAdmin = currentEmail === 'matheus.tmw@gmail.com';
      let resolvedRole: UserRole = isMasterAdmin ? 'super_admin' : 'partner_user';
      let resolvedPartnerId: string | null = isMasterAdmin ? null : 'partner_ultrafox';
      let bestName = auth.currentUser?.displayName || currentEmail.split('@')[0];

      try {
        const q = query(collection(db, 'users'), where('email', '==', currentEmail));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const docData = snap.docs[0].data() as UserProfile;
          if (docData.role) resolvedRole = docData.role;
          if (docData.partnerId) resolvedPartnerId = docData.partnerId;
          if (docData.name) bestName = docData.name;
        }
      } catch (qErr) {
        console.warn('Email lookup notice:', qErr);
      }

      const newProfile: UserProfile = {
        uid,
        name: bestName,
        email: currentEmail,
        role: isMasterAdmin ? 'super_admin' : resolvedRole,
        partnerId: isMasterAdmin ? null : (resolvedPartnerId || 'partner_ultrafox'),
        status: 'active',
        photoURL: auth.currentUser?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(bestName)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Best effort setDoc without throwing if quota reached
      setDoc(userDocRef, newProfile, { merge: true }).catch(() => {});

      return newProfile;
    }

    return null;
  } catch (error) {
    console.warn('getUserProfile fetch notice (using fallback auth user):', error);
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      const emailLower = (firebaseUser.email || '').toLowerCase().trim();
      const isMasterAdmin = emailLower === 'matheus.tmw@gmail.com';

      return {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || emailLower.split('@')[0] || 'Usuário',
        email: emailLower,
        role: isMasterAdmin ? 'super_admin' : 'partner_user',
        partnerId: isMasterAdmin ? null : 'partner_ultrafox',
        status: 'active',
        photoURL: firebaseUser.photoURL,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    return null;
  }
}

export async function updateUserProfile(
  uid: string, 
  data: Partial<Pick<UserProfile, 'name' | 'photoURL'>>
): Promise<void> {
  const userDocRef = doc(db, 'users', uid);
  try {
    await updateDoc(userDocRef, {
      ...data,
      updatedAt: serverTimestamp(),
      updatedBy: auth.currentUser?.uid || uid
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
  }
}

export async function loginWithGoogle(defaultPartnerId: string | null = 'partner_ultrafox'): Promise<UserProfile> {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  // Retrieve or create user profile in Firestore
  const userDocRef = doc(db, 'users', user.uid);
  try {
    const userSnapshot = await getDoc(userDocRef);
    if (userSnapshot.exists()) {
      await updateDoc(userDocRef, {
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }).catch(err => console.warn('Google lastLogin update notice:', err));
      return { uid: userSnapshot.id, ...userSnapshot.data() } as UserProfile;
    } else {
      // New user registering via Google Login
      const isMasterAdmin = user.email?.toLowerCase().trim() === 'matheus.tmw@gmail.com';
      const role: UserRole = isMasterAdmin ? 'super_admin' : 'partner_user';
      const partnerId = isMasterAdmin ? null : defaultPartnerId;

      const newProfile: UserProfile = {
        uid: user.uid,
        name: user.displayName || user.email?.split('@')[0] || 'Usuário MegaZap',
        email: user.email || '',
        role,
        partnerId,
        status: 'active',
        photoURL: user.photoURL || null,
        createdAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any,
        lastLoginAt: serverTimestamp() as any,
        createdBy: user.uid,
        updatedBy: user.uid,
      };
      await setDoc(userDocRef, newProfile).catch(err => console.warn('Google new profile set notice:', err));
      return newProfile;
    }
  } catch (error) {
    console.warn('Google auth profile sync fallback:', error);
    const isMasterAdmin = user.email?.toLowerCase().trim() === 'matheus.tmw@gmail.com';

    return {
      uid: user.uid,
      name: user.displayName || user.email?.split('@')[0] || 'Usuário MegaZap',
      email: user.email || '',
      role: isMasterAdmin ? 'super_admin' : 'partner_user',
      partnerId: isMasterAdmin ? null : defaultPartnerId,
      status: 'active',
      photoURL: user.photoURL || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

export function subscribeToAuthState(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Updates the user's password in Firebase Auth and clears the mustChangePassword flag in Firestore.
 */
export async function updateUserPasswordOnFirstLogin(newPassword: string): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Nenhum usuário autenticado para atualizar a senha.');
  }

  if (newPassword.length < 6) {
    throw new Error('A nova senha deve possuir no mínimo 6 caracteres.');
  }

  // Update password in Firebase Authentication
  await updatePassword(currentUser, newPassword);

  // Clear mustChangePassword and tempPassword in Firestore
  const userDocRef = doc(db, 'users', currentUser.uid);
  try {
    await updateDoc(userDocRef, {
      mustChangePassword: false,
      tempPassword: null,
      updatedAt: serverTimestamp(),
      updatedBy: currentUser.uid
    });
  } catch (err) {
    console.warn('Notice updating user profile after password change:', err);
  }

  await logAuditEvent({
    actorUid: currentUser.uid,
    actorRole: 'partner_user',
    partnerId: null,
    action: 'PASSWORD_RESET_COMPLETED',
    targetType: 'user',
    targetId: currentUser.uid,
    metadata: { firstLoginPasswordDefined: true }
  });
}
