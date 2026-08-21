import { Timestamp } from 'firebase/firestore';

export type UserRole = 'super_admin' | 'partner_admin' | 'partner_user';
export type UserStatus = 'active' | 'inactive' | 'blocked';
export type PartnerStatus = 'active' | 'inactive' | 'suspended';
export type CourseStatus = 'published' | 'draft' | 'archived';
export type CertificateStatus = 'valid' | 'revoked';

export interface Partner {
  id: string;
  name: string;
  displayName: string;
  code: string; // e.g. "ULTRAFOX"
  status: PartnerStatus;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
  createdBy: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  partnerId: string | null; // null for MegaZap HQ super_admins
  status: UserStatus;
  photoURL?: string | null;
  mustChangePassword?: boolean;
  tempPassword?: string | null;
  tempPasswordGeneratedAt?: Timestamp | string | null;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
  lastLoginAt?: Timestamp | string | null;
  progressPercentage?: number;
  completedLessonsCount?: number;
  createdBy?: string;
  updatedBy?: string;
}

export interface ProgressRecord {
  lessonId: string;
  courseId: string;
  moduleId: string;
  completed: boolean;
  progressPercent: number;
  startedAt: Timestamp | string;
  completedAt?: Timestamp | string | null;
  lastWatchedAt: Timestamp | string;
  updatedAt: Timestamp | string;
}

export interface FavoriteRecord {
  lessonId: string;
  createdAt: Timestamp | string;
}

export interface LessonDocument {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  duration: string;
  durationSeconds: number;
  order: number;
  status: 'published' | 'draft';
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
}

export interface ModuleDocument {
  id: string;
  title: string;
  description: string;
  order: number;
}

export interface CourseDocument {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  status: CourseStatus;
  order: number;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
}

export interface CertificateDocument {
  id: string;
  userId: string;
  partnerId: string;
  courseId: string;
  courseTitle: string;
  issuedAt: Timestamp | string;
  certificateNumber: string;
  status: CertificateStatus;
}

export type AuditAction = 
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_DISABLED'
  | 'USER_ENABLED'
  | 'PASSWORD_RESET_REQUESTED'
  | 'PASSWORD_RESET_COMPLETED'
  | 'PARTNER_CREATED'
  | 'PARTNER_UPDATED'
  | 'ROLE_CHANGED'
  | 'CERTIFICATE_ISSUED'
  | 'COURSE_CREATED'
  | 'COURSE_UPDATED'
  | 'COURSE_ARCHIVED'
  | 'COURSE_DELETED'
  | 'CATEGORY_CREATED'
  | 'CATEGORY_UPDATED'
  | 'CATEGORY_DELETED'
  | 'MODULE_CREATED'
  | 'MODULE_UPDATED'
  | 'MODULE_DELETED'
  | 'LESSON_CREATED'
  | 'LESSON_UPDATED'
  | 'LESSON_DELETED'
  | 'CONTENT_REORDERED'
  | 'SYSTEM_INITIALIZED';

export interface AuditLogRecord {
  id?: string;
  actorUid: string;
  actorRole: UserRole | 'system';
  partnerId?: string | null;
  action: AuditAction;
  targetType: 'user' | 'partner' | 'certificate' | 'course' | 'progress' | 'category' | 'module' | 'lesson' | 'system';
  targetId: string;
  metadata: Record<string, any>;
  createdAt: Timestamp | string;
}

export interface CustomClaims {
  role: UserRole;
  partnerId: string | null;
}
