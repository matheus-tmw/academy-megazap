import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { 
  NavigationTab, 
  Track, 
  Lesson, 
  UserNote, 
  NotificationItem, 
  Certificate,
  ThemeMode,
  CategoryItem
} from '../types';
import { UserProfile, UserRole, Partner } from '../types/backend';
import { 
  TRACKS_DATA, 
  ALL_LESSONS, 
  INITIAL_COMPLETED_LESSON_IDS, 
  INITIAL_LESSON_PROGRESS, 
  INITIAL_FAVORITE_LESSON_IDS 
} from '../data/coursesData';
import { 
  fetchCategoriesFromDb, 
  fetchFullTracksFromDb, 
  DEFAULT_CATEGORIES 
} from '../services/cmsService';
import confetti from 'canvas-confetti';
import { auth } from '../lib/firebase';
import { seedInitialDatabase } from '../services/seedDatabase';
import { saveLessonProgress, listenToUserProgress } from '../services/progressService';
import { addFavorite, removeFavorite, listenToUserFavorites } from '../services/favoritesService';
import { 
  loginWithEmail, 
  registerWithEmail,
  loginWithGoogle, 
  logout, 
  sendResetPassword, 
  getUserProfile, 
  updateUserProfile as updateProfileService,
  subscribeToAuthState 
} from '../services/authService';
import { getPartner, listPartners } from '../services/partnerService';

export interface AcademyContextType {
  // Navigation
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  selectedTrackId: string;
  setSelectedTrackId: (id: string) => void;
  selectedLessonId: string;
  setSelectedLessonId: (id: string) => void;
  
  // Navigation helpers
  navigateTo: (tab: NavigationTab) => void;
  navigateToTrack: (trackId: string) => void;
  navigateToLesson: (lessonId: string, trackId?: string) => void;
  goToNextLesson: () => void;
  goToPrevLesson: () => void;
  
  // Data
  tracks: Track[];
  rawTracks: Track[];
  categories: CategoryItem[];
  allLessons: Lesson[];
  contentLoading: boolean;
  refreshContent: () => Promise<void>;
  currentTrack: Track | undefined;
  currentLesson: Lesson | undefined;
  nextLesson: Lesson | undefined;
  prevLesson: Lesson | undefined;
  
  // Progress & State
  completedLessons: string[];
  lessonProgress: Record<string, number>;
  favoriteLessons: string[];
  userNotes: Record<string, string>;
  
  // Actions
  toggleLessonCompleted: (lessonId: string) => void;
  markLessonCompleted: (lessonId: string) => void;
  updateLessonProgress: (lessonId: string, progress: number) => void;
  toggleFavorite: (lessonId: string) => void;
  isFavorite: (lessonId: string) => boolean;
  isCompleted: (lessonId: string) => boolean;
  getLessonProgress: (lessonId: string) => number;
  saveUserNote: (lessonId: string, text: string) => void;
  
  // Computed Metrics
  overallProgressPercentage: number;
  totalCompletedLessonsCount: number;
  totalLessonsCount: number;
  startedTracksCount: number;
  totalTrainingHoursFormatted: string;
  earnedCertificatesCount: number;
  getTrackProgress: (trackId: string) => {
    percentage: number;
    completedCount: number;
    totalCount: number;
    isCompleted: boolean;
    hasStarted: boolean;
  };
  
  // Search & Modals
  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Certificates
  activeCertificate: Certificate | null;
  setActiveCertificate: (cert: Certificate | null) => void;
  isCertificateModalOpen: boolean;
  setIsCertificateModalOpen: (open: boolean) => void;
  openCertificate: (trackId: string) => void;
  
  // Notifications
  notifications: NotificationItem[];
  unreadNotificationsCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  
  // Theme & Dark Mode
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  isDarkMode: boolean;

  // Authentication & RBAC (ETAPA 2)
  currentUser: UserProfile | null;
  currentPartner: Partner | null;
  allPartners: Partner[];
  authLoading: boolean;
  authError: string | null;
  activeRole: UserRole;
  isSuperAdmin: boolean;
  isPartnerAdmin: boolean;
  isPartnerUser: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<boolean>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<boolean>;
  signInWithGoogleAuth: () => Promise<boolean>;
  signOutUser: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  switchDemoRole: (role: UserRole) => void;
  updateCurrentUserProfile: (name: string, photoURL?: string) => Promise<void>;

  // Backwards compatibility userProfile for visual components
  userProfile: {
    name: string;
    role: string;
    company: string;
    avatar: string;
    email: string;
    status: string;
    partnerId: string | null;
  };
}

const AcademyContext = createContext<AcademyContextType | undefined>(undefined);

const STORAGE_KEYS = {
  THEME: 'megazap_academy_theme',
  COMPLETED: 'megazap_academy_completed_lessons',
  PROGRESS: 'megazap_academy_lesson_progress',
  FAVORITES: 'megazap_academy_favorites',
  NOTES: 'megazap_academy_notes',
  NOTIFICATIONS: 'megazap_academy_notifications',
  DEMO_ROLE: 'megazap_academy_demo_role',
};

// Preset demo profiles for effortless persona switching
const DEMO_PROFILES: Record<UserRole, UserProfile> = {
  super_admin: {
    uid: 'user_matheus_barros',
    name: 'Matheus Barros',
    email: 'matheus.tmw@gmail.com',
    role: 'super_admin',
    partnerId: null,
    status: 'active',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  partner_admin: {
    uid: 'user_carlos_mendes',
    name: 'Carlos Mendes',
    email: 'carlos@ultrafox.com.br',
    role: 'partner_admin',
    partnerId: 'partner_ultrafox',
    status: 'active',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  partner_user: {
    uid: 'user_vinicius_rocha',
    name: 'Vinícius Rocha',
    email: 'vinicius@ultrafox.com.br',
    role: 'partner_user',
    partnerId: 'partner_ultrafox',
    status: 'active',
    photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
};

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Novo Módulo Disponível em JADI',
    description: 'Aprenda a conectar assistentes de IA diretamente com transbordo humano inteligente.',
    timeAgo: 'Há 2 horas',
    read: false,
    type: 'update',
    actionTab: 'trilha-detalhe',
    actionTrackId: 'jadi'
  },
  {
    id: 'notif-2',
    title: 'Certificado Conquistado! 🎓',
    description: 'Parabéns! Você concluiu a trilha Primeiros Passos e desbloqueou seu certificado.',
    timeAgo: 'Ontem',
    read: false,
    type: 'certificate',
    actionTab: 'certificados'
  },
  {
    id: 'notif-3',
    title: 'Dica do Parceiro MegaZap',
    description: 'Reduza o tempo de atendimento utilizando variáveis dinâmicas nas Mensagens Rápidas.',
    timeAgo: 'Há 3 dias',
    read: true,
    type: 'tip',
    actionTab: 'aula-player',
    actionTrackId: 'atendimento',
    actionLessonId: 'aula-at-05'
  }
];

export const AcademyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('login');
  const [selectedTrackId, setSelectedTrackId] = useState<string>('atendimento');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('aula-at-05');
  
  // Search state
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Certificate Modal State
  const [activeCertificate, setActiveCertificate] = useState<Certificate | null>(null);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);

  // Authentication State
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [realUserProfile, setRealUserProfile] = useState<UserProfile | null>(null);
  const [activeRole, setActiveRole] = useState<UserRole>('partner_user');

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [currentPartner, setCurrentPartner] = useState<Partner | null>(null);
  const [allPartners, setAllPartners] = useState<Partner[]>([]);

  // Theme State
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) as ThemeMode;
      return savedTheme || 'light';
    } catch {
      return 'light';
    }
  });

  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const isDarkMode = useMemo(() => {
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    return systemPrefersDark;
  }, [theme, systemPrefersDark]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch {}

    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme, isDarkMode]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Local storage states
  const [completedLessons, setCompletedLessons] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COMPLETED);
      return saved ? JSON.parse(saved) : INITIAL_COMPLETED_LESSON_IDS;
    } catch {
      return INITIAL_COMPLETED_LESSON_IDS;
    }
  });

  // Dynamic Content (CMS + Firestore)
  const [rawTracks, setRawTracks] = useState<Track[]>(TRACKS_DATA);
  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);
  const [contentLoading, setContentLoading] = useState<boolean>(false);

  const refreshContent = async () => {
    try {
      setContentLoading(true);
      const [fetchedCats, fetchedTracks] = await Promise.all([
        fetchCategoriesFromDb(),
        fetchFullTracksFromDb(true)
      ]);
      if (fetchedCats && fetchedCats.length > 0) {
        setCategories(fetchedCats);
      }
      if (fetchedTracks && fetchedTracks.length > 0) {
        setRawTracks(fetchedTracks);
      }
    } catch (err) {
      console.warn('Erro ao atualizar conteúdo do CMS Firestore:', err);
    } finally {
      setContentLoading(false);
    }
  };

  const tracks = useMemo(() => {
    if (activeRole === 'super_admin') {
      return rawTracks;
    }
    // Filter out drafts / archived for students and partner admins
    return rawTracks
      .filter(t => t.status === 'published' || t.status === undefined)
      .map(t => ({
        ...t,
        modules: (t.modules || [])
          .filter(m => m.status === 'published' || m.status === undefined)
          .map(m => ({
            ...m,
            lessons: (m.lessons || []).filter(l => l.status === 'published' || l.status === undefined)
          }))
      }));
  }, [rawTracks, activeRole]);

  const allLessons = useMemo(() => {
    return tracks.flatMap(t => (t.modules || []).flatMap(m => m.lessons || []));
  }, [tracks]);

  const [lessonProgress, setLessonProgress] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      return saved ? JSON.parse(saved) : INITIAL_LESSON_PROGRESS;
    } catch {
      return INITIAL_LESSON_PROGRESS;
    }
  });

  const [favoriteLessons, setFavoriteLessons] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return saved ? JSON.parse(saved) : INITIAL_FAVORITE_LESSON_IDS;
    } catch {
      return INITIAL_FAVORITE_LESSON_IDS;
    }
  });

  const [userNotes, setUserNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTES);
      return saved ? JSON.parse(saved) : {
        'aula-at-05': 'Mensagens rápidas: atalho /vendas1 para enviar proposta comercial. Variável {nome} funciona muito bem no primeiro contato.'
      };
    } catch {
      return {};
    }
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  // Seed master database catalog on boot, fetch partners and fetch dynamic CMS content
  useEffect(() => {
    seedInitialDatabase();
    refreshContent();
    listPartners().then(partners => {
      if (partners && partners.length > 0) {
        setAllPartners(partners);
      }
    }).catch(err => console.log('Partners list notice:', err));
  }, []);

  // Fetch partner info for active user
  useEffect(() => {
    if (currentUser?.role === 'super_admin' || activeRole === 'super_admin') {
      setCurrentPartner({
        id: 'partner_megazap_hq',
        name: 'MegaZap Brasil HQ',
        displayName: 'MegaZap Brasil',
        code: 'MEGAZAP_HQ',
        status: 'active',
        createdAt: '',
        updatedAt: '',
        createdBy: 'system'
      });
    } else if (currentUser?.partnerId) {
      getPartner(currentUser.partnerId).then(p => {
        if (p) setCurrentPartner(p);
      }).catch(err => console.log('Partner fetch notice:', err));
    } else {
      setCurrentPartner({
        id: 'partner_megazap_hq',
        name: 'MegaZap Brasil HQ',
        displayName: 'MegaZap Brasil',
        code: 'MEGAZAP_HQ',
        status: 'active',
        createdAt: '',
        updatedAt: '',
        createdBy: 'system'
      });
    }
  }, [currentUser, activeRole]);

  // Firebase Auth listener (run once on mount)
  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (firebaseUser) => {
      setAuthLoading(true);
      if (firebaseUser) {
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          if (profile) {
            // Check if user is disabled
            if (profile.status === 'blocked' || profile.status === 'inactive') {
              setAuthError('Sua conta está desativada ou bloqueada pela administração. Entre em contato com o suporte.');
              await logout();
              setAuthLoading(false);
              return;
            }
            setRealUserProfile(profile);

            // For real authenticated users, their Firestore profile role is authoritative
            const effectiveRole: UserRole = profile.role;
            setActiveRole(effectiveRole);
            setCurrentUser(profile);

            setActiveTab(prev => (prev === 'login' ? (effectiveRole === 'super_admin' ? 'admin-dashboard' : effectiveRole === 'partner_admin' ? 'partner-dashboard' : 'dashboard') : prev));
          } else {
            // Fallback for new user with exact role detection
            const emailLower = (firebaseUser.email || '').toLowerCase().trim();
            const isMasterSuperAdmin = emailLower === 'matheus.tmw@gmail.com';

            const role: UserRole = isMasterSuperAdmin ? 'super_admin' : 'partner_user';
            const partnerId = isMasterSuperAdmin ? null : 'partner_ultrafox';

            const fallbackProfile: UserProfile = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário',
              email: firebaseUser.email || '',
              role,
              partnerId,
              status: 'active',
              photoURL: firebaseUser.photoURL,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            setRealUserProfile(fallbackProfile);
            setActiveRole(role);
            setCurrentUser(fallbackProfile);

            setActiveTab(prev => (prev === 'login' ? (role === 'super_admin' ? 'admin-dashboard' : 'dashboard') : prev));
          }
        } catch (err) {
          console.warn('Profile sync notice:', err);
        }
      } else {
        setRealUserProfile(null);
        setActiveRole('partner_user');
        setCurrentUser(null);
        setActiveTab('login');
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sync with Firestore progress and favorites if authenticated
  useEffect(() => {
    // Only subscribe to live Firestore progress if there is an active Firebase Auth session matching the uid
    if (currentUser?.uid && auth.currentUser && auth.currentUser.uid === currentUser.uid) {
      const unsubscribeProgress = listenToUserProgress(currentUser.uid, (progressMap) => {
        const comp: string[] = [];
        const prog: Record<string, number> = {};
        Object.entries(progressMap).forEach(([id, rec]) => {
          if (rec.completed) comp.push(id);
          prog[id] = rec.progressPercent;
        });
        if (comp.length > 0) setCompletedLessons(comp);
        if (Object.keys(prog).length > 0) setLessonProgress(prog);
      });

      const unsubscribeFavs = listenToUserFavorites(currentUser.uid, (favoriteIds) => {
        if (favoriteIds.length > 0) setFavoriteLessons(favoriteIds);
      });

      return () => {
        unsubscribeProgress();
        unsubscribeFavs();
      };
    }
  }, [currentUser?.uid]);

  // Save to LocalStorage on updates
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMPLETED, JSON.stringify(completedLessons));
  }, [completedLessons]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(lessonProgress));
  }, [lessonProgress]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favoriteLessons));
  }, [favoriteLessons]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(userNotes));
  }, [userNotes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  // Authentication Actions
  const signInWithEmail = async (email: string, pass: string): Promise<boolean> => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      const profile = await loginWithEmail(email, pass);
      if (profile) {
        if (profile.status === 'blocked' || profile.status === 'inactive') {
          setAuthError('Esta conta foi desativada pela administração.');
          await logout();
          setAuthLoading(false);
          return false;
        }
        setRealUserProfile(profile);
        localStorage.removeItem(STORAGE_KEYS.DEMO_ROLE);
        setCurrentUser(profile);
        setActiveRole(profile.role);
        // Automatic redirection based on role
        if (profile.role === 'super_admin') {
          setActiveTab('admin-dashboard');
        } else if (profile.role === 'partner_admin') {
          setActiveTab('partner-dashboard');
        } else {
          setActiveTab('dashboard');
        }
        setAuthLoading(false);
        return true;
      }
      setAuthLoading(false);
      return false;
    } catch (err: any) {
      setAuthLoading(false);
      const msg = err.message || '';
      console.warn('Login attempt note:', msg);
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password') || msg.includes('auth/user-not-found') || msg.includes('auth/invalid-email')) {
        setAuthError('E-mail ou senha incorretos. Verifique suas credenciais ou crie sua conta na aba Cadastrar.');
      } else if (msg.includes('auth/too-many-requests')) {
        setAuthError('Muitas tentativas sem sucesso. Aguarde alguns instantes e tente novamente.');
      } else {
        setAuthError(`Erro ao realizar login: ${err.message || 'Verifique suas credenciais.'}`);
      }
      return false;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string): Promise<boolean> => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      const isSuper = email.toLowerCase().trim() === 'matheus.tmw@gmail.com';
      const role: UserRole = isSuper ? 'super_admin' : 'partner_user';
      const partnerId = isSuper ? null : 'partner_ultrafox';

      const profile = await registerWithEmail({
        email,
        password: pass,
        name: name.trim() || email.split('@')[0],
        partnerId,
        role,
      });

      if (profile) {
        setRealUserProfile(profile);
        localStorage.removeItem(STORAGE_KEYS.DEMO_ROLE);
        setCurrentUser(profile);
        setActiveRole(profile.role);
        if (profile.role === 'super_admin') {
          setActiveTab('admin-dashboard');
        } else if (profile.role === 'partner_admin') {
          setActiveTab('partner-dashboard');
        } else {
          setActiveTab('dashboard');
        }
        setAuthLoading(false);
        return true;
      }
      setAuthLoading(false);
      return false;
    } catch (err: any) {
      setAuthLoading(false);
      const msg = err.message || '';
      console.warn('Registration attempt note:', msg);
      if (msg.includes('auth/email-already-in-use')) {
        setAuthError('Este e-mail já está cadastrado. Realize o login com sua senha.');
      } else if (msg.includes('auth/weak-password')) {
        setAuthError('A senha deve ter pelo menos 6 caracteres.');
      } else {
        setAuthError(`Erro no cadastro: ${err.message || 'Verifique os dados informados.'}`);
      }
      return false;
    }
  };

  const signInWithGoogleAuth = async (): Promise<boolean> => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      const profile = await loginWithGoogle(currentUser?.partnerId || 'partner_ultrafox');
      if (profile) {
        if (profile.status === 'blocked' || profile.status === 'inactive') {
          setAuthError('Esta conta está desativada.');
          await logout();
          setAuthLoading(false);
          return false;
        }
        setRealUserProfile(profile);
        localStorage.removeItem(STORAGE_KEYS.DEMO_ROLE);
        setCurrentUser(profile);
        setActiveRole(profile.role);
        if (profile.role === 'super_admin') {
          setActiveTab('admin-dashboard');
        } else if (profile.role === 'partner_admin') {
          setActiveTab('partner-dashboard');
        } else {
          setActiveTab('dashboard');
        }
        setAuthLoading(false);
        return true;
      }
      setAuthLoading(false);
      return false;
    } catch (err: any) {
      setAuthLoading(false);
      setAuthError('Não foi possível autenticar com o Google. Tente novamente.');
      return false;
    }
  };

  const signOutUser = async (): Promise<void> => {
    await logout();
    setRealUserProfile(null);
    localStorage.removeItem(STORAGE_KEYS.DEMO_ROLE);
    setActiveRole('partner_user');
    setCurrentUser(null);
    setActiveTab('login');
  };

  const sendPasswordReset = async (email: string): Promise<void> => {
    await sendResetPassword(email);
  };

  const switchDemoRole = (newRole: UserRole) => {
    setActiveRole(newRole);
    localStorage.setItem(STORAGE_KEYS.DEMO_ROLE, newRole);

    if (newRole === 'super_admin') {
      const adminProfile = realUserProfile || DEMO_PROFILES.super_admin;
      setCurrentUser(adminProfile);
      setCurrentPartner({
        id: 'partner_megazap_hq',
        name: 'MegaZap Brasil HQ',
        displayName: 'MegaZap Brasil',
        code: 'MEGAZAP_HQ',
        status: 'active',
        createdAt: '',
        updatedAt: '',
        createdBy: 'system'
      });
      setActiveTab('admin-dashboard');
    } else if (newRole === 'partner_admin') {
      const ultrafox = allPartners.find(p => p.id === 'partner_ultrafox') || {
        id: 'partner_ultrafox',
        name: 'Ultrafox Tecnologia & Atendimento',
        displayName: 'Ultrafox',
        code: 'ULTRAFOX_MG',
        status: 'active' as const,
        contactEmail: 'contato@ultrafox.com.br',
        city: 'Belo Horizonte',
        state: 'MG',
        totalUsers: 14,
        createdAt: '',
        updatedAt: '',
        createdBy: 'system'
      };
      setCurrentUser(DEMO_PROFILES.partner_admin);
      setCurrentPartner(ultrafox);
      setActiveTab('partner-dashboard');
    } else {
      const ultrafox = allPartners.find(p => p.id === 'partner_ultrafox') || {
        id: 'partner_ultrafox',
        name: 'Ultrafox Tecnologia & Atendimento',
        displayName: 'Ultrafox',
        code: 'ULTRAFOX_MG',
        status: 'active' as const,
        contactEmail: 'contato@ultrafox.com.br',
        city: 'Belo Horizonte',
        state: 'MG',
        totalUsers: 14,
        createdAt: '',
        updatedAt: '',
        createdBy: 'system'
      };
      setCurrentUser(DEMO_PROFILES.partner_user);
      setCurrentPartner(ultrafox);
      setActiveTab('dashboard');
    }
  };

  const updateCurrentUserProfile = async (name: string, photoURL?: string) => {
    if (!currentUser) return;
    const updated: UserProfile = {
      ...currentUser,
      name,
      photoURL: photoURL || currentUser.photoURL,
    };
    setCurrentUser(updated);
    if (auth.currentUser) {
      await updateProfileService(currentUser.uid, { name, photoURL });
    }
  };

  // Current track and lesson objects
  const currentTrack = useMemo(() => {
    return tracks.find(t => t.id === selectedTrackId) || tracks[0] || TRACKS_DATA[0];
  }, [tracks, selectedTrackId]);

  const currentLesson = useMemo(() => {
    return allLessons.find(l => l.id === selectedLessonId) || allLessons[0] || ALL_LESSONS[0];
  }, [allLessons, selectedLessonId]);

  // Current Track's flattened lessons to find next / prev
  const currentTrackLessons = useMemo(() => {
    if (!currentTrack) return [];
    return (currentTrack.modules || []).flatMap(m => m.lessons || []);
  }, [currentTrack]);

  const currentLessonIndexInTrack = useMemo(() => {
    return currentTrackLessons.findIndex(l => l.id === selectedLessonId);
  }, [currentTrackLessons, selectedLessonId]);

  const prevLesson = useMemo(() => {
    if (currentLessonIndexInTrack > 0) {
      return currentTrackLessons[currentLessonIndexInTrack - 1];
    }
    return undefined;
  }, [currentTrackLessons, currentLessonIndexInTrack]);

  const nextLesson = useMemo(() => {
    if (currentLessonIndexInTrack >= 0 && currentLessonIndexInTrack < currentTrackLessons.length - 1) {
      return currentTrackLessons[currentLessonIndexInTrack + 1];
    }
    return undefined;
  }, [currentTrackLessons, currentLessonIndexInTrack]);

  // Navigation helpers
  const navigateTo = (tab: NavigationTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToTrack = (trackId: string) => {
    setSelectedTrackId(trackId);
    setActiveTab('trilha-detalhe');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToLesson = (lessonId: string, trackId?: string) => {
    const targetLesson = allLessons.find(l => l.id === lessonId);
    if (targetLesson) {
      setSelectedLessonId(targetLesson.id);
      setSelectedTrackId(trackId || targetLesson.trackId);
      setActiveTab('aula-player');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToNextLesson = () => {
    if (nextLesson && currentTrack) {
      navigateToLesson(nextLesson.id, currentTrack.id);
    }
  };

  const goToPrevLesson = () => {
    if (prevLesson && currentTrack) {
      navigateToLesson(prevLesson.id, currentTrack.id);
    }
  };

  // Actions
  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#0284C7', '#0EA5E9', '#10B981', '#F59E0B']
      });
    } catch {
      // ignore
    }
  };

  const toggleLessonCompleted = (lessonId: string) => {
    setCompletedLessons(prev => {
      const isAlready = prev.includes(lessonId);
      if (isAlready) {
        return prev.filter(id => id !== lessonId);
      } else {
        triggerCelebration();
        setLessonProgress(p => ({ ...p, [lessonId]: 100 }));
        return [...prev, lessonId];
      }
    });

    const user = currentUser;
    const lesson = allLessons.find(l => l.id === lessonId);
    if (user && lesson) {
      saveLessonProgress(user.uid, {
        lessonId,
        courseId: lesson.trackId,
        moduleId: lesson.moduleId,
        progressPercent: completedLessons.includes(lessonId) ? 0 : 100,
        completed: !completedLessons.includes(lessonId),
      }).catch(err => console.warn('Firestore progress sync notice:', err));
    }
  };

  const markLessonCompleted = (lessonId: string) => {
    if (!completedLessons.includes(lessonId)) {
      triggerCelebration();
      setCompletedLessons(prev => [...prev, lessonId]);
      setLessonProgress(p => ({ ...p, [lessonId]: 100 }));

      const user = currentUser;
      const lesson = allLessons.find(l => l.id === lessonId);
      if (user && lesson) {
        saveLessonProgress(user.uid, {
          lessonId,
          courseId: lesson.trackId,
          moduleId: lesson.moduleId,
          progressPercent: 100,
          completed: true,
        }).catch(err => console.warn('Firestore progress sync notice:', err));
      }
    }
  };

  const updateLessonProgress = (lessonId: string, progress: number) => {
    const clamped = Math.min(100, Math.max(0, Math.round(progress)));
    setLessonProgress(prev => ({
      ...prev,
      [lessonId]: clamped
    }));
    if (clamped >= 95 && !completedLessons.includes(lessonId)) {
      markLessonCompleted(lessonId);
    } else {
      const user = currentUser;
      const lesson = allLessons.find(l => l.id === lessonId);
      if (user && lesson) {
        saveLessonProgress(user.uid, {
          lessonId,
          courseId: lesson.trackId,
          moduleId: lesson.moduleId,
          progressPercent: clamped,
          completed: completedLessons.includes(lessonId),
        }).catch(err => console.warn('Firestore progress sync notice:', err));
      }
    }
  };

  const toggleFavorite = (lessonId: string) => {
    const isCurrentlyFav = favoriteLessons.includes(lessonId);
    setFavoriteLessons(prev => 
      isCurrentlyFav 
        ? prev.filter(id => id !== lessonId) 
        : [...prev, lessonId]
    );

    const user = currentUser;
    if (user) {
      if (isCurrentlyFav) {
        removeFavorite(user.uid, lessonId).catch(err => console.warn('Firestore favorite remove notice:', err));
      } else {
        addFavorite(user.uid, lessonId).catch(err => console.warn('Firestore favorite add notice:', err));
      }
    }
  };

  const isFavorite = (lessonId: string) => favoriteLessons.includes(lessonId);
  const isCompleted = (lessonId: string) => completedLessons.includes(lessonId);
  const getLessonProgress = (lessonId: string) => {
    if (completedLessons.includes(lessonId)) return 100;
    return lessonProgress[lessonId] || 0;
  };

  const saveUserNote = (lessonId: string, text: string) => {
    setUserNotes(prev => ({
      ...prev,
      [lessonId]: text
    }));
  };

  // Metrics calculation
  const totalLessonsCount = allLessons.length || 1;
  const totalCompletedLessonsCount = completedLessons.length;
  const overallProgressPercentage = Math.round((totalCompletedLessonsCount / totalLessonsCount) * 100);

  const getTrackProgress = (trackId: string) => {
    const track = tracks.find(t => t.id === trackId) || rawTracks.find(t => t.id === trackId);
    if (!track) return { percentage: 0, completedCount: 0, totalCount: 0, isCompleted: false, hasStarted: false };
    
    const trackLessons = (track.modules || []).flatMap(m => m.lessons || []);
    const total = trackLessons.length;
    const completed = trackLessons.filter(l => completedLessons.includes(l.id)).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const hasStarted = completed > 0 || trackLessons.some(l => (lessonProgress[l.id] || 0) > 0);

    return {
      percentage,
      completedCount: completed,
      totalCount: total,
      isCompleted: completed === total && total > 0,
      hasStarted
    };
  };

  const startedTracksCount = useMemo(() => {
    return tracks.filter(t => getTrackProgress(t.id).hasStarted).length;
  }, [tracks, completedLessons, lessonProgress]);

  const earnedCertificatesCount = useMemo(() => {
    return tracks.filter(t => getTrackProgress(t.id).isCompleted).length;
  }, [tracks, completedLessons]);

  const totalTrainingHoursFormatted = '5h 40min';

  // Certificate opener
  const openCertificate = (trackId: string) => {
    const track = tracks.find(t => t.id === trackId) || rawTracks.find(t => t.id === trackId);
    if (!track) return;
    
    setActiveCertificate({
      id: `CERT-MZ-${trackId.toUpperCase()}-2026`,
      trackId: track.id,
      trackTitle: track.title,
      title: track.certificateName,
      issueDate: '14 de agosto de 2026',
      verificationCode: `MZ-WL-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      hoursCount: track.estimatedHours,
      studentName: currentUser?.name || 'Matheus Barros',
      partnerCompany: currentPartner?.displayName || 'Ultrafox'
    });
    setIsCertificateModalOpen(true);
  };

  // Notifications
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Formatted Profile for existing UI components
  const userProfileFormatted = useMemo(() => {
    const isSuper = activeRole === 'super_admin' || currentUser?.role === 'super_admin';
    let roleLabel = 'Aluno Especialista';
    if (isSuper) roleLabel = 'Super Admin MegaZap';
    else if (activeRole === 'partner_admin' || currentUser?.role === 'partner_admin') roleLabel = 'Administrador do Parceiro';

    return {
      name: currentUser?.name || 'Usuário MegaZap',
      role: roleLabel,
      company: isSuper ? 'MegaZap Brasil HQ' : (currentPartner?.displayName || 'Ultrafox'),
      avatar: currentUser?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser?.name || 'User')}`,
      email: currentUser?.email || '',
      status: currentUser?.status || 'active',
      partnerId: isSuper ? null : (currentUser?.partnerId || null)
    };
  }, [currentUser, activeRole, currentPartner]);

  return (
    <AcademyContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedTrackId,
        setSelectedTrackId,
        selectedLessonId,
        setSelectedLessonId,
        navigateTo,
        navigateToTrack,
        navigateToLesson,
        goToNextLesson,
        goToPrevLesson,
        tracks,
        rawTracks,
        categories,
        allLessons,
        contentLoading,
        refreshContent,
        currentTrack,
        currentLesson,
        nextLesson,
        prevLesson,
        completedLessons,
        lessonProgress,
        favoriteLessons,
        userNotes,
        toggleLessonCompleted,
        markLessonCompleted,
        updateLessonProgress,
        toggleFavorite,
        isFavorite,
        isCompleted,
        getLessonProgress,
        saveUserNote,
        overallProgressPercentage,
        totalCompletedLessonsCount,
        totalLessonsCount,
        startedTracksCount,
        totalTrainingHoursFormatted,
        earnedCertificatesCount,
        getTrackProgress,
        isSearchModalOpen,
        setIsSearchModalOpen,
        searchQuery,
        setSearchQuery,
        activeCertificate,
        setActiveCertificate,
        isCertificateModalOpen,
        setIsCertificateModalOpen,
        openCertificate,
        notifications,
        unreadNotificationsCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        theme,
        setTheme,
        toggleTheme,
        isDarkMode,
        // RBAC & Auth
        currentUser,
        currentPartner,
        allPartners,
        authLoading,
        authError,
        activeRole,
        isSuperAdmin: activeRole === 'super_admin',
        isPartnerAdmin: activeRole === 'partner_admin',
        isPartnerUser: activeRole === 'partner_user',
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogleAuth,
        signOutUser,
        sendPasswordReset,
        switchDemoRole,
        updateCurrentUserProfile,
        userProfile: userProfileFormatted
      }}
    >
      {children}
    </AcademyContext.Provider>
  );
};

export const useAcademy = () => {
  const context = useContext(AcademyContext);
  if (!context) {
    throw new Error('useAcademy must be used within an AcademyProvider');
  }
  return context;
};
