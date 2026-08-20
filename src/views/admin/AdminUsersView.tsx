import React, { useState, useEffect } from 'react';
import { useAcademy } from '../../context/AcademyContext';
import { 
  Users, 
  Plus, 
  Search, 
  Edit3, 
  Power, 
  KeyRound, 
  CheckCircle2, 
  X, 
  Building2, 
  Filter, 
  Mail, 
  UserCheck, 
  UserX, 
  Sparkles, 
  Trash2, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { 
  getAllUsers, 
  listenToAllUsers,
  createAdministrativeUser, 
  updateUserAdministrative, 
  deleteUserAdministrative, 
  setUserStatus, 
  requestUserPasswordReset 
} from '../../services/userService';
import { listPartners } from '../../services/partnerService';
import { UserProfile, UserRole, UserStatus, Partner } from '../../types/backend';
import { formatDisplayIdentifier } from '../../utils/userIdentifiers';
import { PasswordResetModal } from '../../components/PasswordResetModal';

export const AdminUsersView: React.FC = () => {
  const { currentUser } = useAcademy();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [partnerFilter, setPartnerFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [userToReset, setUserToReset] = useState<UserProfile | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('partner_user');
  const [formPartnerId, setFormPartnerId] = useState<string>('');
  const [formStatus, setFormStatus] = useState<UserStatus>('active');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Toast / feedback message
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const loadData = async (showToast = false) => {
    setIsSyncing(true);
    try {
      const [uData, pData] = await Promise.all([getAllUsers(), listPartners()]);
      if (uData) setUsers(uData);
      if (pData) {
        setPartners(pData);
        if (pData.length > 0 && !formPartnerId) {
          setFormPartnerId(pData[0].id);
        }
      }
      if (showToast) {
        showFeedback(`Banco de dados sincronizado com sucesso (${uData?.length || 0} usuários encontrados).`);
      }
    } catch (err) {
      console.warn('Users load notice:', err);
    }
    setLoading(false);
    setIsSyncing(false);
  };

  useEffect(() => {
    loadData();
    // Real-time Firestore sync listener
    const unsubscribeUsers = listenToAllUsers((realtimeUsers) => {
      if (realtimeUsers) {
        setUsers(realtimeUsers);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeUsers();
    };
  }, []);

  const openCreateModal = () => {
    setFormName('');
    setFormEmail('');
    setFormRole('partner_user');
    setFormPartnerId(partners[0]?.id || '');
    setFormStatus('active');
    setFormError(null);
    setCreateModalOpen(true);
  };

  const openEditModal = (user: UserProfile) => {
    setSelectedUser(user);
    setFormName(user.name);
    setFormEmail(formatDisplayIdentifier(user.email));
    setFormRole(user.role);
    setFormPartnerId(user.partnerId || (partners[0]?.id || ''));
    setFormStatus(user.status);
    setFormError(null);
    setEditModalOpen(true);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail) return;
    setFormLoading(true);
    setFormError(null);

    try {
      await createAdministrativeUser({
        name: formName,
        email: formEmail,
        role: formRole,
        partnerId: formRole === 'super_admin' ? null : formPartnerId,
        status: formStatus,
        callerProfile: currentUser
      });
      await loadData();
      setCreateModalOpen(false);
      showFeedback(`Usuário "${formName}" (${formatDisplayIdentifier(formEmail)}) cadastrado com sucesso!`);
    } catch (err: any) {
      setFormError(err.message || 'Erro ao criar usuário.');
    }
    setFormLoading(false);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !formName) return;
    setFormLoading(true);
    setFormError(null);

    try {
      await updateUserAdministrative(
        selectedUser.uid,
        {
          name: formName,
          role: formRole,
          partnerId: formRole === 'super_admin' ? null : formPartnerId,
          status: formStatus
        },
        currentUser
      );
      await loadData();
      setEditModalOpen(false);
      showFeedback(`Cadastro do usuário atualizado com sucesso.`);
    } catch (err: any) {
      setFormError(err.message || 'Erro ao atualizar usuário.');
    }
    setFormLoading(false);
  };

  const handleToggleStatus = async (user: UserProfile) => {
    const nextStatus: UserStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      await setUserStatus(user.uid, nextStatus, currentUser);
      await loadData();
      showFeedback(`Status do usuário alterado para ${nextStatus === 'active' ? 'Ativo' : 'Inativo'}.`);
    } catch (err: any) {
      showFeedback(err.message || 'Erro ao alterar status.', 'error');
    }
  };

  const handleSendReset = async (user: UserProfile) => {
    try {
      await requestUserPasswordReset(user.email, user.uid);
      showFeedback(`Solicitação de redefinição de senha gerada para ${formatDisplayIdentifier(user.email)}.`);
    } catch (err: any) {
      showFeedback('Erro ao enviar link de redefinição.', 'error');
    }
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await deleteUserAdministrative(userToDelete.uid, currentUser);
      setUserToDelete(null);
      await loadData();
      showFeedback(`Usuário ${userToDelete.name} removido com sucesso.`);
    } catch (err: any) {
      showFeedback(err.message || 'Erro ao remover usuário.', 'error');
    }
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const displayEmail = formatDisplayIdentifier(user.email);
    const matchesSearch = 
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      displayEmail.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesPartner = partnerFilter === 'all' || user.partnerId === partnerFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesPartner && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Gestão Global de Usuários e Alunos
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Controle de acesso por níveis (Super Admin, Partner Admin, Partner User) com suporte a nomes de usuário (ex: matheus.parceiro) e e-mails
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadData(true)}
            disabled={isSyncing}
            className="py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors shrink-0 cursor-pointer disabled:opacity-50"
            title="Recarregar e sincronizar usuários diretamente do banco Firestore"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-sky-500 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Banco'}</span>
          </button>

          <button
            onClick={openCreateModal}
            className="py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm flex items-center justify-center gap-2 transition-colors shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Novo Usuário</span>
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
            {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-rose-500" />}
            <span>{feedbackMsg.text}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome ou usuário..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Partner Filter */}
        <div>
          <select
            value={partnerFilter}
            onChange={e => setPartnerFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
          >
            <option value="all">Todos os Parceiros</option>
            {partners.map(p => (
              <option key={p.id} value={p.id}>{p.displayName}</option>
            ))}
          </select>
        </div>

        {/* Role Filter */}
        <div>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
          >
            <option value="all">Todos os Papéis</option>
            <option value="super_admin">Super Admin</option>
            <option value="partner_admin">Partner Admin</option>
            <option value="partner_user">Partner User (Aluno)</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
          >
            <option value="all">Todos os Status</option>
            <option value="active">Apenas Ativos</option>
            <option value="inactive">Apenas Inativos</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4 font-semibold">Usuário</th>
                <th className="py-3.5 px-4 font-semibold">Parceiro</th>
                <th className="py-3.5 px-4 font-semibold">Nível / Papel</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-center">Progresso</th>
                <th className="py-3.5 px-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    Nenhum usuário encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const partner = partners.find(p => p.id === user.partnerId);
                  const displayIdentifier = formatDisplayIdentifier(user.email);

                  return (
                    <tr key={user.uid} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white text-xs">{user.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{displayIdentifier}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {user.role === 'super_admin' ? (
                          <span className="text-slate-400 italic">MegaZap HQ Global</span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>{partner?.displayName || user.partnerId || 'Ultrafox'}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-semibold ${
                          user.role === 'super_admin'
                            ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                            : user.role === 'partner_admin'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                        }`}>
                          {user.role === 'super_admin' ? 'Super Admin' : user.role === 'partner_admin' ? 'Partner Admin' : 'Partner User'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${
                          user.status === 'active' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {user.status === 'active' ? 'Ativo' : 'Desativado'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs">75%</span>
                          <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '75%' }} />
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setUserToReset(user)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                            title="Resetar senha e gerar credencial temporária"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                            title="Editar cadastro"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              user.status === 'active'
                                ? 'border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600'
                                : 'border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600'
                            }`}
                            title={user.status === 'active' ? 'Desativar usuário' : 'Ativar usuário'}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setUserToDelete(user)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Remover usuário"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create User */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-500" />
                <span>Cadastrar Novo Usuário</span>
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

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João da Silva"
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
                  <span className="text-[11px] text-sky-600 dark:text-sky-400 font-medium">Aceita nome direto (ex: matheus.parceiro)</span>
                </div>
                <input
                  type="text"
                  required
                  placeholder="ex: matheus.parceiro ou joao@empresa.com"
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nível / Papel
                  </label>
                  <select
                    value={formRole}
                    onChange={e => setFormRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    <option value="partner_user">Partner User (Aluno)</option>
                    <option value="partner_admin">Partner Admin</option>
                    <option value="super_admin">Super Admin (MegaZap HQ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as UserStatus)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </div>
              </div>

              {formRole !== 'super_admin' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Parceiro Vinculado (Tenant)
                  </label>
                  <select
                    required
                    value={formPartnerId}
                    onChange={e => setFormPartnerId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    {partners.map(p => (
                      <option key={p.id} value={p.id}>{p.displayName} ({p.code})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 text-sky-700 dark:text-sky-300 text-[11px] leading-relaxed">
                Você pode utilizar nomes de usuário personalizados (ex: <code className="font-mono bg-sky-100 dark:bg-sky-900/60 px-1 py-0.5 rounded">matheus.parceiro</code>) ou e-mails corporativos válidos para login direto.
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
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold disabled:opacity-50 cursor-pointer"
                >
                  {formLoading ? 'Cadastrando...' : 'Cadastrar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit User */}
      {editModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-sky-500" />
                <span>Editar Cadastro: {selectedUser.name}</span>
              </h2>
              <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-600 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Identificador / Usuário
                </label>
                <input
                  type="text"
                  disabled
                  value={formEmail}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-500 cursor-not-allowed font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nível / Papel
                  </label>
                  <select
                    value={formRole}
                    onChange={e => setFormRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    <option value="partner_user">Partner User (Aluno)</option>
                    <option value="partner_admin">Partner Admin</option>
                    <option value="super_admin">Super Admin (MegaZap HQ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as UserStatus)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </div>
              </div>

              {formRole !== 'super_admin' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Parceiro Vinculado (Tenant)
                  </label>
                  <select
                    required
                    value={formPartnerId}
                    onChange={e => setFormPartnerId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    {partners.map(p => (
                      <option key={p.id} value={p.id}>{p.displayName} ({p.code})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold disabled:opacity-50 cursor-pointer"
                >
                  {formLoading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete User */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-500" />
              <span>Confirmar Exclusão de Usuário</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              Tem certeza que deseja remover o usuário <strong>{userToDelete.name}</strong> ({formatDisplayIdentifier(userToDelete.email)})?
            </p>
            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteUser}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold cursor-pointer"
              >
                Confirmar Exclusão
              </button>
            </div>
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
          loadData();
        }}
      />
    </div>
  );
};
