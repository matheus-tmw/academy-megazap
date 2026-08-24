import React, { useState } from 'react';
import { KeyRound, CheckCircle2, Copy, Check, MessageSquare, AlertCircle, Sparkles, X } from 'lucide-react';
import { UserProfile } from '../types/backend';
import { generateAndResetUserTemporaryPassword } from '../services/userService';
import { formatDisplayIdentifier } from '../utils/userIdentifiers';
import { safeBackdropProps } from '../utils/modalUtils';
import { useAcademy } from '../context/AcademyContext';

interface PasswordResetModalProps {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (message: string) => void;
}

export const PasswordResetModal: React.FC<PasswordResetModalProps> = ({
  user,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { currentUser } = useAcademy();
  const [step, setStep] = useState<'confirm' | 'result'>('confirm');
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<'password' | 'message' | null>(null);

  if (!isOpen || !user) return null;

  const displayUserIdentifier = formatDisplayIdentifier(user.email);

  const handleConfirmReset = async () => {
    setLoading(true);
    setError(null);
    try {
      const tempPass = await generateAndResetUserTemporaryPassword(user.uid, user.email, currentUser);
      setGeneratedPassword(tempPass);
      setStep('result');
      if (onSuccess) {
        onSuccess(`Senha de ${user.name} resetada com sucesso.`);
      }
    } catch (err: any) {
      setError(err?.message || 'Erro ao redefinir a senha do usuário.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPassword = () => {
    if (!generatedPassword) return;
    navigator.clipboard.writeText(generatedPassword);
    setCopiedType('password');
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleCopyMessage = () => {
    if (!generatedPassword) return;
    const message = `Olá ${user.name},\n\nSua nova senha temporária de acesso à plataforma MegaZap Academy foi gerada com sucesso:\n\n👤 Usuário/E-mail: ${displayUserIdentifier}\n🔑 Senha Temporária: ${generatedPassword}\n\nNo seu primeiro login, o sistema solicitará que você cadastre sua senha definitiva.`;
    navigator.clipboard.writeText(message);
    setCopiedType('message');
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleClose = () => {
    setStep('confirm');
    setGeneratedPassword(null);
    setError(null);
    setCopiedType(null);
    onClose();
  };

  return (
    <div 
      {...safeBackdropProps(handleClose)}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden cursor-default"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {step === 'confirm' ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Resetar Senha de Acesso
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Geração de nova credencial temporária
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                Deseja realmente resetar a senha de <strong>{user.name}</strong> (<span className="font-mono text-[11px] text-sky-600 dark:text-sky-400">{displayUserIdentifier}</span>)?
              </p>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>Uma senha aleatória temporária de até 10 dígitos será gerada e o usuário deverá cadastrar uma nova senha no próximo acesso.</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Gerando Senha...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Confirmar e Gerar Nova Senha</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Nova Senha Temporária Gerada!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Copie a senha abaixo para entregar ao colaborador
                </p>
              </div>
            </div>

            {/* Generated Password Highlight Box */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Colaborador: <strong className="text-slate-200">{user.name}</strong></span>
                <span className="font-mono text-emerald-400">{displayUserIdentifier}</span>
              </div>
              
              <div className="flex items-center justify-between bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <span className="font-mono text-lg font-bold tracking-widest text-amber-400 select-all">
                  {generatedPassword}
                </span>
                <button
                  type="button"
                  onClick={handleCopyPassword}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                  title="Copiar Senha"
                >
                  {copiedType === 'password' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copiada!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Senha temporária (máx. 10 dígitos). O usuário trocará no primeiro acesso.</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleCopyMessage}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-200/80 dark:border-slate-700"
              >
                {copiedType === 'message' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">Mensagem Copiada para a Área de Transferência!</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-3.5 h-3.5 text-sky-500" />
                    <span>Copiar Mensagem Pronta (WhatsApp / E-mail)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Concluir
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
