import React, { useState } from 'react';
import { X, Check, Sprout, ArrowRight, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CROPS_CATALOG } from '../data/crops';

export const FarmerOnboardingModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSaveSelectedCrops: (cropNames: string[]) => void;
}> = ({ isOpen, onClose, onSaveSelectedCrops }) => {
  const { crops } = useApp();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedNames, setSelectedNames] = useState<string[]>(['Tomato', 'Onion', 'Wheat']);

  if (!isOpen) return null;

  const toggleCrop = (name: string) => {
    setSelectedNames(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };

  const handleSave = () => {
    onSaveSelectedCrops(selectedNames);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm animate-fadeIn text-charcoal">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-modal border border-agriBorder relative overflow-hidden space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-charcoal-muted hover:text-charcoal p-1.5 rounded-full hover:bg-cream transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 1 ? (
          // STEP 1: WELCOME SCREEN (Requirement 24)
          <div className="space-y-6 py-4 text-center">
            <div className="w-16 h-16 rounded-3xl bg-agriGreen/10 text-agriGreen flex items-center justify-center mx-auto shadow-sm">
              <Sprout className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-charcoal">Welcome to KisanLink</h3>
              <p className="text-sm text-charcoal-muted max-w-sm mx-auto leading-relaxed">
                Let's customize your profile so we can automatically match your harvest to verified regional buyers and calculate your best mandi payouts.
              </p>
            </div>

            {/* Premium Indian Agriculture Illustration Placeholder */}
            <div className="w-full h-44 rounded-2xl overflow-hidden shadow-inner border border-agriBorder relative">
              <img
                src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=600"
                alt="Indian field"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/30 to-transparent" />
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3.5 bg-forest hover:bg-forest-light text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              Get Started <ArrowRight className="w-4.5 h-4.5" />
            </button>
          </div>
        ) : (
          // STEP 2: MULTI-SELECT CROP CHIPS (Requirement 24)
          <div className="space-y-5">
            <div className="flex items-center gap-3 border-b border-cream pb-3">
              <button
                onClick={() => setStep(1)}
                className="p-1 hover:bg-cream rounded-full transition-colors text-charcoal-muted hover:text-charcoal"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h3 className="text-lg font-black text-charcoal">What crops do you grow?</h3>
                <p className="text-xs text-charcoal-muted">Select all matching crop catalog choices (Multiple Selection)</p>
              </div>
            </div>

            {/* Searchable/Filterable scroll grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
              {crops.map((cName) => {
                const staticCrop = CROPS_CATALOG.find(sc => sc.name.toLowerCase() === cName.toLowerCase());
                const isSelected = selectedNames.includes(cName);
                const displayHi = staticCrop ? staticCrop.hindiName : '';
                const displayImage = staticCrop ? staticCrop.image : "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=200";

                return (
                  <div
                    key={cName}
                    onClick={() => toggleCrop(cName)}
                    className={`p-2.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'bg-agriGreen-light border-agriGreen shadow-md'
                        : 'bg-cream border-agriBorder hover:bg-white'
                    }`}
                  >
                    <img
                      src={displayImage}
                      alt={cName}
                      className="w-8 h-8 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1 text-left">
                      <span className="text-xs font-bold text-charcoal truncate block">{cName}</span>
                      {displayHi && <span className="text-[10px] text-charcoal-muted truncate block">{displayHi}</span>}
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-agriGreen shrink-0" />}
                  </div>
                );
              })}
            </div>

            <div className="pt-3 flex justify-between items-center border-t border-cream">
              <span className="text-xs text-charcoal-muted font-bold">
                {selectedNames.length} crop(s) selected
              </span>

              <button
                onClick={handleSave}
                className="px-6 py-2.5 bg-forest hover:bg-forest-light text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                Personalize Dashboard ✓
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
