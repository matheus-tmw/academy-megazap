export type NavigationTab = 
  | 'dashboard'
  | 'meus-treinamentos'
  | 'catalogo'
  | 'trilha-detalhe'
  | 'aula-player'
  | 'meu-progresso'
  | 'favoritos'
  | 'certificados'
  | 'central-ajuda'
  | 'admin-dashboard'
  | 'admin-partners'
  | 'admin-users'
  | 'admin-progress'
  | 'admin-cms'
  | 'admin-content'
  | 'admin-logs'
  | 'partner-dashboard'
  | 'partner-team'
  | 'partner-progress'
  | 'meu-perfil'
  | 'login';

export type ThemeMode = 'light' | 'dark' | 'system';

export type ContentStatus = 'published' | 'draft' | 'archived';

export type TrackCategory = 
  | 'Primeiros Passos'
  | 'Atendimento'
  | 'Automação'
  | 'Marketing'
  | 'Cadastros'
  | 'JADI'
  | 'Administração'
  | string;

export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  order: number;
  status: ContentStatus;
  tracksCount?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export type LessonLevel = 'Iniciante' | 'Intermediário' | 'Avançado';

export type PreviewMockupType = 'chat' | 'flow' | 'campaign' | 'contacts' | 'jadi' | 'settings' | 'general';

export interface LessonResource {
  id: string;
  title: string;
  type: 'pdf' | 'json' | 'link' | 'doc';
  size?: string;
  url?: string;
}

export interface Lesson {
  id: string;
  trackId: string;
  moduleId: string;
  moduleTitle: string;
  title: string;
  slug: string;
  description: string;
  duration: string; // e.g. "08:42"
  durationSeconds: number;
  videoUrl?: string; // URL do vídeo hospedado (ex: .mp4, YouTube, Vimeo, S3, Bunny, servidor próprio)
  level: LessonLevel;
  category: TrackCategory;
  thumbnail: string;
  previewMockupType?: 'chat' | 'flow' | 'campaign' | 'contacts' | 'jadi' | 'settings' | 'general';
  learningObjectives: string[];
  megaZapTip?: string;
  aboutText: string;
  resources?: LessonResource[];
  tags?: string[];
  order?: number;
  status?: ContentStatus;
  isLocked?: boolean;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface Module {
  id: string;
  trackId: string;
  orderNumber: number;
  order?: number;
  title: string;
  description: string;
  status?: ContentStatus;
  lessons: Lesson[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface Track {
  id: string;
  title: string;
  slug: string;
  categoryId?: string;
  category: TrackCategory;
  description: string;
  shortDescription: string;
  iconName: string;
  level: LessonLevel;
  badgeColor: string; // e.g. 'blue' | 'green' | 'purple' | 'amber' | 'slate'
  estimatedHours: string;
  modules: Module[];
  certificateAvailable: boolean;
  certificateName: string;
  order?: number;
  status?: ContentStatus;
  tags?: string[];
  featured?: boolean;
  recommended?: boolean;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface UserNote {
  lessonId: string;
  text: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timeAgo: string;
  read: boolean;
  type: 'course' | 'certificate' | 'update' | 'tip';
  actionTab?: NavigationTab;
  actionTrackId?: string;
  actionLessonId?: string;
}

export interface Certificate {
  id: string;
  trackId: string;
  trackTitle: string;
  title: string;
  issueDate: string;
  verificationCode: string;
  hoursCount: string;
  studentName: string;
  partnerCompany: string;
}
