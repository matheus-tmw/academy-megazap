import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Play, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Compass, 
  MessageSquare, 
  GitBranch, 
  Megaphone, 
  Database, 
  Sparkles, 
  ShieldCheck,
  Layers
} from 'lucide-react';
import { useAcademy } from '../context/AcademyContext';
import { getTrackTheme } from '../data/trackThemes';

export const MeusTreinamentosView: React.FC = () => {
  const { 
    tracks, 
    getTrackProgress, 
    navigateToTrack,
    navigateTo 
  } = useAcademy();

  const [filterTab, setFilterTab] = useState<'todos' | 'andamento' | 'concluidos'>('todos');

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
    return tracks.filter(t => {
      const prog = getTrackProgress(t.id);
      if (filterTab === 'concluidos') return prog.isCompleted;
      if (filterTab === 'andamento') return prog.hasStarted && !prog.isCompleted;
      return true; // 'todos'
    });
  }, [tracks, filterTab, getTrackProgress]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Meus Treinamentos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Acompanhe suas trilhas de capacitação, histórico de estudo e próximos passos.
          </p>
        </div>

        <button
          onClick={() => navigateTo('catalogo')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/60 border border-sky-200 dark:border-sky-800 rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Ver catálogo completo</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/90 dark:border-slate-800 pb-3 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setFilterTab('todos')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-150 cursor-pointer ${
            filterTab === 'todos'
              ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30'
              : 'bg-white dark:bg-slate-900 hover:bg-sky-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-sky-800 dark:hover:text-sky-300 border border-slate-200/90 dark:border-slate-700/90 hover:border-sky-300 dark:hover:border-sky-700'
          }`}
        >
          Todos ({tracks.length})
        </button>

        <button
          onClick={() => setFilterTab('andamento')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-150 cursor-pointer ${
            filterTab === 'andamento'
              ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30'
              : 'bg-white dark:bg-slate-900 hover:bg-sky-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-sky-800 dark:hover:text-sky-300 border border-slate-200/90 dark:border-slate-700/90 hover:border-sky-300 dark:hover:border-sky-700'
          }`}
        >
          Em andamento ({tracks.filter(t => {
            const p = getTrackProgress(t.id);
            return p.hasStarted && !p.isCompleted;
          }).length})
        </button>

        <button
          onClick={() => setFilterTab('concluidos')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-150 cursor-pointer ${
            filterTab === 'concluidos'
              ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30'
              : 'bg-white dark:bg-slate-900 hover:bg-sky-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-sky-800 dark:hover:text-sky-300 border border-slate-200/90 dark:border-slate-700/90 hover:border-sky-300 dark:hover:border-sky-700'
          }`}
        >
          Concluídos ({tracks.filter(t => getTrackProgress(t.id).isCompleted).length})
        </button>
      </div>

      {/* Tracks List */}
      {filteredTracks.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
          <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Nenhum treinamento nesta categoria</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
            Você ainda não possui treinamentos com este status. Explore o catálogo para iniciar novas capacitações.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTracks.map((track) => {
            const prog = getTrackProgress(track.id);
            const totalLessons = track.modules.flatMap(m => m.lessons).length;
            const theme = getTrackTheme(track.id);

            return (
              <div
                key={track.id}
                id={`meus-treinamentos-card-${track.id}`}
                onClick={() => navigateToTrack(track.id)}
                className={`relative bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 ${theme.hoverBorder} rounded-2xl p-5 pt-6 shadow-xs ${theme.hoverShadow} hover:-translate-y-1 transition-all duration-200 cursor-pointer group flex flex-col justify-between overflow-hidden`}
              >
                {/* Top Theme Accent Bar */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 group-hover:h-2 ${theme.topBarColor} transition-all duration-200`} />

                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${theme.iconBg} border ${theme.iconBorder} group-hover:scale-110 group-hover:shadow-2xs transition-all duration-200`}>
                        {theme.renderIcon('w-5 h-5')}
                      </div>
                      <div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${theme.categoryText}`}>
                          {track.category}
                        </span>
                        <h3 className={`font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base ${theme.titleHover} transition-colors`}>
                          {track.title}
                        </h3>
                      </div>
                    </div>

                    {prog.isCompleted ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-full shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Concluído
                      </span>
                    ) : prog.percentage > 0 ? (
                      <span className={`text-[11px] font-bold ${theme.badgeText} ${theme.badgeBg} border ${theme.badgeBorder} px-2.5 py-1 rounded-full shrink-0`}>
                        {prog.percentage}%
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 px-2.5 py-1 rounded-full shrink-0">
                        0%
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {track.shortDescription}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>{prog.completedCount} de {totalLessons} aulas concluídas</span>
                    <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      {track.estimatedHours}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        prog.isCompleted ? 'bg-emerald-500' : theme.progressBar
                      }`}
                      style={{ width: `${prog.percentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Último acesso: {prog.hasStarted ? 'Recentemente' : 'Não iniciado'}
                    </span>

                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 font-bold text-sky-600 dark:text-sky-400 group-hover:text-sky-700 dark:group-hover:text-sky-300 transition-colors cursor-pointer"
                    >
                      <span>{prog.isCompleted ? 'Rever aulas' : prog.percentage > 0 ? 'Continuar' : 'Iniciar'}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
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
