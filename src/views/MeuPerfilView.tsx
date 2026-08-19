import React, { useState } from 'react';
import { useAcademy } from '../context/AcademyContext';
import { 
  User, 
  Mail, 
  Building2, 
  ShieldCheck, 
  KeyRound, 
  CheckCircle2, 
  Save, 
  Calendar, 
  AlertCircle,
  Sparkles,
  Lock
} from 'lucide-react';
import { formatDisplayIdentifier } from '../utils/userIdentifiers';

export const MeuPerfilView: React.FC = () => {
  const { 
    currentUser, 
    currentPartner, 
    activeRole, 
    updateCurrentUserProfile, 
    sendPasswordReset 
  } = useAcademy();

  const [name, setName] = useState(currentUser?.name || 'Matheus Barros');
  const [photoURL, setPhotoURL] = useState(currentUser?.photoURL || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateCurrentUserProfile(name, photoURL);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.warn('Profile save notice:', err);
    }
    setIsSaving(false);
  };

  const handlePasswordReset = async () => {
    if (!currentUser?.email) return;
    try {
      await sendPasswordReset(currentUser.email);
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 5000);
    } catch (err) {
      console.warn('Reset error notice:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-6 h-6 text-sky-500" />
          <span>Meu Perfil & Segurança</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Gerencie seus dados de identificação, credenciais de acesso e preferências
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Perfil atualizado com sucesso!</span>
        </div>
      )}

      {resetSuccess && (
        <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0" />
          <span>Link de redefinição de senha enviado para seu e-mail!</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Summary Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col items-center text-center">
          <img
            src={photoURL || currentUser?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`}
            alt=""
            className="w-24 h-24 rounded-2xl object-cover border-2 border-sky-500/30 p-1 shadow-sm mb-4"
          />

          <h2 className="text-base font-bold text-slate-900 dark:text-white">{name}</h2>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">{formatDisplayIdentifier(currentUser?.email)}</p>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
              activeRole === 'super_admin'
                ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                : activeRole === 'partner_admin'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                : 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
            }`}>
              {activeRole === 'super_admin' ? 'Super Admin' : activeRole === 'partner_admin' ? 'Partner Admin' : 'Aluno Especialista'}
            </span>

            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {currentPartner?.displayName || 'MegaZap HQ'}
            </span>
          </div>

          <div className="w-full mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-2 text-left text-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span>Status do Acesso:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Ativo</span>
            </div>
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span>ID do Usuário:</span>
              <span className="font-mono text-[10px] text-slate-400 truncate max-w-[120px]">
                {currentUser?.uid || 'user_matheus_barros'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Editable Info & Password */}
        <div className="md:col-span-2 space-y-6">
          {/* Edit Profile Form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-sky-500" />
              <span>Informações Pessoais</span>
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Usuário ou E-mail (Identificador)
                </label>
                <input
                  type="text"
                  disabled
                  value={formatDisplayIdentifier(currentUser?.email) || ''}
                  className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-500 cursor-not-allowed font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">O identificador de acesso é vinculado à chave única de autenticação.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  URL da Foto de Perfil (Opcional)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={photoURL}
                  onChange={e => setPhotoURL(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Security & Password Reset Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-sky-500" />
              <span>Segurança da Conta & Senha</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Para maior proteção contra ataques, o envio e redefinição de senhas é realizado exclusivamente pelo fluxo de segurança do Firebase Authentication.
            </p>

            <button
              onClick={handlePasswordReset}
              type="button"
              className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-sky-500" />
              <span>Solicitar Redefinição de Senha por E-mail</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
