import React from 'react';
import { 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  Award, 
  TrendingUp, 
  Calendar, 
  ArrowRight, 
  Sparkles,
  Compass,
  MessageSquare,
  GitBranch,
  Megaphone,
  Database,
  ShieldCheck
} from 'lucide-react';
import { useAcademy } from '../context/AcademyContext';

export const MeuProgressoView: React.FC = () => {
  const { 
    tracks, 
    getTrackProgress, 
    overallProgressPercentage, 
    totalCompletedLessonsCount, 
    totalLessonsCount,
    totalTrainingHoursFormatted,
    earnedCertificatesCount,
    navigateToTrack,
    openCertificate
  } = useAcademy();

  const trackIconMap: Record<string, React.ReactNode> = {
    'primeiros-passos': <Compass className="w-4 h-4 text-sky-600" />,
    'atendimento': <MessageSquare className="w-4 h-4 text-sky-600" />,
    'automacao': <GitBranch className="w-4 h-4 text-amber-600" />,
    'marketing': <Megaphone className="w-4 h-4 text-blue-600" />,
    'cadastros': <Database className="w-4 h-4 text-emerald-600" />,
    'jadi': <Sparkles className="w-4 h-4 text-purple-600" />,
    'administracao': <ShieldCheck className="w-4 h-4 text-slate-600" />,
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          Meu Progresso
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Acompanhe detalhadamente suas estatísticas de aprendizado e certificações conquistadas.
        </p>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Progresso Geral */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4.5 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Progresso Geral</span>
            <TrendingUp className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-1">
            {overallProgressPercentage}%
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {totalCompletedLessonsCount} de {totalLessonsCount} aulas finalizadas
          </p>
        </div>

        {/* Card 2: Aulas Concluídas */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4.5 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Aulas Concluídas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-1">
            {totalCompletedLessonsCount}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Módulos práticos finalizados
          </p>
        </div>

        {/* Card 3: Tempo de Treinamento */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4.5 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tempo de Estudo</span>
            <Clock className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-1">
            {totalTrainingHoursFormatted}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Horas acumuladas na plataforma
          </p>
        </div>

        {/* Card 4: Certificados */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4.5 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Certificados</span>
            <Award className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight mb-1">
            {earnedCertificatesCount}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {earnedCertificatesCount > 0 ? 'Conquistado e validado' : 'Conclua uma trilha'}
          </p>
        </div>
      </div>

      {/* SEÇÃO PROGRESSO POR TRILHA */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Progresso por Trilha de Aprendizado
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Status percentual de conclusão de cada uma das 7 trilhas oficiais.
          </p>
        </div>

        <div className="space-y-3">
          {tracks.map((track) => {
            const prog = getTrackProgress(track.id);
            const total = track.modules.flatMap(m => m.lessons).length;

            return (
              <div 
                key={track.id}
                id={`progress-track-row-${track.id}`}
                className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-850 hover:bg-slate-50/90 dark:hover:bg-slate-800/80 shadow-2xs hover:shadow-xs transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                      {trackIconMap[track.id] || <Compass className="w-4 h-4 text-sky-600 dark:text-sky-400" />}
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                        {track.title}
                      </h3>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {prog.completedCount} de {total} aulas concluídas
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                      {prog.percentage}%
                    </span>

                    {prog.isCompleted && track.certificateAvailable && (
                      <button
                        onClick={() => openCertificate(track.id)}
                        className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer"
                      >
                        Ver Certificado 🎓
                      </button>
                    )}

                    <button
                      onClick={() => navigateToTrack(track.id)}
                      className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Acessar</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-200/80 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      prog.isCompleted 
                        ? 'bg-emerald-500' 
                        : prog.percentage > 50 
                        ? 'bg-sky-600' 
                        : prog.percentage > 0 
                        ? 'bg-amber-500' 
                        : 'bg-transparent'
                    }`}
                    style={{ width: `${prog.percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
