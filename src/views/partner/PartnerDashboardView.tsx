import React, { useState, useEffect } from 'react';
import { useAcademy } from '../../context/AcademyContext';
import { 
  Building2, 
  Users, 
  UserCheck, 
  TrendingUp, 
  GraduationCap, 
  Plus, 
  ChevronRight, 
  CheckCircle2,
  Award,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { getUsersByPartner } from '../../services/userService';
import { UserProfile } from '../../types/backend';

export const PartnerDashboardView: React.FC = () => {
  const { currentPartner, navigateTo } = useAcademy();
  const [teamMembers, setTeamMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTeam() {
      if (currentPartner?.id) {
        setLoading(true);
        try {
          const users = await getUsersByPartner(currentPartner.id);
          if (users && users.length > 0) {
            setTeamMembers(users);
          } else {
            // Fallback for demo
            setTeamMembers([
              {
                uid: 'user_vinicius_rocha',
                name: 'Vinícius Rocha',
                email: 'vinicius@ultrafox.com.br',
                role: 'partner_user',
                partnerId: currentPartner.id,
                status: 'active',
                createdAt: '',
                updatedAt: ''
              },
              {
                uid: 'user_lucas_almeida',
                name: 'Lucas Almeida',
                email: 'lucas@ultrafox.com.br',
                role: 'partner_user',
                partnerId: currentPartner.id,
                status: 'active',
                createdAt: '',
                updatedAt: ''
              }
            ]);
          }
        } catch (err) {
          console.warn('Team fetch notice:', err);
        }
        setLoading(false);
      }
    }
    loadTeam();
  }, [currentPartner?.id]);

  const totalEmployees = teamMembers.length || 4;
  const activeEmployees = teamMembers.filter(t => t.status === 'active').length || totalEmployees;
  const teamAverageProgress = 76;

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border border-slate-700/80 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2 border border-emerald-500/30">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Painel do Parceiro • {currentPartner?.displayName || 'Ultrafox'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Acompanhamento da Equipe
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Gerencie os colaboradores da sua empresa, acompanhe o progresso em tempo real e emita certificados oficiais.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => navigateTo('partner-team')}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Novo Funcionário</span>
            </button>
            <button
              onClick={() => navigateTo('catalogo')}
              className="px-4 py-2.5 rounded-xl bg-slate-700/80 hover:bg-slate-600 text-white text-xs font-semibold border border-slate-600 flex items-center gap-2 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Ver Cursos</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Total de Colaboradores</span>
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {totalEmployees}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Cadastrados na sua empresa
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Alunos Ativos</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {activeEmployees}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Acessando os treinamentos
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Progresso Médio da Equipe</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {teamAverageProgress}%
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            Acima da média geral
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Certificados Conquistados</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            6
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Emissão White Label
          </div>
        </div>
      </div>

      {/* Team Table Preview */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-500" />
              <span>Colaboradores da Empresa</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Lista de funcionários da sua equipe com acesso aos treinamentos
            </p>
          </div>
          <button
            onClick={() => navigateTo('partner-team')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>Gerenciar Equipe Completa</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="pb-3 font-semibold">Colaborador</th>
                <th className="pb-3 font-semibold">Papel</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Progresso Geral</th>
                <th className="pb-3 font-semibold text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {teamMembers.map((user, idx) => (
                <tr key={user.uid} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 pr-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                        alt=""
                        className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">{user.name}</div>
                        <div className="text-[11px] text-slate-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 pr-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                      {user.role === 'partner_admin' ? 'Administrador' : 'Aluno'}
                    </span>
                  </td>
                  <td className="py-3.5 pr-3">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Ativo
                    </span>
                  </td>
                  <td className="py-3.5 pr-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${idx === 0 ? 92 : 65}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        {idx === 0 ? '92%' : '65%'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => navigateTo('partner-team')}
                      className="text-xs text-sky-600 dark:text-sky-400 hover:underline font-semibold"
                    >
                      Detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
