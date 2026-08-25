import React from 'react';
import { X, TrendingUp, ShieldCheck, ArrowRight, Warehouse, Calendar, CheckCircle2 } from 'lucide-react';
import { CropItem } from '../data/crops';
import { CropImage } from './CropImage';

export const CropDetailModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  crop: CropItem | null;
  onSellCrop: (crop: CropItem) => void;
}> = ({ isOpen, onClose, crop, onSellCrop }) => {
  if (!isOpen || !crop) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-modal border border-agriBorder relative overflow-hidden space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-charcoal-muted hover:text-charcoal p-1.5 rounded-full hover:bg-cream transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* HERO IMAGE & TITLE (Requirement 9) */}
        <div className="relative h-48 rounded-2xl overflow-hidden">
          <CropImage crop={crop} className="w-full h-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amberGold bg-black/40 backdrop-blur px-2.5 py-0.5 rounded-full self-start">
              {crop.category}
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <h2 className="text-2xl font-black">{crop.name}</h2>
              <span className="text-sm font-semibold opacity-90">{crop.hindiName} • {crop.marathiName}</span>
            </div>
          </div>
        </div>

        {/* PRICING & DEMAND METRICS GRID */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 bg-cream rounded-2xl border border-agriBorder">
            <span className="text-[10px] font-bold uppercase text-charcoal-muted block">Local Mandi</span>
            <span className="text-lg font-black text-charcoal mt-0.5 block">₹{crop.mandiPrice} /{crop.unit}</span>
          </div>

          <div className="p-3 bg-agriGreen-light rounded-2xl border border-agriGreen-accent/30">
            <span className="text-[10px] font-bold uppercase text-agriGreen block">Best Buyer Offer</span>
            <span className="text-lg font-black text-forest mt-0.5 block">₹{crop.bestOfferPrice} /{crop.unit}</span>
          </div>

          <div className="p-3 bg-cream rounded-2xl border border-agriBorder">
            <span className="text-[10px] font-bold uppercase text-charcoal-muted block">Market Trend</span>
            <span className="text-base font-extrabold text-agriGreen mt-0.5 flex items-center justify-center gap-0.5">
              <TrendingUp className="w-4 h-4" /> +{crop.trendPct}%
            </span>
          </div>
        </div>

        {/* CROP DETAILS & STORAGE SPECS */}
        <div className="space-y-2 text-xs text-charcoal-muted pt-2 border-t border-cream">
          <div className="flex justify-between py-1 border-b border-cream">
            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-forest" /> Seasonality:</span>
            <span className="font-bold text-charcoal">{crop.season.join(', ')}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-cream">
            <span className="flex items-center gap-1.5"><Warehouse className="w-3.5 h-3.5 text-forest" /> Recommended Storage:</span>
            <span className="font-bold text-charcoal">{crop.storageType}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-cream">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-agriGreen" /> Quality Grades Supported:</span>
            <span className="font-bold text-charcoal">{crop.qualityGrades.join(', ')}</span>
          </div>
        </div>

        {/* ACTION CTA */}
        <div className="pt-2 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-charcoal-muted hover:text-charcoal"
          >
            Close
          </button>

          <button
            onClick={() => {
              onSellCrop(crop);
              onClose();
            }}
            className="px-6 py-2.5 bg-agriGreen hover:bg-agriGreen-hover text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            Sell Produce <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
