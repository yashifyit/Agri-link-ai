import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2, Sliders, Warehouse } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ScoreRing } from '../components/ScoreRing';
import { CropImage } from '../components/CropImage';

export const AISaleEngineView: React.FC<{ onOpenNegotiation: () => void }> = ({ onOpenNegotiation }) => {
  const { recommendation, crops } = useApp();

  const [formData, setFormData] = useState({
    crop: 'Tomato',
    quantity_kg: 800,
    quality_grade: 'Grade A',
    location: 'Kanpur',
    harvest_date: '2026-08-23',
    storage_available: false,
    preferred_sale_strategy: 'OPTIMIZE_NET'
  });

  const [activeStrategy, setActiveStrategy] = useState<'SELL_NOW' | 'SPLIT_SELL'>('SELL_NOW');

  return (
    <div className="space-y-8 pb-16 md:pb-6">
      
      {/* PAGE HEADER */}
      <div className="bg-forest text-white p-6 sm:p-8 rounded-3xl border border-forest-light shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-agriGreen/30 text-freshGreen text-xs font-bold border border-agriGreen-accent/30">
            <Sparkles className="w-4 h-4 text-amberGold" />
            Flagship AI Sale Decision Engine
          </div>
          <h1 className="text-2xl sm:text-4xl font-black">“What should I do with my crop?”</h1>
          <p className="text-xs sm:text-sm text-white/80">
            Real-time net realization optimization considering mandi modal prices, buyer offers, logistics rates & storage risks.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: PARAMETER INPUT ENGINE */}
        <div className="bg-white rounded-3xl p-6 border border-agriBorder shadow-card space-y-4">
          <div className="flex items-center gap-2 border-b border-cream pb-3">
            <Sliders className="w-5 h-5 text-forest" />
            <h3 className="text-base font-extrabold text-charcoal">Crop & Farm Input Specs</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-charcoal mb-1">Crop</label>
              <div className="flex items-center gap-2.5">
                <CropImage cropName={formData.crop} className="w-10 h-10 rounded-xl border border-agriBorder shrink-0" />
                <select
                  value={formData.crop}
                  onChange={e => setFormData({ ...formData, crop: e.target.value })}
                  className="flex-1 bg-cream border border-agriBorder rounded-xl p-3 font-bold text-charcoal focus:ring-2 focus:ring-agriGreen focus:outline-none"
                >
                  {crops.map(cName => (
                    <option key={cName} value={cName}>{cName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-charcoal mb-1">Quantity (KG)</label>
                <input
                  type="number"
                  value={formData.quantity_kg}
                  onChange={e => setFormData({ ...formData, quantity_kg: Number(e.target.value) })}
                  className="w-full bg-cream border border-agriBorder rounded-xl p-3 font-bold text-charcoal focus:ring-2 focus:ring-agriGreen focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">Quality Grade</label>
                <select
                  value={formData.quality_grade}
                  onChange={e => setFormData({ ...formData, quality_grade: e.target.value })}
                  className="w-full bg-cream border border-agriBorder rounded-xl p-3 font-bold text-charcoal focus:ring-2 focus:ring-agriGreen focus:outline-none"
                >
                  <option value="Grade A">Grade A (Premium)</option>
                  <option value="Grade B">Grade B</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-charcoal mb-1">Farm Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-cream border border-agriBorder rounded-xl p-3 font-bold text-charcoal focus:ring-2 focus:ring-agriGreen focus:outline-none"
              />
            </div>

            <div className="p-3 bg-cream rounded-xl border border-agriBorder flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Warehouse className="w-4 h-4 text-forest" />
                <span className="font-semibold text-charcoal">Cold Storage Available?</span>
              </div>
              <input
                type="checkbox"
                checked={formData.storage_available}
                onChange={e => setFormData({ ...formData, storage_available: e.target.checked })}
                className="w-4 h-4 accent-agriGreen rounded"
              />
            </div>
          </div>

          <button className="w-full py-3 bg-forest hover:bg-forest-hover text-white text-xs font-bold rounded-xl shadow-sm transition-all mt-2">
            Re-calculate Decision Score
          </button>
        </div>

        {/* RIGHT COLUMN: AI SALE RECOMMENDATION DISPLAY */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Decision Output Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-agriGreen shadow-card space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-agriGreen bg-agriGreen-light px-3 py-1 rounded-full">
                  AI RECOMMENDATION
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-charcoal mt-1 flex items-center gap-2">
                  🟢 SELL NOW
                </h2>
              </div>
              <ScoreRing score={recommendation.confidence_percentage} size={90} label="CONFIDENCE" />
            </div>

            {/* Net Realization Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-cream rounded-2xl border border-agriBorder">
                <span className="text-[10px] uppercase font-bold text-charcoal-muted block">Expected Net Realization</span>
                <span className="text-2xl font-black text-forest mt-1 block">₹{recommendation.net_realization.toLocaleString()}</span>
                <span className="text-[10px] text-agriGreen font-bold mt-1 block">₹{recommendation.net_per_kg.toFixed(2)} / kg net</span>
              </div>

              <div className="p-4 bg-cream rounded-2xl border border-agriBorder">
                <span className="text-[10px] uppercase font-bold text-charcoal-muted block">Best Verified Buyer</span>
                <span className="text-base font-extrabold text-charcoal mt-1 block">{recommendation.recommended_buyer}</span>
                <span className="text-[10px] text-charcoal-muted mt-1 block">Offer: ₹{recommendation.offer_price_per_kg}/kg</span>
              </div>

              <div className="p-4 bg-cream rounded-2xl border border-agriBorder">
                <span className="text-[10px] uppercase font-bold text-charcoal-muted block">Estimated Transport</span>
                <span className="text-lg font-bold text-agriDanger mt-1 block">-₹{recommendation.transport_cost.toLocaleString()}</span>
                <span className="text-[10px] text-charcoal-muted mt-1 block">42 km Lucknow Route</span>
              </div>
            </div>

            {/* Why Reasons Checklist (Requirement 12) */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal">Why This Recommendation?</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {recommendation.why_reasons.map((reason, idx) => (
                  <div key={idx} className="p-3 bg-cream/70 rounded-xl border border-agriBorder flex items-start gap-2 text-charcoal">
                    <CheckCircle2 className="w-4 h-4 text-agriGreen shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategy Switcher: Immediate vs Split Sell (Requirement 39) */}
            <div className="p-4 bg-amberGold-light rounded-2xl border border-amber-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900">Alternative Differentiating Strategy:</span>
                <div className="flex bg-white rounded-lg p-0.5 border border-amber-200">
                  <button
                    onClick={() => setActiveStrategy('SELL_NOW')}
                    className={`px-3 py-1 text-[10px] font-bold rounded ${
                      activeStrategy === 'SELL_NOW' ? 'bg-amberGold text-charcoal' : 'text-charcoal-muted'
                    }`}
                  >
                    100% Sell Now
                  </button>
                  <button
                    onClick={() => setActiveStrategy('SPLIT_SELL')}
                    className={`px-3 py-1 text-[10px] font-bold rounded ${
                      activeStrategy === 'SPLIT_SELL' ? 'bg-amberGold text-charcoal' : 'text-charcoal-muted'
                    }`}
                  >
                    Split Sell (60/40)
                  </button>
                </div>
              </div>

              {activeStrategy === 'SPLIT_SELL' && (
                <p className="text-xs text-amber-800 leading-relaxed">
                  <strong>Split Execution Plan:</strong> Sell 60% (480 kg) today at ₹33.00/kg to FreshHarvest Foods to lock in immediate cash flow (₹15,840). Hold 40% (320 kg) for 2 days to capture projected ₹35.00/kg price peak.
                </p>
              )}
            </div>

            {/* Action CTAs */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={onOpenNegotiation}
                className="w-full sm:w-auto px-8 py-3.5 bg-agriGreen hover:bg-agriGreen-hover text-white text-xs font-extrabold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                Proceed to Sell to FreshHarvest Foods <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
