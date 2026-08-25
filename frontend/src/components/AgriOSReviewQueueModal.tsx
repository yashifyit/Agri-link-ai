import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle2, Ban, Eye, AlertTriangle } from 'lucide-react';
import { ReviewItem, INITIAL_REVIEWS } from '../services/agriOsEventService';

export const AgriOSReviewQueueModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onActionProcessed?: (reviewId: string, action: string) => void;
}> = ({ isOpen, onClose, onActionProcessed }) => {
  const [reviews, setReviews] = useState<ReviewItem[]>(INITIAL_REVIEWS);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAction = (reviewId: string, action: 'APPROVE' | 'BLOCK' | 'DISMISS') => {
    setReviews(prev => prev.filter(r => r.id !== reviewId));
    setSuccessMessage(`Action '${action}' recorded in AgriOS immutable audit ledger for item ${reviewId}.`);
    if (onActionProcessed) {
      onActionProcessed(reviewId, action);
    }
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-modal border border-agriBorder relative space-y-5">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-cream pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amberGold-light text-amber-800 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-charcoal">Human-in-the-Loop Review Queue</h3>
                <span className="px-2 py-0.5 bg-amberGold text-charcoal text-[10px] font-black rounded-full">
                  {reviews.length} PENDING
                </span>
              </div>
              <p className="text-xs text-charcoal-muted font-medium">
                Consequential actions requiring human farmer or agronomist authorization
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-charcoal-muted hover:text-charcoal p-1.5 rounded-full hover:bg-cream transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NOTIFICATION FEEDBACK */}
        {successMessage && (
          <div className="p-3 bg-green-50 border border-green-200 text-agriGreen text-xs font-bold rounded-xl flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* QUEUE CARDS */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="py-12 text-center text-charcoal-muted space-y-2">
              <CheckCircle2 className="w-10 h-10 text-agriGreen mx-auto" />
              <h4 className="text-base font-bold text-charcoal">Review Queue Cleared</h4>
              <p className="text-xs">All high-risk autonomous agent recommendations have been verified and processed.</p>
            </div>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} className="p-5 bg-cream rounded-2xl border border-agriBorder space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-agriBorder/60 pb-2.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                        rev.riskLevel === 'HIGH' ? 'bg-rose-100 text-rose-800' :
                        rev.riskLevel === 'FINANCIAL' ? 'bg-blue-100 text-blue-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {rev.riskLevel} RISK
                      </span>
                      <span className="text-[10px] font-bold text-charcoal-muted">{rev.domain}</span>
                    </div>
                    <h4 className="text-sm font-black text-charcoal mt-1">{rev.title}</h4>
                  </div>

                  <div className="text-left sm:text-right text-xs">
                    <span className="text-forest font-black block">{rev.confidence}% Confidence</span>
                    <span className="text-[10px] text-charcoal-muted">{rev.submittedAt}</span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-agriBorder/80 text-xs">
                  <span className="text-[10px] uppercase font-bold text-charcoal-muted block">Agent Proposal:</span>
                  <p className="font-extrabold text-charcoal mt-0.5">{rev.recommendation}</p>
                </div>

                {/* Factors checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {rev.factors.map((f, idx) => (
                    <div key={idx} className="p-2 bg-white/70 rounded-lg border border-agriBorder/60 text-[11px]">
                      <span className="text-charcoal-muted block text-[9px]">{f.label}</span>
                      <span className="font-bold text-charcoal">{f.value}</span>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    onClick={() => handleAction(rev.id, 'BLOCK')}
                    className="px-3.5 py-1.5 bg-white hover:bg-rose-50 text-agriDanger border border-rose-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1"
                  >
                    <Ban className="w-3.5 h-3.5" /> Block Action
                  </button>

                  <button
                    onClick={() => handleAction(rev.id, 'APPROVE')}
                    className="px-4 py-1.5 bg-agriGreen hover:bg-agriGreen-hover text-white text-xs font-black rounded-xl shadow-sm transition-all flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Authorize Execution
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* FOOTER NOTE */}
        <div className="p-3 bg-cream rounded-xl text-[11px] text-charcoal-muted flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amberGold shrink-0" />
          <span>
            AgriOS Safety Policy forbids autonomous execution of chemical applications or financial disbursements exceeding ₹50,000 without verified human sign-off.
          </span>
        </div>

      </div>
    </div>
  );
};
