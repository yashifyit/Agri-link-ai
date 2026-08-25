import React from 'react';
import { X, Sparkles, CheckCircle2, TrendingUp, ShieldCheck, Truck, Warehouse } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ScoreRing } from './ScoreRing';

export const AIExplanationDrawer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { recommendation } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-charcoal/60 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-agriBorder shadow-2xl p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
          
          <div className="space-y-6">
            
            {/* DRAWER HEADER */}
            <div className="flex items-center justify-between border-b border-cream pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amberGold" />
                <div>
                  <h3 className="text-lg font-black text-charcoal">AI Sale Advisor Breakdown</h3>
                  <p className="text-xs text-charcoal-muted">Detailed variables & decision confidence analysis</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-charcoal-muted hover:text-charcoal p-1.5 rounded-full hover:bg-cream transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* CONFIDENCE & RECOMMENDATION BADGE */}
            <div className="bg-forest text-white p-5 rounded-2xl border border-forest-light flex items-center justify-between shadow-md">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amberGold block">
                  RECOMMENDED ACTION
                </span>
                <span className="text-2xl font-black text-freshGreen mt-1 block">🟢 SELL NOW</span>
                <span className="text-xs text-white/80 mt-1 block">Optimal Net Realization</span>
              </div>
              <ScoreRing score={recommendation.confidence_percentage} size={85} label="CONFIDENCE" />
            </div>

            {/* VARIABLE BREAKDOWN METRICS (Requirement 22) */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal">Decision Variables Breakdown</h4>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-cream rounded-xl border border-agriBorder flex justify-between items-center">
                  <span className="text-charcoal-muted font-medium">Local Kanpur Mandi Modal Price:</span>
                  <span className="font-bold text-charcoal">₹{recommendation.local_mandi_price}.00 / kg</span>
                </div>

                <div className="p-3 bg-cream rounded-xl border border-agriBorder flex justify-between items-center">
                  <span className="text-charcoal-muted font-medium">Best Verified Buyer Offer:</span>
                  <span className="font-extrabold text-forest">₹{recommendation.offer_price_per_kg}.00 / kg</span>
                </div>

                <div className="p-3 bg-cream rounded-xl border border-agriBorder flex justify-between items-center">
                  <span className="text-charcoal-muted font-medium">Logistics & Transport Deduction:</span>
                  <span className="font-bold text-agriDanger">-₹{(recommendation.transport_cost / 800).toFixed(2)} / kg</span>
                </div>

                <div className="p-3.5 bg-agriGreen-light rounded-xl border border-agriGreen-accent/30 flex justify-between items-center text-forest font-bold">
                  <span>Expected Net Realization:</span>
                  <span className="text-base font-black">₹{recommendation.net_per_kg.toFixed(2)} / kg</span>
                </div>
              </div>
            </div>

            {/* WHY RECOMMENDATION REASONS (Requirement 22) */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal">Why Sell Now?</h4>
              <div className="space-y-2 text-xs">
                {recommendation.why_reasons.map((reason, idx) => (
                  <div key={idx} className="p-3 bg-cream/70 rounded-xl border border-agriBorder flex items-start gap-2 text-charcoal">
                    <CheckCircle2 className="w-4 h-4 text-agriGreen shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* VERIFIED EXPLANATION TEXT */}
            <div className="p-4 bg-amberGold-light rounded-2xl border border-amber-200 text-xs text-amber-900 leading-relaxed font-medium">
              KisanLink recommends selling now because the current verified offer from <strong>FreshHarvest Foods</strong> provides a stronger expected net realization (<strong>+₹2,240 net profit</strong>) than holding produce under perishability risks.
            </div>

          </div>

          {/* ACTION BUTTON */}
          <button
            onClick={onClose}
            className="w-full py-3 bg-forest hover:bg-forest-hover text-white text-xs font-bold rounded-xl shadow-md transition-all mt-4"
          >
            Close Analysis
          </button>

        </div>
      </div>
    </div>
  );
};
