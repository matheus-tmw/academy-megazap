import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Partner, PartnerStatus } from '../types/backend';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { logAuditEvent } from './auditService';

/**
 * Service for Managing White Label Partners.
 * Prepared for 100+ partners with unique IDs.
 */

export async function createPartner(params: {
  name: string;
  displayName: string;
  code: string;
  status?: PartnerStatus;
}): Promise<Partner> {
  const { name, displayName, code, status = 'active' } = params;
  const currentUid = auth.currentUser?.uid || 'super_admin';
  
  // Create partner with unique document ID
  const partnerRef = doc(collection(db, 'partners'));
  const partnerData: Partner = {
    id: partnerRef.id,
    name: name.trim(),
    displayName: displayName.trim(),
    code: code.toUpperCase().trim().replace(/[^A-Z0-9_-]/g, ''),
    status,
    createdAt: serverTimestamp() as any,
    updatedAt: serverTimestamp() as any,
    createdBy: currentUid,
  };

  try {
    await setDoc(partnerRef, partnerData);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `partners/${partnerRef.id}`);
  }

  await logAuditEvent({
    actorUid: currentUid,
    actorRole: 'super_admin',
    partnerId: partnerRef.id,
    action: 'PARTNER_CREATED',
    targetType: 'partner',
    targetId: partnerRef.id,
    metadata: { name, displayName, code: partnerData.code }
  });

  return partnerData;
}

export async function getPartner(partnerId: string): Promise<Partner | null> {
  const docRef = doc(db, 'partners', partnerId);
  try {
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as Partner;
    }
    return null;
  } catch (error) {
    if (!auth.currentUser) {
      console.info('getPartner unauthenticated notice (using fallback)');
      return null;
    }
    handleFirestoreError(error, OperationType.GET, `partners/${partnerId}`);
    return null;
  }
}

export async function getPartnerByCode(code: string): Promise<Partner | null> {
  const path = 'partners';
  try {
    const q = query(collection(db, path), where('code', '==', code.toUpperCase().trim()));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() } as Partner;
    }
    return null;
  } catch (error) {
    if (!auth.currentUser) {
      console.info('getPartnerByCode unauthenticated notice');
      return null;
    }
    handleFirestoreError(error, OperationType.LIST, path);
    return null;
  }
}

export async function listPartners(): Promise<Partner[]> {
  const path = 'partners';
  try {
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Partner));
  } catch (error) {
    if (!auth.currentUser) {
      console.info('listPartners unauthenticated notice (waiting for auth)');
      return [];
    }
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function updatePartner(partnerId: string, data: Partial<Pick<Partner, 'name' | 'displayName' | 'code' | 'status'>>): Promise<void> {
  const docRef = doc(db, 'partners', partnerId);
  try {
    await updateDoc(docRef, {
      ...data,
      code: data.code ? data.code.toUpperCase().trim() : undefined,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `partners/${partnerId}`);
  }

  await logAuditEvent({
    action: 'PARTNER_UPDATED',
    targetType: 'partner',
    targetId: partnerId,
    metadata: data
  });
}

export async function updatePartnerStatus(partnerId: string, status: PartnerStatus): Promise<void> {
  const docRef = doc(db, 'partners', partnerId);
  try {
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `partners/${partnerId}`);
  }

  await logAuditEvent({
    action: 'PARTNER_UPDATED',
    targetType: 'partner',
    targetId: partnerId,
    metadata: { status }
  });
}
