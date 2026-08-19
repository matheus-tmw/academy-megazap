# Security Specification - MegaZap Academy Backend (Firestore & Auth)

## 1. Data Invariants

1. **Identity & Tenant Isolation**: A user belonging to Partner A (`partnerId: 'partner_A'`) can never read, modify, or list users, progress, or certificates belonging to Partner B (`partnerId: 'partner_B'`).
2. **Zero-Trust Role Authority**: Role assignment (`super_admin`, `partner_admin`, `partner_user`) and `partnerId` association can NEVER be self-escalated or modified by regular users or partner admins on their own accounts.
3. **No Credential Storage**: Passwords, plaintext credentials, temporary passwords, and password hashes must NEVER exist in Firestore. Firebase Authentication alone handles credentials and tokens.
4. **Progress & Favorite Integrity**: A user can only write and update their own progress (`/users/{uid}/progress/{lessonId}`) and favorites (`/users/{uid}/favorites/{lessonId}`), strictly enforcing `uid == request.auth.uid`.
5. **Immutable Audit Logs**: Audit logs (`/auditLogs/{logId}`) are append-only by authenticated actors (or privileged admins) and can NEVER be updated or deleted once created.
6. **Temporal & Boundary Enforcement**: All timestamps (`createdAt`, `updatedAt`, `issuedAt`) must strictly match `request.time`. String sizes must be bounded (`.size() <= MAX`) to prevent resource exhaustion / denial of wallet attacks.
7. **Certificate Authenticity**: Certificates (`/certificates/{certId}`) can only be created by system/super_admin or when progress reaches 100% verified status, and can never be modified by partner users.

---

## 2. The "Dirty Dozen" Payloads (Attack Vectors)

| # | Vector Name | Target Collection / Path | Malicious Payload / Action | Expected Result |
|---|---|---|---|---|
| 1 | **Privilege Escalation** | `users/{userUid}` | Partner user updates their own document with `role: "super_admin"`. | `PERMISSION_DENIED` |
| 2 | **Tenant Hijack** | `users/{userUid}` | Partner admin attempts to change `partnerId` to another partner's ID. | `PERMISSION_DENIED` |
| 3 | **Cross-Partner Snoop** | `users/{otherUserUid}` | Partner admin from Partner 1 requests `get` on a user document from Partner 2. | `PERMISSION_DENIED` |
| 4 | **Unverified Progress Write** | `users/{otherUserUid}/progress/{lessonId}` | User A attempts to write progress into User B's subcollection. | `PERMISSION_DENIED` |
| 5 | **Audit Trail Tampering** | `auditLogs/{logId}` | Actor attempts to `delete` or `update` an existing audit log entry. | `PERMISSION_DENIED` |
| 6 | **Password Infiltration** | `users/{userUid}` | Attacker attempts to add `password` or `passwordHash` field in profile payload. | `PERMISSION_DENIED` |
| 7 | **Forged Certificate** | `certificates/{certId}` | Regular partner user attempts to create a certificate document directly. | `PERMISSION_DENIED` |
| 8 | **Timestamp Spoofing** | `users/{userUid}/progress/{lessonId}` | Client sends `updatedAt: "2020-01-01T00:00:00Z"` instead of `request.time`. | `PERMISSION_DENIED` |
| 9 | **Ghost Field Injection** | `partners/{partnerId}` | Partner admin adds rogue field `isFreeUnlimitedLicensing: true` to partner doc. | `PERMISSION_DENIED` |
| 10 | **Catalog Vandalism** | `courses/{courseId}` | Partner user attempts to update course title or lesson video URL. | `PERMISSION_DENIED` |
| 11 | **Denial of Wallet Flooding** | `users/{userUid}/progress/{lessonId}` | Attacker sends a 500KB string in `lessonId` or `moduleId`. | `PERMISSION_DENIED` |
| 12 | **Unauthenticated Access** | Any path | Unauthenticated client attempts `read` or `write`. | `PERMISSION_DENIED` |

---

## 3. Test Runner & Verification Matrix

All 12 vectors above are protected by the hardened rules in `firestore.rules`.
Roles are evaluated through:
- `isSuperAdmin()`: Checks root `/admins/$(request.auth.uid)` or verified super_admin user doc.
- `isPartnerAdmin(pId)`: Verifies caller's `role == 'partner_admin'` and matching `partnerId == pId`.
- `isOwner(userId)`: Verifies `request.auth.uid == userId`.
