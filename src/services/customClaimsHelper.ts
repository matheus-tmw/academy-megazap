import { CustomClaims, UserRole } from '../types/backend';

/**
 * Custom Claims Helper and Cloud Function Reference Architecture.
 * 
 * Firebase Custom Claims allow attaching trusted RBAC metadata directly to the user's JWT ID token.
 * 
 * Payload structure:
 * {
 *   role: 'super_admin' | 'partner_admin' | 'partner_user',
 *   partnerId: string | null
 * }
 * 
 * In Cloud Functions (Node.js Admin SDK), claims are set via:
 * 
 * ```typescript
 * import * as admin from 'firebase-admin';
 * 
 * export async function setUserCustomClaims(uid: string, claims: { role: UserRole; partnerId: string | null }) {
 *   await admin.auth().setCustomUserClaims(uid, {
 *     role: claims.role,
 *     partnerId: claims.partnerId
 *   });
 * }
 * ```
 */

export function parseCustomClaims(idTokenResultClaims: Record<string, any>): CustomClaims {
  const role: UserRole = (['super_admin', 'partner_admin', 'partner_user'].includes(idTokenResultClaims.role))
    ? idTokenResultClaims.role
    : 'partner_user';

  const partnerId = typeof idTokenResultClaims.partnerId === 'string' 
    ? idTokenResultClaims.partnerId 
    : null;

  return {
    role,
    partnerId
  };
}
