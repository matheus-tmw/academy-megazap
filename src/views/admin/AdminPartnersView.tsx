import React, { useState, useEffect } from 'react';
import { useAcademy } from '../../context/AcademyContext';
import { 
  Building2, 
  Plus, 
  Search, 
  Edit3, 
  Power, 
  Users, 
  CheckCircle2, 
  X, 
  Eye, 
  TrendingUp, 
  Shield, 
  Sparkles,
  Layers,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { listPartners, listenToPartners, createPartner, updatePartner, updatePartnerStatus } from '../../services/partnerService';
import { getUsersByPartner } from '../../services/userService';
import { Partner, PartnerStatus, UserProfile } from '../../types/backend';
import { UserDetailModal } from '../../components/UserDetailModal';
import { safeBackdropProps } from '../../utils/modalUtils';

export const AdminPartnersView: React.FC = () => {
  const { navigateTo } = useAcademy();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal States
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [partnerUsers, setPartnerUsers] = useState<UserProfile[]>([]);
  const [selectedUserForModal, setSelectedUserForModal] = useState<UserProfile | null>(null);

  // Form States
  const [formName, setFormName] = useState('');
  const [formDisplayName, setFormDisplayName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formStatus, setFormStatus] = useState<PartnerStatus>('active');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchPartners = async () => {
    setSyncing(true);
    try {
      const data = await listPartners();
      setPartners(data);
    } catch (err) {
      console.warn('Partners fetch notice:', err);
    } finally {
      setSyncing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Real-time listener for partners collection
    const unsubscribe = listenToPartners((data) => {
      setPartners(data);
      setLoading(false);
    }, (err) => {
      console.warn('Partners live subscription fallback:', err);
      fetchPartners();
    });

    return () => unsubscribe();
  }, []);

  const openCreateModal = () => {
    setFormName('');
    setFormDisplayName('');
    setFormCode('');
    setFormStatus('active');
    setFormError(null);
    setCreateModalOpen(true);
  };

  const openEditModal = (partner: Partner) => {
    setSelectedPartner(partner);
    setFormName(partner.name);
    setFormDisplayName(partner.displayName);
    setFormCode(partner.code);
    setFormStatus(partner.status);
    setFormError(null);
    setEditModalOpen(true);
  };

  const openDetailModal = async (partner: Partner) => {
    setSelectedPartner(partner);
    setPartnerUsers([]);
    setDetailModalOpen(true);
    try {
      const users = await getUsersByPartner(partner.id);
      if (users) setPartnerUsers(users);
    } catch (err) {
      console.warn('Partner users fetch notice:', err);
    }
  };

  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formDisplayName || !formCode) return;
    setFormLoading(true);
    setFormError(null);

    try {
      await createPartner({
        name: formName,
        displayName: formDisplayName,
        code: formCode,
        status: formStatus
      });
      await fetchPartners();
      setCreateModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Erro ao criar parceiro.');
    }
    setFormLoading(false);
  };

  const handleUpdatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartner || !formName || !formDisplayName || !formCode) return;
    setFormLoading(true);
    setFormError(null);

    try {
      await updatePartner(selectedPartner.id, {
        name: formName,
        displayName: formDisplayName,
        code: formCode,
        status: formStatus
      });
      await fetchPartners();
      setEditModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Erro ao atualizar parceiro.');
    }
    setFormLoading(false);
  };

  const toggleStatus = async (partner: Partner) => {
    const newStatus = partner.status === 'active' ? 'inactive' : 'active';
    try {
      await updatePartnerStatus(partner.id, newStatus);
      await fetchPartners();
    } catch (err) {
      console.warn('Toggle status notice:', err);
    }
  };

  const filteredPartners = partners.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.displayName.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <Building2 className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Gestão de Parceiros White Label
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Cadastre e administre as empresas parceiras autorizadas e suas configurações de tenant
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchPartners}
            disabled={syncing || loading}
            title="Sincronizar com Firestore em tempo real"
            className="py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-sky-500 ${syncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sincronizar</span>
          </button>

          <button
            onClick={openCreateModal}
            className="py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm flex items-center justify-center gap-2 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Novo Parceiro</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, fantasia ou código..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Status:</span>
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Todos ({partners.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                statusFilter === 'active'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Ativos
            </button>
            <button
              onClick={() => setStatusFilter('inactive')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                statusFilter === 'inactive'
                  ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Inativos
            </button>
          </div>
        </div>
      </div>

      {/* Partners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPartners.map(partner => (
          <div
            key={partner.id}
            className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all group"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-sm">
                    {partner.displayName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      {partner.displayName}
                    </h3>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{partner.name}</p>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                  partner.status === 'active'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                }`}>
                  {partner.status === 'active' ? 'Ativo' : 'Inativo'}
                </span>
              </div>

              <div className="space-y-2 py-3 border-y border-slate-100 dark:border-slate-800/80 text-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>Código White Label:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {partner.code}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>Tenant ID:</span>
                  <span className="font-mono text-[10px] text-slate-400 truncate max-w-[150px]">
                    {partner.id}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>Status do Contrato:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Habilitado</span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between gap-2">
              <button
                onClick={() => openDetailModal(partner)}
                className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Detalhes</span>
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openEditModal(partner)}
                  className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                  title="Editar Parceiro"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => toggleStatus(partner)}
                  className={`p-1.5 rounded-xl border transition-colors ${
                    partner.status === 'active'
                      ? 'border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600'
                      : 'border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600'
                  }`}
                  title={partner.status === 'active' ? 'Desativar Parceiro' : 'Ativar Parceiro'}
                >
                  <Power className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Create Partner */}
      {createModalOpen && (
        <div 
          {...safeBackdropProps(() => setCreateModalOpen(false))}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
        >
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl cursor-default">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-sky-500" />
                <span>Novo Parceiro White Label</span>
              </h2>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-600 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreatePartner} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Razão Social / Nome Oficial
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Ultrafox Tecnologia e Telecomunicações LTDA"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nome Fantasia (Marca do White Label)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Ultrafox"
                  value={formDisplayName}
                  onChange={e => setFormDisplayName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Código Identificador Único (UPPERCASE)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: ULTRAFOX_WL"
                  value={formCode}
                  onChange={e => setFormCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono uppercase"
                />
                <p className="text-[10px] text-slate-400 mt-1">Utilizado para identificação técnica e filtros de relatórios.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Status Inicial
                </label>
                <select
                  value={formStatus}
                  onChange={e => setFormStatus(e.target.value as PartnerStatus)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                >
                  <option value="active">Ativo (Permitir logins e treinamentos)</option>
                  <option value="inactive">Inativo (Bloquear acessos)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold disabled:opacity-50"
                >
                  {formLoading ? 'Salvando...' : 'Cadastrar Parceiro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Partner */}
      {editModalOpen && selectedPartner && (
        <div 
          {...safeBackdropProps(() => setEditModalOpen(false))}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
        >
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl cursor-default">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-sky-500" />
                <span>Editar Parceiro: {selectedPartner.displayName}</span>
              </h2>
              <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-600 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleUpdatePartner} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Razão Social / Nome Oficial
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
                  Nome Fantasia (Marca White Label)
                </label>
                <input
                  type="text"
                  required
                  value={formDisplayName}
                  onChange={e => setFormDisplayName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Código White Label
                </label>
                <input
                  type="text"
                  required
                  value={formCode}
                  onChange={e => setFormCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Status
                </label>
                <select
                  value={formStatus}
                  onChange={e => setFormStatus(e.target.value as PartnerStatus)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold disabled:opacity-50"
                >
                  {formLoading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Partner Detail */}
      {detailModalOpen && selectedPartner && (
        <div 
          {...safeBackdropProps(() => setDetailModalOpen(false))}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
        >
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl cursor-default">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 font-bold flex items-center justify-center">
                  {selectedPartner.displayName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedPartner.displayName}
                  </h2>
                  <p className="text-xs text-slate-400">{selectedPartner.name}</p>
                </div>
              </div>
              <button onClick={() => setDetailModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 my-4">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Código</div>
                <div className="text-sm font-bold font-mono text-slate-800 dark:text-slate-200 mt-0.5">{selectedPartner.code}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Usuários Cadastrados</div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {partnerUsers.length} {partnerUsers.length === 1 ? 'aluno' : 'alunos'}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Progresso Médio</div>
                <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {partnerUsers.length > 0
                    ? `${Math.round(partnerUsers.reduce((acc, u) => acc + (u.progressPercentage || 0), 0) / partnerUsers.length)}% concluído`
                    : '0% (sem alunos)'}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-sky-500" />
                <span>Colaboradores Vinculados ao Tenant</span>
              </h3>
              <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                {partnerUsers.length > 0 ? (
                  partnerUsers.map(u => (
                    <div 
                      key={u.uid} 
                      onClick={() => setSelectedUserForModal(u)}
                      className="p-3 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={u.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}`}
                          alt=""
                          className="w-7 h-7 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                        />
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors flex items-center gap-1.5">
                            <span>{u.name}</span>
                          </div>
                          <div className="text-[11px] text-slate-400">{u.email}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          u.role === 'partner_admin'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                        }`}>
                          {u.role === 'partner_admin' ? 'Admin' : 'Funcionário'}
                        </span>
                        
                        <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:underline">
                          Ver Detalhes →
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400">
                    Nenhum colaborador encontrado para este parceiro.
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setDetailModalOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Detail & Progress Modal */}
      <UserDetailModal
        user={selectedUserForModal}
        isOpen={Boolean(selectedUserForModal)}
        onClose={() => setSelectedUserForModal(null)}
        partnerName={selectedPartner?.displayName}
      />
    </div>
  );
};
