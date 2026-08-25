import React, { useState } from 'react';
import { 
  MapPin, TrendingUp, Sparkles, ArrowUpRight, CheckCircle2, 
  ChevronRight, PlusCircle, Settings2, Eye, CloudRain, 
  Droplets, Wind, ShieldCheck, ArrowRight, Zap, ShoppingBag
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ScoreRing } from '../components/ScoreRing';
import { AIExplanationDrawer } from '../components/AIExplanationDrawer';
import { FarmerOnboardingModal } from '../components/FarmerOnboardingModal';
import { CropDetailModal } from '../components/CropDetailModal';
import { CropImage } from '../components/CropImage';
import { CROPS_CATALOG, CropItem } from '../data/crops';
import { t } from '../utils/i18n';

export const FarmerDashboard: React.FC<{ 
  onOpenCreateLot: () => void; 
  onOpenNegotiation: () => void 
}> = ({
  onOpenCreateLot,
  onOpenNegotiation
}) => {
  const { recommendation, language, setCurrentTab } = useApp();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [selectedDetailCrop, setSelectedDetailCrop] = useState<CropItem | null>(null);

  const [selectedFarmerCrops, setSelectedFarmerCrops] = useState<string[]>(() => {
    const saved = localStorage.getItem('farmer_selected_crops');
    return saved ? JSON.parse(saved) : ['Tomato', 'Onion', 'Wheat'];
  });

  const handleSaveSelectedCrops = (newCrops: string[]) => {
    setSelectedFarmerCrops(newCrops);
    localStorage.setItem('farmer_selected_crops', JSON.stringify(newCrops));
  };

  const userCropItems = CROPS_CATALOG.filter(c => selectedFarmerCrops.includes(c.name));

  const marketSnapshots = [
    { name: 'Tomato', mandi: 28, offer: 33, change: '+6.4%', trend: 'up' },
    { name: 'Potato', mandi: 18, offer: 22, change: '+3.2%', trend: 'up' },
    { name: 'Onion', mandi: 24, offer: 29, change: '+4.8%', trend: 'up' },
    { name: 'Garlic', mandi: 140, offer: 165, change: '+8.1%', trend: 'up' },
    { name: 'Wheat', mandi: 25, offer: 28, change: '+2.4%', trend: 'up' }
  ];

  return (
    <div className="space-y-4 sm:space-y-6 pb-6 text-charcoal">
      
      {/* 1. COMPACT APP GREETING & STATUS HEADER */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-agriBorder shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=200"
            alt="Ramesh Verma Farmer"
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-agriGreen shadow-sm shrink-0"
          />
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-black text-charcoal truncate">
              Good morning, Ramesh 👋
            </h1>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] sm:text-xs text-charcoal-muted mt-0.5">
              <MapPin className="w-3 h-3 text-agriGreen shrink-0" />
              <span className="font-semibold text-charcoal">Kanpur, UP</span>
              <span className="text-charcoal-muted">•</span>
              <span className="font-bold text-forest truncate">Lot #KL-10492 Active</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOnboardingOpen(true)}
            aria-label="Manage Cultivated Crops"
            className="min-touch px-3 py-2 bg-cream hover:bg-cream-dark active:bg-cream-dark text-charcoal text-xs font-bold rounded-xl border border-agriBorder transition-all flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
          >
            <Settings2 className="w-4 h-4 text-forest shrink-0" />
            <span>Manage</span>
          </button>

          <button
            onClick={onOpenCreateLot}
            aria-label="Sell Crop Lot"
            className="min-touch px-4 py-2 bg-agriGreen hover:bg-agriGreen-hover active:scale-95 text-white text-xs font-black rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span>Sell Crop</span>
          </button>
        </div>
      </div>

      {/* 2. MARKET SNAPSHOT HORIZONTAL SCROLL (Requirement 7) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-black uppercase text-charcoal tracking-wider">
            Market Benchmark Snapshot
          </span>
          <button 
            onClick={() => setCurrentTab('markets')} 
            className="text-xs font-bold text-forest hover:text-agriGreen flex items-center gap-0.5"
          >
            See all <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1 -mx-3 px-3 sm:mx-0 sm:px-0">
          {marketSnapshots.map((item) => (
            <div
              key={item.name}
              onClick={() => setCurrentTab('markets')}
              className="bg-white p-3 rounded-2xl border border-agriBorder shadow-sm min-w-[135px] sm:min-w-[150px] shrink-0 cursor-pointer hover:border-agriGreen transition-all active:scale-98 space-y-1.5"
            >
              <div className="flex items-center gap-2">
                <CropImage
                  cropName={item.name}
                  className="w-7 h-7 rounded-lg shrink-0"
                />
                <span className="font-extrabold text-xs text-charcoal truncate">{item.name}</span>
              </div>
              <div className="flex items-baseline justify-between pt-0.5">
                <span className="text-sm font-black text-forest">₹{item.offer}/kg</span>
                <span className="text-[10px] font-black text-agriGreen bg-agriGreen-light px-1.5 py-0.2 rounded">
                  {item.change}
                </span>
              </div>
              <span className="text-[9px] text-charcoal-muted block">Mandi: ₹{item.mandi}/kg</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. HERO OPPORTUNITY CARD & BEST NET REALIZATION */}
      <div className="bg-forest text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-forest-light relative overflow-hidden space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-amberGold bg-white/10 px-2.5 py-1 rounded-full border border-white/15">
            {t('bestOpportunity', language)}
          </span>
          <span className="text-xs font-extrabold text-freshGreen bg-agriGreen/30 px-2.5 py-0.5 rounded-xl border border-agriGreen-accent/30">
            ↑ ₹3.00/kg vs Mandi
          </span>
        </div>

        <div className="flex items-center gap-3.5">
          <CropImage
            cropName="Tomato"
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border border-white/20 shadow-md shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white truncate">Tomato</h2>
              <span className="text-xs text-white/80 shrink-0">800 kg • Grade A</span>
            </div>
            <p className="text-[11px] text-white/70 truncate">Kanpur Hub → FreshHarvest Foods (Lucknow)</p>
          </div>
        </div>

        <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase text-white/70 block">{t('bestNetRealization', language)}</span>
            <span className="text-2xl sm:text-3xl font-black text-freshGreen">₹31.00 <span className="text-xs font-normal text-white/80">/ kg</span></span>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase text-white/70 block">Total Payout</span>
            <span className="text-lg font-extrabold text-white">₹24,800</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => setIsDrawerOpen(true)}
            aria-label="View Analysis"
            className="min-touch py-2.5 px-3 bg-white/15 hover:bg-white/25 active:bg-white/30 text-white text-xs font-bold rounded-xl border border-white/20 transition-all flex items-center justify-center gap-1"
          >
            <span>Analysis</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onOpenNegotiation}
            aria-label="Accept Buyer Offer"
            className="min-touch py-2.5 px-3 bg-agriGreen hover:bg-agriGreen-hover active:scale-95 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-1"
          >
            <span>Sell Offer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4. COMPACT WEATHER & AGRIOS INSIGHT (Requirement 7, 18) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* COMPACT WEATHER CARD */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-agriBorder shadow-card space-y-3">
          <div className="flex items-center justify-between border-b border-cream pb-2.5">
            <div className="flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-cyan-600" />
              <h3 className="text-sm font-black text-charcoal">Weather & Soil Telemetry</h3>
            </div>
            <span className="text-[10px] font-bold text-charcoal-muted">Kanpur District</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-3xl font-black text-charcoal">28°C</span>
              <span className="text-xs text-charcoal-muted block">Partly Cloudy • Feels 30°C</span>
            </div>
            <div className="text-right space-y-0.5 text-xs text-charcoal">
              <div className="flex items-center justify-end gap-1 font-bold text-cyan-700">
                <Droplets className="w-3.5 h-3.5" /> Rain: 18%
              </div>
              <div className="flex items-center justify-end gap-1 font-semibold text-charcoal-muted text-[11px]">
                <Wind className="w-3.5 h-3.5" /> Wind: 12 km/h
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-cream/80 rounded-xl border border-agriBorder text-xs text-charcoal space-y-0.5">
            <span className="text-[9px] font-black uppercase tracking-wider text-forest block">Next 24h Advisory:</span>
            <p className="text-[11px] text-charcoal-muted leading-relaxed">
              Optimal moisture window for tomato harvesting. Rain probability rises to 82% in 18 hours.
            </p>
          </div>
        </div>

        {/* AGRIOS INSIGHT CARD */}
        <div 
          onClick={() => setCurrentTab('agrios')}
          className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-agriBorder shadow-card space-y-3 cursor-pointer hover:border-agriGreen transition-all active:scale-98 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between border-b border-cream pb-2.5">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amberGold" />
              <h3 className="text-sm font-black text-charcoal">AgriOS Intelligence Insight</h3>
            </div>
            <span className="w-2 h-2 rounded-full bg-freshGreen animate-ping" />
          </div>

          <div className="space-y-1">
            <p className="text-xs font-bold text-charcoal leading-snug">
              Tomato processor demand in Lucknow is +11% higher. Direct buyer offers exceed Kanpur APMC by ₹3.00–₹5.00/kg.
            </p>
            <p className="text-[11px] text-forest font-bold">
              Suggested listing range: ₹31–₹34/kg.
            </p>
          </div>

          <div className="pt-2 border-t border-cream flex items-center justify-between text-xs text-forest font-black">
            <span>Open AgriOS Command Center</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

      </div>

      {/* 5. CULTIVATED CROPS LIST */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-base font-black text-charcoal">Your Cultivated Crops</h2>
            <p className="text-[11px] text-charcoal-muted">Active benchmarks for your farm</p>
          </div>
          <button
            onClick={() => setIsOnboardingOpen(true)}
            className="text-xs font-bold text-forest hover:text-agriGreen"
          >
            Edit list
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {userCropItems.map((crop) => (
            <div
              key={crop.id}
              onClick={() => setSelectedDetailCrop(crop)}
              className="bg-white rounded-2xl p-3.5 sm:p-4 border border-agriBorder shadow-sm hover:shadow-card transition-all cursor-pointer space-y-2.5 active:scale-98"
            >
              <div className="flex items-center gap-3">
                <CropImage
                  crop={crop}
                  className="w-12 h-12 rounded-xl border border-agriBorder shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="text-sm font-black text-charcoal truncate">{crop.name}</h3>
                  <span className="text-[10px] text-charcoal-muted block truncate">
                    {crop.hindiName} • {crop.category}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <div className="p-1.5 bg-cream rounded-lg border border-agriBorder">
                  <span className="text-[9px] text-charcoal-muted block">Mandi</span>
                  <span className="font-black text-charcoal text-xs">₹{crop.mandiPrice}/{crop.unit}</span>
                </div>
                <div className="p-1.5 bg-agriGreen-light rounded-lg border border-agriGreen-accent/30">
                  <span className="text-[9px] text-agriGreen font-bold block">Best Offer</span>
                  <span className="font-black text-forest text-xs">₹{crop.bestOfferPrice}/{crop.unit}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1 text-charcoal-muted">
                <span className="font-bold text-agriGreen">Demand: {crop.demandTrend} ↑</span>
                <span className="text-forest font-bold flex items-center gap-0.5">
                  Details <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. RECENT ORDERS TIMELINE PREVIEW (Requirement 7, 19) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-agriBorder shadow-card space-y-3">
        <div className="flex items-center justify-between border-b border-cream pb-2.5">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-forest" />
            <h3 className="text-sm font-black text-charcoal">Recent Orders & Transactions</h3>
          </div>
          <button onClick={() => setCurrentTab('offers')} className="text-xs font-bold text-forest hover:text-agriGreen">
            View All
          </button>
        </div>

        <div className="p-3 bg-cream/70 rounded-xl border border-agriBorder flex items-center justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold text-forest">#AG-4821</span>
              <span className="text-xs font-black text-charcoal truncate">Tomato (800 kg)</span>
            </div>
            <p className="text-[10px] text-charcoal-muted truncate">FreshHarvest Foods • ₹33.00/kg</p>
          </div>
          <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 shrink-0">
            ● Pickup Scheduled
          </span>
        </div>
      </div>

      {/* MODALS */}
      <AIExplanationDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      <FarmerOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onSaveSelectedCrops={handleSaveSelectedCrops}
      />
      <CropDetailModal
        isOpen={Boolean(selectedDetailCrop)}
        onClose={() => setSelectedDetailCrop(null)}
        crop={selectedDetailCrop}
        onSellCrop={() => {
          setSelectedDetailCrop(null);
          onOpenCreateLot();
        }}
      />

    </div>
  );
};
