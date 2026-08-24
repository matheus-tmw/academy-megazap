import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  Globe, 
  ChevronDown, 
  Check, 
  Sparkles, 
  Award, 
  BookOpen, 
  Lightbulb, 
  User, 
  Settings, 
  LogOut,
  ExternalLink,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
  Shield,
  Building2,
  Users,
  Activity,
  KeyRound
} from 'lucide-react';
import { useAcademy } from '../context/AcademyContext';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const { 
    activeTab, 
    currentTrack, 
    currentLesson, 
    userProfile, 
    setIsSearchModalOpen,
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    navigateTo,
    navigateToTrack,
    navigateToLesson,
    theme,
    setTheme,
    toggleTheme,
    isDarkMode,
    activeRole,
    switchDemoRole,
    signOutUser,
    isSuperAdmin,
    isPartnerAdmin,
    isPartnerUser,
    isRealSuperAdmin,
    isRealPartnerAdmin,
    isRealPartnerUser
  } = useAcademy();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState('Português (BR)');

  const notifRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute Breadcrumb / Page Title Context
  const renderBreadcrumb = () => {
    if (activeTab === 'aula-player' && currentLesson && currentTrack) {
      return (
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 overflow-hidden text-ellipsis whitespace-nowrap max-w-[280px] sm:max-w-md lg:max-w-xl">
          <button 
            onClick={() => navigateTo('catalogo')}
            className="hover:text-slate-900 dark:hover:text-white transition-colors font-medium cursor-pointer"
          >
            Treinamentos
          </button>
          <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
          <button 
            onClick={() => navigateToTrack(currentTrack.id)}
            className="hover:text-sky-600 dark:hover:text-sky-400 font-medium text-slate-700 dark:text-slate-300 transition-colors cursor-pointer truncate"
          >
            {currentTrack.title}
          </button>
          <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
          <span className="text-slate-400 dark:text-slate-500 truncate">{currentLesson.moduleTitle}</span>
          <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
          <span className="font-semibold text-slate-900 dark:text-white truncate">{currentLesson.title}</span>
        </div>
      );
    }

    if (activeTab === 'trilha-detalhe' && currentTrack) {
      return (
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <button 
            onClick={() => navigateTo('catalogo')}
            className="hover:text-slate-900 dark:hover:text-white transition-colors font-medium cursor-pointer"
          >
            Treinamentos
          </button>
          <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
          <span className="font-semibold text-slate-900 dark:text-white">{currentTrack.title}</span>
        </div>
      );
    }

    const titleMap: Record<string, string> = {
      'dashboard': 'Dashboard do Aluno',
      'meus-treinamentos': 'Meus Treinamentos',
      'catalogo': 'Catálogo de Trilhas',
      'meu-progresso': 'Meu Progresso',
      'favoritos': 'Aulas Favoritas',
      'certificados': 'Meus Certificados',
      'central-ajuda': 'Central de Ajuda e Suporte',
      'admin-dashboard': 'Painel Geral Super Admin',
      'admin-partners': 'Gestão de Parceiros White Label',
      'admin-users': 'Gestão de Usuários e Alunos',
      'admin-logs': 'Trilha de Auditoria & Conformidade',
      'partner-dashboard': 'Painel do Parceiro',
      'partner-team': 'Gestão da Equipe',
      'partner-progress': 'Progresso da Equipe',
      'meu-perfil': 'Meu Perfil & Segurança',
      'login': 'Acesso à Plataforma'
    };

    return (
      <div className="flex items-center gap-2">
        <h1 className="text-sm sm:text-[15px] font-bold text-slate-800 dark:text-white tracking-tight">
          {titleMap[activeTab] || 'MegaZap Academy'}
        </h1>
        {isSuperAdmin ? (
          <span className="hidden md:inline-flex items-center px-2 py-0.5 text-[10px] font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/70 border border-sky-200 dark:border-sky-800 rounded-full">
            MegaZap HQ Master
          </span>
        ) : isPartnerAdmin ? (
          <span className="hidden md:inline-flex items-center px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 rounded-full">
            Admin Parceiro
          </span>
        ) : (
          <span className="hidden md:inline-flex items-center px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 rounded-full">
            Aluno White Label
          </span>
        )}
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left side: Mobile burger + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {renderBreadcrumb()}
      </div>

      {/* Center: Global Search */}
      <div className="flex-1 flex justify-center px-4">
        <button
          type="button"
          onClick={() => setIsSearchModalOpen(true)}
          className="flex items-center gap-3 px-4 py-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-xl transition-all cursor-pointer shadow-xs w-full max-w-md"
        >
          <Search className="w-4 h-4" />
          <span>Buscar cursos, certificados...</span>
          <kbd className="hidden sm:inline-flex ml-auto px-1.5 py-0.5 text-[10px] font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right side: Role Switcher, Notifications, Theme, User Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        
        {/* Quick Role Switcher Pill (Master Admin) */}
        {isRealSuperAdmin && (
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] gap-0.5">
            <button
              onClick={() => switchDemoRole('super_admin')}
              className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                activeRole === 'super_admin'
                  ? 'bg-sky-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
              title="Super Admin"
            >
              👑
            </button>
            <button
              onClick={() => switchDemoRole('partner_admin')}
              className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                activeRole === 'partner_admin'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
              title="Partner Admin"
            >
              🏢
            </button>
            <button
              onClick={() => switchDemoRole('partner_user')}
              className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                activeRole === 'partner_user'
                  ? 'bg-purple-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
              title="Aluno"
            >
              🎓
            </button>
          </div>
        )}

        {/* Quick Role Switcher Pill (Partner Admin) */}
        {isRealPartnerAdmin && !isRealSuperAdmin && (
          <div className="flex items-center bg-emerald-50 dark:bg-emerald-900/30 p-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800 text-[10px]">
            <button
              onClick={() => switchDemoRole('partner_admin')}
              className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                activeRole === 'partner_admin'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-emerald-700 dark:text-emerald-300'
              }`}
              title="Painel da Empresa"
            >
              🏢 Painel Empresa
            </button>
          </div>
        )}

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isDarkMode ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            aria-label="Notificações"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-sky-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 py-2 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-white text-xs">Notificações</span>
                {unreadNotificationsCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline font-medium"
                  >
                    Marcar lidas
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      markNotificationAsRead(notif.id);
                      if (notif.actionTab) navigateTo(notif.actionTab);
                      setIsNotifOpen(false);
                    }}
                    className={`p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${
                      !notif.read ? 'bg-sky-50/40 dark:bg-sky-950/20' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-slate-800 dark:text-white text-xs leading-snug">
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0">{notif.timeAgo}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {notif.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative pl-1 sm:pl-2 border-l border-slate-200 dark:border-slate-800" ref={userRef}>
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2.5 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer group"
          >
            <img
              src={userProfile.avatar}
              alt={userProfile.name}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 group-hover:ring-sky-400 transition-all"
            />
            <div className="hidden lg:flex flex-col text-left leading-tight">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                {userProfile.name}
              </span>
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                {userProfile.role}
              </span>
            </div>
            <ChevronDown className="hidden lg:block w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 py-2 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60">
                <p className="font-bold text-slate-800 dark:text-white">{userProfile.name}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{userProfile.email}</p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="inline-block px-2 py-0.5 text-[9.5px] font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/70 border border-sky-200 dark:border-sky-800 rounded">
                    {userProfile.company}
                  </span>
                  <span className="inline-block px-2 py-0.5 text-[9.5px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 rounded">
                    {userProfile.role}
                  </span>
                </div>
              </div>

              <div className="py-1.5">
                <button
                  onClick={() => {
                    navigateTo('meu-perfil');
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-left transition-colors"
                >
                  <User className="w-4 h-4 text-sky-500" />
                  <span>Meu Perfil & Segurança</span>
                </button>

                {isSuperAdmin && (
                  <button
                    onClick={() => {
                      navigateTo('admin-dashboard');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-left transition-colors"
                  >
                    <Shield className="w-4 h-4 text-sky-500" />
                    <span>Painel Super Admin</span>
                  </button>
                )}

                {isPartnerAdmin && (
                  <button
                    onClick={() => {
                      navigateTo('partner-dashboard');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-left transition-colors"
                  >
                    <Building2 className="w-4 h-4 text-emerald-500" />
                    <span>Painel da Empresa</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    navigateTo('certificados');
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-left transition-colors"
                >
                  <Award className="w-4 h-4 text-purple-500" />
                  <span>Meus Certificados</span>
                </button>
              </div>

              {/* Persona selector based on permissions */}
              {isRealSuperAdmin && (
                <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Alternar Papel (Validação):
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-[10px]">
                    <button
                      onClick={() => { switchDemoRole('super_admin'); setIsUserMenuOpen(false); }}
                      className={`p-1 rounded text-center border font-medium ${activeRole === 'super_admin' ? 'bg-sky-600 text-white border-sky-600' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600'}`}
                    >
                      Super
                    </button>
                    <button
                      onClick={() => { switchDemoRole('partner_admin'); setIsUserMenuOpen(false); }}
                      className={`p-1 rounded text-center border font-medium ${activeRole === 'partner_admin' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600'}`}
                    >
                      Partner
                    </button>
                    <button
                      onClick={() => { switchDemoRole('partner_user'); setIsUserMenuOpen(false); }}
                      className={`p-1 rounded text-center border font-medium ${activeRole === 'partner_user' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600'}`}
                    >
                      Aluno
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    signOutUser();
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-medium text-left transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Sair da Conta</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
