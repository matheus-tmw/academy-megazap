import React, { useState, useMemo, useEffect } from 'react';
import { useAcademy } from '../../context/AcademyContext';
import { 
  CategoryItem, 
  Track, 
  Module, 
  Lesson, 
  ContentStatus,
  LessonLevel,
  PreviewMockupType,
  LessonResource
} from '../../types';
import { 
  FolderTree, 
  Plus, 
  Search, 
  Filter, 
  Layers, 
  BookOpen, 
  Film, 
  Edit3, 
  Trash2, 
  MoveUp, 
  MoveDown, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ChevronDown, 
  Sparkles, 
  Compass, 
  MessageSquare, 
  GitBranch, 
  Megaphone, 
  Database, 
  ShieldCheck, 
  Clock, 
  Award, 
  ExternalLink, 
  HelpCircle, 
  RefreshCw, 
  Copy,
  Sliders,
  Check,
  X,
  FileText,
  Video,
  ListOrdered,
  Tag,
  Flame,
  Lock,
  Unlock,
  Archive,
  ArrowRight
} from 'lucide-react';
import { 
  createCategory, 
  updateCategory, 
  deleteCategory, 
  reorderCategories,
  createTrackInDb, 
  updateTrackInDb, 
  deleteTrackInDb, 
  reorderTracksInDb,
  createModuleInDb, 
  updateModuleInDb, 
  deleteModuleInDb, 
  reorderModulesInDb,
  createLessonInDb, 
  updateLessonInDb, 
  deleteLessonInDb, 
  reorderLessonsInDb,
  seedDefaultTracksToFirestore,
  slugify
} from '../../services/cmsService';
import { getTrackTheme } from '../../data/trackThemes';

type ActiveViewMode = 'tree' | 'categories' | 'tracks' | 'modules-lessons';

export const AdminContentCMSView: React.FC = () => {
  const { 
    rawTracks, 
    categories, 
    refreshContent, 
    contentLoading,
    currentUser,
    navigateToLesson,
    navigateToTrack
  } = useAcademy();

  // Navigation & View States
  const [viewMode, setViewMode] = useState<ActiveViewMode>('tree');
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ContentStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedTrackId, setSelectedTrackId] = useState<string>('');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');

  // Expanded Tree Nodes
  const [expandedTracks, setExpandedTracks] = useState<Record<string, boolean>>({});
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  // Loading & Notification Feedback
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals
  const [categoryModal, setCategoryModal] = useState<{ open: boolean; item?: CategoryItem | null }>({ open: false });
  const [trackModal, setTrackModal] = useState<{ open: boolean; item?: Track | null }>({ open: false });
  const [moduleModal, setModuleModal] = useState<{ open: boolean; trackId: string; item?: Module | null }>({ open: false, trackId: '' });
  const [lessonModal, setLessonModal] = useState<{ open: boolean; trackId: string; moduleId: string; item?: Lesson | null }>({ open: false, trackId: '', moduleId: '' });
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    open: boolean;
    type: 'category' | 'track' | 'module' | 'lesson';
    id: string;
    title: string;
    parentTrackId?: string;
    parentModuleId?: string;
  }>({ open: false, type: 'category', id: '', title: '' });

  // Auto-select first track when rawTracks load
  useEffect(() => {
    if (rawTracks.length > 0 && !selectedTrackId) {
      setSelectedTrackId(rawTracks[0].id);
      // Auto expand first track
      setExpandedTracks({ [rawTracks[0].id]: true });
    }
  }, [rawTracks, selectedTrackId]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const toggleTrackExpand = (trackId: string) => {
    setExpandedTracks(prev => ({ ...prev, [trackId]: !prev[trackId] }));
  };

  const toggleModuleExpand = (moduleId: string) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  // Metrics computation
  const totalCategoriesCount = categories.length;
  const totalTracksCount = rawTracks.length;
  const totalModulesCount = useMemo(() => {
    return rawTracks.reduce((acc, t) => acc + (t.modules?.length || 0), 0);
  }, [rawTracks]);
  const totalLessonsCount = useMemo(() => {
    return rawTracks.reduce((acc, t) => {
      return acc + (t.modules?.reduce((mAcc, m) => mAcc + (m.lessons?.length || 0), 0) || 0);
    }, 0);
  }, [rawTracks]);

  const publishedTracksCount = rawTracks.filter(t => t.status === 'published' || t.status === undefined).length;
  const draftTracksCount = rawTracks.filter(t => t.status === 'draft').length;

  // Filtered tracks for search & filters
  const filteredTracks = useMemo(() => {
    return rawTracks.filter(t => {
      if (categoryFilter !== 'all' && t.category !== categoryFilter && t.categoryId !== categoryFilter) {
        return false;
      }
      if (statusFilter !== 'all') {
        const currentStatus = t.status || 'published';
        if (currentStatus !== statusFilter) return false;
      }
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        const matchesTrack = t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
        const matchesModule = t.modules?.some(m => m.title.toLowerCase().includes(q) || m.lessons?.some(l => l.title.toLowerCase().includes(q)));
        if (!matchesTrack && !matchesModule) return false;
      }
      return true;
    });
  }, [rawTracks, categoryFilter, statusFilter, searchFilter]);

  // Selected Track object
  const currentSelectedTrack = useMemo(() => {
    return rawTracks.find(t => t.id === selectedTrackId) || rawTracks[0];
  }, [rawTracks, selectedTrackId]);

  // ==========================================
  // HANDLERS: CATEGORIES
  // ==========================================
  const handleSaveCategory = async (data: Partial<CategoryItem>) => {
    try {
      setIsActionLoading(true);
      if (categoryModal.item?.id) {
        await updateCategory(categoryModal.item.id, data, currentUser?.uid);
        showToast('Categoria atualizada com sucesso!');
      } else {
        await createCategory(data, currentUser?.uid);
        showToast('Nova categoria criada com sucesso!');
      }
      setCategoryModal({ open: false });
      await refreshContent();
    } catch (err: any) {
      showToast(`Erro ao salvar categoria: ${err.message || 'Falha na operação.'}`, 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleMoveCategory = async (categoryId: string, direction: 'up' | 'down') => {
    const sorted = [...categories].sort((a, b) => a.order - b.order);
    const index = sorted.findIndex(c => c.id === categoryId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sorted.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const itemA = sorted[index];
    const itemB = sorted[targetIndex];

    const newOrderA = itemB.order;
    const newOrderB = itemA.order === itemB.order ? (direction === 'up' ? itemB.order + 1 : itemB.order - 1) : itemA.order;

    try {
      setIsActionLoading(true);
      await reorderCategories([
        { id: itemA.id, order: newOrderA },
        { id: itemB.id, order: newOrderB }
      ], currentUser?.uid);
      await refreshContent();
      showToast('Ordem das categorias atualizada!');
    } catch (err: any) {
      showToast(`Erro ao reordenar: ${err.message}`, 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // ==========================================
  // HANDLERS: TRACKS (COURSES)
  // ==========================================
  const handleSaveTrack = async (data: Partial<Track>) => {
    try {
      setIsActionLoading(true);
      if (trackModal.item?.id) {
        await updateTrackInDb(trackModal.item.id, data, currentUser?.uid);
        showToast('Trilha atualizada com sucesso!');
      } else {
        await createTrackInDb(data, currentUser?.uid);
        showToast('Nova trilha criada com sucesso no catálogo!');
      }
      setTrackModal({ open: false });
      await refreshContent();
    } catch (err: any) {
      showToast(`Erro ao salvar trilha: ${err.message || 'Falha na operação.'}`, 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleMoveTrack = async (trackId: string, direction: 'up' | 'down') => {
    const sorted = [...rawTracks].sort((a, b) => (a.order || 0) - (b.order || 0));
    const index = sorted.findIndex(t => t.id === trackId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sorted.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const itemA = sorted[index];
    const itemB = sorted[targetIndex];

    try {
      setIsActionLoading(true);
      await reorderTracksInDb([
        { id: itemA.id, order: (itemB.order || 0) },
        { id: itemB.id, order: (itemA.order || 0) }
      ], currentUser?.uid);
      await refreshContent();
      showToast('Ordem das trilhas atualizada!');
    } catch (err: any) {
      showToast(`Erro ao reordenar trilha: ${err.message}`, 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleToggleTrackStatus = async (track: Track) => {
    const newStatus: ContentStatus = (track.status === 'published' || !track.status) ? 'draft' : 'published';
    try {
      setIsActionLoading(true);
      await updateTrackInDb(track.id, { status: newStatus }, currentUser?.uid);
      await refreshContent();
      showToast(`Trilha "${track.title}" alterada para ${newStatus === 'published' ? 'Publicada' : 'Rascunho'}.`);
    } catch (err: any) {
      showToast(`Erro ao alterar status: ${err.message}`, 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // ==========================================
  // HANDLERS: MODULES
  // ==========================================
  const handleSaveModule = async (data: Partial<Module>) => {
    try {
      setIsActionLoading(true);
      const trackId = moduleModal.trackId;
      if (moduleModal.item?.id) {
        await updateModuleInDb(trackId, moduleModal.item.id, data, currentUser?.uid);
        showToast('Módulo atualizado com sucesso!');
      } else {
        await createModuleInDb(trackId, data, currentUser?.uid);
        showToast('Novo módulo adicionado à trilha!');
      }
      setModuleModal({ open: false, trackId: '' });
      await refreshContent();
    } catch (err: any) {
      showToast(`Erro ao salvar módulo: ${err.message}`, 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleMoveModule = async (trackId: string, moduleId: string, direction: 'up' | 'down') => {
    const track = rawTracks.find(t => t.id === trackId);
    if (!track || !track.modules) return;
    const sorted = [...track.modules].sort((a, b) => (a.orderNumber || 0) - (b.orderNumber || 0));
    const index = sorted.findIndex(m => m.id === moduleId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sorted.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const itemA = sorted[index];
    const itemB = sorted[targetIndex];

    try {
      setIsActionLoading(true);
      await reorderModulesInDb(trackId, [
        { id: itemA.id, order: itemB.orderNumber || (targetIndex + 1) },
        { id: itemB.id, order: itemA.orderNumber || (index + 1) }
      ], currentUser?.uid);
      await refreshContent();
      showToast('Ordem dos módulos atualizada!');
    } catch (err: any) {
      showToast(`Erro ao reordenar módulo: ${err.message}`, 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // ==========================================
  // HANDLERS: LESSONS
  // ==========================================
  const handleSaveLesson = async (data: Partial<Lesson>) => {
    try {
      setIsActionLoading(true);
      const { trackId, moduleId } = lessonModal;
      if (lessonModal.item?.id) {
        await updateLessonInDb(trackId, moduleId, lessonModal.item.id, data, currentUser?.uid);
        showToast('Aula atualizada com sucesso!');
      } else {
        await createLessonInDb(trackId, moduleId, data, currentUser?.uid);
        showToast('Nova aula criada com sucesso!');
      }
      setLessonModal({ open: false, trackId: '', moduleId: '' });
      await refreshContent();
    } catch (err: any) {
      showToast(`Erro ao salvar aula: ${err.message}`, 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleMoveLesson = async (trackId: string, moduleId: string, lessonId: string, direction: 'up' | 'down') => {
    const track = rawTracks.find(t => t.id === trackId);
    const mod = track?.modules?.find(m => m.id === moduleId);
    if (!mod || !mod.lessons) return;
    const sorted = [...mod.lessons].sort((a, b) => (a.order || 0) - (b.order || 0));
    const index = sorted.findIndex(l => l.id === lessonId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sorted.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const itemA = sorted[index];
    const itemB = sorted[targetIndex];

    try {
      setIsActionLoading(true);
      await reorderLessonsInDb(trackId, moduleId, [
        { id: itemA.id, order: itemB.order || (targetIndex + 1) },
        { id: itemB.id, order: itemA.order || (index + 1) }
      ], currentUser?.uid);
      await refreshContent();
      showToast('Ordem das aulas atualizada!');
    } catch (err: any) {
      showToast(`Erro ao reordenar aula: ${err.message}`, 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // ==========================================
  // HANDLERS: DELETE CONFIRMATION
  // ==========================================
  const handleConfirmDelete = async () => {
    const { type, id, parentTrackId, parentModuleId } = deleteConfirmModal;
    try {
      setIsActionLoading(true);
      if (type === 'category') {
        await deleteCategory(id, currentUser?.uid);
        showToast('Categoria excluída com sucesso.');
      } else if (type === 'track') {
        await deleteTrackInDb(id, currentUser?.uid);
        showToast('Trilha excluída com sucesso.');
      } else if (type === 'module' && parentTrackId) {
        await deleteModuleInDb(parentTrackId, id, currentUser?.uid);
        showToast('Módulo excluído com sucesso.');
      } else if (type === 'lesson' && parentTrackId && parentModuleId) {
        await deleteLessonInDb(parentTrackId, parentModuleId, id, currentUser?.uid);
        showToast('Aula excluída com sucesso.');
      }
      setDeleteConfirmModal({ open: false, type: 'category', id: '', title: '' });
      await refreshContent();
    } catch (err: any) {
      showToast(`Erro ao excluir: ${err.message}`, 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // ==========================================
  // HANDLER: SEED / SYNC DEFAULT CATALOG
  // ==========================================
  const handleSyncDefaults = async () => {
    if (!window.confirm('Deseja sincronizar todas as trilhas e categorias padrão com o Firestore? Conteúdos existentes serão preservados/atualizados.')) {
      return;
    }
    try {
      setIsActionLoading(true);
      await seedDefaultTracksToFirestore(currentUser?.uid);
      await refreshContent();
      showToast('Catálogo padrão sincronizado com sucesso no Firestore!');
    } catch (err: any) {
      showToast(`Erro na sincronização: ${err.message}`, 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl bg-slate-900 text-white text-xs font-medium border border-slate-700/80">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
          <button 
            onClick={() => setToastMessage(null)}
            className="p-1 text-slate-400 hover:text-white rounded-md"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
              CMS Administrativo
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Conteúdo Dinâmico Firestore
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Gerenciamento de Conteúdo da MegaZap Academy
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Crie, edite, reorganize e publique categorias, trilhas de capacitação, módulos e aulas completas diretamente pelo painel.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={refreshContent}
            disabled={contentLoading || isActionLoading}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Atualizar dados do Firestore"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${contentLoading || isActionLoading ? 'animate-spin text-sky-600' : ''}`} />
            <span>Atualizar</span>
          </button>

          <button
            type="button"
            onClick={handleSyncDefaults}
            disabled={isActionLoading}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 hover:bg-amber-100 border border-amber-200 dark:border-amber-900/60 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Popular Firestore com o catálogo padrão inicial"
          >
            <Database className="w-3.5 h-3.5 text-amber-600" />
            <span>Sincronizar Catálogo Base</span>
          </button>

          <button
            type="button"
            onClick={() => setTrackModal({ open: true, item: null })}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-sm shadow-sky-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Trilha</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold">Categorias</span>
            <FolderTree className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {totalCategoriesCount}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Eixos temáticos ativos
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold">Trilhas (Cursos)</span>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {totalTracksCount}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">
            {publishedTracksCount} publicadas • {draftTracksCount} rascunhos
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold">Módulos</span>
            <BookOpen className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {totalModulesCount}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Etapas estruturadas
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold">Aulas & Vídeos</span>
            <Film className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {totalLessonsCount}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Aulas interativas prontas
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          {/* Main View Mode Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('tree')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'tree'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>Hierarquia Completa</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('categories')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'categories'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Categorias ({categories.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('tracks')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'tracks'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Trilhas ({rawTracks.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('modules-lessons')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'modules-lessons'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Módulos & Aulas</span>
            </button>
          </div>

          {/* Quick Add Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCategoryModal({ open: true, item: null })}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-sky-600" />
              <span>Nova Categoria</span>
            </button>

            <button
              type="button"
              onClick={() => setTrackModal({ open: true, item: null })}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 hover:bg-sky-100 border border-sky-200 dark:border-sky-800 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-sky-600" />
              <span>Nova Trilha</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filtrar por nome de trilha, módulo ou aula..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-sky-500 text-slate-900 dark:text-white"
            />
            {searchFilter && (
              <button 
                onClick={() => setSearchFilter('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="all">Todas as Categorias</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="all">Todos os Status</option>
              <option value="published">Publicados</option>
              <option value="draft">Rascunhos</option>
              <option value="archived">Arquivados</option>
            </select>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* VIEW 1: FULL HIERARCHY TREE (Categorias -> Trilhas -> Módulos -> Aulas) */}
      {/* ============================================================== */}
      {viewMode === 'tree' && (
        <div className="space-y-4">
          {filteredTracks.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-8 text-center">
              <Layers className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Nenhum conteúdo encontrado</h3>
              <p className="text-xs text-slate-500 mt-1">Tente ajustar os filtros de busca ou crie uma nova trilha.</p>
            </div>
          ) : (
            filteredTracks.map((track, trackIndex) => {
              const isExpanded = !!expandedTracks[track.id];
              const theme = getTrackTheme(track.id);
              const modules = track.modules || [];
              const lessonsCount = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);

              return (
                <div 
                  key={track.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden transition-all"
                >
                  {/* Track Header Line */}
                  <div className="p-4 sm:p-5 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800/60">
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={() => toggleTrackExpand(track.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title={isExpanded ? 'Recolher trilha' : 'Expandir módulos e aulas'}
                      >
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>

                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${theme.iconBg} ${theme.iconBorder} border shrink-0`}>
                        {theme.renderIcon('w-4 h-4')}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {track.title}
                          </h3>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            track.status === 'published' || !track.status
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : track.status === 'draft'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {track.status === 'published' || !track.status ? 'Publicada' : track.status === 'draft' ? 'Rascunho' : 'Arquivada'}
                          </span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {track.category}
                          </span>
                          {track.certificateAvailable && (
                            <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                              <Award className="w-3 h-3" />
                              Certificado
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {track.shortDescription || track.description}
                        </p>
                      </div>
                    </div>

                    {/* Track Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="hidden sm:inline-block text-xs text-slate-400 mr-2">
                        {modules.length} {modules.length === 1 ? 'módulo' : 'módulos'} • {lessonsCount} aulas
                      </span>

                      {/* Reorder Up / Down */}
                      <button
                        type="button"
                        onClick={() => handleMoveTrack(track.id, 'up')}
                        disabled={trackIndex === 0 || isActionLoading}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                        title="Mover Trilha para Cima"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMoveTrack(track.id, 'down')}
                        disabled={trackIndex === filteredTracks.length - 1 || isActionLoading}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                        title="Mover Trilha para Baixo"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Toggle Quick Status */}
                      <button
                        type="button"
                        onClick={() => handleToggleTrackStatus(track)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          track.status === 'published' || !track.status
                            ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
                            : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        title={track.status === 'published' ? 'Desativar / Mudar para Rascunho' : 'Publicar Trilha'}
                      >
                        {track.status === 'published' || !track.status ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>

                      {/* Add Module inside this Track */}
                      <button
                        type="button"
                        onClick={() => setModuleModal({ open: true, trackId: track.id, item: null })}
                        className="p-1.5 text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/50 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                        title="Adicionar Módulo nesta Trilha"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">Módulo</span>
                      </button>

                      {/* Edit Track */}
                      <button
                        type="button"
                        onClick={() => setTrackModal({ open: true, item: track })}
                        className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-sky-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Editar Trilha"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Track */}
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmModal({
                          open: true,
                          type: 'track',
                          id: track.id,
                          title: track.title
                        })}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                        title="Excluir Trilha"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Modules and Lessons */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 space-y-3.5 bg-slate-50/30 dark:bg-slate-900/40">
                      {modules.length === 0 ? (
                        <div className="p-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                          <p className="text-xs text-slate-400">Esta trilha ainda não possui módulos.</p>
                          <button
                            type="button"
                            onClick={() => setModuleModal({ open: true, trackId: track.id, item: null })}
                            className="mt-2 text-xs font-semibold text-sky-600 hover:underline"
                          >
                            + Criar primeiro módulo
                          </button>
                        </div>
                      ) : (
                        modules.map((mod, modIndex) => {
                          const isModExpanded = expandedModules[mod.id] !== false; // default expanded in view
                          const lessons = mod.lessons || [];

                          return (
                            <div 
                              key={mod.id}
                              className="bg-white dark:bg-slate-900/80 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs"
                            >
                              {/* Module Header */}
                              <div className="p-3 sm:p-3.5 flex items-center justify-between gap-3 bg-slate-100/60 dark:bg-slate-800/50">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <button
                                    type="button"
                                    onClick={() => toggleModuleExpand(mod.id)}
                                    className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                  >
                                    {isModExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                  </button>

                                  <div className="w-6 h-6 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-bold text-xs flex items-center justify-center shrink-0">
                                    {mod.orderNumber || (modIndex + 1)}
                                  </div>

                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                                        {mod.title}
                                      </h4>
                                      <span className="text-[10px] text-slate-400">
                                        ({lessons.length} {lessons.length === 1 ? 'aula' : 'aulas'})
                                      </span>
                                    </div>
                                    {mod.description && (
                                      <p className="text-[11px] text-slate-400 truncate">
                                        {mod.description}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* Module Action buttons */}
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleMoveModule(track.id, mod.id, 'up')}
                                    disabled={modIndex === 0 || isActionLoading}
                                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded disabled:opacity-30 cursor-pointer"
                                    title="Mover Módulo para Cima"
                                  >
                                    <MoveUp className="w-3 h-3" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleMoveModule(track.id, mod.id, 'down')}
                                    disabled={modIndex === modules.length - 1 || isActionLoading}
                                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded disabled:opacity-30 cursor-pointer"
                                    title="Mover Módulo para Baixo"
                                  >
                                    <MoveDown className="w-3 h-3" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setLessonModal({ open: true, trackId: track.id, moduleId: mod.id, item: null })}
                                    className="px-2 py-1 text-[11px] font-semibold text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/50 rounded flex items-center gap-1 cursor-pointer"
                                    title="Criar Aula neste Módulo"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>Aula</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setModuleModal({ open: true, trackId: track.id, item: mod })}
                                    className="p-1 text-slate-400 hover:text-sky-600 rounded"
                                    title="Editar Módulo"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setDeleteConfirmModal({
                                      open: true,
                                      type: 'module',
                                      id: mod.id,
                                      title: mod.title,
                                      parentTrackId: track.id
                                    })}
                                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                    title="Excluir Módulo"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>

                              {/* Lessons Table in Module */}
                              {isModExpanded && (
                                <div className="p-2 sm:p-3 divide-y divide-slate-100 dark:divide-slate-800/80">
                                  {lessons.length === 0 ? (
                                    <div className="py-3 text-center text-slate-400 text-xs">
                                      Nenhuma aula cadastrada neste módulo.
                                      <button
                                        type="button"
                                        onClick={() => setLessonModal({ open: true, trackId: track.id, moduleId: mod.id, item: null })}
                                        className="ml-2 text-sky-600 hover:underline font-semibold"
                                      >
                                        + Adicionar Aula
                                      </button>
                                    </div>
                                  ) : (
                                    lessons.map((lesson, lessonIndex) => (
                                      <div 
                                        key={lesson.id}
                                        className="py-2 px-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-lg transition-colors group"
                                      >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                          <div className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:text-sky-600 shrink-0">
                                            <Video className="w-3.5 h-3.5" />
                                          </div>

                                          <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                                                {lesson.title}
                                              </span>
                                              <span className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0">
                                                <Clock className="w-2.5 h-2.5" />
                                                {lesson.duration}
                                              </span>
                                              {lesson.featured && (
                                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                                  Destaque
                                                </span>
                                              )}
                                              {lesson.isLocked && (
                                                <Lock className="w-3 h-3 text-slate-400" />
                                              )}
                                            </div>
                                            <p className="text-[11px] text-slate-400 truncate max-w-xl">
                                              {lesson.description}
                                            </p>
                                          </div>
                                        </div>

                                        {/* Lesson Actions */}
                                        <div className="flex items-center gap-1 shrink-0">
                                          <button
                                            type="button"
                                            onClick={() => handleMoveLesson(track.id, mod.id, lesson.id, 'up')}
                                            disabled={lessonIndex === 0 || isActionLoading}
                                            className="p-1 text-slate-300 hover:text-slate-700 dark:hover:text-slate-200 rounded disabled:opacity-20 cursor-pointer"
                                            title="Mover Aula para Cima"
                                          >
                                            <MoveUp className="w-3 h-3" />
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() => handleMoveLesson(track.id, mod.id, lesson.id, 'down')}
                                            disabled={lessonIndex === lessons.length - 1 || isActionLoading}
                                            className="p-1 text-slate-300 hover:text-slate-700 dark:hover:text-slate-200 rounded disabled:opacity-20 cursor-pointer"
                                            title="Mover Aula para Baixo"
                                          >
                                            <MoveDown className="w-3 h-3" />
                                          </button>

                                          {/* Preview Lesson in Student Player */}
                                          <button
                                            type="button"
                                            onClick={() => navigateToLesson(lesson.id, track.id)}
                                            className="p-1 text-slate-400 hover:text-sky-600 rounded"
                                            title="Visualizar no Player de Aula"
                                          >
                                            <ExternalLink className="w-3 h-3" />
                                          </button>

                                          {/* Edit Lesson */}
                                          <button
                                            type="button"
                                            onClick={() => setLessonModal({
                                              open: true,
                                              trackId: track.id,
                                              moduleId: mod.id,
                                              item: lesson
                                            })}
                                            className="p-1 text-slate-400 hover:text-sky-600 rounded"
                                            title="Editar Aula"
                                          >
                                            <Edit3 className="w-3 h-3" />
                                          </button>

                                          {/* Delete Lesson */}
                                          <button
                                            type="button"
                                            onClick={() => setDeleteConfirmModal({
                                              open: true,
                                              type: 'lesson',
                                              id: lesson.id,
                                              title: lesson.title,
                                              parentTrackId: track.id,
                                              parentModuleId: mod.id
                                            })}
                                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                            title="Excluir Aula"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 2: CATEGORIES MANAGEMENT */}
      {/* ============================================================== */}
      {viewMode === 'categories' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Categorias & Eixos Temáticos
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Organizam as trilhas de capacitação no catálogo da plataforma.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCategoryModal({ open: true, item: null })}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-600 text-white hover:bg-sky-700 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Categoria</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="pb-3 w-12 text-center">Ordem</th>
                  <th className="pb-3">Categoria</th>
                  <th className="pb-3">Descrição</th>
                  <th className="pb-3">Cor / Ícone</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {categories.sort((a, b) => a.order - b.order).map((cat, catIdx) => (
                  <tr key={cat.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 text-center font-bold text-slate-500">
                      {cat.order}
                    </td>
                    <td className="py-3.5 font-bold text-slate-900 dark:text-white">
                      {cat.name}
                    </td>
                    <td className="py-3.5 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                      {cat.description || '—'}
                    </td>
                    <td className="py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        <span className={`w-2.5 h-2.5 rounded-full bg-${cat.color || 'sky'}-500`} />
                        {cat.icon || 'layers'} ({cat.color || 'sky'})
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        cat.status === 'published'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {cat.status === 'published' ? 'Publicada' : 'Rascunho'}
                      </span>
                    </td>
                    <td className="py-3.5 text-right space-x-1">
                      <button
                        type="button"
                        onClick={() => handleMoveCategory(cat.id, 'up')}
                        disabled={catIdx === 0}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded disabled:opacity-30"
                        title="Subir Ordem"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveCategory(cat.id, 'down')}
                        disabled={catIdx === categories.length - 1}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded disabled:opacity-30"
                        title="Descer Ordem"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCategoryModal({ open: true, item: cat })}
                        className="p-1 text-slate-400 hover:text-sky-600 rounded"
                        title="Editar Categoria"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmModal({
                          open: true,
                          type: 'category',
                          id: cat.id,
                          title: cat.name
                        })}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        title="Excluir Categoria"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 3: TRACKS LIST VIEW */}
      {/* ============================================================== */}
      {viewMode === 'tracks' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Trilhas de Capacitação
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Cursos mestres disponíveis para os parceiros e alunos.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setTrackModal({ open: true, item: null })}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-600 text-white hover:bg-sky-700 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Trilha</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="pb-3 w-12 text-center">Ordem</th>
                  <th className="pb-3">Trilha</th>
                  <th className="pb-3">Categoria</th>
                  <th className="pb-3">Nível / Carga</th>
                  <th className="pb-3">Módulos / Aulas</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {rawTracks.sort((a, b) => (a.order || 0) - (b.order || 0)).map((track, tIdx) => {
                  const mCount = track.modules?.length || 0;
                  const lCount = track.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;

                  return (
                    <tr key={track.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 text-center font-bold text-slate-500">
                        {track.order || (tIdx + 1)}
                      </td>
                      <td className="py-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {track.title}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">
                          {track.shortDescription || track.description}
                        </div>
                      </td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                          {track.category}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-600 dark:text-slate-300">
                        <div>{track.level}</div>
                        <div className="text-[10px] text-slate-400">{track.estimatedHours}h estimadas</div>
                      </td>
                      <td className="py-3.5 text-slate-600 dark:text-slate-300">
                        {mCount} módulos • {lCount} aulas
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          track.status === 'published' || !track.status
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {track.status === 'published' || !track.status ? 'Publicada' : 'Rascunho'}
                        </span>
                      </td>
                      <td className="py-3.5 text-right space-x-1">
                        <button
                          type="button"
                          onClick={() => handleMoveTrack(track.id, 'up')}
                          disabled={tIdx === 0}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded disabled:opacity-30"
                          title="Subir Ordem"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveTrack(track.id, 'down')}
                          disabled={tIdx === rawTracks.length - 1}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded disabled:opacity-30"
                          title="Descer Ordem"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => navigateToTrack(track.id)}
                          className="p-1 text-slate-400 hover:text-sky-600 rounded"
                          title="Ver na visão do aluno"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setTrackModal({ open: true, item: track })}
                          className="p-1 text-slate-400 hover:text-sky-600 rounded"
                          title="Editar Trilha"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmModal({
                            open: true,
                            type: 'track',
                            id: track.id,
                            title: track.title
                          })}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="Excluir Trilha"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 4: MODULES & LESSONS FOCUSED EXPLORER */}
      {/* ============================================================== */}
      {viewMode === 'modules-lessons' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column: Track Selector */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2 mb-2">
              Selecione a Trilha
            </h3>
            <div className="space-y-1">
              {rawTracks.map(track => {
                const isSelected = track.id === selectedTrackId;
                const mCount = track.modules?.length || 0;
                return (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => setSelectedTrackId(track.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="truncate">{track.title}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${isSelected ? 'bg-sky-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                      {mCount} mod
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column (3 cols): Selected Track's Modules and Lessons */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {currentSelectedTrack?.title || 'Trilha Selecionada'}
                  </h2>
                  <span className="text-xs text-slate-400">
                    ({currentSelectedTrack?.modules?.length || 0} módulos)
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Gerencie módulos, vídeo-aulas, descrições e materiais de apoio.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModuleModal({ open: true, trackId: currentSelectedTrack?.id || '', item: null })}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-sky-600 text-white hover:bg-sky-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Módulo</span>
              </button>
            </div>

            {/* Modules List */}
            <div className="space-y-4">
              {(currentSelectedTrack?.modules || []).map((mod, modIdx) => (
                <div 
                  key={mod.id}
                  className="rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden"
                >
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-sky-600 text-white font-bold text-xs flex items-center justify-center">
                        {mod.orderNumber || (modIdx + 1)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {mod.title}
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          {mod.lessons?.length || 0} aulas cadastradas
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setLessonModal({ open: true, trackId: currentSelectedTrack.id, moduleId: mod.id, item: null })}
                        className="px-2.5 py-1 text-xs font-bold bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 rounded-lg hover:bg-sky-200 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Nova Aula</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setModuleModal({ open: true, trackId: currentSelectedTrack.id, item: mod })}
                        className="p-1 text-slate-400 hover:text-sky-600 rounded"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmModal({
                          open: true,
                          type: 'module',
                          id: mod.id,
                          title: mod.title,
                          parentTrackId: currentSelectedTrack.id
                        })}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Lessons */}
                  <div className="p-3 divide-y divide-slate-100 dark:divide-slate-800">
                    {(mod.lessons || []).map((lesson, lIdx) => (
                      <div key={lesson.id} className="py-2 px-2 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 font-mono text-[11px] w-4">{lIdx + 1}.</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">{lesson.title}</span>
                          <span className="text-[10px] text-slate-400">({lesson.duration})</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => navigateToLesson(lesson.id, currentSelectedTrack.id)}
                            className="p-1 text-slate-400 hover:text-sky-600 rounded"
                            title="Player da aula"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setLessonModal({ open: true, trackId: currentSelectedTrack.id, moduleId: mod.id, item: lesson })}
                            className="p-1 text-slate-400 hover:text-sky-600 rounded"
                            title="Editar aula"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmModal({
                              open: true,
                              type: 'lesson',
                              id: lesson.id,
                              title: lesson.title,
                              parentTrackId: currentSelectedTrack.id,
                              parentModuleId: mod.id
                            })}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            title="Excluir aula"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: CATEGORY FORM MODAL */}
      {/* ============================================================== */}
      {categoryModal.open && (
        <CategoryEditModal
          category={categoryModal.item}
          onClose={() => setCategoryModal({ open: false })}
          onSave={handleSaveCategory}
          isLoading={isActionLoading}
        />
      )}

      {/* ============================================================== */}
      {/* MODAL 2: TRACK FORM MODAL */}
      {/* ============================================================== */}
      {trackModal.open && (
        <TrackEditModal
          track={trackModal.item}
          categories={categories}
          onClose={() => setTrackModal({ open: false })}
          onSave={handleSaveTrack}
          isLoading={isActionLoading}
        />
      )}

      {/* ============================================================== */}
      {/* MODAL 3: MODULE FORM MODAL */}
      {/* ============================================================== */}
      {moduleModal.open && (
        <ModuleEditModal
          module={moduleModal.item}
          trackId={moduleModal.trackId}
          onClose={() => setModuleModal({ open: false, trackId: '' })}
          onSave={handleSaveModule}
          isLoading={isActionLoading}
        />
      )}

      {/* ============================================================== */}
      {/* MODAL 4: LESSON FORM MODAL */}
      {/* ============================================================== */}
      {lessonModal.open && (
        <LessonEditModal
          lesson={lessonModal.item}
          trackId={lessonModal.trackId}
          moduleId={lessonModal.moduleId}
          onClose={() => setLessonModal({ open: false, trackId: '', moduleId: '' })}
          onSave={handleSaveLesson}
          isLoading={isActionLoading}
        />
      )}

      {/* ============================================================== */}
      {/* MODAL 5: DELETE CONFIRMATION MODAL */}
      {/* ============================================================== */}
      {deleteConfirmModal.open && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteConfirmModal({ open: false, type: null, id: null, title: '' }); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
        >
          <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 cursor-default">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Confirmar Exclusão
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tem certeza que deseja remover {deleteConfirmModal.type === 'category' ? 'a categoria' : deleteConfirmModal.type === 'track' ? 'a trilha' : deleteConfirmModal.type === 'module' ? 'o módulo' : 'a aula'}{' '}
                <strong className="text-slate-800 dark:text-slate-200">"{deleteConfirmModal.title}"</strong>?
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmModal({ open: false, type: 'category', id: '', title: '' })}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isActionLoading}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm shadow-rose-600/30 cursor-pointer disabled:opacity-50"
              >
                {isActionLoading ? 'Excluindo...' : 'Sim, Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// =========================================================================
// SUB-COMPONENT: CATEGORY EDIT MODAL
// =========================================================================
interface CategoryEditModalProps {
  category?: CategoryItem | null;
  onClose: () => void;
  onSave: (data: Partial<CategoryItem>) => void;
  isLoading: boolean;
}

const CategoryEditModal: React.FC<CategoryEditModalProps> = ({ category, onClose, onSave, isLoading }) => {
  const [name, setName] = useState(category?.name || '');
  const [description, setDescription] = useState(category?.description || '');
  const [icon, setIcon] = useState(category?.icon || 'layers');
  const [color, setColor] = useState(category?.color || 'sky');
  const [order, setOrder] = useState<number>(category?.order || 1);
  const [status, setStatus] = useState<ContentStatus>(category?.status || 'published');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      description: description.trim(),
      icon,
      color,
      order: Number(order) || 1,
      status
    });
  };

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
    >
      <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 cursor-default">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {category ? 'Editar Categoria' : 'Nova Categoria'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nome da Categoria *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="ex: Inteligência Artificial MegaZap"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-sky-500 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Descrição
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Resumo do conteúdo desta categoria..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-sky-500 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cor Tema
              </label>
              <select
                value={color}
                onChange={e => setColor(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="sky">Azul Céu (Sky)</option>
                <option value="blue">Azul Escuro (Blue)</option>
                <option value="emerald">Verde Esmeralda (Emerald)</option>
                <option value="amber">Laranja / Âmbar (Amber)</option>
                <option value="purple">Roxo / Púrpura (Purple)</option>
                <option value="slate">Cinza Neutro (Slate)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Ícone Identificador
              </label>
              <select
                value={icon}
                onChange={e => setIcon(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="compass">Bússola (Compass)</option>
                <option value="message-square">Atendimento (MessageSquare)</option>
                <option value="git-branch">Automação (GitBranch)</option>
                <option value="megaphone">Marketing (Megaphone)</option>
                <option value="database">Cadastros (Database)</option>
                <option value="sparkles">JADI / IA (Sparkles)</option>
                <option value="shield-check">Administração (ShieldCheck)</option>
                <option value="layers">Camadas (Layers)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Ordem de Exibição
              </label>
              <input
                type="number"
                min={1}
                value={order}
                onChange={e => setOrder(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as ContentStatus)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="published">Publicado</option>
                <option value="draft">Rascunho</option>
                <option value="archived">Arquivado</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold disabled:opacity-50"
            >
              {isLoading ? 'Salvando...' : 'Salvar Categoria'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =========================================================================
// SUB-COMPONENT: TRACK EDIT MODAL
// =========================================================================
interface TrackEditModalProps {
  track?: Track | null;
  categories: CategoryItem[];
  onClose: () => void;
  onSave: (data: Partial<Track>) => void;
  isLoading: boolean;
}

const TrackEditModal: React.FC<TrackEditModalProps> = ({ track, categories, onClose, onSave, isLoading }) => {
  const [title, setTitle] = useState(track?.title || '');
  const [category, setCategory] = useState(track?.category || (categories[0]?.name || 'Primeiros Passos'));
  const [shortDescription, setShortDescription] = useState(track?.shortDescription || '');
  const [description, setDescription] = useState(track?.description || '');
  const [level, setLevel] = useState<LessonLevel>(track?.level || 'Iniciante');
  const [estimatedHours, setEstimatedHours] = useState<string>(track?.estimatedHours || '1h 30min');
  const [badgeColor, setBadgeColor] = useState(track?.badgeColor || 'sky');
  const [iconName, setIconName] = useState(track?.iconName || 'compass');
  const [certificateAvailable, setCertificateAvailable] = useState(track?.certificateAvailable ?? true);
  const [certificateName, setCertificateName] = useState(track?.certificateName || '');
  const [status, setStatus] = useState<ContentStatus>(track?.status || 'published');
  const [order, setOrder] = useState<number>(track?.order || 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      slug: track?.slug || slugify(title),
      category,
      categoryId: category.toLowerCase().replace(/\s+/g, '-'),
      shortDescription: shortDescription.trim(),
      description: description.trim(),
      level,
      estimatedHours: estimatedHours.trim() || '1h 30min',
      badgeColor,
      iconName,
      certificateAvailable,
      certificateName: certificateName.trim() || `Certificado de Especialista em ${title}`,
      status,
      order: Number(order) || 1,
    });
  };

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto cursor-pointer"
    >
      <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 my-8 cursor-default">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {track ? 'Editar Trilha de Capacitação' : 'Criar Nova Trilha'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs max-h-[75vh] overflow-y-auto pr-1">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Título da Trilha *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="ex: Automação e Chatbots com IA"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-sky-500 text-slate-900 dark:text-white font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Categoria *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nível de Dificuldade
              </label>
              <select
                value={level}
                onChange={e => setLevel(e.target.value as LessonLevel)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="Iniciante">Iniciante</option>
                <option value="Intermediário">Intermediário</option>
                <option value="Avançado">Avançado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Descrição Curta (Subtítulo do Card)
            </label>
            <input
              type="text"
              value={shortDescription}
              onChange={e => setShortDescription(e.target.value)}
              placeholder="ex: Aprenda a criar fluxos e respostas automáticas inteligentes"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Descrição Detalhada
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Visão completa dos objetivos e competências desenvolvidas nesta trilha..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Horas Estimadas
              </label>
              <input
                type="text"
                value={estimatedHours}
                onChange={e => setEstimatedHours(e.target.value)}
                placeholder="ex: 1h 30min"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cor do Badge
              </label>
              <select
                value={badgeColor}
                onChange={e => setBadgeColor(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="sky">Azul Céu (Sky)</option>
                <option value="amber">Âmbar (Amber)</option>
                <option value="emerald">Esmeralda (Emerald)</option>
                <option value="purple">Púrpura (Purple)</option>
                <option value="indigo">Índigo (Indigo)</option>
                <option value="slate">Grafite (Slate)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as ContentStatus)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold"
              >
                <option value="published">Publicada</option>
                <option value="draft">Rascunho</option>
                <option value="archived">Arquivada</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200">Emissão de Certificado</span>
              <input
                type="checkbox"
                checked={certificateAvailable}
                onChange={e => setCertificateAvailable(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded"
              />
            </div>
            {certificateAvailable && (
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1 text-[11px]">
                  Título no Certificado
                </label>
                <input
                  type="text"
                  value={certificateName}
                  onChange={e => setCertificateName(e.target.value)}
                  placeholder="ex: Especialista em Automação MegaZap"
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold disabled:opacity-50"
            >
              {isLoading ? 'Salvando...' : 'Salvar Trilha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =========================================================================
// SUB-COMPONENT: MODULE EDIT MODAL
// =========================================================================
interface ModuleEditModalProps {
  module?: Module | null;
  trackId: string;
  onClose: () => void;
  onSave: (data: Partial<Module>) => void;
  isLoading: boolean;
}

const ModuleEditModal: React.FC<ModuleEditModalProps> = ({ module, trackId, onClose, onSave, isLoading }) => {
  const [title, setTitle] = useState(module?.title || '');
  const [description, setDescription] = useState(module?.description || '');
  const [orderNumber, setOrderNumber] = useState<number>(module?.orderNumber || 1);
  const [status, setStatus] = useState<ContentStatus>(module?.status || 'published');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim(),
      orderNumber: Number(orderNumber) || 1,
      status
    });
  };

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
    >
      <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 cursor-default">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {module ? 'Editar Módulo' : 'Novo Módulo'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Título do Módulo *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="ex: Módulo 1: Visão Geral e Arquitetura"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Descrição do Módulo
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="O que o aluno aprenderá neste módulo..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Número de Ordem
              </label>
              <input
                type="number"
                min={1}
                value={orderNumber}
                onChange={e => setOrderNumber(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as ContentStatus)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="published">Publicado</option>
                <option value="draft">Rascunho</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold disabled:opacity-50"
            >
              {isLoading ? 'Salvando...' : 'Salvar Módulo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =========================================================================
// SUB-COMPONENT: LESSON EDIT MODAL (COMPREHENSIVE)
// =========================================================================
interface LessonEditModalProps {
  lesson?: Lesson | null;
  trackId: string;
  moduleId: string;
  onClose: () => void;
  onSave: (data: Partial<Lesson>) => void;
  isLoading: boolean;
}

const LessonEditModal: React.FC<LessonEditModalProps> = ({ lesson, trackId, moduleId, onClose, onSave, isLoading }) => {
  const [title, setTitle] = useState(lesson?.title || '');
  const [duration, setDuration] = useState(lesson?.duration || '12 min');
  const [durationSeconds, setDurationSeconds] = useState<number>(lesson?.durationSeconds || 720);
  const [videoUrl, setVideoUrl] = useState(lesson?.videoUrl || '');
  const [level, setLevel] = useState<LessonLevel>(lesson?.level || 'Iniciante');
  const [description, setDescription] = useState(lesson?.description || '');
  const [aboutText, setAboutText] = useState(lesson?.aboutText || '');
  const [previewMockupType, setPreviewMockupType] = useState<PreviewMockupType>(lesson?.previewMockupType || 'general');
  const [megaZapTip, setMegaZapTip] = useState(lesson?.megaZapTip || '');
  const [learningObjectivesText, setLearningObjectivesText] = useState((lesson?.learningObjectives || []).join('\n'));
  const [isLocked, setIsLocked] = useState(lesson?.isLocked || false);
  const [featured, setFeatured] = useState(lesson?.featured || false);
  const [status, setStatus] = useState<ContentStatus>(lesson?.status || 'published');
  const [order, setOrder] = useState<number>(lesson?.order || 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const objectives = learningObjectivesText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    onSave({
      title: title.trim(),
      slug: lesson?.slug || slugify(title),
      duration: duration.trim() || '10 min',
      durationSeconds: Number(durationSeconds) || 600,
      videoUrl: videoUrl.trim(),
      level,
      description: description.trim(),
      aboutText: aboutText.trim() || description.trim(),
      previewMockupType,
      megaZapTip: megaZapTip.trim(),
      learningObjectives: objectives,
      isLocked,
      featured,
      status,
      order: Number(order) || 1
    });
  };

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto cursor-pointer"
    >
      <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 my-8 cursor-default">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {lesson ? 'Editar Aula' : 'Nova Aula'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs max-h-[78vh] overflow-y-auto pr-1">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Título da Aula *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="ex: Como Configurar o Primeiro Fluxo de Mensagens"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Duração (Texto)
              </label>
              <input
                type="text"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                placeholder="ex: 12 min"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Segundos Totais
              </label>
              <input
                type="number"
                min={30}
                value={durationSeconds}
                onChange={e => setDurationSeconds(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mockup / Simulador
              </label>
              <select
                value={previewMockupType}
                onChange={e => setPreviewMockupType(e.target.value as PreviewMockupType)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="chat">Interface de Chat</option>
                <option value="flow">Editor de Fluxos</option>
                <option value="dashboard">Dashboard & Relatórios</option>
                <option value="campaign">Disparo de Campanhas</option>
                <option value="contacts">Gestão de Contatos</option>
                <option value="jadi">JADI Assistente IA</option>
                <option value="general">Geral / Vídeo Padrão</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              URL do Vídeo (YouTube, Vimeo ou MP4 direto)
            </label>
            <input
              type="text"
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... ou deixe vazio para usar simulador interativo"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono text-[11px]"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Resumo Curto
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Resumo em 1 linha que aparece na lista de aulas..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Sobre esta Aula (Texto Explicativo Completo)
            </label>
            <textarea
              rows={3}
              value={aboutText}
              onChange={e => setAboutText(e.target.value)}
              placeholder="Instruções completas, conceitos-chave e orientações ao aluno..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Dica de Ouro MegaZap (MegaZap Tip)
            </label>
            <input
              type="text"
              value={megaZapTip}
              onChange={e => setMegaZapTip(e.target.value)}
              placeholder="ex: Use o atalho /vendas para disparar uma resposta rápida..."
              className="w-full px-3 py-2 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Objetivos de Aprendizagem (1 por linha)
            </label>
            <textarea
              rows={3}
              value={learningObjectivesText}
              onChange={e => setLearningObjectivesText(e.target.value)}
              placeholder="Compreender a lógica do construtor de fluxos&#10;Criar menus de opções interativos&#10;Testar disparos em tempo real"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono text-[11px]"
            />
          </div>

          <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={e => setFeatured(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded"
              />
              <span className="font-semibold text-slate-700 dark:text-slate-300">Aula Destaque</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isLocked}
                onChange={e => setIsLocked(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded"
              />
              <span className="font-semibold text-slate-700 dark:text-slate-300">Bloqueada</span>
            </label>

            <div>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as ContentStatus)}
                className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold"
              >
                <option value="published">Publicada</option>
                <option value="draft">Rascunho</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold disabled:opacity-50"
            >
              {isLoading ? 'Salvando...' : 'Salvar Aula'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
