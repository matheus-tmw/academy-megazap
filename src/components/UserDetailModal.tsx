import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Building2, 
  Shield, 
  Award, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  KeyRound, 
  Power, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  PlayCircle,
  FileCheck,
  GraduationCap,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { UserProfile, ProgressRecord, CertificateDocument, Partner } from '../types/backend';
import { TRACKS_DATA } from '../data/coursesData';
import { getUserProgress } from '../services/progressService';
import { getUserCertificates } from '../services/certificateService';
import { getPartner } from '../services/partnerService';
import { formatDisplayIdentifier } from '../utils/userIdentifiers';
import { useAcademy } from '../context/AcademyContext';

interface UserDetailModalProps {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  partnerName?: string;
  onResetPassword?: (user: UserProfile) => void;
  onToggleStatus?: (user: UserProfile) => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  isOpen,
  onClose,
  partnerName,
  onResetPassword,
  onToggleStatus
}) => {
  const { getLessonDisplayDuration } = useAcademy();
  const [activeTab, setActiveTab] = useState<'tracks' | 'certificates' | 'account'>('tracks');
  const [progressMap, setProgressMap] = useState<Record<string, ProgressRecord>>({});
  const [certificates, setCertificates] = useState<CertificateDocument[]>([]);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedTrackId, setExpandedTrackId] = useState<string | null>('primeiros-passos');

  useEffect(() => {
    if (!user || !isOpen) return;

    let isMounted = true;
    setLoading(true);

    async function loadUserData() {
      try {
        // Fetch progress & certs in parallel
        const [prog, certs, partnerData] = await Promise.all([
          getUserProgress(user.uid),
          getUserCertificates(user.uid),
          user.partnerId ? getPartner(user.partnerId) : Promise.resolve(null)
        ]);

        if (!isMounted) return;

        setProgressMap(prog || {});
        setCertificates(certs || []);

        if (partnerData) {
          setPartner(partnerData);
        }
      } catch (err) {
        console.warn('Error loading user detail info:', err);
        if (isMounted) {
          setProgressMap({});
          setCertificates([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadUserData();

    return () => {
      isMounted = false;
    };
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  // Helpers to calculate stats
  const allLessons = TRACKS_DATA.flatMap(t => t.modules.flatMap(m => m.lessons));
  const totalLessonsCount = allLessons.length;
  
  let completedLessonsCount = 0;
  allLessons.forEach(l => {
    if (progressMap[l.id]?.completed) {
      completedLessonsCount++;
    }
  });

  // Calculate overall percent completed
  const overallPercent = totalLessonsCount > 0 
    ? Math.min(100, Math.round((completedLessonsCount / totalLessonsCount) * 100))
    : 0;

  const displayPartnerName = partnerName || partner?.displayName || partner?.name || (user.partnerId ? 'Empresa Parceira' : 'MegaZap HQ');
  const displayIdentifier = formatDisplayIdentifier(user.email);

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200 cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden cursor-default"
      >
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white border-b border-slate-800 relative">
          <button 
            onClick={onClose} 
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <img
              src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
              alt={user.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-700 bg-slate-800 shrink-0 shadow-md"
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-white truncate">{user.name}</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  user.role === 'super_admin'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    : user.role === 'partner_admin'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                }`}>
                  {user.role === 'super_admin' ? 'Super Admin' : user.role === 'partner_admin' ? 'Partner Admin' : 'Aluno (Partner User)'}
                </span>

                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  user.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {user.status === 'active' ? '● Ativo' : '● Inativo'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-300">
                <span className="flex items-center gap-1.5 font-mono text-slate-300">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {displayIdentifier}
                </span>
                <span className="flex items-center gap-1.5 font-medium text-emerald-400">
                  <Building2 className="w-3.5 h-3.5" />
                  {displayPartnerName}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800 text-xs">
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Progresso Geral</div>
              <div className="text-lg font-bold text-emerald-400 mt-0.5">{overallPercent}%</div>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Aulas Assistidas</div>
              <div className="text-lg font-bold text-white mt-0.5">{completedLessonsCount} / {totalLessonsCount}</div>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Certificado Master</div>
              <div className="text-lg font-bold text-amber-400 mt-0.5">{overallPercent === 100 ? '100% (Emitido)' : `${overallPercent}% (Pendente)`}</div>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Status Acesso</div>
              <div className="text-lg font-bold text-sky-400 mt-0.5">{user.status === 'active' ? 'Liberado' : 'Bloqueado'}</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 px-6 pt-2">
          <button
            onClick={() => setActiveTab('tracks')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'tracks'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Trilhas & Aulas Assistidas</span>
          </button>
          
          <button
            onClick={() => setActiveTab('certificates')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'certificates'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Certificado Master</span>
          </button>

          <button
            onClick={() => setActiveTab('account')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'account'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Credenciais & Segurança</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span>Carregando dados das trilhas do usuário...</span>
            </div>
          ) : activeTab === 'tracks' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Progresso Detalhado por Trilha
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Acompanhe quais aulas o colaborador assistiu e concluiu em cada treinamento.
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  {completedLessonsCount} de {totalLessonsCount} aulas ({overallPercent}%)
                </span>
              </div>

              {/* Tracks List */}
              <div className="space-y-3">
                {TRACKS_DATA.map(track => {
                  const trackLessons = track.modules.flatMap(m => m.lessons);
                  const trackCompletedCount = trackLessons.filter(l => progressMap[l.id]?.completed).length;
                  const trackPercent = trackLessons.length > 0 
                    ? Math.round((trackCompletedCount / trackLessons.length) * 100)
                    : 0;
                  const isExpanded = expandedTrackId === track.id;

                  return (
                    <div 
                      key={track.id}
                      className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-800/30 transition-all"
                    >
                      {/* Track Header Bar */}
                      <button
                        onClick={() => setExpandedTrackId(isExpanded ? null : track.id)}
                        className="w-full p-4 flex items-center justify-between gap-4 text-left hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`p-2 rounded-xl text-white shrink-0 bg-gradient-to-br ${
                            track.badgeColor === 'blue' ? 'from-sky-500 to-blue-600' :
                            track.badgeColor === 'green' ? 'from-emerald-500 to-teal-600' :
                            track.badgeColor === 'purple' ? 'from-purple-500 to-indigo-600' :
                            track.badgeColor === 'amber' ? 'from-amber-500 to-orange-600' :
                            'from-slate-600 to-slate-700'
                          }`}>
                            <BookOpen className="w-4 h-4" />
                          </div>
                          
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              Trilha: {track.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {track.estimatedHours} • {trackLessons.length} aulas disponíveis
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right hidden sm:block">
                            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {trackPercent}%
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {trackCompletedCount}/{trackLessons.length} aulas
                            </div>
                          </div>

                          <div className="w-20 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden hidden xs:block">
                            <div 
                              className="h-full bg-emerald-500 rounded-full" 
                              style={{ width: `${trackPercent}%` }} 
                            />
                          </div>

                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </button>

                      {/* Expandable Modules & Lessons */}
                      {isExpanded && (
                        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-4">
                          {track.modules.map(module => (
                            <div key={module.id} className="space-y-2">
                              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span>{module.title}</span>
                              </div>

                              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800/80 rounded-xl overflow-hidden">
                                {module.lessons.map((lesson, lIdx) => {
                                  const record = progressMap[lesson.id];
                                  const isCompleted = Boolean(record?.completed);
                                  const progPercent = record?.progressPercent || (isCompleted ? 100 : 0);

                                  return (
                                    <div 
                                      key={lesson.id} 
                                      className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors text-xs"
                                    >
                                      <div className="flex items-center gap-3 min-w-0">
                                        <div className={`p-1.5 rounded-lg shrink-0 ${
                                          isCompleted 
                                            ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400' 
                                            : progPercent > 0
                                            ? 'bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                        }`}>
                                          {isCompleted ? (
                                            <CheckCircle2 className="w-4 h-4" />
                                          ) : (
                                            <PlayCircle className="w-4 h-4" />
                                          )}
                                        </div>

                                        <div className="min-w-0">
                                          <div className="font-semibold text-slate-900 dark:text-white truncate">
                                            {lIdx + 1}. {lesson.title}
                                          </div>
                                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                                            {getLessonDisplayDuration(lesson) && (
                                              <>
                                                <span className="flex items-center gap-1">
                                                  <Clock className="w-3 h-3 text-slate-400" />
                                                  {getLessonDisplayDuration(lesson)}
                                                </span>
                                                <span>•</span>
                                              </>
                                            )}
                                            <span>Nível: {lesson.level}</span>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2 shrink-0">
                                        {isCompleted ? (
                                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                            Concluída
                                          </span>
                                        ) : progPercent > 0 ? (
                                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                                            {progPercent}% Assistido
                                          </span>
                                        ) : (
                                          <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                            Não assistida
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : activeTab === 'certificates' ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Status do Certificado Master
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  O certificado definitivo de especialização exige 100% de conclusão de todas as trilhas oficiais.
                </p>
              </div>

              {overallPercent === 100 ? (
                <div className="p-5 rounded-2xl border-2 border-amber-300 dark:border-amber-700 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 dark:from-amber-950/40 dark:to-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="p-3.5 rounded-2xl bg-amber-500 text-white shadow-md shrink-0">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100 rounded">
                        100% Concluído • Válido
                      </span>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-sm mt-1">
                        Certificado de Especialista MegaZap White Label
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Código: MZ-MASTER-2026-{(user.uid || '2026').substring(0, 6).toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Apto para Emissão</span>
                  </span>
                </div>
              ) : (
                <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-center space-y-3">
                  <Award className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto" />
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                      Certificado Em Progresso ({overallPercent}%)
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                      O colaborador assistiu <strong>{completedLessonsCount} de {totalLessonsCount} aulas</strong>. Faltam {totalLessonsCount - completedLessonsCount} aulas para liberar a emissão do certificado.
                    </p>
                  </div>
                  <div className="w-full max-w-xs mx-auto h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${overallPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Credenciais e Permissões do Usuário
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Definições de segurança, papel no sistema e controle de acesso.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3 text-xs">
                  <div className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                    Identificação
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Nome Completo:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{user.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Usuário / E-mail:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">{displayIdentifier}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">UID Técnico (Firestore):</span>
                    <span className="font-mono text-[10px] text-slate-400 truncate block">{user.uid}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3 text-xs">
                  <div className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                    Organização & Nível
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Empresa Vinculada:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{displayPartnerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Nível de Acesso:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {user.role === 'super_admin' ? 'Super Admin' : user.role === 'partner_admin' ? 'Partner Admin (Revenda)' : 'Partner User (Aluno/Funcionário)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Status da Conta:</span>
                    <span className={`font-bold ${user.status === 'active' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {user.status === 'active' ? 'Ativo (Acesso Liberado)' : 'Inativo (Acesso Bloqueado)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs">
                  <div className="font-bold text-slate-900 dark:text-white">Ações de Segurança</div>
                  <div className="text-[11px] text-slate-400">Redefina a senha ou altere o status de acesso do colaborador.</div>
                </div>

                <div className="flex items-center gap-2">
                  {onResetPassword && (
                    <button
                      onClick={() => onResetPassword(user)}
                      className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                      <span>Redefinir Acesso</span>
                    </button>
                  )}

                  {onToggleStatus && (
                    <button
                      onClick={() => onToggleStatus(user)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer ${
                        user.status === 'active'
                          ? 'border-rose-200 dark:border-rose-800 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                          : 'border-emerald-200 dark:border-emerald-800 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{user.status === 'active' ? 'Desativar Acesso' : 'Ativar Acesso'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-mono">
            ID: {user.uid}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl font-bold cursor-pointer transition-colors"
          >
            Fechar Detalhes
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper mock generators for preview when Firestore maps are blank
function generateMockProgress(uid: string): Record<string, ProgressRecord> {
  const isHighProgress = uid.includes('paulo') || uid.includes('vinicius') || uid.includes('carlos');
  const mock: Record<string, ProgressRecord> = {};

  TRACKS_DATA.forEach((track, tIdx) => {
    track.modules.forEach(mod => {
      mod.lessons.forEach((lesson, lIdx) => {
        const completed = isHighProgress 
          ? (tIdx === 0 || (tIdx === 1 && lIdx < 2))
          : (tIdx === 0 && lIdx < 2);

        mock[lesson.id] = {
          lessonId: lesson.id,
          courseId: track.id,
          moduleId: mod.id,
          completed,
          progressPercent: completed ? 100 : (tIdx === 1 && lIdx === 2 ? 45 : 0),
          startedAt: '',
          completedAt: completed ? '2026-08-15' : null,
          lastWatchedAt: '2026-08-18',
          updatedAt: '2026-08-18'
        };
      });
    });
  });

  return mock;
}

function generateMockCertificates(user: UserProfile): CertificateDocument[] {
  return [
    {
      id: `cert-01-${user.uid}`,
      userId: user.uid,
      partnerId: user.partnerId || 'partner_ultrafox',
      courseId: 'primeiros-passos',
      courseTitle: 'Certificação em Onboarding e Implantação White Label',
      issuedAt: '2026-08-10',
      certificateNumber: `MZ-WL-PP-${user.uid.substring(0, 6).toUpperCase()}`,
      status: 'valid'
    }
  ];
}
