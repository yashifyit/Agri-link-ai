import React, { useState } from 'react';
import { Handshake, Truck, CreditCard, CheckCircle2, Clock, AlertCircle, ArrowRight, ShieldCheck, RefreshCw, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { OfferNegotiationModal } from '../components/OfferNegotiationModal';
import { DisputeModal } from '../components/DisputeModal';
import { CropImage } from '../components/CropImage';

export const TransactionFlowView: React.FC<{ onOpenNegotiation: () => void }> = ({ onOpenNegotiation }) => {
  const { offers, transactions, acceptOffer, refreshData, lots } = useApp();
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'OFFERS' | 'LOGISTICS' | 'PAYMENT' | 'HISTORY'>('OFFERS');
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const activeTxn = transactions.find(t => t.status !== 'PAYMENT_COMPLETED' && t.status !== 'DISPUTED') || transactions[0];

  const API_BASE = 'http://localhost:8000/api/v1';

  // State machine REST triggers
  const handleUpdateStatus = async (txnId: string, newStatus: string) => {
    setLoadingAction(newStatus);
    try {
      const res = await fetch(`${API_BASE}/transactions/${txnId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        await refreshData();
      } else {
        alert("Failed to update status on server.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleUpdatePayment = async (txnId: string, newPaymentStatus: string) => {
    setLoadingAction(newPaymentStatus);
    try {
      const res = await fetch(`${API_BASE}/transactions/${txnId}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newPaymentStatus })
      });
      if (res.ok) {
        await refreshData();
      } else {
        alert("Failed to update payment on server.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAction(null);
    }
  };

  const selectedOffer = offers.find(o => o.id === selectedOfferId) || offers[0];

  return (
    <div className="space-y-4 sm:space-y-6 pb-12 text-charcoal">
      
      {/* 1. MOBILE HEADER & HORIZONTALLY SCROLLABLE SUBTABS */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-agriBorder shadow-card space-y-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-charcoal">Orders & Logistics Tracking</h1>
          <p className="text-xs text-charcoal-muted mt-0.5">Manage buyer purchase orders, farmgate dispatch & escrow settlement</p>
        </div>

        <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1 bg-cream p-1 rounded-xl border border-agriBorder">
          {[
            { id: 'OFFERS', label: 'Buyer Offers' },
            { id: 'LOGISTICS', label: 'Transit & Tracking' },
            { id: 'PAYMENT', label: 'Escrow Settlement' },
            { id: 'HISTORY', label: 'History Log' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-all flex-1 min-touch ${
                activeSubTab === tab.id
                  ? 'bg-forest text-white shadow-sm font-black'
                  : 'text-charcoal-muted hover:text-charcoal'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SUBTAB 1: OFFERS */}
      {activeSubTab === 'OFFERS' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-agriBorder shadow-card space-y-4">
            <h3 className="text-base sm:text-lg font-black text-charcoal border-b border-cream pb-3">
              Received Buyer Offers ({offers.length})
            </h3>

            {offers.length === 0 ? (
              <div className="py-8 text-center text-charcoal-muted space-y-2">
                <Clock className="w-8 h-8 text-amberGold mx-auto animate-spin" />
                <p className="font-bold text-charcoal">No pending offers currently.</p>
                <p className="text-xs">Publish a digital crop lot to receive matching processor offers.</p>
              </div>
            ) : (
              offers.map((off) => {
                const offerCrop = off.crop || lots.find(l => l.id === off.lot_id)?.crop || 'Tomato';
                return (
                  <div key={off.id} className="p-4 sm:p-5 bg-cream/70 rounded-2xl border border-agriBorder space-y-3.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-agriBorder/60 pb-3">
                      <div className="flex items-center gap-3">
                        <CropImage cropName={offerCrop} className="w-12 h-12 rounded-xl border border-agriBorder shrink-0" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm sm:text-base font-black text-charcoal truncate">{off.buyer_name}</h4>
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              off.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                              off.status === 'COUNTERED' ? 'bg-blue-100 text-blue-800' :
                              off.status === 'EXPIRED' ? 'bg-gray-100 text-charcoal-muted' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {off.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-charcoal-muted mt-0.5 truncate">{offerCrop} • {off.quantity_kg} KG</p>
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-xl sm:text-2xl font-black text-forest block">₹{off.offered_price_per_kg}.00 / kg</span>
                        <span className="text-[10px] text-charcoal-muted block">Gross Processor Offer</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                      <div className="p-2.5 bg-white rounded-xl border border-agriBorder">
                        <span className="text-charcoal-muted block text-[9px] font-bold uppercase">Gross Total</span>
                        <span className="font-bold text-charcoal text-xs">₹{off.gross_total.toLocaleString()}</span>
                      </div>

                      <div className="p-2.5 bg-white rounded-xl border border-agriBorder">
                        <span className="text-charcoal-muted block text-[9px] font-bold uppercase">Freight Cost</span>
                        <span className="font-bold text-agriDanger text-xs">-₹{off.transport_estimate.toLocaleString()}</span>
                      </div>

                      <div className="p-2.5 bg-agriGreen-light rounded-xl border border-agriGreen-accent/30 col-span-2 sm:col-span-1">
                        <span className="text-forest block text-[9px] font-bold uppercase">Net Realization</span>
                        <span className="font-black text-forest text-sm">₹{off.net_realization.toLocaleString()}</span>
                      </div>
                    </div>

                    {off.status !== 'ACCEPTED' && off.status !== 'EXPIRED' && (
                      <div className="pt-2 grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setSelectedOfferId(off.id)}
                          className="min-touch py-2 px-3 bg-white hover:bg-cream active:bg-cream text-charcoal font-bold text-xs rounded-xl border border-agriBorder transition-all flex items-center justify-center"
                        >
                          Negotiate
                        </button>

                        <button
                          onClick={() => acceptOffer(off.id)}
                          className="min-touch py-2 px-3 bg-agriGreen hover:bg-agriGreen-hover active:scale-95 text-white font-black text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1"
                        >
                          Accept <CheckCircle2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 2: LOGISTICS */}
      {activeSubTab === 'LOGISTICS' && (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-agriBorder shadow-card space-y-5">
          {!activeTxn ? (
            <div className="py-8 text-center text-charcoal-muted space-y-2">
              <Truck className="w-8 h-8 text-charcoal-muted mx-auto" />
              <p className="font-bold text-charcoal">No active logistics dispatches.</p>
              <p className="text-xs">Accept a buyer offer to schedule transport and track vehicle ETA.</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cream pb-3">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-agriGreen bg-agriGreen-light px-2.5 py-0.5 rounded-full">
                    Active Logistics Route
                  </span>
                  <h2 className="text-base sm:text-lg font-black text-charcoal mt-1">Lot #{activeTxn.lot_id} Transit</h2>
                </div>
                <span className="text-xs font-bold text-white bg-forest px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                  {activeTxn.status}
                </span>
              </div>

              {/* Route Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 bg-cream rounded-xl border border-agriBorder">
                  <span className="text-charcoal-muted text-[10px] block">Origin & Destination</span>
                  <span className="text-sm font-black text-charcoal block mt-0.5">{activeTxn.origin} → Lucknow Hub</span>
                  <span className="text-[10px] text-charcoal-muted">{activeTxn.buyer_name} Warehouse</span>
                </div>

                <div className="p-3 bg-cream rounded-xl border border-agriBorder">
                  <span className="text-charcoal-muted text-[10px] block">Transit Vehicle</span>
                  <span className="text-sm font-black text-charcoal block mt-0.5">{activeTxn.vehicle_number}</span>
                  <span className="text-[10px] text-charcoal-muted">Driver: {activeTxn.driver_name}</span>
                </div>

                <div className="p-3 bg-cream rounded-xl border border-agriBorder">
                  <span className="text-charcoal-muted text-[10px] block">Delivery ETA</span>
                  <span className="text-sm font-black text-forest block mt-0.5">Scheduled Pickup</span>
                  <span className="text-[10px] text-agriGreen font-bold">Estimated ETA: 10:45 AM</span>
                </div>
              </div>

              {/* VERTICAL STATUS PROGRESSION TIMELINE (Requirement 19) */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-black uppercase text-charcoal tracking-wider block">
                  Delivery Milestones
                </span>

                <div className="space-y-2.5 pl-2 border-l-2 border-agriGreen">
                  {[
                    { label: 'Offer Accepted & Trade Locked', desc: 'Price and quantities committed in smart escrow', done: true },
                    { label: 'Consignment Created', desc: 'Electronic gate pass issued by Kanpur APMC', done: true },
                    { label: 'Farmgate Pickup Scheduled', desc: 'Mini-truck assigned; arriving at 10:15 AM', done: true, active: true },
                    { label: 'Refrigerated Transit to Processor', desc: 'Continuous cold-chain temperature telemetry (10.5°C)', done: false },
                    { label: 'Assay Lab Signoff & Escrow Release', desc: 'Instant 24-hr payment disbursement to farmer account', done: false }
                  ].map((step, idx) => (
                    <div key={idx} className="relative pl-4 space-y-0.5">
                      <div className={`absolute -left-[13px] top-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                        step.done ? 'bg-agriGreen text-white' : 'bg-gray-300'
                      }`}>
                        {step.done && <CheckCircle2 className="w-3 h-3" />}
                      </div>
                      <span className={`text-xs font-black block ${step.active ? 'text-forest' : step.done ? 'text-charcoal' : 'text-charcoal-muted'}`}>
                        {step.label}
                      </span>
                      <p className="text-[11px] text-charcoal-muted leading-tight">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* SUBTAB 3: PAYMENT SANDBOX */}
      {activeSubTab === 'PAYMENT' && (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-agriBorder shadow-card space-y-5 max-w-xl mx-auto">
          {!activeTxn ? (
            <div className="py-8 text-center text-charcoal-muted">
              <CreditCard className="w-8 h-8 text-charcoal-muted mx-auto" />
              <p className="font-bold text-charcoal mt-2">No pending payments currently.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-cream pb-3">
                <ShieldCheck className="w-5 h-5 text-agriGreen" />
                <div>
                  <h3 className="text-base font-black text-charcoal">AgriLink Smart Escrow</h3>
                  <p className="text-xs text-charcoal-muted">Guaranteed payment security via escrow contracts</p>
                </div>
              </div>

              <div className="p-4 bg-forest text-white rounded-2xl space-y-2">
                <span className="text-[10px] font-black uppercase text-amberGold tracking-wider block">
                  Locked Escrow Funds
                </span>
                <span className="text-2xl font-black text-white">₹24,800.00</span>
                <p className="text-xs text-white/80">
                  Buyer funds are verified and locked. 100% payout released upon delivery confirmation.
                </p>
              </div>

              <button
                onClick={() => handleUpdatePayment(activeTxn.id, 'ESCROW_RELEASED')}
                className="w-full min-touch py-3 bg-agriGreen hover:bg-agriGreen-hover text-white text-xs font-black rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Release Escrow Payout (Demo Sandbox)
              </button>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 4: TRANSACTION HISTORY */}
      {activeSubTab === 'HISTORY' && (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-agriBorder shadow-card space-y-4">
          <h3 className="text-base font-black text-charcoal border-b border-cream pb-3">
            Completed Transactions
          </h3>
          <div className="space-y-2.5">
            {transactions.map((t) => (
              <div key={t.id} className="p-3.5 bg-cream/70 rounded-xl border border-agriBorder flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-charcoal text-xs block">{t.crop} ({t.quantity_kg} kg)</span>
                  <span className="text-[10px] text-charcoal-muted">{t.buyer_name} • {t.created_at}</span>
                </div>
                <div className="text-right">
                  <span className="font-black text-forest text-sm block">₹{t.gross_value.toLocaleString()}</span>
                  <span className="text-[9px] font-bold uppercase text-agriGreen">✓ Completed</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NEGOTIATION MODAL */}
      {selectedOffer && (
        <OfferNegotiationModal
          isOpen={Boolean(selectedOfferId)}
          onClose={() => setSelectedOfferId(null)}
          offer={selectedOffer}
        />
      )}

      <DisputeModal
        isOpen={isDisputeModalOpen}
        onClose={() => setIsDisputeModalOpen(false)}
      />

    </div>
  );
};
