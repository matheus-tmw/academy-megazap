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
  Sparkles
} from 'lucide-react';
import { useAcademy } from '../context/AcademyContext';
import { MegaZapLogo } from '../components/MegaZapLogo';

export const CertificadosView: React.FC = () => {
  const { 
    tracks, 
    getTrackProgress, 
    openCertificate, 
    navigateToTrack,
    userProfile 
  } = useAcademy();

  const completedTracks = tracks.filter(t => getTrackProgress(t.id).isCompleted);
  const inProgressTracks = tracks.filter(t => !getTrackProgress(t.id).isCompleted);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          Meus Certificados
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Certificações de conclusão emitidas oficialmente pela MegaZap Academy para parceiros White Label.
        </p>
      </div>

      {/* Earned Certificates Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Certificados Conquistados ({completedTracks.length})
          </h2>
        </div>

        {completedTracks.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center">
            <Award className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Você ainda não possui certificados emitidos</h3>
            <p className="text-xs text-slate-400 dark:text-slate-400 mt-1 max-w-md mx-auto">
              Conclua 100% das aulas de uma trilha de treinamento para conquistar seu primeiro certificado oficial com código de autenticidade.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {completedTracks.map((track) => (
              <div 
                key={track.id}
                id={`cert-card-${track.id}`}
                className="bg-white dark:bg-slate-900 border-2 border-sky-100 dark:border-sky-900/50 hover:border-sky-300 dark:hover:border-sky-700 rounded-2xl p-6 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between relative overflow-hidden"
              >
                {/* Background decorative seal */}
                <div className="absolute -right-6 -bottom-6 opacity-5 dark:opacity-10 pointer-events-none">
                  <ShieldCheck className="w-36 h-36 text-sky-900 dark:text-sky-400" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 text-[10.5px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-md">
                        Oficial • Válido
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                        ID: MZ-{track.id.toUpperCase()}-2026
                      </span>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>

                  <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 block mb-1">
                    MegaZap Academy
                  </span>

                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 mb-2">
                    {track.certificateName}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                    Emitido para: <strong className="text-slate-700 dark:text-slate-200">{userProfile.name}</strong> • {userProfile.company}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-400 py-2 border-y border-slate-100 dark:border-slate-800 mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      14 de agosto de 2026
                    </span>
                    <span>•</span>
                    <span>{track.estimatedHours}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    Trilha: {track.title}
                  </span>

                  <button
                    onClick={() => openCertificate(track.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-colors cursor-pointer shadow-2xs"
                  >
                    <span>Visualizar certificado</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available / Locked Certificates in Progress */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Próximos Certificados a Conquistar ({inProgressTracks.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inProgressTracks.map((track) => {
            const prog = getTrackProgress(track.id);
            const total = track.modules.flatMap(m => m.lessons).length;

            return (
              <div 
                key={track.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4.5 shadow-2xs flex flex-col justify-between opacity-90 hover:opacity-100 transition-opacity"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      {track.category}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {prog.percentage}% concluído
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm line-clamp-2 mb-1.5">
                    {track.certificateName}
                  </h3>

                  <p className="text-[11.5px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                    Conclua as {total - prog.completedCount} aulas restantes para desbloquear este certificado.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
                    <div 
                      className="h-full bg-sky-600 rounded-full"
                      style={{ width: `${prog.percentage}%` }}
                    />
                  </div>

                  <button
                    onClick={() => navigateToTrack(track.id)}
                    className="w-full flex items-center justify-center gap-1 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 py-1.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-sky-50 dark:hover:bg-sky-950/40 rounded-lg transition-colors cursor-pointer"
                  >
                    <span>Continuar aulas da trilha</span>
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
