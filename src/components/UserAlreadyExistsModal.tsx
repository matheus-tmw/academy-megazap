import React from 'react';
import { UserX, AlertCircle, X, ShieldAlert } from 'lucide-react';
import { safeBackdropProps } from '../utils/modalUtils';

interface UserAlreadyExistsModalProps {
  isOpen: boolean;
  username: string;
  customMessage?: string;
  onClose: () => void;
}

export const UserAlreadyExistsModal: React.FC<UserAlreadyExistsModalProps> = ({
  isOpen,
  username,
  customMessage,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      {...safeBackdropProps(onClose)}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 cursor-default"
      >
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <UserX className="w-6 h-6" />
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Usuário já cadastrado</span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {customMessage ? (
              customMessage
            ) : (
              <>
                O nome de usuário{' '}
                <span className="font-semibold text-slate-900 dark:text-white font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  {username}
                </span>{' '}
                já está cadastrado no sistema.
              </>
            )}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Escolha outro nome de usuário para continuar.
          </p>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm cursor-pointer"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
};
