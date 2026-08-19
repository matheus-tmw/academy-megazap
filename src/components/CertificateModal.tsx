import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  Share2, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles,
  Award,
  ExternalLink
} from 'lucide-react';
import { useAcademy } from '../context/AcademyContext';
import { MegaZapLogo } from './MegaZapLogo';

export const CertificateModal: React.FC = () => {
  const { 
    activeCertificate, 
    isCertificateModalOpen, 
    setIsCertificateModalOpen,
    userProfile 
  } = useAcademy();

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isCertificateModalOpen || !activeCertificate) return null;

  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    }, 1200);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCertificateModalOpen(false)}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col z-10 animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Header Actions */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              Certificado Oficial MegaZap Academy
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Imprimir</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors cursor-pointer disabled:opacity-75 shadow-xs"
            >
              {isDownloading ? (
                <span>Gerando PDF...</span>
              ) : downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  <span>Baixado!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-white" />
                  <span>Baixar Certificado (PDF)</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsCertificateModalOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Visual Canvas (kept clean printable parchment/white for official export) */}
        <div className="p-6 sm:p-10 bg-slate-100/70 dark:bg-slate-950/80 flex items-center justify-center">
          <div 
            id="certificate-print-area"
            className="w-full bg-white border-8 border-double border-slate-200 rounded-xl p-6 sm:p-10 shadow-sm relative overflow-hidden text-center select-none text-slate-900"
          >
            {/* Subtle background watermark pattern */}
            <div className="absolute inset-0 opacity-[0.025] pointer-events-none flex items-center justify-center">
              <span className="text-[120px] font-black tracking-tighter text-slate-900 rotate-12">
                MEGAZAP
              </span>
            </div>

            {/* Top Logo & Title */}
            <div className="flex items-center justify-center mb-6">
              <MegaZapLogo />
            </div>

            <div className="mb-2">
              <span className="text-[11px] uppercase tracking-[0.25em] font-bold text-sky-700">
                Certificado de Conclusão Profissional
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-4">
              MegaZap Academy • White Label
            </h2>

            <p className="text-xs text-slate-500 max-w-lg mx-auto mb-5 leading-relaxed">
              Certificamos que o profissional abaixo completou com êxito todas as etapas, módulos teóricos e práticos da trilha de capacitação oficial:
            </p>

            {/* Student Name */}
            <div className="my-5">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight underline decoration-sky-500 decoration-2 underline-offset-8">
                {activeCertificate.studentName || userProfile.name}
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-2">
                Parceiro Credenciado: <strong className="text-slate-700">{userProfile.company}</strong>
              </p>
            </div>

            {/* Course Title Badge */}
            <div className="my-6 inline-block bg-sky-50/80 border border-sky-200/80 px-6 py-2.5 rounded-xl">
              <span className="text-xs font-medium text-slate-500 block mb-0.5">
                Trilha Concluída:
              </span>
              <span className="text-base sm:text-lg font-bold text-sky-900">
                {activeCertificate.title}
              </span>
            </div>

            {/* Metrics and Date */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 my-4 py-3 border-y border-slate-100 max-w-md mx-auto">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Carga Horária</span>
                <span className="font-bold text-slate-800">{activeCertificate.hoursCount}</span>
              </div>
              <div className="w-px h-6 bg-slate-200" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Concluído em</span>
                <span className="font-bold text-slate-800">{activeCertificate.issueDate}</span>
              </div>
              <div className="w-px h-6 bg-slate-200" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Autenticação</span>
                <span className="font-mono font-bold text-sky-700">{activeCertificate.verificationCode}</span>
              </div>
            </div>

            {/* Signatures & Seal */}
            <div className="mt-8 pt-4 flex flex-col sm:flex-row items-center justify-between gap-6 px-4">
              <div className="text-center w-44">
                <div className="h-9 flex items-end justify-center mb-1">
                  <span className="font-serif italic text-base text-slate-700 font-semibold">
                    Leonardo Silva
                  </span>
                </div>
                <div className="w-full border-t border-slate-300 pt-1">
                  <p className="text-[10px] font-bold text-slate-800">Diretoria de Operações</p>
                  <p className="text-[9px] text-slate-400">MegaZap Tecnologia</p>
                </div>
              </div>

              {/* Official Seal Badge */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-sky-600 to-cyan-500 p-0.5 shadow-md flex items-center justify-center">
                <div className="w-full h-full rounded-full border-2 border-dashed border-white/60 flex flex-col items-center justify-center text-white">
                  <ShieldCheck className="w-5 h-5 mb-0.5" />
                  <span className="text-[7.5px] font-black uppercase tracking-widest">OFICIAL</span>
                </div>
              </div>

              <div className="text-center w-44">
                <div className="h-9 flex items-end justify-center mb-1">
                  <span className="font-serif italic text-base text-slate-700 font-semibold">
                    Carolina Mendes
                  </span>
                </div>
                <div className="w-full border-t border-slate-300 pt-1">
                  <p className="text-[10px] font-bold text-slate-800">Coordenação Pedagógica</p>
                  <p className="text-[9px] text-slate-400">MegaZap Academy</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5 text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Certificado com autenticidade verificável para parceiros White Label.
          </span>
          <span className="text-[10.5px] text-slate-400">
            ID: {activeCertificate.id}
          </span>
        </div>
      </div>
    </div>
  );
};
