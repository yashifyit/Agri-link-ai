import React, { useState } from 'react';
import { Globe, Bell, User as UserIcon, LogOut, ChevronLeft, ArrowLeft, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

import { UserRole, Language } from '../types';
import { AVAILABLE_LANGUAGES, t } from '../utils/i18n';
import { AuthModal } from './AuthModal';
import { NotificationCenter } from './NotificationCenter';

export const Navbar: React.FC = () => {
  const { role, setRole, language, setLanguage, currentTab, setCurrentTab, isSyncing, refreshData } = useApp();
  const { user } = useAuth();


  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Helper title for mobile screens
  const getMobileTitle = () => {
    switch (currentTab) {
      case 'overview': return t('home', language) + ' — ' + t('roleFarmer', language);
      case 'markets': return t('markets', language);
      case 'offers': return t('orders', language);
      case 'agrios': return t('agrios', language);
      case 'ai-engine': return t('aiEngine', language);
      case 'buyers': return t('buyers', language);
      case 'fpo': return t('fpo', language);
      case 'admin': return t('admin', language);
      default: return t('appName', language);
    }
  };

  const navLinks = [
    { id: 'overview', label: t('home', language) },
    { id: 'markets', label: t('markets', language) },
    { id: 'agrios', label: '⚡ ' + t('agrios', language) },
    { id: 'ai-engine', label: t('aiEngine', language) },
    { id: 'buyers', label: t('buyers', language) },
    { id: 'offers', label: t('orders', language) },
    { id: 'fpo', label: t('fpo', language) },
    { id: 'admin', label: t('admin', language) }
  ];

  const isSubPage = currentTab !== 'landing' && currentTab !== 'overview';

  return (
    <header className="sticky top-0 z-40 bg-forest text-white shadow-md border-b border-forest-light pt-safe select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-18">
          
          {/* BRAND LOGO & CONTEXTUAL TITLE */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {isSubPage && (
              <button
                onClick={() => setCurrentTab('overview')}
                aria-label="Back to Dashboard"
                className="md:hidden min-touch -ml-1 p-2 rounded-xl text-white/90 hover:bg-forest-light active:bg-forest-hover flex items-center justify-center transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-freshGreen" />
              </button>
            )}

            <div 
              className="flex items-center gap-2 cursor-pointer group min-w-0" 
              onClick={() => setCurrentTab('overview')}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-agriGreen to-forest-light text-white flex items-center justify-center shadow-md border border-agriGreen-accent/40 group-hover:scale-105 transition-transform shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-freshGreen" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.4 19 2c1 2 2 4.1 2 7 0 6-4.5 11-10 11Z" fill="currentColor" fillOpacity="0.15" />
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.4 19 2c1 2 2 4.1 2 7 0 6-4.5 11-10 11Z" />
                  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                </svg>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg sm:text-2xl font-black tracking-tight text-white font-sans truncate">
                    {t('appName', language)}
                  </span>
                  <span className="text-[10px] hidden lg:inline-block font-extrabold px-2 py-0.2 rounded-full bg-agriGreen-light/20 text-freshGreen border border-freshGreen/30">
                    Pro
                  </span>
                </div>
                <p className="text-[10px] text-freshGreen font-medium hidden sm:block truncate">
                  {t('appTagline', language)}
                </p>
                <span className="text-[11px] text-white/80 font-bold block sm:hidden truncate">
                  {getMobileTitle()}
                </span>
              </div>
            </div>
          </div>

          {/* DESKTOP NAVIGATION LINKS (Hidden on Mobile) */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((nav) => (
              <button
                key={nav.id}
                onClick={() => setCurrentTab(nav.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  currentTab === nav.id
                    ? 'bg-agriGreen text-white shadow-md font-bold'
                    : 'text-white/80 hover:text-white hover:bg-forest-light'
                }`}
              >
                {nav.label}
              </button>
            ))}
          </nav>

          {/* RIGHT CONTROLS: ROLE, SYNC, LANGUAGE & NOTIFICATIONS */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
            
            {/* Live Sync Indicator & Trigger */}
            <button
              onClick={() => refreshData()}
              disabled={isSyncing}
              title="Live Data Synchronization (Farmer & Buyer Sync)"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-forest-light hover:bg-forest-hover border border-white/15 text-[11px] font-bold text-white transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-agriGreen animate-ping inline-block" />
              <RefreshCw className={`w-3.5 h-3.5 text-freshGreen ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="text-[10px] text-white/90">Live Sync</span>
            </button>

            {/* Role Switcher Dropdown (Compact on Mobile) */}
            <div className="relative flex items-center bg-forest-light rounded-xl px-1.5 py-0.5 sm:px-2 sm:py-1 border border-white/15 shadow-inner">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="bg-transparent text-white text-[11px] sm:text-xs font-bold py-1 focus:outline-none cursor-pointer border-none"
              >
                <option value="FARMER" className="text-charcoal bg-white">{t('roleFarmer', language)}</option>
                <option value="BUYER" className="text-charcoal bg-white">{t('roleBuyer', language)}</option>
                <option value="FPO" className="text-charcoal bg-white">{t('roleFpo', language)}</option>
                <option value="LOGISTICS" className="text-charcoal bg-white">🚚 Logistics Partner</option>
                <option value="ADMIN" className="text-charcoal bg-white">{t('roleAdmin', language)}</option>
              </select>
            </div>


            {/* Language Selector */}
            <div className="flex items-center bg-forest-light rounded-xl px-2 py-1 border border-white/15">
              <Globe className="w-3.5 h-3.5 text-freshGreen mr-1.5" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                aria-label="Select Language"
                className="bg-transparent text-white text-[11px] sm:text-xs font-bold focus:outline-none cursor-pointer"
              >
                {AVAILABLE_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="text-charcoal bg-white font-medium">
                    {lang.nativeName} ({lang.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Notification Center Button (Touch Target >= 44x44px) */}
            <button
              onClick={() => setIsNotifOpen(true)}
              aria-label="Open notifications"
              className="min-touch relative p-2 rounded-xl bg-forest-light hover:bg-forest-hover active:bg-forest-hover text-white/90 border border-white/15 transition-colors flex items-center justify-center"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amberGold animate-ping" />
            </button>

            {/* User Profile / Auth Button */}
            {user ? (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="min-touch flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-agriGreen hover:bg-agriGreen-hover active:scale-95 text-white text-xs font-bold transition-all shadow-sm"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline-block">{user.name.split(' ')[0]}</span>
              </button>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="min-touch px-2.5 sm:px-3 py-1.5 rounded-xl bg-amberGold text-charcoal text-xs font-bold hover:bg-amber-600 active:scale-95 transition-all shadow-sm flex items-center justify-center"
              >
                Sign In
              </button>
            )}

          </div>

        </div>
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <NotificationCenter isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </header>
  );
};
