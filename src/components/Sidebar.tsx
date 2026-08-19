import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Layers, 
  Compass, 
  MessageSquare, 
  GitBranch, 
  Megaphone, 
  Database, 
  Sparkles, 
  ShieldCheck, 
  BarChart3, 
  Bookmark, 
  Award, 
  HelpCircle, 
  Search, 
  CheckCircle2, 
  X,
  Building2,
  Users,
  Activity,
  Shield,
  UserCheck,
  FolderTree
} from 'lucide-react';
import { useAcademy } from '../context/AcademyContext';
import { MegaZapLogo } from './MegaZapLogo';
import { NavigationTab } from '../types';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { 
    activeTab, 
    navigateTo, 
    navigateToTrack, 
    selectedTrackId, 
    getTrackProgress,
    tracks,
    setIsSearchModalOpen,
    favoriteLessons,
    earnedCertificatesCount,
    isSuperAdmin,
    isPartnerAdmin,
    isPartnerUser,
    currentPartner
  } = useAcademy();

  const handleNav = (tab: NavigationTab) => {
    navigateTo(tab);
    onCloseMobile();
  };

  const handleTrackNav = (trackId: string) => {
    navigateToTrack(trackId);
    onCloseMobile();
  };

  const trackIconMap: Record<string, React.ReactNode> = {
    'primeiros-passos': <Compass className="w-4 h-4 text-sky-700" />,
    'atendimento': <MessageSquare className="w-4 h-4 text-sky-700" />,
    'automacao': <GitBranch className="w-4 h-4 text-amber-700" />,
    'marketing': <Megaphone className="w-4 h-4 text-blue-700" />,
    'cadastros': <Database className="w-4 h-4 text-emerald-700" />,
    'jadi': <Sparkles className="w-4 h-4 text-purple-700" />,
    'administracao': <ShieldCheck className="w-4 h-4 text-slate-700" />,
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Sidebar Container */}
      <aside 
        className={`
          fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col transition-all duration-200 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        `}
      >
        {/* Top Branding Section */}
        <div className="h-16 px-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <MegaZapLogo />
          <button 
            type="button"
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            onClick={onCloseMobile}
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Search Trigger Input */}
        <div className="px-4 pt-3.5 pb-1">
          <button
            type="button"
            id="sidebar-search-btn"
            onClick={() => setIsSearchModalOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100/80 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-xl transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400" />
              <span className="font-medium text-slate-700 dark:text-slate-300">Buscar treinamento...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded shadow-2xs">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 px-3 py-3 space-y-5 overflow-y-auto custom-scrollbar text-xs">
          
          {/* SUPER ADMIN EXCLUSIVE SECTION */}
          {isSuperAdmin && (
            <div>
              <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-sky-600 dark:text-sky-400 uppercase flex items-center gap-1.5">
                <Shield className="w-3 h-3" />
                <span>Super Admin MegaZap</span>
              </div>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => handleNav('admin-dashboard')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all duration-150 group cursor-pointer ${
                    activeTab === 'admin-dashboard'
                      ? 'bg-sky-600 text-white font-bold shadow-sm shadow-sky-600/30'
                      : 'text-slate-600 dark:text-slate-300 font-medium hover:text-sky-800 dark:hover:text-sky-300 hover:bg-sky-50/80 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <LayoutDashboard className={`w-4 h-4 ${activeTab === 'admin-dashboard' ? 'text-white' : 'text-slate-400 group-hover:text-sky-600'}`} />
                  <span>Painel Geral</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNav('admin-partners')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all duration-150 group cursor-pointer ${
                    activeTab === 'admin-partners'
                      ? 'bg-sky-600 text-white font-bold shadow-sm shadow-sky-600/30'
                      : 'text-slate-600 dark:text-slate-300 font-medium hover:text-sky-800 dark:hover:text-sky-300 hover:bg-sky-50/80 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <Building2 className={`w-4 h-4 ${activeTab === 'admin-partners' ? 'text-white' : 'text-slate-400 group-hover:text-sky-600'}`} />
                  <span>Parceiros White Label</span>
                </button>

                <button
                  type="button"
                  id="nav-admin-content"
                  onClick={() => handleNav('admin-content')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all duration-150 group cursor-pointer ${
                    activeTab === 'admin-content' || activeTab === 'admin-cms'
                      ? 'bg-sky-600 text-white font-bold shadow-sm shadow-sky-600/30'
                      : 'text-slate-600 dark:text-slate-300 font-medium hover:text-sky-800 dark:hover:text-sky-300 hover:bg-sky-50/80 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <FolderTree className={`w-4 h-4 ${activeTab === 'admin-content' || activeTab === 'admin-cms' ? 'text-white' : 'text-slate-400 group-hover:text-sky-600'}`} />
                  <span>Gerenciar Conteúdo</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNav('admin-users')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all duration-150 group cursor-pointer ${
                    activeTab === 'admin-users'
                      ? 'bg-sky-600 text-white font-bold shadow-sm shadow-sky-600/30'
                      : 'text-slate-600 dark:text-slate-300 font-medium hover:text-sky-800 dark:hover:text-sky-300 hover:bg-sky-50/80 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <Users className={`w-4 h-4 ${activeTab === 'admin-users' ? 'text-white' : 'text-slate-400 group-hover:text-sky-600'}`} />
                  <span>Usuários & Alunos</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNav('admin-logs')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all duration-150 group cursor-pointer ${
                    activeTab === 'admin-logs'
                      ? 'bg-sky-600 text-white font-bold shadow-sm shadow-sky-600/30'
                      : 'text-slate-600 dark:text-slate-300 font-medium hover:text-sky-800 dark:hover:text-sky-300 hover:bg-sky-50/80 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <Activity className={`w-4 h-4 ${activeTab === 'admin-logs' ? 'text-white' : 'text-slate-400 group-hover:text-sky-600'}`} />
                  <span>Logs de Auditoria</span>
                </button>
              </div>
            </div>
          )}

          {/* PARTNER ADMIN EXCLUSIVE SECTION */}
          {isPartnerAdmin && (
            <div>
              <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-1.5">
                <Building2 className="w-3 h-3" />
                <span>Gestão • {currentPartner?.displayName || 'Ultrafox'}</span>
              </div>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => handleNav('partner-dashboard')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all duration-150 group cursor-pointer ${
                    activeTab === 'partner-dashboard'
                      ? 'bg-emerald-600 text-white font-bold shadow-sm shadow-emerald-600/30'
                      : 'text-slate-600 dark:text-slate-300 font-medium hover:text-emerald-800 dark:hover:text-emerald-300 hover:bg-emerald-50/80 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <LayoutDashboard className={`w-4 h-4 ${activeTab === 'partner-dashboard' ? 'text-white' : 'text-slate-400 group-hover:text-emerald-600'}`} />
                  <span>Início da Empresa</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNav('partner-team')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all duration-150 group cursor-pointer ${
                    activeTab === 'partner-team'
                      ? 'bg-emerald-600 text-white font-bold shadow-sm shadow-emerald-600/30'
                      : 'text-slate-600 dark:text-slate-300 font-medium hover:text-emerald-800 dark:hover:text-emerald-300 hover:bg-emerald-50/80 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <Users className={`w-4 h-4 ${activeTab === 'partner-team' ? 'text-white' : 'text-slate-400 group-hover:text-emerald-600'}`} />
                  <span>Minha Equipe</span>
                </button>
              </div>
            </div>
          )}

          {/* Section: TREINAMENTOS & ACADEMY */}
          <div>
            <div className="px-3 pb-2 text-[10.5px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              {isSuperAdmin ? 'Plataforma de Treinamento' : 'Área do Aluno'}
            </div>
            <div className="space-y-1">
              <button
                type="button"
                id="nav-dashboard"
                onClick={() => handleNav('dashboard')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all duration-150 group cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-sky-600 text-white font-bold shadow-sm shadow-sky-600/30'
                    : 'text-slate-600 dark:text-slate-300 font-medium hover:text-sky-800 dark:hover:text-sky-300 hover:bg-sky-50/80 dark:hover:bg-slate-800/80'
                }`}
              >
                <LayoutDashboard className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-white' : 'text-slate-400 group-hover:text-sky-600'}`} />
                <span>Início Aluno</span>
              </button>

              <button
                type="button"
                id="nav-meus-treinamentos"
                onClick={() => handleNav('meus-treinamentos')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all duration-150 group cursor-pointer ${
                  activeTab === 'meus-treinamentos'
                    ? 'bg-sky-600 text-white font-bold shadow-sm shadow-sky-600/30'
                    : 'text-slate-600 dark:text-slate-300 font-medium hover:text-sky-800 dark:hover:text-sky-300 hover:bg-sky-50/80 dark:hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className={`w-4 h-4 ${activeTab === 'meus-treinamentos' ? 'text-white' : 'text-slate-400 group-hover:text-sky-600'}`} />
                  <span>Meus treinamentos</span>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                  activeTab === 'meus-treinamentos' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}>
                  {tracks.length}
                </span>
              </button>

              <button
                type="button"
                id="nav-catalogo"
                onClick={() => handleNav('catalogo')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all duration-150 group cursor-pointer ${
                  activeTab === 'catalogo'
                    ? 'bg-sky-600 text-white font-bold shadow-sm shadow-sky-600/30'
                    : 'text-slate-600 dark:text-slate-300 font-medium hover:text-sky-800 dark:hover:text-sky-300 hover:bg-sky-50/80 dark:hover:bg-slate-800/80'
                }`}
              >
                <Layers className={`w-4 h-4 ${activeTab === 'catalogo' ? 'text-white' : 'text-slate-400 group-hover:text-sky-600'}`} />
                <span>Catálogo de Trilhas</span>
              </button>
            </div>
          </div>

          {/* Section: TRILHAS OFICIAIS */}
          <div>
            <div className="px-3 pb-2 text-[10.5px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              Trilhas Oficiais
            </div>
            <div className="space-y-0.5">
              {tracks.map((track) => {
                const isSelected = activeTab === 'trilha-detalhe' && selectedTrackId === track.id;
                const progress = getTrackProgress(track.id);

                return (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => handleTrackNav(track.id)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-left transition-colors group cursor-pointer ${
                      isSelected 
                        ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-900 dark:text-sky-200 font-bold border border-sky-200/80 dark:border-sky-800' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="shrink-0">{trackIconMap[track.id] || <Layers className="w-4 h-4 text-slate-500" />}</span>
                      <span className="truncate">{track.title}</span>
                    </div>
                    {progress.isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : progress.hasStarted ? (
                      <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 shrink-0">
                        {progress.percentage}%
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: DESEMPENHO */}
          <div>
            <div className="px-3 pb-2 text-[10.5px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              Desempenho
            </div>
            <div className="space-y-1">
              <button
                type="button"
                id="nav-meu-progresso"
                onClick={() => handleNav('meu-progresso')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all duration-150 group cursor-pointer ${
                  activeTab === 'meu-progresso'
                    ? 'bg-sky-600 text-white font-bold shadow-sm shadow-sky-600/30'
                    : 'text-slate-600 dark:text-slate-300 font-medium hover:text-sky-800 dark:hover:text-sky-300 hover:bg-sky-50/80 dark:hover:bg-slate-800/80'
                }`}
              >
                <BarChart3 className={`w-4 h-4 ${activeTab === 'meu-progresso' ? 'text-white' : 'text-slate-400 group-hover:text-sky-600'}`} />
                <span>Meu Progresso</span>
              </button>

              <button
                type="button"
                id="nav-favoritos"
                onClick={() => handleNav('favoritos')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all duration-150 group cursor-pointer ${
                  activeTab === 'favoritos'
                    ? 'bg-sky-600 text-white font-bold shadow-sm shadow-sky-600/30'
                    : 'text-slate-600 dark:text-slate-300 font-medium hover:text-sky-800 dark:hover:text-sky-300 hover:bg-sky-50/80 dark:hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Bookmark className={`w-4 h-4 ${activeTab === 'favoritos' ? 'text-white' : 'text-slate-400 group-hover:text-sky-600'}`} />
                  <span>Aulas Salvas</span>
                </div>
                {favoriteLessons.length > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                    {favoriteLessons.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                id="nav-certificados"
                onClick={() => handleNav('certificados')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all duration-150 group cursor-pointer ${
                  activeTab === 'certificados'
                    ? 'bg-sky-600 text-white font-bold shadow-sm shadow-sky-600/30'
                    : 'text-slate-600 dark:text-slate-300 font-medium hover:text-sky-800 dark:hover:text-sky-300 hover:bg-sky-50/80 dark:hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Award className={`w-4 h-4 ${activeTab === 'certificados' ? 'text-white' : 'text-slate-400 group-hover:text-sky-600'}`} />
                  <span>Certificados</span>
                </div>
                {earnedCertificatesCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    {earnedCertificatesCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Section: SUPORTE */}
          <div>
            <div className="px-3 pb-2 text-[10.5px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              Suporte
            </div>
            <div className="space-y-1">
              <button
                type="button"
                id="nav-central-ajuda"
                onClick={() => handleNav('central-ajuda')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all duration-150 group cursor-pointer ${
                  activeTab === 'central-ajuda'
                    ? 'bg-sky-600 text-white font-bold shadow-sm shadow-sky-600/30'
                    : 'text-slate-600 dark:text-slate-300 font-medium hover:text-sky-800 dark:hover:text-sky-300 hover:bg-sky-50/80 dark:hover:bg-slate-800/80'
                }`}
              >
                <HelpCircle className={`w-4 h-4 ${activeTab === 'central-ajuda' ? 'text-white' : 'text-slate-400 group-hover:text-sky-600'}`} />
                <span>Central de Ajuda</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Footer Partner Banner */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                {currentPartner?.displayName || 'MegaZap HQ'}
              </span>
              <span className="inline-flex items-center px-1.5 py-0.2 text-[9px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded">
                Ativo
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
              Tenant ID: <span className="font-mono">{currentPartner?.code || 'MEGAZAP_HQ'}</span>
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
