import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowRight,
  Play, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  Award, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Compass, 
  MessageSquare, 
  GitBranch, 
  Megaphone, 
  Database, 
  ShieldCheck, 
  Share2,
  Lock
} from 'lucide-react';
import { useAcademy } from '../context/AcademyContext';
import { Lesson, Module } from '../types';

export const TrilhaDetalhesView: React.FC = () => {
  const { 
    currentTrack, 
    getTrackProgress, 
    navigateTo, 
    navigateToLesson, 
    isCompleted,
    getLessonProgress,
    openCertificate,
    getLessonDisplayDuration
  } = useAcademy();

  if (!currentTrack) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <p className="text-slate-600 dark:text-slate-300">Trilha não encontrada.</p>
        <button 
          onClick={() => navigateTo('catalogo')}
          className="mt-3 px-4 py-2 text-xs font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 rounded-lg cursor-pointer"
        >
          Voltar ao Catálogo
        </button>
      </div>
    );
  }

  const trackProgress = getTrackProgress(currentTrack.id);
  const totalLessons = currentTrack.modules.flatMap(m => m.lessons);

  // Find first uncompleted lesson for "Continuar treinamento"
  const firstUncompletedLesson = totalLessons.find(l => !isCompleted(l.id)) || totalLessons[0];

  // Accordion state: by default all modules expanded
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    currentTrack.modules.forEach(m => { map[m.id] = true; });
    return map;
  });

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const trackIconMap: Record<string, React.ReactNode> = {
    'primeiros-passos': <Compass className="w-6 h-6 text-sky-600 dark:text-sky-400" />,
    'atendimento': <MessageSquare className="w-6 h-6 text-sky-600 dark:text-sky-400" />,
    'automacao': <GitBranch className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
    'marketing': <Megaphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
    'cadastros': <Database className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
    'jadi': <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
    'administracao': <ShieldCheck className="w-6 h-6 text-slate-600 dark:text-slate-400" />,
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigateTo('catalogo')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar ao catálogo de treinamentos</span>
      </button>

      {/* Hero Track Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 border border-sky-200/80 dark:border-sky-800/80 rounded-md">
                {currentTrack.category}
              </span>
              <span className="px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-md">
                Nível {currentTrack.level}
              </span>
              {trackProgress.isCompleted && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-md">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Trilha Concluída
                </span>
              )}
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shrink-0 hidden sm:block">
                {trackIconMap[currentTrack.id] || <Compass className="w-7 h-7 text-sky-600 dark:text-sky-400" />}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  {currentTrack.title}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-2 max-w-2xl">
                  {currentTrack.description}
                </p>
              </div>
            </div>

            {/* Track Key Metrics */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                <span><strong className="text-slate-700 dark:text-slate-200">{currentTrack.modules.length}</strong> módulos</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Play className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                <span><strong className="text-slate-700 dark:text-slate-200">{totalLessons.length}</strong> aulas práticas</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                <span><strong className="text-slate-700 dark:text-slate-200">{currentTrack.estimatedHours}</strong> de duração</span>
              </div>
            </div>
          </div>

          {/* Right side Action Box */}
          <div className="lg:col-span-4 bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-5 space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-200">Progresso Geral</span>
                <span className="font-extrabold text-sky-700 dark:text-sky-400">{trackProgress.percentage}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-sky-600 rounded-full transition-all duration-300"
                  style={{ width: `${trackProgress.percentage}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                {trackProgress.completedCount} de {totalLessons.length} aulas concluídas
              </p>
            </div>

            <button
              type="button"
              id="trilha-continuar-btn"
              onClick={() => navigateToLesson(firstUncompletedLesson.id, currentTrack.id)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{trackProgress.percentage > 0 ? 'Continuar treinamento' : 'Iniciar treinamento'}</span>
            </button>

            {currentTrack.certificateAvailable && (
              <button
                type="button"
                id="trilha-ver-certificado-btn"
                onClick={() => openCertificate(currentTrack.id)}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                <Award className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>Visualizar Certificado Oficial</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MÓDULOS DA TRILHA */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Conteúdo Programático da Trilha
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {currentTrack.modules.length} módulos estruturados • {totalLessons.length} aulas práticas
            </p>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg self-start sm:self-auto font-medium">
            Clique no módulo para expandir ou recolher
          </span>
        </div>

        {/* Modules Accordion List */}
        <div className="space-y-4">
          {currentTrack.modules.map((moduleItem, modIndex) => {
            const isExpanded = expandedModules[moduleItem.id] ?? true;
            const moduleCompletedCount = moduleItem.lessons.filter(l => isCompleted(l.id)).length;
            const moduleIsFinished = moduleCompletedCount === moduleItem.lessons.length && moduleItem.lessons.length > 0;

            return (
              <div 
                key={moduleItem.id}
                className="bg-white dark:bg-slate-900 border-2 border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-700"
              >
                {/* Module Header Bar - Visual de Bloco Destacado */}
                <button
                  type="button"
                  id={`module-header-${moduleItem.id}`}
                  onClick={() => toggleModule(moduleItem.id)}
                  className={`w-full px-5 py-4 flex items-center justify-between text-left transition-colors cursor-pointer ${
                    isExpanded 
                      ? 'bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border-b-2 border-slate-200 dark:border-slate-700/80' 
                      : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100/70 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0 shadow-2xs ${
                      moduleIsFinished 
                        ? 'bg-emerald-500 text-white shadow-emerald-200 dark:shadow-emerald-950' 
                        : 'bg-slate-800 dark:bg-slate-700 text-white'
                    }`}>
                      {moduleIsFinished ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        `0${modIndex + 1}`
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="px-2 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wider bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 rounded-md">
                          MÓDULO {String(modIndex + 1).padStart(2, '0')}
                        </span>
                        {moduleIsFinished && (
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Módulo Concluído
                          </span>
                        )}
                      </div>
                      <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base truncate">
                        {moduleItem.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5 font-normal">
                        {moduleItem.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 pl-3">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs hidden sm:inline-block">
                      {moduleCompletedCount} / {moduleItem.lessons.length} aulas
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 shadow-2xs">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Lessons inside Module - Cards Individuais e Destacados */}
                {isExpanded && (
                  <div className="p-3 sm:p-4 bg-slate-100/50 dark:bg-slate-950/50 space-y-2.5">
                    {moduleItem.lessons.map((lesson, lessonIndex) => {
                      const completed = isCompleted(lesson.id);
                      const progress = getLessonProgress(lesson.id);

                      return (
                        <div
                          key={lesson.id}
                          id={`trilha-lesson-row-${lesson.id}`}
                          onClick={() => navigateToLesson(lesson.id, currentTrack.id)}
                          className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-sky-400 dark:hover:border-sky-500 hover:shadow-xs rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-150 cursor-pointer group"
                        >
                          <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                            {/* Icon status */}
                            <div className="shrink-0 mt-0.5 sm:mt-0">
                              {completed ? (
                                <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shadow-2xs" title="Aula concluída">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                </div>
                              ) : progress > 0 ? (
                                <div className="w-7 h-7 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 flex items-center justify-center text-[10px] font-bold shadow-2xs" title={`Progresso: ${progress}%`}>
                                  {progress}%
                                </div>
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-sky-600 dark:group-hover:bg-sky-600 group-hover:text-white text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors shadow-2xs" title="Iniciar aula">
                                  <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[10px] font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-1.5 py-0.2 rounded border border-sky-200/60 dark:border-sky-800/60">
                                  Aula {modIndex + 1}.{lessonIndex + 1}
                                </span>
                                {completed && (
                                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                    ✓ Concluída
                                  </span>
                                )}
                              </div>
                              <h4 className={`text-xs sm:text-sm font-bold truncate transition-colors ${
                                completed 
                                  ? 'text-slate-800 dark:text-slate-200' 
                                  : 'text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400'
                              }`}>
                                {lesson.title}
                              </h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5 font-normal">
                                {lesson.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                              {getLessonDisplayDuration(lesson) && (
                                <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200/80 dark:border-slate-700/80">
                                  <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                                  {getLessonDisplayDuration(lesson)}
                                </span>
                              )}
                              <span className="px-2 py-1 text-[10px] font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-md">
                                {lesson.level}
                              </span>
                            </div>

                            <button
                              type="button"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 group-hover:bg-sky-600 dark:group-hover:bg-sky-600 group-hover:text-white rounded-lg transition-all cursor-pointer"
                            >
                              <span>{completed ? 'Rever' : 'Assistir'}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
