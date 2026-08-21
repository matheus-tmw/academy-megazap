import { collection, addDoc, serverTimestamp, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { AuditLogRecord, AuditAction } from '../types/backend';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { logFirestoreRead, logFirestoreWrite } from '../lib/firestore-logger';

export async function logAuditEvent(params: {
  actorUid?: string;
  actorRole?: 'super_admin' | 'partner_admin' | 'partner_user' | 'system';
  partnerId?: string | null;
  action: AuditAction;
  targetType: 'user' | 'partner' | 'certificate' | 'course' | 'progress' | 'category' | 'module' | 'lesson' | 'system';
  targetId: string;
  metadata?: Record<string, any>;
}): Promise<void> {
  const currentUid = auth.currentUser?.uid || params.actorUid || 'anonymous';
  const role = params.actorRole || 'partner_user';
  
  const logData: AuditLogRecord = {
    actorUid: currentUid,
    actorRole: role,
    partnerId: params.partnerId || null,
    action: params.action,
    targetType: params.targetType,
    targetId: params.targetId,
    metadata: params.metadata || {},
    createdAt: serverTimestamp() as any,
  };

  try {
    logFirestoreWrite('logAuditEvent', 'auditLogs', 'addDoc');
    await addDoc(collection(db, 'auditLogs'), logData);
  } catch (error) {
    // Non-blocking log catch
    console.warn('Audit log write error:', error);
  }
}

export async function getAuditLogsForPartner(partnerId: string, maxResults = 50): Promise<AuditLogRecord[]> {
  const path = 'auditLogs';
  try {
    const q = query(
      collection(db, path),
      where('partnerId', '==', partnerId),
      orderBy('createdAt', 'desc'),
      limit(maxResults)
    );
    const snapshot = await getDocs(q);
    logFirestoreRead('getAuditLogsForPartner', path, snapshot.docs.length);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AuditLogRecord));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function getAllAuditLogs(maxResults = 100): Promise<AuditLogRecord[]> {
  const path = 'auditLogs';
  try {
    const q = query(
      collection(db, path),
      orderBy('createdAt', 'desc'),
      limit(maxResults)
    );
    const snapshot = await getDocs(q);
    logFirestoreRead('getAllAuditLogs', path, snapshot.docs.length);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AuditLogRecord));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}
