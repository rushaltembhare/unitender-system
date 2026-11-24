import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AiAssistantModal } from './components/AiAssistantModal';
import { HashChainModal } from './components/HashChainModal';

// Pages
import { Dashboard } from './pages/Dashboard';
import { NoticeBoard } from './pages/NoticeBoard';
import { RequisitionList } from './pages/RequisitionList';
import { TenderCreate } from './pages/TenderCreate';
import { TenderDetails } from './pages/TenderDetails';
import { BidSubmission } from './pages/BidSubmission';
import { BidOpeningRoom } from './pages/BidOpeningRoom';
import { EvaluationDesk } from './pages/EvaluationDesk';
import { ContractManager } from './pages/ContractManager';
import { VendorPortal } from './pages/VendorPortal';
import { PaymentsHub } from './pages/PaymentsHub';
import { InventoryRegister } from './pages/InventoryRegister';
import { AuditLedger } from './pages/AuditLedger';
import { RtiDisclosures } from './pages/RtiDisclosures';
import { VendorGuide } from './pages/VendorGuide';
import { LoginPage } from './pages/LoginPage';

function AppContent() {
  const { user, allUsers, switchUser, isAuthenticated, loading } = useAuth();
  const { t } = useLanguage();
  const [currentTab, setCurrentTab] = useState('dashboard');

  // Modals state
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [ledgerModalOpen, setLedgerModalOpen] = useState(false);
  const [activeBidTender, setActiveBidTender] = useState(null);
  const [activeDetailsTender, setActiveDetailsTender] = useState(null);

  // Cross-page state (e.g. AI drafted specs transferred to Create Tender)
  const [aiPrefilledSpecs, setAiPrefilledSpecs] = useState(null);
  const [evaluationTenderId, setEvaluationTenderId] = useState('TDR-2026-001');

  const handleApplySpecsFromAi = (generated) => {
    setAiPrefilledSpecs(generated);
    setCurrentTab('create-tender');
  };

  const handleOpenBidModal = (tender) => {
    setActiveBidTender(tender);
  };

  const handleOpenDetailsModal = (tender) => {
    setActiveDetailsTender(tender);
  };

  const handleNavigateToEvaluation = (tenderId) => {
    setEvaluationTenderId(tenderId);
    setCurrentTab('evaluation');
  };

  const handleNavigateToInventory = () => {
    setCurrentTab('inventory');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xs">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping"></span>
          <span className="font-semibold text-slate-300">Initializing UniTender Institutional Security Layer...</span>
        </div>
      </div>
    );
  }

  // Dedicated Login & Authentication Page Gate
  if (!isAuthenticated) {
    return (
      <LoginPage 
        onOpenVendorRegister={() => {
          // Switch to a vendor and open registration
          const vendorUser = allUsers.find(u => u.role === 'vendor') || { id: 'vendor-1', role: 'vendor' };
          switchUser(vendorUser.id);
          setCurrentTab('vendors');
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f5ee] text-[#2c1d1a]">
      
      {/* Top Universal Navbar */}
      <Navbar 
        onOpenAiModal={() => setAiModalOpen(true)}
        onOpenLedgerModal={() => setLedgerModalOpen(true)}
      />

      <div className="flex flex-1 max-w-7xl w-full mx-auto">
        
        {/* Dynamic Role-Aware Sidebar */}
        <Sidebar 
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
        />

        {/* Main Workspace Body */}
        <main className="flex-1 p-6 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <Dashboard 
              onNavigate={(tab) => setCurrentTab(tab)}
              onOpenAiModal={() => setAiModalOpen(true)}
              onOpenLedgerModal={() => setLedgerModalOpen(true)}
            />
          )}

          {currentTab === 'notice-board' && (
            <NoticeBoard 
              onOpenBidModal={handleOpenBidModal}
              onOpenDetailsModal={handleOpenDetailsModal}
            />
          )}

          {currentTab === 'requisitions' && (
            <RequisitionList />
          )}

          {currentTab === 'create-tender' && (
            <TenderCreate 
              prefilledData={aiPrefilledSpecs}
              onTenderCreated={() => {
                setAiPrefilledSpecs(null);
                setCurrentTab('notice-board');
              }}
            />
          )}

          {currentTab === 'bid-opening' && (
            <BidOpeningRoom 
              onNavigateToEvaluation={handleNavigateToEvaluation}
            />
          )}

          {currentTab === 'evaluation' && (
            <EvaluationDesk 
              initialTenderId={evaluationTenderId}
              onAwardComplete={() => setCurrentTab('contracts')}
            />
          )}

          {currentTab === 'contracts' && (
            <ContractManager 
              onNavigateToInventory={handleNavigateToInventory}
            />
          )}

          {currentTab === 'vendors' && (
            <VendorPortal />
          )}

          {currentTab === 'payments' && (
            <PaymentsHub />
          )}

          {currentTab === 'inventory' && (
            <InventoryRegister />
          )}

          {currentTab === 'audit' && (
            <AuditLedger />
          )}

          {currentTab === 'rti' && (
            <RtiDisclosures />
          )}

          {currentTab === 'guide' && (
            <VendorGuide 
              onNavigate={(tab) => setCurrentTab(tab)}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <AiAssistantModal 
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onApplySpecs={handleApplySpecsFromAi}
      />

      <HashChainModal 
        isOpen={ledgerModalOpen}
        onClose={() => setLedgerModalOpen(false)}
      />

      {activeBidTender && (
        <BidSubmission 
          tender={activeBidTender}
          onClose={() => setActiveBidTender(null)}
          onBidSubmitted={() => {
            setActiveBidTender(null);
            setCurrentTab('notice-board');
          }}
        />
      )}

      {activeDetailsTender && (
        <TenderDetails 
          tender={activeDetailsTender}
          onClose={() => setActiveDetailsTender(null)}
          onOpenBidModal={handleOpenBidModal}
        />
      )}

    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
