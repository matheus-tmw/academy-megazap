import React, { useState, useEffect } from 'react';
import { useAcademy } from '../../context/AcademyContext';
import { 
  Users, 
  Plus, 
  Search, 
  KeyRound, 
  Power, 
  CheckCircle2, 
  X, 
  Building2, 
  Mail, 
  Sparkles, 
  GraduationCap,
  ShieldCheck,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { 
  getUsersByPartner, 
  listenToPartnerUsers,
  createAdministrativeUser, 
  setUserStatus, 
  requestUserPasswordReset 
} from '../../services/userService';
import { UserProfile, UserStatus } from '../../types/backend';
import { formatDisplayIdentifier } from '../../utils/userIdentifiers';
import { PasswordResetModal } from '../../components/PasswordResetModal';

export const PartnerTeamView: React.FC = () => {
  const { currentPartner, currentUser } = useAcademy();
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [search, setSearch] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [userToReset, setUserToReset] = useState<UserProfile | null>(null);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Toast / Feedback
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const loadTeam = async (showToast = false) => {
    if (currentPartner?.id) {
      setIsSyncing(true);
      try {
        const data = await getUsersByPartner(currentPartner.id);
        if (data && data.length > 0) {
          setMembers(data);
        } else {
          setMembers([]);
        }
        if (showToast) {
          showFeedback(`Equipe sincronizada com o banco (${data?.length || 0} membros).`);
        }
      } catch (err) {
        console.warn('Team fetch notice:', err);
      }
      setLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadTeam();

    if (currentPartner?.id) {
      const unsubscribe = listenToPartnerUsers(currentPartner.id, (realtimeTeam) => {
        if (realtimeTeam) {
          setMembers(realtimeTeam);
          setLoading(false);
        }
      });

      return () => {
        unsubscribe();
      };
    }
  }, [currentPartner?.id]);

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail || !currentPartner?.id) return;
    setFormLoading(true);
    setFormError(null);

    try {
      // Strictly enforce partner_user role and current partnerId
      await createAdministrativeUser({
        name: formName,
        email: formEmail,
        role: 'partner_user',
        partnerId: currentPartner.id,
        status: 'active',
        callerProfile: currentUser
      });
      await loadTeam();
      setCreateModalOpen(false);
      setFormName('');
      setFormEmail('');
      showFeedback(`Funcionário "${formName}" (${formatDisplayIdentifier(formEmail)}) cadastrado com sucesso!`);
    } catch (err: any) {
      setFormError(err.message || 'Erro ao cadastrar funcionário.');
    }
    setFormLoading(false);
  };

  const handleToggleStatus = async (user: UserProfile) => {
    const nextStatus: UserStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      await setUserStatus(user.uid, nextStatus, currentUser);
      await loadTeam();
      showFeedback(`Acesso de ${user.name} alterado para ${nextStatus === 'active' ? 'Ativo' : 'Inativo'}.`);
    } catch (err: any) {
      showFeedback(err.message || 'Erro ao alterar status.', 'error');
    }
  };

  const handleSendReset = async (user: UserProfile) => {
    try {
      await requestUserPasswordReset(user.email, user.uid);
      showFeedback(`Instruções de redefinição enviadas para ${formatDisplayIdentifier(user.email)}.`);
    } catch (err) {
      showFeedback('Erro ao enviar link de redefinição.', 'error');
    }
  };

  const filteredMembers = members.filter(m => {
    const displayId = formatDisplayIdentifier(m.email);
    return (
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      displayId.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Minha Equipe • {currentPartner?.displayName || 'Ultrafox'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Cadastre os membros da sua equipe para liberar acesso às trilhas oficiais de treinamento
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadTeam(true)}
            disabled={isSyncing}
            className="py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors shrink-0 cursor-pointer disabled:opacity-50"
            title="Sincronizar equipe com o banco de dados"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-500 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar'}</span>
          </button>

          <button
            onClick={() => { setFormError(null); setCreateModalOpen(true); }}
            className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm flex items-center justify-center gap-2 transition-colors shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Novo Funcionário</span>
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackMsg && (
        <div className={`p-3.5 rounded-xl text-xs font-medium flex items-center justify-between border ${
          feedbackMsg.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />}
            <span>{feedbackMsg.text}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="opacity-70 hover:opacity-100 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar colaborador por nome ou usuário..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Members Grid / Cards */}
      {filteredMembers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-10 text-center text-xs text-slate-400">
          Nenhum colaborador encontrado na equipe. Clique em "Cadastrar Novo Funcionário" para adicionar.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member, idx) => {
            const displayId = formatDisplayIdentifier(member.email);
            return (
              <div
                key={member.uid}
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={member.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}`}
                        alt=""
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                          {member.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-mono">{displayId}</p>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      member.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}>
                      {member.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="my-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      <span>Progresso nas Trilhas</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{idx === 0 ? '88%' : '60%'}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${idx === 0 ? 88 : 60}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setUserToReset(member)}
                    className="py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Definir / resetar credenciais"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                    <span>Redefinir Acesso</span>
                  </button>

                  <button
                    onClick={() => handleToggleStatus(member)}
                    className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                      member.status === 'active'
                        ? 'border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600'
                        : 'border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600'
                    }`}
                    title={member.status === 'active' ? 'Desativar acesso' : 'Reativar acesso'}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create Employee */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-500" />
                <span>Novo Funcionário da Equipe</span>
              </h2>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-600 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateEmployee} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nome Completo do Colaborador
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Amanda Costa"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Usuário ou E-mail
                  </label>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Aceita nome direto (ex: amanda.parceiro)</span>
                </div>
                <input
                  type="text"
                  required
                  placeholder="ex: amanda.parceiro ou amanda@empresa.com"
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>Empresa / Tenant:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{currentPartner?.displayName || 'Ultrafox'}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>Papel no Sistema:</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">Partner User (Aluno)</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold disabled:opacity-50 cursor-pointer"
                >
                  {formLoading ? 'Salvando...' : 'Cadastrar Funcionário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal with Random Temporary Password */}
      <PasswordResetModal
        user={userToReset}
        isOpen={Boolean(userToReset)}
        onClose={() => setUserToReset(null)}
        onSuccess={(msg) => {
          showFeedback(msg);
          loadTeam();
        }}
      />
    </div>
  );
};
