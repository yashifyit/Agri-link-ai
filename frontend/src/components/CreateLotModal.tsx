import React, { useState } from 'react';
import { X, Upload, CheckCircle2, Sprout } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CropImage } from './CropImage';

export const CreateLotModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { addLot, crops } = useApp();
  const [formData, setFormData] = useState({
    crop: 'Tomato',
    variety: 'Desi Red',
    quantity_kg: 800,
    quality_grade: 'Grade A',
    expected_price_per_kg: 32,
    location: 'Kanpur, Uttar Pradesh',
    harvest_date: '2026-08-23'
  });

  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addLot(formData);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-modal border border-agriBorder relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-charcoal-muted hover:text-charcoal p-1.5 rounded-full hover:bg-cream transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-agriGreen/10 text-agriGreen flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-charcoal">Lot Successfully Published!</h3>
            <p className="text-xs text-charcoal-muted max-w-xs">
              Your crop lot has been assigned ID <span className="font-mono font-bold text-forest">KL-LOT-10493</span> and is now discoverable by verified buyers.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 border-b border-cream pb-3">
              <div className="w-9 h-9 rounded-xl bg-agriGreen-light text-agriGreen flex items-center justify-center">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-charcoal">Create Digital Crop Lot</h3>
                <p className="text-xs text-charcoal-muted">Publish your harvest details to unlock verified buyer offers</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Crop</label>
                <select
                  value={formData.crop}
                  onChange={e => setFormData({ ...formData, crop: e.target.value })}
                  className="w-full bg-cream border border-agriBorder rounded-xl p-2.5 text-xs font-medium text-charcoal focus:ring-2 focus:ring-agriGreen focus:outline-none"
                >
                  {crops.map((cName) => (
                    <option key={cName} value={cName}>
                      {cName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Variety</label>
                <input
                  type="text"
                  value={formData.variety}
                  onChange={e => setFormData({ ...formData, variety: e.target.value })}
                  className="w-full bg-cream border border-agriBorder rounded-xl p-2.5 text-xs font-medium text-charcoal focus:ring-2 focus:ring-agriGreen focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Quantity (KG)</label>
                <input
                  type="number"
                  value={formData.quantity_kg}
                  onChange={e => setFormData({ ...formData, quantity_kg: Number(e.target.value) })}
                  className="w-full bg-cream border border-agriBorder rounded-xl p-2.5 text-xs font-medium text-charcoal focus:ring-2 focus:ring-agriGreen focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Quality Grade</label>
                <select
                  value={formData.quality_grade}
                  onChange={e => setFormData({ ...formData, quality_grade: e.target.value })}
                  className="w-full bg-cream border border-agriBorder rounded-xl p-2.5 text-xs font-medium text-charcoal focus:ring-2 focus:ring-agriGreen focus:outline-none"
                >
                  <option value="Grade A">Grade A (Premium)</option>
                  <option value="Grade B">Grade B (Standard)</option>
                  <option value="Grade C">Grade C (Commercial)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Expected Price (₹/KG)</label>
                <input
                  type="number"
                  value={formData.expected_price_per_kg}
                  onChange={e => setFormData({ ...formData, expected_price_per_kg: Number(e.target.value) })}
                  className="w-full bg-cream border border-agriBorder rounded-xl p-2.5 text-xs font-medium text-charcoal focus:ring-2 focus:ring-agriGreen focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-cream border border-agriBorder rounded-xl p-2.5 text-xs font-medium text-charcoal focus:ring-2 focus:ring-agriGreen focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Crop Lot Photos</label>
              <div className="border-2 border-dashed border-agriBorder rounded-2xl p-4 text-center bg-cream/50 hover:bg-cream transition-colors cursor-pointer">
                <Upload className="w-6 h-6 text-charcoal-muted mx-auto mb-1" />
                <span className="text-xs font-semibold text-forest">Click to upload produce images</span>
                <p className="text-[10px] text-charcoal-muted mt-0.5">Supports JPG, PNG up to 10MB</p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold text-charcoal-muted hover:text-charcoal"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-agriGreen hover:bg-agriGreen-hover text-white text-xs font-bold rounded-xl transition-all shadow-sm"
              >
                Publish Digital Lot
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
