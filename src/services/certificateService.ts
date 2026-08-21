import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CertificateDocument } from '../types/backend';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { logAuditEvent } from './auditService';
import { logFirestoreRead, logFirestoreWrite } from '../lib/firestore-logger';

/**
 * Service for Issuing and Validating Graduation Certificates.
 * Collection: certificates/{certificateId}
 */

export async function issueCertificate(params: {
  userId: string;
  partnerId: string;
  courseId: string;
  courseTitle: string;
}): Promise<CertificateDocument> {
  const { userId, partnerId, courseId, courseTitle } = params;
  const certRef = doc(collection(db, 'certificates'));
  const randomSuffix = Math.random().toString(36).substring(2, 9).toUpperCase();
  const certificateNumber = `MZ-WL-${courseId.toUpperCase()}-${randomSuffix}`;

  const certData: CertificateDocument = {
    id: certRef.id,
    userId,
    partnerId,
    courseId,
    courseTitle,
    issuedAt: serverTimestamp() as any,
    certificateNumber,
    status: 'valid',
  };

  try {
    await setDoc(certRef, certData);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `certificates/${certRef.id}`);
  }

  await logAuditEvent({
    actorUid: userId,
    actorRole: 'partner_user',
    partnerId,
    action: 'CERTIFICATE_ISSUED',
    targetType: 'certificate',
    targetId: certRef.id,
    metadata: { courseId, certificateNumber }
  });

  return certData;
}

export async function getUserCertificates(userId: string): Promise<CertificateDocument[]> {
  const path = 'certificates';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    logFirestoreRead('getUserCertificates', path, snapshot.docs.length);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as CertificateDocument));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function getPartnerCertificates(partnerId: string): Promise<CertificateDocument[]> {
  const path = 'certificates';
  try {
    const q = query(collection(db, path), where('partnerId', '==', partnerId));
    const snapshot = await getDocs(q);
    logFirestoreRead('getPartnerCertificates', path, snapshot.docs.length);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as CertificateDocument));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function verifyCertificateByNumber(certificateNumber: string): Promise<CertificateDocument | null> {
  const path = 'certificates';
  try {
    const q = query(collection(db, path), where('certificateNumber', '==', certificateNumber.trim()));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() } as CertificateDocument;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}
