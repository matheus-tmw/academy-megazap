import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { UserProfile, UserRole, UserStatus } from '../types/backend';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { logAuditEvent } from './auditService';
import { sendPasswordResetEmail } from 'firebase/auth';
import { normalizeAuthIdentifier } from '../utils/userIdentifiers';
import { provisionFirebaseAuthUser, generateTemporaryPassword } from './authAdminHelper';

/**
 * Service for Managing Users and Partner Relations.
 * Enforces strict multi-tenant authorization rules:
 * - Super Admin: Global access, can create/edit any role, assign partners.
 * - Partner Admin: Scoped strictly to their own partnerId, can only create partner_user in their own company.
 */

/**
 * Helper to deduplicate list of users by email and clean up obsolete seed records
 */
async function deduplicateUsersList(rawUsers: UserProfile[]): Promise<UserProfile[]> {
  const emailMap = new Map<string, UserProfile>();
  const obsoleteDocIdsToDelete: string[] = [];

  for (const user of rawUsers) {
    const key = (user.email || '').toLowerCase().trim();
    if (!key) continue;

    if (!emailMap.has(key)) {
      emailMap.set(key, user);
    } else {
      const existing = emailMap.get(key)!;
      // If one of them is the hardcoded seed document 'user_matheus_barros', prefer the real one
      if (user.uid === 'user_matheus_barros') {
        obsoleteDocIdsToDelete.push('user_matheus_barros');
      } else if (existing.uid === 'user_matheus_barros') {
        obsoleteDocIdsToDelete.push('user_matheus_barros');
        emailMap.set(key, user);
      } else {
        // Keep the most recently updated profile
        emailMap.set(key, user);
      }
    }
  }

  // Delete obsolete seed duplicates asynchronously in background
  if (obsoleteDocIdsToDelete.length > 0) {
    obsoleteDocIdsToDelete.forEach(docId => {
      deleteDoc(doc(db, 'users', docId)).catch(() => {});
    });
  }

  return Array.from(emailMap.values());
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const path = 'users';
  try {
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const raw = snapshot.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile));
    return await deduplicateUsersList(raw);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function getUsersByPartner(partnerId: string): Promise<UserProfile[]> {
  const path = 'users';
  try {
    const q = query(collection(db, path), where('partnerId', '==', partnerId));
    const snapshot = await getDocs(q);
    const raw = snapshot.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile));
    return await deduplicateUsersList(raw);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function getUser(uid: string): Promise<UserProfile | null> {
  const docRef = doc(db, 'users', uid);
  try {
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { uid: snapshot.id, ...snapshot.data() } as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${uid}`);
  }
}

/**
 * Administrative User Creation Flow
 * Supports standard emails (e.g. 'matheus@empresa.com') OR custom usernames (e.g. 'matheus.parceiro').
 * Validates caller privileges before creating user profile in Firestore.
 */
export async function createAdministrativeUser(params: {
  name: string;
  email: string;
  role: UserRole;
  partnerId: string | null;
  status?: UserStatus;
  callerProfile?: UserProfile | null;
}): Promise<UserProfile> {
  const { name, email, callerProfile, status = 'active' } = params;
  let targetRole = params.role;
  let targetPartnerId = params.partnerId;

  // Normalize username or email
  const normalizedEmail = normalizeAuthIdentifier(email);

  // Security Verification: Partner Admin scope enforcement
  if (callerProfile?.role === 'partner_admin') {
    // Partner Admin can ONLY create partner_user and MUST use their own partnerId
    if (targetRole !== 'partner_user') {
      throw new Error('Permissão negada: Partner Admin só pode criar usuários do nível Partner User.');
    }
    if (!callerProfile.partnerId) {
      throw new Error('Erro de configuração: Administrador do parceiro não possui vínculo com empresa.');
    }
    targetPartnerId = callerProfile.partnerId;
  }

  // Super Admin validation
  if (targetRole === 'super_admin') {
    targetPartnerId = null;
  } else if (!targetPartnerId) {
    throw new Error('Parceiro é obrigatório para usuários Partner Admin e Partner User.');
  }

  // Check if a document with this email already exists in Firestore
  let existingDocId: string | null = null;
  try {
    const qEmail = query(collection(db, 'users'), where('email', '==', normalizedEmail));
    const snapEmail = await getDocs(qEmail);
    if (!snapEmail.empty) {
      existingDocId = snapEmail.docs[0].id;
    }
  } catch (e) {
    console.warn('Check existing email notice:', e);
  }

  // Provision in Firebase Authentication with standard initial password 'Acesso01'
  const provisionResult = await provisionFirebaseAuthUser(normalizedEmail, 'Acesso01');

  // Determine User ID (prefer Auth UID or existing doc ID)
  const userUid = provisionResult.uid || existingDocId || doc(collection(db, 'users')).id;
  const userRef = doc(db, 'users', userUid);

  const newUser: UserProfile = {
    uid: userUid,
    name: name.trim(),
    email: normalizedEmail,
    role: targetRole,
    partnerId: targetRole === 'super_admin' ? null : targetPartnerId,
    status,
    mustChangePassword: true,
    tempPassword: 'Acesso01',
    tempPasswordGeneratedAt: serverTimestamp() as any,
    photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    createdAt: serverTimestamp() as any,
    updatedAt: serverTimestamp() as any,
    lastLoginAt: null,
    createdBy: callerProfile?.uid || auth.currentUser?.uid || 'admin',
    updatedBy: callerProfile?.uid || auth.currentUser?.uid || 'admin',
  };

  try {
    await setDoc(userRef, newUser, { merge: true });
    // Clean up older duplicate document if ID changed
    if (existingDocId && existingDocId !== userUid) {
      deleteDoc(doc(db, 'users', existingDocId)).catch(() => {});
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `users/${userUid}`);
  }

  // Attempt to trigger Firebase Auth password setup email if configured with a public email
  if (normalizedEmail.includes('@') && !normalizedEmail.endsWith('@megazap.local')) {
    try {
      await sendPasswordResetEmail(auth, normalizedEmail);
    } catch (authError) {
      console.log('Password reset invitation notice:', authError);
    }
  }

  // Audit Log
  await logAuditEvent({
    actorUid: callerProfile?.uid || auth.currentUser?.uid || 'admin',
    actorRole: callerProfile?.role || 'super_admin',
    partnerId: targetPartnerId,
    action: 'USER_CREATED',
    targetType: 'user',
    targetId: userUid,
    metadata: { name, email: normalizedEmail, role: targetRole, partnerId: targetPartnerId }
  });

  return newUser;
}

export async function updateUserAdministrative(
  uid: string,
  data: {
    name?: string;
    role?: UserRole;
    partnerId?: string | null;
    status?: UserStatus;
  },
  callerProfile?: UserProfile | null
): Promise<void> {
  const docRef = doc(db, 'users', uid);
  
  // Security Checks
  if (callerProfile?.role === 'partner_admin') {
    // Partner Admin cannot elevate anyone to super_admin or change partnerId
    if (data.role && data.role !== 'partner_user') {
      throw new Error('Permissão negada: Partner Admin não pode alterar papéis para administrador.');
    }
    if (data.partnerId && data.partnerId !== callerProfile.partnerId) {
      throw new Error('Permissão negada: Não é permitido transferir usuários para outro parceiro.');
    }
  }

  try {
    const updatePayload: Record<string, any> = {
      ...data,
      updatedAt: serverTimestamp(),
      updatedBy: callerProfile?.uid || auth.currentUser?.uid || 'admin'
    };

    if (data.role === 'super_admin') {
      updatePayload.partnerId = null;
    }

    const snap = await getDoc(docRef);
    if (snap.exists()) {
      await updateDoc(docRef, updatePayload);
      const userEmail = snap.data()?.email;
      if (userEmail) {
        const qOther = query(collection(db, 'users'), where('email', '==', userEmail));
        const otherSnap = await getDocs(qOther).catch(() => null);
        if (otherSnap) {
          otherSnap.docs.forEach(d => {
            if (d.id !== uid) deleteDoc(d.ref).catch(() => {});
          });
        }
      }
    } else {
      await setDoc(docRef, updatePayload, { merge: true });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
  }

  await logAuditEvent({
    actorUid: callerProfile?.uid || auth.currentUser?.uid || 'admin',
    actorRole: callerProfile?.role || 'super_admin',
    partnerId: data.partnerId || callerProfile?.partnerId || null,
    action: 'USER_UPDATED',
    targetType: 'user',
    targetId: uid,
    metadata: data
  });
}

export async function deleteUserAdministrative(uid: string, callerProfile?: UserProfile | null): Promise<void> {
  if (callerProfile && callerProfile.role !== 'super_admin') {
    throw new Error('Apenas Super Admin pode excluir usuários permanentemente.');
  }

  const docRef = doc(db, 'users', uid);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${uid}`);
  }

  await logAuditEvent({
    actorUid: callerProfile?.uid || auth.currentUser?.uid || 'admin',
    actorRole: callerProfile?.role || 'super_admin',
    partnerId: callerProfile?.partnerId || null,
    action: 'USER_DISABLED',
    targetType: 'user',
    targetId: uid,
    metadata: { deleted: true }
  });
}

export async function setUserRole(uid: string, role: UserRole, callerProfile?: UserProfile | null): Promise<void> {
  if (callerProfile?.role !== 'super_admin') {
    throw new Error('Apenas Super Admin pode alterar nível de acesso.');
  }

  const docRef = doc(db, 'users', uid);
  try {
    await updateDoc(docRef, {
      role,
      partnerId: role === 'super_admin' ? null : undefined,
      updatedAt: serverTimestamp(),
      updatedBy: callerProfile?.uid || auth.currentUser?.uid || 'admin'
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
  }

  await logAuditEvent({
    action: 'ROLE_CHANGED',
    targetType: 'user',
    targetId: uid,
    metadata: { newRole: role }
  });
}

export async function setUserStatus(uid: string, status: UserStatus, callerProfile?: UserProfile | null): Promise<void> {
  const docRef = doc(db, 'users', uid);
  try {
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp(),
      updatedBy: callerProfile?.uid || auth.currentUser?.uid || 'admin'
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
  }

  await logAuditEvent({
    actorUid: callerProfile?.uid || auth.currentUser?.uid || 'admin',
    actorRole: callerProfile?.role || 'super_admin',
    partnerId: callerProfile?.partnerId || null,
    action: status === 'blocked' || status === 'inactive' ? 'USER_DISABLED' : 'USER_ENABLED',
    targetType: 'user',
    targetId: uid,
    metadata: { status }
  });
}

/**
 * Resets user password by generating a random temporary password (max 10 characters),
 * provisioning it in Firebase Auth, and forcing a password change on next login.
 */
export async function generateAndResetUserTemporaryPassword(
  uid: string, 
  email: string, 
  callerProfile?: UserProfile | null
): Promise<string> {
  const normalized = normalizeAuthIdentifier(email);
  const newTempPassword = generateTemporaryPassword();

  // Try to provision / sync in Auth with the new temporary password
  await provisionFirebaseAuthUser(normalized, newTempPassword);

  const docRef = doc(db, 'users', uid);
  try {
    await updateDoc(docRef, {
      mustChangePassword: true,
      tempPassword: newTempPassword,
      tempPasswordGeneratedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      updatedBy: callerProfile?.uid || auth.currentUser?.uid || 'admin'
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
  }

  await logAuditEvent({
    actorUid: callerProfile?.uid || auth.currentUser?.uid || 'admin',
    actorRole: callerProfile?.role || 'super_admin',
    partnerId: callerProfile?.partnerId || null,
    action: 'PASSWORD_RESET_REQUESTED',
    targetType: 'user',
    targetId: uid,
    metadata: { email: normalized, temporaryPasswordGenerated: true }
  });

  return newTempPassword;
}

export async function requestUserPasswordReset(email: string, targetUid?: string): Promise<string> {
  if (targetUid) {
    return generateAndResetUserTemporaryPassword(targetUid, email);
  }
  const tempPass = generateTemporaryPassword();
  const normalized = normalizeAuthIdentifier(email);
  await provisionFirebaseAuthUser(normalized, tempPass);
  return tempPass;
}
