import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { LandingView } from './features/LandingView';
import { FarmerDashboard } from './features/FarmerDashboard';
import { MarketIntelligenceView } from './features/MarketIntelligenceView';
import { AISaleEngineView } from './features/AISaleEngineView';
import { BuyerDiscoveryView } from './features/BuyerDiscoveryView';
import { BuyerDashboardView } from './features/BuyerDashboardView';
import { FPODashboardView } from './features/FPODashboardView';
import { TransactionFlowView } from './features/TransactionFlowView';
import { AdminCommandCenterView } from './features/AdminCommandCenterView';
import { AgriOSCommandCenterView } from './features/AgriOSCommandCenterView';
import { LogisticsDashboardView } from './features/LogisticsDashboardView';
import { CreateLotWizardModal } from './components/CreateLotWizardModal';
import { OfferNegotiationModal } from './components/OfferNegotiationModal';
import { KisanLinkAIAssistant } from './components/KisanLinkAIAssistant';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition } from './utils/animations';

const MainContent: React.FC = () => {
  const { role, currentTab, setCurrentTab, offers } = useApp();

  const [isCreateLotOpen, setIsCreateLotOpen] = useState(false);
  const [isNegotiationOpen, setIsNegotiationOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-cream text-charcoal antialiased selection:bg-agriGreen selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 pb-24 md:pb-8 overflow-x-hidden momentum-scroll">
        <AnimatePresence mode="wait">
          <motion.div
            key={role + '-' + currentTab}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
          >
            {/* VIEW ROUTER LOGIC */}
            {currentTab === 'agrios' ? (
              <AgriOSCommandCenterView />
            ) : role === 'LOGISTICS' ? (
              <LogisticsDashboardView />
            ) : role === 'BUYER' ? (
              <BuyerDashboardView onOpenNegotiation={() => setIsNegotiationOpen(true)} />
            ) : role === 'FPO' ? (
              <FPODashboardView onOpenNegotiation={() => setIsNegotiationOpen(true)} />
            ) : role === 'ADMIN' ? (
              <AdminCommandCenterView />
            ) : (
              /* FARMER ROLE VIEWS */
              currentTab === 'overview' ? (
                <FarmerDashboard
                  onOpenCreateLot={() => setIsCreateLotOpen(true)}
                  onOpenNegotiation={() => setIsNegotiationOpen(true)}
                />
              ) : currentTab === 'markets' ? (
                <MarketIntelligenceView />
              ) : currentTab === 'ai-engine' ? (
                <AISaleEngineView onOpenNegotiation={() => setIsNegotiationOpen(true)} />
              ) : currentTab === 'buyers' ? (
                <BuyerDiscoveryView onOpenNegotiation={() => setIsNegotiationOpen(true)} />
              ) : currentTab === 'offers' ? (
                <TransactionFlowView onOpenNegotiation={() => setIsNegotiationOpen(true)} />
              ) : currentTab === 'fpo' ? (
                <FPODashboardView onOpenNegotiation={() => setIsNegotiationOpen(true)} />
              ) : currentTab === 'admin' ? (
                <AdminCommandCenterView />
              ) : (
                <LandingView onStartSelling={() => setCurrentTab('overview')} />
              )
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* FOOTER */}
      <footer className="bg-forest text-white/70 text-xs py-8 border-t border-forest-light hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-white text-sm">KisanLink Platform</span>
            <p className="text-[11px] text-white/50 mt-0.5">Market intelligence & direct procurement layer for Indian agriculture</p>
          </div>
          <div className="flex items-center gap-4 text-white/80">
            <span>Privacy</span>
            <span>Terms</span>
            <span>API Docs</span>
            <span>Unsplash & Media Attribution</span>
          </div>
        </div>
      </footer>

      {/* MOBILE BOTTOM NAVIGATION */}
      <BottomNav onOpenCreateLot={() => setIsCreateLotOpen(true)} />

      {/* GLOBAL MODALS */}
      <CreateLotWizardModal isOpen={isCreateLotOpen} onClose={() => setIsCreateLotOpen(false)} />
      {isNegotiationOpen && (
        <OfferNegotiationModal
          isOpen={isNegotiationOpen}
          onClose={() => setIsNegotiationOpen(false)}
          offer={
            (offers && offers.length > 0 && offers.find(o => o.buyer_name?.includes('FreshHarvest'))) ||
            (offers && offers.length > 0 ? offers[0] : {
              id: "KL-OFF-8831",
              lot_id: "KL-10492",
              crop: "Tomato",
              buyer_name: "FreshHarvest Foods",
              offered_price_per_kg: 33.0,
              quantity_kg: 800.0,
              transport_estimate: 1600.0,
              gross_total: 26400.0,
              net_realization: 24800.0,
              status: "PENDING" as any,
              created_at: "2026-08-23 10:30"
            })
          }
        />
      )}
      <KisanLinkAIAssistant />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </AuthProvider>
  );
};
