import React from 'react';
import { 
  Play, 
  ArrowRight, 
  CheckCircle2, 
  Award, 
  Clock, 
  BookOpen, 
  Sparkles, 
  TrendingUp, 
  Layers, 
  Compass, 
  MessageSquare, 
  GitBranch, 
  Megaphone, 
  Database, 
  ShieldCheck,
  ChevronRight,
  Star
} from 'lucide-react';
import { useAcademy } from '../context/AcademyContext';
import { ALL_LESSONS, RECOMMENDED_LESSONS_IDS } from '../data/coursesData';
import { Track, Lesson } from '../types';
import { VideoThumbnail } from '../components/VideoThumbnail';
import { getTrackTheme } from '../data/trackThemes';

export const DashboardView: React.FC = () => {
  const { 
    userProfile, 
    tracks, 
    getTrackProgress, 
    overallProgressPercentage,
    totalCompletedLessonsCount,
    startedTracksCount,
    totalTrainingHoursFormatted,
    earnedCertificatesCount,
    navigateTo,
    navigateToTrack,
    navigateToLesson,
    isCompleted,
    isFavorite,
    toggleFavorite
  } = useAcademy();

  // Recommended lessons
  const recommendedLessons = ALL_LESSONS.filter(l => 
    RECOMMENDED_LESSONS_IDS.includes(l.id) || l.featured
  ).slice(0, 3);

  const trackIconMap: Record<string, React.ReactNode> = {
    'primeiros-passos': <Compass className="w-5 h-5 text-sky-600" />,
    'atendimento': <MessageSquare className="w-5 h-5 text-sky-600" />,
    'automacao': <GitBranch className="w-5 h-5 text-amber-600" />,
    'marketing': <Megaphone className="w-5 h-5 text-blue-600" />,
    'cadastros': <Database className="w-5 h-5 text-emerald-600" />,
    'jadi': <Sparkles className="w-5 h-5 text-purple-600" />,
    'administracao': <ShieldCheck className="w-5 h-5 text-slate-600" />,
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Olá, parceiro! 👋
            </h1>
            <span className="px-2 py-0.5 text-[11px] font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 border border-sky-200/80 dark:border-sky-800 rounded-md">
              White Label MegaZap
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Continue sua jornada de aprendizado e capacite sua equipe com os recursos oficiais do MegaZap.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="dashboard-cta-catalogo"
            onClick={() => navigateTo('catalogo')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Explorar Catálogo</span>
          </button>
        </div>
      </div>

      {/* Progress & Continue Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* CARD DE PROGRESSO GERAL (Lg: 5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Seu progresso geral
              </span>
              <span className="text-xs font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2.5 py-0.5 rounded-full border border-sky-200/80 dark:border-sky-800">
                {totalCompletedLessonsCount} aulas concluídas
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                {overallProgressPercentage}%
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                concluído da plataforma
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-5">
              <div 
                className="h-full bg-gradient-to-r from-sky-500 to-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(5, overallProgressPercentage)}%` }}
              />
            </div>
          </div>

          {/* Metrics summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-base font-extrabold text-slate-800 dark:text-slate-100 block">
                {startedTracksCount}
              </span>
              <span className="text-[10.5px] font-medium text-slate-500 dark:text-slate-400 leading-tight block">
                Trilhas iniciadas
              </span>
            </div>

            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-base font-extrabold text-slate-800 dark:text-slate-100 block">
                {totalCompletedLessonsCount}
              </span>
              <span className="text-[10.5px] font-medium text-slate-500 dark:text-slate-400 leading-tight block">
                Aulas concluídas
              </span>
            </div>

            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-base font-extrabold text-slate-800 dark:text-slate-100 block">
                {totalTrainingHoursFormatted}
              </span>
              <span className="text-[10.5px] font-medium text-slate-500 dark:text-slate-400 leading-tight block">
                Horas estudadas
              </span>
            </div>

            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 block">
                {earnedCertificatesCount}
              </span>
              <span className="text-[10.5px] font-medium text-slate-500 dark:text-slate-400 leading-tight block">
                Certificados
              </span>
            </div>
          </div>
        </div>

        {/* SEÇÃO CONTINUE DE ONDE PAROU (Lg: 7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
              </span>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Continue de onde parou
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              08:42 restantes
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-2">
            {/* Video Thumbnail with overlay play */}
            <div 
              onClick={() => navigateToLesson('aula-at-05', 'atendimento')}
              className="w-full sm:w-44 h-28 rounded-xl overflow-hidden bg-slate-900 relative group cursor-pointer shrink-0 border border-slate-200 dark:border-slate-700"
            >
              {(() => {
                const continueLesson = ALL_LESSONS.find(l => l.id === 'aula-at-05');
                return continueLesson ? (
                  <VideoThumbnail lesson={continueLesson} showPlayOverlay />
                ) : null;
              })()}
              <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-slate-900/80 backdrop-blur-xs text-[10px] font-medium text-white rounded z-10">
                08:42
              </div>
            </div>

            {/* Lesson details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-[11px] font-semibold text-sky-600 dark:text-sky-400 mb-1">
                <span>Atendimento</span>
                <span>•</span>
                <span className="text-slate-400 dark:text-slate-500">Gestão de conversas</span>
              </div>

              <h3 
                onClick={() => navigateToLesson('aula-at-05', 'atendimento')}
                className="text-base font-bold text-slate-900 dark:text-slate-100 hover:text-sky-600 dark:hover:text-sky-400 transition-colors cursor-pointer line-clamp-1 mb-1"
              >
                Como utilizar as Mensagens Rápidas
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
                Aprenda a cadastrar respostas com atalhos (/atalho) e variáveis dinâmicas de cliente para aumentar a velocidade da equipe.
              </p>

              {/* Progress bar in lesson */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-600 dark:bg-sky-500 rounded-full" style={{ width: '82%' }} />
                </div>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">82%</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 dark:text-slate-500">
              Último acesso: <strong className="text-slate-600 dark:text-slate-300">Hoje às 10:15</strong>
            </span>

            <button
              type="button"
              id="dashboard-continue-lesson-btn"
              onClick={() => navigateToLesson('aula-at-05', 'atendimento')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              <span>Continuar aula</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* SEÇÃO MEUS TREINAMENTOS */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Meus Treinamentos
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Trilhas de capacitação organizadas por área de atuação no MegaZap.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigateTo('meus-treinamentos')}
            className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 flex items-center gap-1 cursor-pointer"
          >
            <span>Ver todos</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tracks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tracks.slice(0, 6).map((track) => {
            const prog = getTrackProgress(track.id);
            const totalLessons = track.modules.flatMap(m => m.lessons).length;
            const theme = getTrackTheme(track.id);

            return (
              <div
                key={track.id}
                id={`dashboard-track-card-${track.id}`}
                onClick={() => navigateToTrack(track.id)}
                className={`relative bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 ${theme.hoverBorder} rounded-2xl p-4.5 pt-5.5 shadow-xs ${theme.hoverShadow} hover:-translate-y-1 transition-all duration-200 cursor-pointer group flex flex-col justify-between overflow-hidden`}
              >
                {/* Top Theme Accent Bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 group-hover:h-1.5 ${theme.topBarColor} transition-all duration-200`} />

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 rounded-xl ${theme.iconBg} border ${theme.iconBorder} group-hover:scale-110 group-hover:shadow-2xs transition-all duration-200`}>
                      {theme.renderIcon('w-5 h-5')}
                    </div>

                    {prog.isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Concluído
                      </span>
                    ) : prog.percentage > 0 ? (
                      <span className={`text-[11px] font-bold ${theme.badgeText} ${theme.badgeBg} border ${theme.badgeBorder} px-2.5 py-0.5 rounded-full`}>
                        {prog.percentage}% concluído
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 px-2.5 py-0.5 rounded-full">
                        Não iniciado
                      </span>
                    )}
                  </div>

                  <h3 className={`font-bold text-slate-900 dark:text-slate-100 text-sm ${theme.titleHover} transition-colors mb-1.5`}>
                    {track.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {track.shortDescription}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{track.modules.length} módulos • {totalLessons} aulas</span>
                    <span className="font-medium text-slate-600 dark:text-slate-300">{track.estimatedHours}</span>
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

                  <div className="flex items-center justify-end pt-1">
                    <span className="text-xs font-bold text-sky-600 dark:text-sky-400 group-hover:text-sky-700 dark:group-hover:text-sky-300 flex items-center gap-1">
                      <span>{prog.isCompleted ? 'Rever trilha' : prog.percentage > 0 ? 'Continuar' : 'Iniciar'}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SEÇÃO RECOMENDADOS PARA VOCÊ */}
      <div className="space-y-3 pt-2">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            Recomendados para Você
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Aulas selecionadas estrategicamente para acelerar sua implantação White Label.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendedLessons.map((lesson) => {
            const completed = isCompleted(lesson.id);
            const fav = isFavorite(lesson.id);

            return (
              <div
                key={lesson.id}
                id={`recommended-lesson-${lesson.id}`}
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs hover:shadow-xs transition-all group flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail */}
                  <div 
                    onClick={() => navigateToLesson(lesson.id, lesson.trackId)}
                    className="w-full h-36 bg-slate-900 relative cursor-pointer overflow-hidden"
                  >
                    <VideoThumbnail lesson={lesson} showPlayOverlay />

                    <div className="absolute top-2.5 left-2.5 z-10">
                      <span className="px-2 py-0.5 text-[10px] font-bold text-slate-800 dark:text-slate-100 bg-white/95 dark:bg-slate-900/90 backdrop-blur-xs rounded-md shadow-xs">
                        {lesson.category}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(lesson.id);
                      }}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white backdrop-blur-xs transition-colors cursor-pointer z-10"
                      aria-label="Favoritar"
                    >
                      <Star className={`w-3.5 h-3.5 ${fav ? 'fill-amber-400 text-amber-400' : 'text-white'}`} />
                    </button>

                    <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-slate-900/80 backdrop-blur-xs text-[10px] font-medium text-white rounded flex items-center gap-1 z-10">
                      <Clock className="w-3 h-3" />
                      {lesson.duration}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 mb-1">
                      <span>Nível {lesson.level}</span>
                      <span>•</span>
                      <span className="truncate">{lesson.moduleTitle}</span>
                    </div>

                    <h3 
                      onClick={() => navigateToLesson(lesson.id, lesson.trackId)}
                      className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm hover:text-sky-600 dark:hover:text-sky-400 transition-colors cursor-pointer line-clamp-2 mb-2"
                    >
                      {lesson.title}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {lesson.description}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 mt-2">
                  {completed ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Concluída
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                      Disponível
                    </span>
                  )}

                  <button
                    onClick={() => navigateToLesson(lesson.id, lesson.trackId)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 cursor-pointer"
                  >
                    <span>Acessar aula</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
