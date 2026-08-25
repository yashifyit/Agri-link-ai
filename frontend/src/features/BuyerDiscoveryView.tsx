import React, { useState } from 'react';
import { ShieldCheck, Building2, MapPin, Clock, Award, CheckCircle2, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ScoreRing } from '../components/ScoreRing';

export const BuyerDiscoveryView: React.FC<{ onOpenNegotiation: () => void }> = ({ onOpenNegotiation }) => {
  const { buyers } = useApp();
  const [selectedBuyer, setSelectedBuyer] = useState<number>(1);

  return (
    <div className="space-y-8 pb-16 md:pb-6">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-agriBorder shadow-card">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-charcoal">Best Buyers For You</h1>
          <p className="text-xs text-charcoal-muted mt-0.5">Algorithmically matched verified processors and wholesale buyers</p>
        </div>

        <div className="text-xs font-semibold text-charcoal bg-cream px-3.5 py-2 rounded-xl border border-agriBorder">
          Matching Crop: <span className="font-bold text-forest">Tomato (800 KG Grade A)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: BUYER CARDS LIST (Requirement 16) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* BUYER CARD 1: FreshHarvest Foods (91% Match) */}
          <div className="bg-white rounded-3xl p-6 border-2 border-agriGreen shadow-card hover:shadow-card-hover transition-all space-y-4">
            
            <div className="flex items-start justify-between gap-4 border-b border-cream pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-forest text-white flex items-center justify-center font-extrabold text-base shadow-sm">
                  FH
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-extrabold text-charcoal">FreshHarvest Foods</h3>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-agriGreen bg-agriGreen-light px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified Processor
                    </span>
                  </div>
                  <p className="text-xs text-charcoal-muted mt-0.5">Lucknow Processing Hub • 42 km distance</p>
                </div>
              </div>
               
              <div className="text-right">
                <span className="text-2xl font-black text-forest">₹33.00 / kg</span>
                <span className="text-[10px] text-charcoal-muted block">Gross Offer</span>
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-cream rounded-xl border border-agriBorder">
                <span className="text-charcoal-muted block text-[10px] uppercase font-bold">Requirement</span>
                <span className="font-extrabold text-charcoal">5,000 KG</span>
              </div>

              <div className="p-3 bg-cream rounded-xl border border-agriBorder">
                <span className="text-charcoal-muted block text-[10px] uppercase font-bold">Grade Pref</span>
                <span className="font-extrabold text-charcoal">Grade A</span>
              </div>

              <div className="p-3 bg-cream rounded-xl border border-agriBorder">
                <span className="text-charcoal-muted block text-[10px] uppercase font-bold">Payment SLA</span>
                <span className="font-extrabold text-agriGreen">Within 24 hrs</span>
              </div>

              <div className="p-3 bg-cream rounded-xl border border-agriBorder">
                <span className="text-charcoal-muted block text-[10px] uppercase font-bold">Reliability</span>
                <span className="font-extrabold text-charcoal">94% Score</span>
              </div>
            </div>

            {/* Match Compatibility Reasons */}
            <div className="p-3.5 bg-agriGreen-light/50 rounded-xl border border-agriGreen-accent/30 text-xs text-forest space-y-1">
              <span className="font-bold block">Why 91% Compatibility Match?</span>
              <div className="flex flex-wrap gap-3 text-[11px]">
                <span>✓ Exact Tomato Grade A match</span>
                <span>✓ Offer price meets expectation</span>
                <span>✓ Lucknow transit corridor advantage</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                onClick={() => setSelectedBuyer(1)}
                className="text-xs font-bold text-charcoal-muted hover:text-charcoal"
              >
                View Full Profile
              </button>

              <button
                onClick={onOpenNegotiation}
                className="px-6 py-2.5 bg-agriGreen hover:bg-agriGreen-hover text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1"
              >
                Make Offer / Sell <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* BUYER CARD 2: Maharashtra Fresh Processors */}
          <div className="bg-white rounded-3xl p-6 border border-agriBorder shadow-card space-y-4">
            <div className="flex items-start justify-between gap-4 border-b border-cream pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-base">
                  MF
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-extrabold text-charcoal">Maharashtra Fresh Processors</h3>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified Wholesale
                    </span>
                  </div>
                  <p className="text-xs text-charcoal-muted mt-0.5">Pune APMC Corridor • 1,100 km distance</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black text-charcoal">₹28.00 / kg</span>
                <span className="text-[10px] text-charcoal-muted block">Gross Offer</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-cream rounded-xl border border-agriBorder">
                <span className="text-charcoal-muted block text-[10px]">Requirement</span>
                <span className="font-bold text-charcoal">12,000 KG</span>
              </div>
              <div className="p-3 bg-cream rounded-xl border border-agriBorder">
                <span className="text-charcoal-muted block text-[10px]">Grade Pref</span>
                <span className="font-bold text-charcoal">Grade B</span>
              </div>
              <div className="p-3 bg-cream rounded-xl border border-agriBorder">
                <span className="text-charcoal-muted block text-[10px]">Payment SLA</span>
                <span className="font-bold text-charcoal">Within 48 hrs</span>
              </div>
              <div className="p-3 bg-cream rounded-xl border border-agriBorder">
                <span className="text-charcoal-muted block text-[10px]">Reliability</span>
                <span className="font-bold text-charcoal">92% Score</span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: BUYER CREDIBILITY PROFILE (Requirement 17) */}
        <div className="bg-white rounded-3xl p-6 border border-agriBorder shadow-card space-y-5">
          <div className="border-b border-cream pb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-agriGreen bg-agriGreen-light px-2.5 py-1 rounded-full">
              Verified Credibility Profile
            </span>
            <h3 className="text-xl font-black text-charcoal mt-2">FreshHarvest Foods</h3>
            <p className="text-xs text-charcoal-muted mt-0.5">Lucknow Food Processing Park, Uttar Pradesh</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-4 bg-cream rounded-2xl border border-agriBorder">
              <span className="text-2xl font-black text-forest">94%</span>
              <span className="text-[10px] font-bold uppercase text-charcoal-muted block mt-0.5">Reliability Score</span>
            </div>

            <div className="p-4 bg-cream rounded-2xl border border-agriBorder">
              <span className="text-2xl font-black text-charcoal">128</span>
              <span className="text-[10px] font-bold uppercase text-charcoal-muted block mt-0.5">Completed Deals</span>
            </div>

            <div className="p-4 bg-cream rounded-2xl border border-agriBorder">
              <span className="text-2xl font-black text-agriGreen">96%</span>
              <span className="text-[10px] font-bold uppercase text-charcoal-muted block mt-0.5">On-time Payments</span>
            </div>

            <div className="p-4 bg-cream rounded-2xl border border-agriBorder">
              <span className="text-xl font-extrabold text-charcoal">₹2.4 Cr</span>
              <span className="text-[10px] font-bold uppercase text-charcoal-muted block mt-0.5">Trade Volume</span>
            </div>
          </div>

          <div className="space-y-2 text-xs text-charcoal-muted pt-2 border-t border-cream">
            <div className="flex justify-between">
              <span>Business Registration:</span>
              <span className="font-bold text-charcoal">FSSAI & APMC License ✓</span>
            </div>
            <div className="flex justify-between">
              <span>Primary Crops Purchased:</span>
              <span className="font-bold text-charcoal">Tomato, Potato, Chili</span>
            </div>
            <div className="flex justify-between">
              <span>Dispute Rate:</span>
              <span className="font-bold text-agriSuccess">0.8% (Extremely Low)</span>
            </div>
          </div>

          <button
            onClick={onOpenNegotiation}
            className="w-full py-3 bg-forest hover:bg-forest-hover text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            Initiate Deal with FreshHarvest
          </button>
        </div>

      </div>

    </div>
  );
};
