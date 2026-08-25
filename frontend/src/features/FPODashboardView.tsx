import React from 'react';
import { Users, Truck, TrendingUp, Layers, CheckCircle2, Award, Handshake, ShieldCheck, ChevronRight } from 'lucide-react';
import { CropImage } from '../components/CropImage';
import { useApp } from '../context/AppContext';

export const FPODashboardView: React.FC<{ onOpenNegotiation: () => void }> = ({ onOpenNegotiation }) => {
  return (
    <div className="space-y-8 pb-16 md:pb-6">
      
      {/* HEADER BAR */}
      <div className="bg-purple-900 text-white p-6 sm:p-8 rounded-3xl border border-purple-800 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-purple-200 text-xs font-bold border border-white/15">
              <Users className="w-4 h-4 text-amberGold" />
              Sahyadri Farmer Producer Organization (FPO)
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-2">Bulk Aggregation & Bargaining Center</h1>
          </div>
          <button className="px-5 py-2.5 bg-amberGold hover:bg-amber-600 text-charcoal font-bold text-xs rounded-xl shadow-lg transition-all self-start sm:self-auto">
            + Aggregate New Member Lots
          </button>
        </div>

        {/* PROMOTION HIGHLIGHT BANNER (Requirement 27) */}
        <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-xs sm:text-sm font-bold text-amberGold flex items-center gap-2">
          <Award className="w-5 h-5 shrink-0" />
          <span>Collective selling could improve estimated realization by ₹35,000 across 24 member farmers.</span>
        </div>
      </div>

      {/* METRICS CARDS (Requirement 27) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-charcoal">
        <div className="bg-white p-4 rounded-2xl border border-agriBorder shadow-card">
          <span className="text-[10px] font-bold uppercase text-charcoal-muted block">FPO Members</span>
          <span className="text-2xl font-black text-charcoal mt-1 block">248</span>
          <span className="text-[10px] text-charcoal-muted">Verified Farmers</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-agriBorder shadow-card">
          <span className="text-[10px] font-bold uppercase text-charcoal-muted block">Active Lots</span>
          <span className="text-2xl font-black text-forest mt-1 block">34</span>
          <span className="text-[10px] text-charcoal-muted">Aggregated Lots</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-agriBorder shadow-card">
          <span className="text-[10px] font-bold uppercase text-charcoal-muted block">Aggregated Volume</span>
          <span className="text-2xl font-black text-purple-700 mt-1 block">128.4 T</span>
          <span className="text-[10px] text-charcoal-muted">Tons Total</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-agriBorder shadow-card">
          <span className="text-[10px] font-bold uppercase text-charcoal-muted block">Best Bulk Offer</span>
          <span className="text-2xl font-black text-agriGreen mt-1 block">₹34/kg</span>
          <span className="text-[10px] text-agriGreen font-bold">+₹2.80/kg bonus</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-agriBorder shadow-card col-span-2 lg:col-span-1">
          <span className="text-[10px] font-bold uppercase text-charcoal-muted block">Potential Revenue</span>
          <span className="text-2xl font-black text-charcoal mt-1 block">₹43.6L</span>
          <span className="text-[10px] text-charcoal-muted">Projected Net</span>
        </div>
      </div>

      {/* BULK AGGREGATION CASE CARD (Requirement 27) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-agriBorder shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cream pb-4">
          <div className="flex items-center gap-3.5">
            <CropImage cropName="Tomato" className="w-12 h-12 rounded-2xl border border-purple-200 shrink-0" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-purple-800 bg-purple-100 px-2.5 py-1 rounded-full">
                BULK LOT #FPO-TOM-049
              </span>
              <h2 className="text-xl font-black text-charcoal mt-1">Aggregated Tomato Bulk Lot (24 Farmers)</h2>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-purple-800">12,500 KG</span>
            <span className="text-xs text-charcoal-muted block">Average Quality: Grade A</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-cream rounded-2xl border border-agriBorder space-y-1">
            <span className="text-charcoal-muted block">Individual Mandi Net</span>
            <span className="text-lg font-bold text-charcoal">₹28.00 / kg</span>
            <p className="text-charcoal-muted">Single farmer volume has limited leverage</p>
          </div>

          <div className="p-4 bg-cream rounded-2xl border border-agriBorder space-y-1">
            <span className="text-charcoal-muted block">Bulk Buyer Offer</span>
            <span className="text-lg font-bold text-purple-800">₹34.00 / kg</span>
            <p className="text-purple-900 font-semibold">+₹6.00/kg gross improvement</p>
          </div>

          <div className="p-4 bg-forest text-white rounded-2xl space-y-1 flex flex-col justify-between">
            <div>
              <span className="text-white/70 block uppercase text-[10px]">Net Collective Gain</span>
              <span className="text-2xl font-black text-freshGreen">+₹35,000</span>
            </div>
            <span className="text-[10px] text-amberGold font-semibold">Distributed back to 24 member farmers</span>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onOpenNegotiation}
            className="px-6 py-3 bg-purple-800 hover:bg-purple-900 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            Negotiate Bulk Deal with Processor
          </button>
        </div>
      </div>

    </div>
  );
};
