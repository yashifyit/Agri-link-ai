import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DisputeModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { addDispute } = useApp();
  const [formData, setFormData] = useState({
    transaction_id: 'KL-TXN-10491',
    raised_by: 'Ramesh Verma',
    category: 'Payment issue',
    description: 'Payment SLA exceeded 24 hours without electronic clearance notification.'
  });

  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addDispute(formData);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-modal border border-agriBorder relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-charcoal-muted hover:text-charcoal p-1.5 rounded-full hover:bg-cream transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="py-10 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-red-100 text-agriDanger flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-charcoal">Dispute Filed</h3>
            <p className="text-xs text-charcoal-muted max-w-xs">
              Assigned Grievance ID <span className="font-mono font-bold text-agriDanger">KL-DSP-102</span>. The Admin Command Center and buyer escrow compliance team have been alerted.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 border-b border-cream pb-3">
              <div className="w-9 h-9 rounded-xl bg-red-100 text-agriDanger flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
                
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-charcoal">Raise a Dispute / Grievance</h3>
                <p className="text-xs text-charcoal-muted">Submit official grievance for transaction resolution</p>
              </div>
            </div>
            

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Transaction Reference</label>
              <input
                type="text"
                value={formData.transaction_id}
                onChange={e => setFormData({ ...formData, transaction_id: e.target.value })}
                className="w-full bg-cream border border-agriBorder rounded-xl p-2.5 text-xs font-medium text-charcoal focus:ring-2 focus:ring-agriDanger focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Grievance Category</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-cream border border-agriBorder rounded-xl p-2.5 text-xs font-medium text-charcoal focus:ring-2 focus:ring-agriDanger focus:outline-none"
              >
                <option value="Payment issue">Payment issue</option>
                <option value="Quality disagreement">Quality disagreement</option>
                <option value="Quantity mismatch">Quantity mismatch</option>
                <option value="Delivery issue">Delivery issue</option>
                <option value="Buyer issue">Buyer issue</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Detailed Explanation</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-cream border border-agriBorder rounded-xl p-2.5 text-xs font-medium text-charcoal focus:ring-2 focus:ring-agriDanger focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-charcoal-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-agriDanger hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
              >
              
                File Official Dispute
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
