import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query, 
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { UserProfile, UserRole, UserStatus } from '../types/backend';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { logAuditEvent } from './auditService';
import { sendPasswordResetEmail } from 'firebase/auth';
import { normalizeAuthIdentifier, formatDisplayIdentifier } from '../utils/userIdentifiers';
import { provisionFirebaseAuthUser, generateTemporaryPassword } from './authAdminHelper';

/**
 * Custom Error thrown when attempting to register or update a user with a duplicate username/login.
 */
export class UserAlreadyExistsError extends Error {
  public readonly username: string;
  constructor(rawUsername: string, customMessage?: string) {
    const formatted = formatDisplayIdentifier(rawUsername);
    super(
      customMessage ||
        `O nome de usuário "${formatted}" já está cadastrado no sistema. Escolha outro nome de usuário para continuar.`
    );
    this.name = 'UserAlreadyExistsError';
    this.username = formatted;
  }
}

/**
 * Service for Managing Users and Partner Relations.
 * Enforces strict multi-tenant authorization rules:
 * - Super Admin: Global access, can create/edit any role, assign partners.
 * - Partner Admin: Scoped strictly to their own partnerId, can only create partner_user in their own company.
 */

/**
 * Helper to deduplicate list of users by email and clean up obsolete seed records
 */
export async function deduplicateUsersList(rawUsers: UserProfile[]): Promise<UserProfile[]> {
  const emailMap = new Map<string, UserProfile>();
  const obsoleteDocIdsToDelete: string[] = [];

  for (const user of rawUsers) {
    const key = (user.email || '').toLowerCase().trim();
    if (!key) {
      if (user.uid) emailMap.set(user.uid, user);
      continue;
    }

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
        // Keep the most complete / recently updated profile
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

  const list = Array.from(emailMap.values());
  // Sort by update / creation date descending
  list.sort((a, b) => {
    const dateA = a.updatedAt || a.createdAt || '';
    const dateB = b.updatedAt || b.createdAt || '';
    if (dateA && dateB) {
      return String(dateB).localeCompare(String(dateA));
    }
    return (a.name || '').localeCompare(b.name || '');
  });

  return list;
}

/**
 * Real-time listener for all users in the platform (used by Super Admin)
 */
export function listenToAllUsers(
  onUpdate: (users: UserProfile[]) => void,
  onError?: (error: any) => void
): () => void {
  const collRef = collection(db, 'users');
  return onSnapshot(collRef, async (snapshot) => {
    try {
      const raw = snapshot.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile));
      const deduplicated = await deduplicateUsersList(raw);
      onUpdate(deduplicated);
    } catch (err) {
      console.warn('Real-time users processing notice:', err);
      if (onError) onError(err);
    }
  }, (error) => {
    console.warn('Real-time users listener error:', error);
    if (onError) onError(error);
  });
}

/**
 * Real-time listener for partner users (used by Partner Admin)
 */
export function listenToPartnerUsers(
  partnerId: string,
  onUpdate: (users: UserProfile[]) => void,
  onError?: (error: any) => void
): () => void {
  const collRef = collection(db, 'users');
  return onSnapshot(collRef, async (snapshot) => {
    try {
      const raw = snapshot.docs
        .map(d => ({ uid: d.id, ...d.data() } as UserProfile))
        .filter(u => u.partnerId === partnerId || (partnerId === 'partner_ultrafox' && (!u.partnerId || u.partnerId === 'partner_ultrafox') && u.role !== 'super_admin'));
      const deduplicated = await deduplicateUsersList(raw);
      onUpdate(deduplicated);
    } catch (err) {
      console.warn('Real-time partner users processing notice:', err);
      if (onError) onError(err);
    }
  }, (error) => {
    console.warn('Real-time partner users listener error:', error);
    if (onError) onError(error);
  });
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const path = 'users';
  try {
    const snapshot = await getDocs(collection(db, path));
    const raw = snapshot.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile));
    return await deduplicateUsersList(raw);
  } catch (error) {
    console.warn('getAllUsers notice:', error);
    return [];
  }
}

export async function getUsersByPartner(partnerId: string): Promise<UserProfile[]> {
  const path = 'users';
  try {
    const snapshot = await getDocs(collection(db, path));
    const raw = snapshot.docs
      .map(d => ({ uid: d.id, ...d.data() } as UserProfile))
      .filter(u => u.partnerId === partnerId || (partnerId === 'partner_ultrafox' && (!u.partnerId || u.partnerId === 'partner_ultrafox') && u.role !== 'super_admin'));
    return await deduplicateUsersList(raw);
  } catch (error) {
    console.warn('getUsersByPartner notice:', error);
    return [];
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
 * Enforces ABSOLUTE UNICITY: Never creates, edits, or overwrites an existing user document when duplicate username is provided.
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

  if (!email || !email.trim()) {
    throw new Error('Informe um nome de usuário ou e-mail válido.');
  }

  // Normalize username or email (trims leading/trailing spaces, converts to lowercase)
  const normalizedEmail = normalizeAuthIdentifier(email);
  const rawDisplayUsername = formatDisplayIdentifier(normalizedEmail);

  // Security Verification: Partner Admin scope enforcement
  if (callerProfile?.role === 'partner_admin') {
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

  // STEP 1: Strict Check in Firestore for existing username index or user document
  const usernameDocRef = doc(db, 'usernames', normalizedEmail);
  const usernameSnap = await getDoc(usernameDocRef).catch(() => null);
  if (usernameSnap && usernameSnap.exists()) {
    throw new UserAlreadyExistsError(
      rawDisplayUsername,
      `O nome de usuário "${rawDisplayUsername}" já está cadastrado no sistema. Escolha outro nome de usuário para continuar.`
    );
  }

  const qEmail = query(collection(db, 'users'), where('email', '==', normalizedEmail));
  const snapEmail = await getDocs(qEmail).catch(() => null);
  if (snapEmail && !snapEmail.empty) {
    throw new UserAlreadyExistsError(
      rawDisplayUsername,
      `O nome de usuário "${rawDisplayUsername}" já está cadastrado no sistema. Escolha outro nome de usuário para continuar.`
    );
  }

  // STEP 2: Provision in Firebase Authentication
  const provisionResult = await provisionFirebaseAuthUser(normalizedEmail, 'Acesso01');

  let userUid: string | null = null;

  if (provisionResult.success && provisionResult.uid) {
    userUid = provisionResult.uid;
  } else if (provisionResult.alreadyExists) {
    // Self-Healing Check: If Auth user exists, verify whether Firestore user document exists.
    // If NO Firestore document exists, recover the UID and proceed with creating the missing profile!
    if (provisionResult.uid) {
      const existingUserDoc = await getDoc(doc(db, 'users', provisionResult.uid)).catch(() => null);
      if (!existingUserDoc || !existingUserDoc.exists()) {
        userUid = provisionResult.uid;
      }
    }

    if (!userUid) {
      throw new UserAlreadyExistsError(
        rawDisplayUsername,
        `O nome de usuário "${rawDisplayUsername}" já está cadastrado no sistema. Escolha outro nome de usuário para continuar.`
      );
    }
  } else {
    throw new Error(provisionResult.error || 'Erro ao provisionar conta de acesso no sistema.');
  }

  const userRef = doc(db, 'users', userUid);

  const newUser: UserProfile = {
    uid: userUid,
    name: name.trim(),
    email: normalizedEmail,
    role: targetRole,
    partnerId: targetRole === 'super_admin' ? null : (targetPartnerId || null),
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
    // Write username lock index FIRST (will be blocked by security rules if doc exists)
    await setDoc(usernameDocRef, {
      uid: userUid,
      email: normalizedEmail,
      createdAt: serverTimestamp(),
      createdBy: callerProfile?.uid || auth.currentUser?.uid || 'admin'
    });

    // Write user profile
    await setDoc(userRef, newUser);
  } catch (error: any) {
    if (
      error?.message?.includes('already-exists') || 
      error?.code === 'already-exists'
    ) {
      throw new UserAlreadyExistsError(
        rawDisplayUsername,
        `O nome de usuário "${rawDisplayUsername}" já está cadastrado no sistema. Escolha outro nome de usuário para continuar.`
      );
    }

    if (error?.message?.includes('Missing or insufficient permissions') || error?.code === 'permission-denied') {
      throw new Error('Não foi possível salvar o perfil do usuário. Verifique se possui permissão de administrador.');
    }

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
    email?: string;
    role?: UserRole;
    partnerId?: string | null;
    status?: UserStatus;
  },
  callerProfile?: UserProfile | null
): Promise<void> {
  const docRef = doc(db, 'users', uid);
  const snap = await getDoc(docRef);
  if (!snap.exists()) {
    throw new Error('Usuário não encontrado.');
  }

  const existingUserData = snap.data() as UserProfile;
  const currentEmail = existingUserData.email;

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

  let newNormalizedEmail = currentEmail;
  if (data.email && data.email.trim()) {
    newNormalizedEmail = normalizeAuthIdentifier(data.email);
    const rawDisplayUsername = formatDisplayIdentifier(newNormalizedEmail);

    // If changing username/email, check if it already belongs to another user!
    if (newNormalizedEmail !== currentEmail) {
      // Check username reservation index
      const newUsernameRef = doc(db, 'usernames', newNormalizedEmail);
      const newUsernameSnap = await getDoc(newUsernameRef).catch(() => null);
      if (newUsernameSnap && newUsernameSnap.exists()) {
        const ownerUid = newUsernameSnap.data()?.uid;
        if (ownerUid && ownerUid !== uid) {
          throw new UserAlreadyExistsError(
            rawDisplayUsername,
            `O nome de usuário "${rawDisplayUsername}" já pertence a outro cadastro. Escolha outro nome de usuário.`
          );
        }
      }

      // Check users collection query
      const qOther = query(collection(db, 'users'), where('email', '==', newNormalizedEmail));
      const snapOther = await getDocs(qOther).catch(() => null);
      if (snapOther && !snapOther.empty) {
        const matchingDoc = snapOther.docs.find(d => d.id !== uid);
        if (matchingDoc) {
          throw new UserAlreadyExistsError(
            rawDisplayUsername,
            `O nome de usuário "${rawDisplayUsername}" já pertence a outro cadastro. Escolha outro nome de usuário.`
          );
        }
      }
    }
  }

  try {
    const updatePayload: Record<string, any> = {
      ...data,
      email: newNormalizedEmail,
      updatedAt: serverTimestamp(),
      updatedBy: callerProfile?.uid || auth.currentUser?.uid || 'admin'
    };

    if (data.role === 'super_admin') {
      updatePayload.partnerId = null;
    }

    await updateDoc(docRef, updatePayload);

    // If email/username changed, update username reservation index
    if (newNormalizedEmail !== currentEmail) {
      deleteDoc(doc(db, 'usernames', currentEmail)).catch(() => {});
      setDoc(doc(db, 'usernames', newNormalizedEmail), {
        uid,
        email: newNormalizedEmail,
        updatedAt: serverTimestamp(),
        updatedBy: callerProfile?.uid || auth.currentUser?.uid || 'admin'
      }).catch(() => {});
    }
  } catch (error: any) {
    if (error instanceof UserAlreadyExistsError) throw error;
    handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
  }

  await logAuditEvent({
    actorUid: callerProfile?.uid || auth.currentUser?.uid || 'admin',
    actorRole: callerProfile?.role || 'super_admin',
    partnerId: data.partnerId || callerProfile?.partnerId || null,
    action: 'USER_UPDATED',
    targetType: 'user',
    targetId: uid,
    metadata: { ...data, email: newNormalizedEmail }
  });
}

export async function deleteUserAdministrative(uid: string, callerProfile?: UserProfile | null): Promise<void> {
  if (callerProfile && callerProfile.role !== 'super_admin') {
    throw new Error('Apenas Super Admin pode excluir usuários permanentemente.');
  }

  const docRef = doc(db, 'users', uid);
  try {
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const email = snap.data()?.email;
      if (email) {
        deleteDoc(doc(db, 'usernames', email)).catch(() => {});
      }
    }
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
