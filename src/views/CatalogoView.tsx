import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Layers, 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  Compass,
  MessageSquare,
  GitBranch,
  Megaphone,
  Database,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { useAcademy } from '../context/AcademyContext';
import { TrackCategory, LessonLevel } from '../types';
import { getTrackTheme } from '../data/trackThemes';

export const CatalogoView: React.FC = () => {
  const { 
    tracks, 
    getTrackProgress, 
    navigateToTrack 
  } = useAcademy();

  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedLevel, setSelectedLevel] = useState<string>('Todos');
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'default' | 'lessons' | 'hours'>('default');

  const categories = [
    'Todas',
    'Primeiros Passos',
    'Atendimento',
    'Automação',
    'Marketing',
    'Cadastros',
    'JADI',
    'Administração'
  ];

  const trackIconMap: Record<string, React.ReactNode> = {
    'primeiros-passos': <Compass className="w-5 h-5 text-sky-600" />,
    'atendimento': <MessageSquare className="w-5 h-5 text-sky-600" />,
    'automacao': <GitBranch className="w-5 h-5 text-amber-600" />,
    'marketing': <Megaphone className="w-5 h-5 text-blue-600" />,
    'cadastros': <Database className="w-5 h-5 text-emerald-600" />,
    'jadi': <Sparkles className="w-5 h-5 text-purple-600" />,
    'administracao': <ShieldCheck className="w-5 h-5 text-slate-600" />,
  };

  const filteredTracks = useMemo(() => {
    return tracks.filter(track => {
      // Category filter
      if (selectedCategory !== 'Todas' && track.category !== selectedCategory) {
        return false;
      }
      // Level filter
      if (selectedLevel !== 'Todos' && track.level !== selectedLevel) {
        return false;
      }
      // Status filter
      const prog = getTrackProgress(track.id);
      if (selectedStatus === 'Concluídos' && !prog.isCompleted) return false;
      if (selectedStatus === 'Em andamento' && (!prog.hasStarted || prog.isCompleted)) return false;
      if (selectedStatus === 'Não iniciados' && prog.hasStarted) return false;

      // Text search
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        const matchesTitle = track.title.toLowerCase().includes(q);
        const matchesDesc = track.description.toLowerCase().includes(q) || track.shortDescription.toLowerCase().includes(q);
        const matchesModule = track.modules.some(m => 
          m.title.toLowerCase().includes(q) || 
          m.lessons.some(l => l.title.toLowerCase().includes(q))
        );
        if (!matchesTitle && !matchesDesc && !matchesModule) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'lessons') {
        const aCount = a.modules.flatMap(m => m.lessons).length;
        const bCount = b.modules.flatMap(m => m.lessons).length;
        return bCount - aCount;
      }
      return 0;
    });
  }, [tracks, selectedCategory, selectedLevel, selectedStatus, searchFilter, sortBy, getTrackProgress]);

  const resetFilters = () => {
    setSelectedCategory('Todas');
    setSelectedLevel('Todos');
    setSelectedStatus('Todos');
    setSearchFilter('');
    setSortBy('default');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Catálogo de Treinamentos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Explore todos os treinamentos e tutoriais disponíveis para parceiros MegaZap.
          </p>
        </div>

        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 self-start sm:self-auto">
          {filteredTracks.length} {filteredTracks.length === 1 ? 'trilha encontrada' : 'trilhas encontradas'}
        </span>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
        {/* Search input & Select dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search box */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="catalogo-search-input"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filtrar por nome de trilha, módulo ou aula..."
              className="w-full pl-9.5 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
          </div>

          {/* Level Filter */}
          <div className="sm:col-span-2">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer"
            >
              <option value="Todos">Nível: Todos</option>
              <option value="Iniciante">Iniciante</option>
              <option value="Intermediário">Intermediário</option>
              <option value="Avançado">Avançado</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer"
            >
              <option value="Todos">Status: Todos</option>
              <option value="Em andamento">Em andamento</option>
              <option value="Concluídos">Concluídos</option>
              <option value="Não iniciados">Não iniciados</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="sm:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer"
            >
              <option value="default">Ordem Padrão</option>
              <option value="lessons">Mais Aulas</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar text-xs">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30 border border-sky-600'
                    : 'bg-white dark:bg-slate-900 hover:bg-sky-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-sky-800 dark:hover:text-sky-300 border border-slate-200/90 dark:border-slate-700/90 hover:border-sky-300 dark:hover:border-sky-700 hover:shadow-2xs'
                }`}
              >
                {cat}
              </button>
            );
          })}

          {(selectedCategory !== 'Todas' || selectedLevel !== 'Todos' || selectedStatus !== 'Todos' || searchFilter) && (
            <button
              onClick={resetFilters}
              className="px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl font-semibold flex items-center gap-1 cursor-pointer transition-colors ml-auto shrink-0 border border-transparent hover:border-red-200 dark:hover:border-red-800"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Limpar filtros</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of Track Cards */}
      {filteredTracks.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
          <Layers className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Nenhum treinamento encontrado</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
            Não encontramos nenhuma trilha com os filtros selecionados. Tente ajustar os termos de pesquisa.
          </p>
          <button
            onClick={resetFilters}
            className="mt-4 px-4 py-2 text-xs font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/60 rounded-xl transition-colors cursor-pointer"
          >
            Restaurar todos os filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTracks.map((track) => {
            const prog = getTrackProgress(track.id);
            const totalLessons = track.modules.flatMap(m => m.lessons).length;
            const theme = getTrackTheme(track.id);

            return (
              <div
                key={track.id}
                id={`catalogo-track-card-${track.id}`}
                onClick={() => navigateToTrack(track.id)}
                className={`relative bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 ${theme.hoverBorder} rounded-2xl p-5 pt-6 shadow-xs ${theme.hoverShadow} hover:-translate-y-1 transition-all duration-200 cursor-pointer group flex flex-col justify-between overflow-hidden`}
              >
                {/* Top Theme Accent Bar */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 group-hover:h-2 ${theme.topBarColor} transition-all duration-200`} />

                <div>
                  {/* Top Bar inside card */}
                  <div className="flex items-center justify-between mb-3.5">
                    <div className={`p-3 rounded-xl ${theme.iconBg} border ${theme.iconBorder} group-hover:scale-110 group-hover:shadow-2xs transition-all duration-200`}>
                      {theme.renderIcon('w-6 h-6')}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 text-[10.5px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-md">
                        Nível {track.level}
                      </span>
                      {prog.isCompleted && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10.5px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          Concluído
                        </span>
                      )}
                    </div>
                  </div>

                  <span className={`text-[11px] font-bold uppercase tracking-wider ${theme.categoryText}`}>
                    {track.category}
                  </span>

                  <h3 className={`font-bold text-slate-900 dark:text-slate-100 text-base ${theme.titleHover} transition-colors mt-0.5 mb-2 leading-snug`}>
                    {track.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed mb-4">
                    {track.description}
                  </p>
                </div>

                {/* Bottom stats & Action */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      {track.modules.length} módulos • {totalLessons} aulas
                    </span>
                    <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      {track.estimatedHours}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        prog.isCompleted ? 'bg-emerald-500' : theme.progressBar
                      }`}
                      style={{ width: `${prog.percentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      {prog.completedCount} de {totalLessons} concluídas ({prog.percentage}%)
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateToTrack(track.id);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 group-hover:bg-sky-600 dark:group-hover:bg-sky-600 group-hover:text-white rounded-xl transition-all cursor-pointer shadow-2xs group-hover:shadow-xs"
                    >
                      <span>Ver treinamento</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
