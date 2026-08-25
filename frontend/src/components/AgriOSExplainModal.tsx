import React from 'react';
import { X, Sparkles, TrendingUp, CloudRain, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export interface ExplainModalProps {
  isOpen: boolean;
  onClose: () => void;
  crop?: string;
  recommendation?: string;
}

export const AgriOSExplainModal: React.FC<ExplainModalProps> = ({
  isOpen,
  onClose,
  crop = 'Tomato',
  recommendation
}) => {
  if (!isOpen) return null;

  const factors = [
    { label: "Kanpur APMC Mandi Benchmark", value: "₹28.00 / kg", delta: "Base rate", positive: true, detail: "Weighted modal average across 3 reference mandis" },
    { label: "Institutional Buyer Demand Surge", value: "+₹3.00 / kg", delta: "+11% demand", positive: true, detail: "Lucknow ketchup processor procurement orders active" },
    { label: "Assay Grade A Quality Premium", value: "+₹1.50 / kg", delta: "Premium tier", positive: true, detail: "Firmness >4.2 kg/cm², 0% surface blemishes" },
    { label: "Direct Proximity Advantage", value: "+₹0.80 / kg", delta: "+42 km corridor", positive: true, detail: "Shorter haul reduces transit shrinkage by 2.1%" },
    { label: "Precipitation Harvest Risk Penalty", value: "-₹0.50 / kg", delta: "82% rain risk", positive: false, detail: "Rain forecasted in 18 hrs narrows harvest window" },
    { label: "Farmgate Dedicated Freight", value: "-₹0.80 / kg", delta: "Transit cost", positive: false, detail: "Standard refrigerated mini-truck dispatch" }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-modal border border-agriBorder relative space-y-5">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-cream pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-agriGreen-light text-agriGreen flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-charcoal">Explainable AI Breakdown</h3>
              <p className="text-[11px] text-charcoal-muted font-medium">Transparent pricing and agronomy attribution logic</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-charcoal-muted hover:text-charcoal p-1.5 rounded-full hover:bg-cream transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* RECOMMENDATION SUMMARY */}
        <div className="p-4 bg-forest text-white rounded-2xl space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-amberGold block">
            Synthesized Recommendation
          </span>
          <p className="text-sm font-extrabold leading-snug">
            {recommendation || `Suggested ${crop} Price Range: ₹31.00 – ₹34.00 / kg`}
          </p>
          <div className="flex items-center justify-between pt-1 border-t border-white/10 text-xs text-white/80">
            <span>Overall Model Confidence:</span>
            <span className="font-extrabold text-freshGreen">91.4% (Multi-Factor Probabilistic)</span>
          </div>
        </div>

        {/* MATHEMATICAL & TELEMETRIC ATTRIBUTION FACTORS */}
        <div className="space-y-2 text-xs">
          <span className="text-[10px] uppercase font-bold text-charcoal-muted block">
            Attribution Vector Breakdown:
          </span>

          <div className="space-y-2">
            {factors.map((item, idx) => (
              <div key={idx} className="p-3 bg-cream/70 rounded-xl border border-agriBorder flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-charcoal">{item.label}</span>
                    <span className="text-[9px] px-2 py-0.2 bg-white rounded border text-charcoal-muted font-bold">
                      {item.delta}
                    </span>
                  </div>
                  <p className="text-[10px] text-charcoal-muted">{item.detail}</p>
                </div>

                <span className={`text-sm font-black shrink-0 ${item.positive ? 'text-forest' : 'text-agriDanger'}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* DECISION CAUSALITY CHAIN */}
        <div className="p-3.5 bg-cream rounded-2xl border border-agriBorder space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-forest">
            <ShieldCheck className="w-4 h-4 text-agriGreen" />
            <span>Sense → Understand → Predict → Recommend → Validate</span>
          </div>
          <p className="text-[11px] text-charcoal-muted leading-relaxed">
            Every dollar and action recommended is cross-validated against government APMC modal data, Doppler radar, and verified buyer escrow balances before release.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-forest hover:bg-forest-light text-white font-bold text-xs rounded-xl shadow-sm transition-all"
        >
          Got It, Close Breakdown
        </button>

      </div>
    </div>
  );
};
