import React, { useState, useEffect } from 'react';
import { useAcademy } from '../../context/AcademyContext';
import { 
  Building2, 
  Users, 
  UserCheck, 
  UserX, 
  TrendingUp, 
  GraduationCap, 
  Plus, 
  Shield, 
  Activity,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { listPartners } from '../../services/partnerService';
import { getAllUsers } from '../../services/userService';
import { Partner, UserProfile } from '../../types/backend';

const DEFAULT_PARTNERS: Partner[] = [
  {
    id: 'partner_ultrafox',
    name: 'Ultrafox Telecom & Digital',
    displayName: 'Ultrafox',
    code: 'ULTRAFOX',
    status: 'active',
    createdAt: '',
    updatedAt: '',
    createdBy: 'system_bootstrap'
  },
  {
    id: 'partner_megazap_hq',
    name: 'MegaZap Brasil HQ',
    displayName: 'MegaZap Brasil',
    code: 'MEGAZAP_HQ',
    status: 'active',
    createdAt: '',
    updatedAt: '',
    createdBy: 'system_bootstrap'
  }
];

const DEFAULT_USERS: UserProfile[] = [
  {
    uid: 'user_matheus_barros',
    name: 'Matheus Barros',
    email: 'matheus.tmw@gmail.com',
    role: 'super_admin',
    partnerId: null,
    status: 'active',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '',
    updatedAt: ''
  },
  {
    uid: 'user_carlos_mendes',
    name: 'Carlos Mendes',
    email: 'carlos@ultrafox.com.br',
    role: 'partner_admin',
    partnerId: 'partner_ultrafox',
    status: 'active',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: '',
    updatedAt: ''
  },
  {
    uid: 'user_vinicius_rocha',
    name: 'Vinícius Rocha',
    email: 'vinicius@ultrafox.com.br',
    role: 'partner_user',
    partnerId: 'partner_ultrafox',
    status: 'active',
    photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    createdAt: '',
    updatedAt: ''
  },
  {
    uid: 'user_lucas_almeida',
    name: 'Lucas Almeida',
    email: 'lucas@ultrafox.com.br',
    role: 'partner_user',
    partnerId: 'partner_ultrafox',
    status: 'active',
    photoURL: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    createdAt: '',
    updatedAt: ''
  }
];

export const AdminDashboardView: React.FC = () => {
  const { navigateTo } = useAcademy();
  const [partners, setPartners] = useState<Partner[]>(DEFAULT_PARTNERS);
  const [users, setUsers] = useState<UserProfile[]>(DEFAULT_USERS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [pList, uList] = await Promise.allSettled([listPartners(), getAllUsers()]);
        if (pList.status === 'fulfilled' && pList.value && pList.value.length > 0) {
          setPartners(pList.value);
        }
        if (uList.status === 'fulfilled' && uList.value && uList.value.length > 0) {
          setUsers(uList.value);
        }
      } catch (err) {
        console.warn('Dashboard data notice:', err);
      }
    }
    loadData();
  }, []);

  const totalPartners = partners.length;
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const disabledUsers = users.filter(u => u.status === 'inactive' || u.status === 'blocked').length;
  const studentUsers = users.filter(u => u.role !== 'super_admin');
  const averageProgress = studentUsers.length > 0 
    ? Math.round(studentUsers.reduce((acc, u) => acc + (u.progressPercentage || 0), 0) / studentUsers.length)
    : 0;
  const totalCertificates = users.filter(u => (u.progressPercentage || 0) === 100).length;

  const recentUsers = users.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border border-slate-700/80 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold uppercase tracking-wider mb-2 border border-sky-500/30">
              <Shield className="w-3.5 h-3.5 text-sky-400" />
              <span>Painel Super Admin • MegaZap HQ</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Visão Geral do Ecossistema White Label
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Gerencie empresas parceiras, credenciais de acesso, trilhas de treinamento e conformidade de equipes.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => navigateTo('admin-partners')}
              className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Parceiro</span>
            </button>
            <button
              onClick={() => navigateTo('admin-users')}
              className="px-4 py-2.5 rounded-xl bg-slate-700/80 hover:bg-slate-600 text-white text-xs font-semibold border border-slate-600 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Gerenciar Usuários</span>
            </button>
            <button
              onClick={() => navigateTo('dashboard')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-sky-400" />
              <span>Ver Plataforma do Aluno</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5 sm:gap-4">
        {/* Card 1: Parceiros */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Parceiros</span>
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {totalPartners}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">100% ativos</span>
          </div>
        </div>

        {/* Card 2: Total Usuários */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Total Alunos</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {totalUsers}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Nas revendas ativas
          </div>
        </div>

        {/* Card 3: Ativos */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Ativos</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {activeUsers}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Com acesso liberado
          </div>
        </div>

        {/* Card 4: Desativados */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Desativados</span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-700 dark:text-slate-300">
            {disabledUsers}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Sem acesso
          </div>
        </div>

        {/* Card 5: Progresso Médio */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Progresso Médio</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {averageProgress}%
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            +12% esta semana
          </div>
        </div>

        {/* Card 6: Certificados Master */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Certificados Master</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {totalCertificates}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Alunos com 100% de Conclusão
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Users & Partner Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Recent Users */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-500" />
                <span>Últimos Usuários Cadastrados</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Usuários criados recentemente nas empresas parceiras
              </p>
            </div>
            <button
              onClick={() => navigateTo('admin-users')}
              className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
            >
              <span>Ver todos</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="pb-3 font-semibold">Usuário</th>
                  <th className="pb-3 font-semibold">Parceiro</th>
                  <th className="pb-3 font-semibold">Papel</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {recentUsers.map(user => {
                  const partner = partners.find(p => p.id === user.partnerId);
                  return (
                    <tr key={user.uid} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 pr-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || 'User')}`}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          />
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">{user.name}</div>
                            <div className="text-[11px] text-slate-400">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 pr-3 text-slate-600 dark:text-slate-300">
                        {user.role === 'super_admin' ? (
                          <span className="text-slate-400 italic">MegaZap HQ</span>
                        ) : (
                          partner?.displayName || user.partnerId || 'Ultrafox'
                        )}
                      </td>
                      <td className="py-3.5 pr-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                          user.role === 'super_admin'
                            ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                            : user.role === 'partner_admin'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                        }`}>
                          {user.role === 'super_admin' ? 'Super Admin' : user.role === 'partner_admin' ? 'Partner Admin' : 'Partner User'}
                        </span>
                      </td>
                      <td className="py-3.5 pr-3">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                          user.status === 'active' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {user.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="py-3.5 text-right text-slate-400 text-[11px]">
                        Hoje
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Top Partners by Completion */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-500" />
                <span>Parceiros White Label</span>
              </h2>
              <button
                onClick={() => navigateTo('admin-partners')}
                className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline"
              >
                Gerenciar
              </button>
            </div>

            <div className="space-y-3.5">
              {partners.map((partner) => {
                const partnerMembers = users.filter(u => u.partnerId === partner.id);
                const memberCount = partnerMembers.length;
                const partnerAvg = memberCount > 0
                  ? Math.round(partnerMembers.reduce((acc, u) => acc + (u.progressPercentage || 0), 0) / memberCount)
                  : 0;

                return (
                  <div
                    key={partner.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="font-semibold text-slate-900 dark:text-white text-xs">
                        {partner.displayName}
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {partner.code}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                      <span>Equipe: {memberCount} {memberCount === 1 ? 'aluno' : 'alunos'}</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {memberCount > 0 ? `${partnerAvg}% concluído` : '0%'}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sky-500 rounded-full"
                        style={{ width: `${partnerAvg}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => navigateTo('admin-logs')}
              className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5 text-slate-500" />
              <span>Ver Trilha de Auditoria e Logs</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
