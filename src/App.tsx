/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AcademyProvider, useAcademy } from './context/AcademyContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { CertificateModal } from './components/CertificateModal';
import { FirstLoginPasswordModal } from './components/FirstLoginPasswordModal';

// Views - Student & General
import { DashboardView } from './views/DashboardView';
import { CatalogoView } from './views/CatalogoView';
import { TrilhaDetalhesView } from './views/TrilhaDetalhesView';
import { AulaPlayerView } from './views/AulaPlayerView';
import { MeusTreinamentosView } from './views/MeusTreinamentosView';
import { MeuProgressoView } from './views/MeuProgressoView';
import { FavoritosView } from './views/FavoritosView';
import { CertificadosView } from './views/CertificadosView';
import { CentralAjudaView } from './views/CentralAjudaView';
import { MeuPerfilView } from './views/MeuPerfilView';
import { LoginView } from './views/LoginView';

// Views - Super Admin
import { AdminDashboardView } from './views/admin/AdminDashboardView';
import { AdminPartnersView } from './views/admin/AdminPartnersView';
import { AdminUsersView } from './views/admin/AdminUsersView';
import { AdminAuditLogsView } from './views/admin/AdminAuditLogsView';
import { AdminContentCMSView } from './views/admin/AdminContentCMSView';

// Views - Partner Admin
import { PartnerDashboardView } from './views/partner/PartnerDashboardView';
import { PartnerTeamView } from './views/partner/PartnerTeamView';

// Access Denied Shield
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const AccessDeniedView: React.FC<{ requiredRole: string }> = ({ requiredRole }) => {
  const { navigateTo, switchDemoRole, isRealSuperAdmin, realUserProfile } = useAcademy();
  const canSwitchToRole = !realUserProfile || isRealSuperAdmin;

  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center shadow-lg">
      <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
        <ShieldAlert className="w-6 h-6" />
      </div>
      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Acesso Restrito</h2>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
        Esta área requer permissões de <span className="font-semibold text-slate-800 dark:text-slate-200">{requiredRole}</span>.
      </p>
      <div className="mt-6 flex flex-col gap-2">
        <button
          onClick={() => navigateTo('dashboard')}
          className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Início</span>
        </button>
        {canSwitchToRole && (
          <button
            onClick={() => switchDemoRole(requiredRole as any)}
            className="w-full py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            Alternar para {requiredRole} (Modo Teste)
          </button>
        )}
      </div>
    </div>
  );
};

const MainContent: React.FC = () => {
  const { 
    activeTab, 
    isSuperAdmin, 
    isPartnerAdmin,
    isPartnerUser,
    authLoading,
    currentUser,
    clearMustChangePasswordFlag
  } = useAcademy();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If loading initial authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-medium">Carregando MegaZap Academy...</span>
        </div>
      </div>
    );
  }

  // If not logged in or viewing standalone login screen
  if (!currentUser || activeTab === 'login') {
    return <LoginView />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      // Super Admin Routes
      case 'admin-dashboard':
        return isSuperAdmin ? <AdminDashboardView /> : <AccessDeniedView requiredRole="super_admin" />;
      case 'admin-partners':
        return isSuperAdmin ? <AdminPartnersView /> : <AccessDeniedView requiredRole="super_admin" />;
      case 'admin-content':
      case 'admin-cms':
        return isSuperAdmin ? <AdminContentCMSView /> : <AccessDeniedView requiredRole="super_admin" />;
      case 'admin-users':
        return isSuperAdmin ? <AdminUsersView /> : <AccessDeniedView requiredRole="super_admin" />;
      case 'admin-logs':
        return isSuperAdmin ? <AdminAuditLogsView /> : <AccessDeniedView requiredRole="super_admin" />;

      // Partner Admin Routes
      case 'partner-dashboard':
        return isPartnerAdmin || isSuperAdmin ? <PartnerDashboardView /> : <AccessDeniedView requiredRole="partner_admin" />;
      case 'partner-team':
        return isPartnerAdmin || isSuperAdmin ? <PartnerTeamView /> : <AccessDeniedView requiredRole="partner_admin" />;

      // Profile & User Settings
      case 'meu-perfil':
        return <MeuPerfilView />;

      // Core Training & Catalog Routes (MegaZap Academy Platform)
      case 'dashboard':
        return <DashboardView />;
      case 'catalogo':
        return <CatalogoView />;
      case 'trilha-detalhe':
        return <TrilhaDetalhesView />;
      case 'aula-player':
        return <AulaPlayerView />;
      case 'meus-treinamentos':
        return <MeusTreinamentosView />;
      case 'meu-progresso':
        return <MeuProgressoView />;
      case 'favoritos':
        return <FavoritosView />;
      case 'certificados':
        return <CertificadosView />;
      case 'central-ajuda':
        return <CentralAjudaView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col antialiased selection:bg-sky-500 selection:text-white transition-colors duration-200">
      {/* Sidebar (Desktop + Mobile Drawer) */}
      <Sidebar 
        mobileOpen={mobileMenuOpen} 
        onCloseMobile={() => setMobileMenuOpen(false)} 
      />

      {/* Main Layout Area (offset for desktop sidebar) */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        {/* Dynamic Main Body */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 py-4 px-6 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              MegaZap Academy © 2026 • Plataforma Oficial de Capacitação White Label
            </span>
            <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
              <span>Etapa 2: RBAC + Multi-Tenant</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Sistemas Operacionais 100% Online</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Global Modals */}
      <GlobalSearchModal />
      <CertificateModal />
      <FirstLoginPasswordModal
        isOpen={Boolean(currentUser?.mustChangePassword)}
        onSuccess={() => {
          clearMustChangePasswordFlag();
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <AcademyProvider>
      <MainContent />
    </AcademyProvider>
  );
}
