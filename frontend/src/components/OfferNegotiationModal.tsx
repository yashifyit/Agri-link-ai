import React, { useState } from 'react';
import { X, Handshake, CheckCircle2, ArrowRight, ShieldCheck, Truck, Clock, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OfferItem } from '../types';
import { CropImage } from './CropImage';

export const OfferNegotiationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  offer: OfferItem;
}> = ({ isOpen, onClose, offer }) => {
  const { counterOffer, acceptOffer, lots, setCurrentTab } = useApp();
  const [counterPrice, setCounterPrice] = useState<number>(() => (offer?.offered_price_per_kg ?? 33) + 1);
  const [mode, setMode] = useState<'VIEW' | 'COUNTER' | 'SUCCESS'>('VIEW');
  const [successText, setSuccessText] = useState<string>('Deal Locked with FreshHarvest Foods!');

  if (!isOpen || !offer) return null;

  const offerCrop = offer.crop || lots.find(l => l.id === offer.lot_id)?.crop || 'Tomato';

  const handleCounterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await counterOffer(offer.id, counterPrice);
    setSuccessText(`Counteroffer of ₹${counterPrice.toFixed(2)}/kg submitted to ${offer.buyer_name}!`);
    setMode('SUCCESS');
    setTimeout(() => {
      setMode('VIEW');
      onClose();
      setCurrentTab('offers');
    }, 1600);
  };

  const handleAccept = async () => {
    await acceptOffer(offer.id);
    setSuccessText(`Deal Confirmed with ${offer.buyer_name}! Pickup scheduled and smart escrow locked.`);
    setMode('SUCCESS');
    setTimeout(() => {
      setMode('VIEW');
      onClose();
      setCurrentTab('offers');
    }, 1600);
  };

  const grossCalculated = offer.quantity_kg * (mode === 'COUNTER' ? counterPrice : offer.offered_price_per_kg);
  const netCalculated = grossCalculated - offer.transport_estimate;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-charcoal/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-t-[2rem] sm:rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 shadow-modal border border-agriBorder relative space-y-4 pb-safe">
        
        {/* Mobile Drag Handle */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto sm:hidden -mt-1 mb-2" />

        <button
          onClick={onClose}
          aria-label="Close modal"
          className="min-touch absolute top-4 right-4 text-charcoal-muted hover:text-charcoal p-2 rounded-full hover:bg-cream transition-colors flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>

        {mode === 'SUCCESS' ? (
          <div className="py-10 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-agriGreen/10 text-agriGreen flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-charcoal">Deal Successfully Initiated!</h3>
            <p className="text-xs text-charcoal-muted max-w-xs leading-relaxed">
              {successText}
            </p>
            <span className="text-[11px] font-bold text-forest">
              Redirecting to Orders & Logistics tracking...
            </span>
          </div>
        ) : mode === 'COUNTER' ? (
          <form onSubmit={handleCounterSubmit} className="space-y-4">
            <div className="flex items-center gap-2.5 border-b border-cream pb-3">
              <div className="w-10 h-10 rounded-2xl bg-amberGold-light text-amber-800 flex items-center justify-center">
                <Handshake className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-charcoal">Counteroffer to {offer.buyer_name}</h3>
                <p className="text-xs text-charcoal-muted">Current Offer: ₹{offer.offered_price_per_kg}/kg for {offerCrop}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal mb-1">Your Proposed Counter Price (₹/KG)</label>
              <input
                type="number"
                step="0.5"
                value={counterPrice}
                onChange={e => setCounterPrice(Number(e.target.value))}
                className="w-full bg-cream border border-agriBorder rounded-xl p-3 text-base font-black text-forest focus:ring-2 focus:ring-agriGreen focus:outline-none"
              />
            </div>

            <div className="p-4 bg-cream rounded-2xl border border-agriBorder space-y-2 text-xs">
              <div className="flex justify-between text-charcoal-muted">
                <span>Crop & Lot Volume:</span>
                <span className="font-bold text-charcoal">{offerCrop} • {offer.quantity_kg} KG</span>
              </div>
              <div className="flex justify-between text-charcoal-muted">
                <span>Revised Gross Payout:</span>
                <span className="font-bold text-charcoal">₹{grossCalculated.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-charcoal-muted">
                <span>Freight Logistics Estimate:</span>
                <span className="font-bold text-agriDanger">-₹{offer.transport_estimate.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-agriBorder flex justify-between font-black text-forest text-sm">
                <span>Revised Net Realization:</span>
                <span>₹{netCalculated.toLocaleString()} (₹{(netCalculated / offer.quantity_kg).toFixed(2)}/kg)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMode('VIEW')}
                className="min-touch py-2.5 px-3 bg-white hover:bg-cream text-charcoal font-bold text-xs rounded-xl border border-agriBorder"
              >
                Back to Offer
              </button>
              <button
                type="submit"
                className="min-touch py-2.5 px-3 bg-amberGold hover:bg-amber-600 active:scale-95 text-charcoal font-black text-xs rounded-xl shadow-sm transition-all"
              >
                Submit Counter
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            
            {/* BUYER HEADER */}
            <div className="flex items-center justify-between gap-3 border-b border-cream pb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-forest text-white flex items-center justify-center font-black text-sm shadow-sm">
                  FH
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base font-black text-charcoal">{offer.buyer_name}</h3>
                    <ShieldCheck className="w-4 h-4 text-agriGreen" />
                  </div>
                  <span className="text-[11px] text-charcoal-muted font-semibold">Verified Food Processor • 94% Reliability</span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-cream p-1.5 rounded-xl border border-agriBorder">
                <CropImage cropName={offerCrop} className="w-8 h-8 rounded-lg shrink-0 border border-agriBorder" />
                <div className="text-right pr-1">
                  <span className="text-[11px] font-black text-charcoal block truncate">{offerCrop}</span>
                  <span className="text-[9px] text-charcoal-muted block">{offer.quantity_kg} KG</span>
                </div>
              </div>
            </div>

            {/* OFFER HIGHLIGHT HERO BOX */}
            <div className="p-4 bg-forest rounded-2xl text-white space-y-2.5 shadow-md">
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] text-white/70 uppercase tracking-wider font-bold">Binding Offer Price</span>
                <span className="text-2xl sm:text-3xl font-black text-freshGreen">₹{offer.offered_price_per_kg}.00 / kg</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
                <div>
                  <span className="text-[10px] text-white/70 block uppercase">Gross Value</span>
                  <span className="font-bold text-white text-sm">₹{offer.gross_total.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-white/70 block uppercase">Estimated Net Realization</span>
                  <span className="font-black text-freshGreen text-sm">₹{offer.net_realization.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* GUARANTEES & LOGISTICS */}
            <div className="p-3 bg-cream rounded-2xl border border-agriBorder space-y-1.5 text-xs text-charcoal-muted">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-forest" /> Transit Logistics:</span>
                <span className="font-bold text-charcoal">Lucknow Corridor (42 km)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-agriGreen" /> Escrow Settlement:</span>
                <span className="font-extrabold text-agriGreen">Within 24 Hours upon arrival</span>
              </div>
            </div>

            {/* ACTION BUTTONS: SELL / ACCEPT vs COUNTER */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={() => setMode('COUNTER')}
                aria-label="Counteroffer"
                className="min-touch py-3 px-3 bg-cream hover:bg-cream-dark active:bg-cream-dark text-charcoal font-bold text-xs rounded-xl border border-agriBorder transition-all flex items-center justify-center"
              >
                Negotiate / Counter
              </button>

              <button
                onClick={handleAccept}
                aria-label="Confirm Deal & Sell to FreshHarvest"
                className="min-touch py-3 px-3 bg-agriGreen hover:bg-agriGreen-hover active:scale-95 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <span>Accept & Sell</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
