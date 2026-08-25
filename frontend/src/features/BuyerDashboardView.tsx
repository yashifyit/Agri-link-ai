import React, { useState } from 'react';
import { Building2, PlusCircle, CheckCircle2, ChevronRight, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CreateRequirementModal } from '../components/CreateRequirementModal';
import { CropImage } from '../components/CropImage';

export const BuyerDashboardView: React.FC<{ onOpenNegotiation: () => void }> = ({ onOpenNegotiation }) => {
  const { lots, buyers } = useApp();
  const [isReqModalOpen, setIsReqModalOpen] = useState(false);

  return (
    <div className="space-y-8 pb-16 md:pb-6">
      
      {/* HEADER & METRICS BAR (Requirement 18) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-agriBorder shadow-card">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-charcoal">Procurement Overview</h1>
          <p className="text-xs text-charcoal-muted mt-0.5">FreshHarvest Foods Procurement Manager Hub</p>
        </div>

        <button
          onClick={() => setIsReqModalOpen(true)}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" /> Create Buying Requirement
        </button>
      </div>

      {/* METRICS CARDS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-charcoal">
        <div className="bg-white p-5 rounded-2xl border border-agriBorder shadow-card">
          <span className="text-xs font-semibold text-charcoal-muted block">Active Requirements</span>
          <span className="text-3xl font-black text-blue-600 mt-1 block">12</span>
          <span className="text-[10px] text-charcoal-muted mt-1 block">Across Tomato & Onion</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-agriBorder shadow-card">
          <span className="text-xs font-semibold text-charcoal-muted block">Matched Lots</span>
          <span className="text-3xl font-black text-forest mt-1 block">47</span>
          <span className="text-[10px] text-agriGreen font-bold mt-1 block">↑ 8 new today</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-agriBorder shadow-card">
          <span className="text-xs font-semibold text-charcoal-muted block">Offers Sent</span>
          <span className="text-3xl font-black text-charcoal mt-1 block">18</span>
          <span className="text-[10px] text-charcoal-muted mt-1 block">3 pending response</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-agriBorder shadow-card">
          <span className="text-xs font-semibold text-charcoal-muted block">Pending Deliveries</span>
          <span className="text-3xl font-black text-amberGold mt-1 block">6</span>
          <span className="text-[10px] text-charcoal-muted mt-1 block">In transit to Lucknow</span>
        </div>
      </div>

      {/* RECOMMENDED SUPPLY SECTION (Requirement 18) */}
      <div className="bg-white rounded-3xl p-6 border border-agriBorder shadow-card space-y-5">
        <div className="flex items-center justify-between border-b border-cream pb-4">
          <div>
            <h2 className="text-xl font-black text-charcoal">Recommended Supply Lots</h2>
            <p className="text-xs text-charcoal-muted">Lots matching your procurement specs ranked by quality and proximity</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lots.map((lot) => (
            <div key={lot.id} className="bg-cream p-5 rounded-2xl border border-agriBorder space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-forest text-white px-2.5 py-0.5 rounded-full">
                    91% MATCH
                  </span>
                  <span className="text-xs font-mono font-bold text-charcoal-muted">{lot.id}</span>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <CropImage cropName={lot.crop} className="w-12 h-12 rounded-xl border border-agriBorder shrink-0" />
                  <div>
                    <h3 className="text-base font-bold text-charcoal">{lot.crop} — {lot.quantity_kg} KG</h3>
                    <p className="text-xs text-charcoal-muted mt-0.5">{lot.farmer_name} • {lot.location}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-agriBorder">
                    <span className="text-charcoal-muted block text-[10px]">Quality Grade</span>
                    <span className="font-bold text-charcoal">{lot.quality_grade}</span>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-agriBorder">
                    <span className="text-charcoal-muted block text-[10px]">Expected Price</span>
                    <span className="font-bold text-forest">₹{lot.expected_price_per_kg}/kg</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-agriBorder">
                <span className="text-[11px] text-charcoal-muted">Harvested: {lot.harvest_date}</span>
                <button
                  onClick={onOpenNegotiation}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1"
                >
                  Make Offer <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CreateRequirementModal isOpen={isReqModalOpen} onClose={() => setIsReqModalOpen(false)} />

    </div>
  );
};
