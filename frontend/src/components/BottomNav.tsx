import React from 'react';
import { Home, ShoppingBag, Plus, Package, Cpu } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BottomNav: React.FC<{ onOpenCreateLot: () => void }> = ({ onOpenCreateLot }) => {
  const { currentTab, setCurrentTab } = useApp();

  const navItems = [
    { id: 'overview', label: 'Home', icon: Home },
    { id: 'markets', label: 'Market', icon: ShoppingBag },
    { id: 'sell', label: 'Sell', icon: Plus, isAction: true },
    { id: 'offers', label: 'Orders', icon: Package },
    { id: 'agrios', label: 'AgriOS', icon: Cpu, isAgriOS: true },
  ];

  return (
    <nav 
      aria-label="Mobile Navigation Bar"
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-agriBorder shadow-2xl md:hidden select-none pb-safe"
    >
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto items-center px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          if (item.isAction) {
            return (
              <button
                key={item.id}
                onClick={onOpenCreateLot}
                aria-label="Sell Crop"
                className="flex flex-col items-center justify-center -mt-5 group min-touch"
              >
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-agriGreen to-forest text-white flex items-center justify-center shadow-lg border-3 border-white transform group-hover:scale-105 active:scale-95 transition-transform">
                  <Plus className="w-7 h-7 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-black text-forest mt-0.5 tracking-tight">Sell</span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`min-touch flex flex-col items-center justify-center py-1 rounded-xl transition-all active:scale-90 ${
                isActive ? 'text-forest font-black' : 'text-charcoal-muted hover:text-charcoal'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-forest stroke-[2.3]' : 'text-charcoal-muted'}`} />
                {item.isAgriOS && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-freshGreen animate-ping" />
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? 'font-black text-forest' : 'font-semibold'}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-agriGreen mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
