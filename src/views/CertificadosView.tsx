import React from 'react';
import { 
  Award, 
  CheckCircle2, 
  Lock, 
  Download, 
  ExternalLink, 
  ArrowRight, 
  ShieldCheck, 
  Calendar,
  Sparkles,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import { useAcademy } from '../context/AcademyContext';

export const CertificadosView: React.FC = () => {
  const { 
    tracks, 
    getTrackProgress, 
    openMasterCertificate, 
    navigateToTrack,
    overallProgressPercentage,
    totalCompletedLessonsCount,
    totalLessonsCount,
    userProfile 
  } = useAcademy();

  // Calculate overall progress across all tracks and lessons
  const totalTracksCount = tracks.length;
  const completedTracks = tracks.filter(t => getTrackProgress(t.id).isCompleted);
  const completedTracksCount = completedTracks.length;
  
  const isMasterUnlocked = completedTracksCount === totalTracksCount || overallProgressPercentage === 100;

  // Find first incomplete track to continue
  const firstIncompleteTrack = tracks.find(t => !getTrackProgress(t.id).isCompleted) || tracks[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
          <Award className="w-6 h-6 text-amber-500" />
          <span>Certificado Oficial MegaZap</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Certificação única e oficial de Formação Completa para Especialistas White Label MegaZap.
        </p>
      </div>

      {/* Main Master Certificate Hub Card */}
      {isMasterUnlocked ? (
        /* UNLOCKED MASTER CERTIFICATE CARD */
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 p-6 sm:p-8 text-white shadow-xl border border-amber-400/40">
          {/* Background decorative elements */}
          <div className="absolute -right-12 -bottom-12 opacity-15 pointer-events-none">
            <ShieldCheck className="w-72 h-72 text-white" />
          </div>

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-extrabold uppercase tracking-widest text-amber-100 border border-white/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                Formação Completa 100% Concluída
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/30 backdrop-blur-md text-[11px] font-bold text-emerald-100 border border-emerald-300/30 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Certificado Unico Emitido
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
                Certificado de Especialista White Label MegaZap
              </h2>
              <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
                Parabéns, <strong className="text-white">{userProfile.name}</strong>! Você concluiu 100% de todas as trilhas oficiais da MegaZap Academy. Seu certificado definitivo com código de verificação único e carga horária de 16 horas está disponível.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-medium text-amber-100 border-t border-white/20">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-200/80 block">Empresa Credenciada</span>
                <span className="font-bold text-white text-sm">{userProfile.company}</span>
              </div>
              <div className="w-px h-6 bg-white/20 hidden sm:block" />
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-200/80 block">Requisito</span>
                <span className="font-bold text-white text-sm">7 de 7 Trilhas Finalizadas</span>
              </div>
              <div className="w-px h-6 bg-white/20 hidden sm:block" />
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-200/80 block">Autenticidade</span>
                <span className="font-mono font-bold text-white text-sm">MZ-MASTER-2026</span>
              </div>
            </div>

            <div className="pt-3">
              <button
                onClick={openMasterCertificate}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white hover:bg-amber-50 text-amber-900 font-extrabold text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-0.5"
              >
                <Award className="w-4 h-4 text-amber-600" />
                <span>Visualizar & Baixar Certificado Oficial (PDF)</span>
                <ExternalLink className="w-4 h-4 text-amber-700" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* IN-PROGRESS / LOCKED MASTER CERTIFICATE CARD */
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
          {/* Background watermark */}
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <GraduationCap className="w-64 h-64 text-sky-400" />
          </div>

          <div className="relative z-10 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-[11px] font-extrabold uppercase tracking-wider border border-sky-500/30 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-sky-400" />
                  Certificado Único de Formação Completa
                </span>
              </div>

              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                {overallProgressPercentage}% Concluído
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Certificado de Especialista MegaZap White Label
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Ao concluir 100% do conteúdo de todas as trilhas oficiais, a plataforma gerará automaticamente seu certificado único e definitivo comprovando sua capacitação técnica e comercial.
              </p>
            </div>

            {/* Progress bar toward Master Certificate */}
            <div className="space-y-2 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-300">Progresso de Formação Acadêmica</span>
                <span className="text-sky-400">{totalCompletedLessonsCount} de {totalLessonsCount} aulas assistidas ({completedTracksCount}/{totalTracksCount} trilhas)</span>
              </div>
              <div className="w-full h-3 bg-slate-700/80 rounded-full overflow-hidden p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${overallProgressPercentage}%` }}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Faltam <strong>{totalLessonsCount - totalCompletedLessonsCount} aulas</strong> para desbloquear a emissão oficial do seu certificado.
                </span>
              </div>

              <button
                onClick={() => navigateToTrack(firstIncompleteTrack.id)}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors cursor-pointer shrink-0 shadow-md"
              >
                <span>Continuar Formação ({firstIncompleteTrack.title})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Track Requirements Checklist */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Trilhas Necessárias para a Certificação ({completedTracksCount}/{totalTracksCount})
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            100% de cada trilha é exigido
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tracks.map((track) => {
            const trackProg = getTrackProgress(track.id);
            const isDone = trackProg.isCompleted;

            return (
              <div 
                key={track.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isDone 
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/80' 
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      {track.category}
                    </span>

                    {isDone ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        Trilha Concluída
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {trackProg.percentage}% concluído
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1 line-clamp-1">
                    {track.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                    {track.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${isDone ? 'bg-emerald-500' : 'bg-sky-500'}`}
                      style={{ width: `${trackProg.percentage}%` }}
                    />
                  </div>

                  <button
                    onClick={() => navigateToTrack(track.id)}
                    className={`w-full flex items-center justify-center gap-1 text-xs font-bold py-2 rounded-xl transition-colors cursor-pointer ${
                      isDone
                        ? 'bg-emerald-100/60 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950/50 text-slate-700 dark:text-slate-200 hover:text-sky-600'
                    }`}
                  >
                    <span>{isDone ? 'Rever aulas da trilha' : 'Acessar esta trilha'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
