import React, { useState } from 'react';
import { X, Building2, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CreateRequirementModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { addBuyerRequirement } = useApp();
  const [formData, setFormData] = useState({
    buyer_name: 'FreshHarvest Foods',
    company_name: 'FreshHarvest Processors Pvt Ltd',
    crop: 'Tomato',
    required_qty_kg: 5000,
    min_grade: 'Grade A',
    target_price_min: 30,
    target_price_max: 34,
    delivery_location: 'Lucknow'
  });

  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addBuyerRequirement(formData);
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
            <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-charcoal">Requirement Published!</h3>
            <p className="text-xs text-charcoal-muted">
              Matching farmer lots and FPOs are now being computed automatically.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 border-b border-cream pb-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-charcoal">Create Buying Requirement</h3>
                <p className="text-xs text-charcoal-muted">Post your procurement specs to discover matching farmer lots</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Crop</label>
                <select
                  value={formData.crop}
                  onChange={e => setFormData({ ...formData, crop: e.target.value })}
                  className="w-full bg-cream border border-agriBorder rounded-xl p-2.5 text-xs font-medium text-charcoal focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Tomato">Tomato</option>
                  <option value="Onion">Onion</option>
                  <option value="Soybean">Soybean</option>
                  <option value="Cotton">Cotton</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Required Volume (KG)</label>
                <input
                  type="number"
                  value={formData.required_qty_kg}
                  onChange={e => setFormData({ ...formData, required_qty_kg: Number(e.target.value) })}
                  className="w-full bg-cream border border-agriBorder rounded-xl p-2.5 text-xs font-medium text-charcoal focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Min Grade</label>
                <select
                  value={formData.min_grade}
                  onChange={e => setFormData({ ...formData, min_grade: e.target.value })}
                  className="w-full bg-cream border border-agriBorder rounded-xl p-2.5 text-xs font-medium text-charcoal focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Grade A">Grade A</option>
                  <option value="Grade B">Grade B</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Delivery Hub</label>
                <input
                  type="text"
                  value={formData.delivery_location}
                  onChange={e => setFormData({ ...formData, delivery_location: e.target.value })}
                  className="w-full bg-cream border border-agriBorder rounded-xl p-2.5 text-xs font-medium text-charcoal focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Target Price Min (₹/KG)</label>
                <input
                  type="number"
                  value={formData.target_price_min}
                  onChange={e => setFormData({ ...formData, target_price_min: Number(e.target.value) })}
                  className="w-full bg-cream border border-agriBorder rounded-xl p-2.5 text-xs font-medium text-charcoal focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Target Price Max (₹/KG)</label>
                <input
                  type="number"
                  value={formData.target_price_max}
                  onChange={e => setFormData({ ...formData, target_price_max: Number(e.target.value) })}
                  className="w-full bg-cream border border-agriBorder rounded-xl p-2.5 text-xs font-medium text-charcoal focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
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
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                Publish Requirement
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
