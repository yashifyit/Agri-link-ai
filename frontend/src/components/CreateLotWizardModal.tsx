import React, { useState } from 'react';
import { X, Upload, CheckCircle2, ArrowRight, ArrowLeft, Sprout, Image as ImageIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CropImage } from './CropImage';

export const CreateLotWizardModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { addLot, crops } = useApp();
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState({
    crop: 'Tomato',
    variety: 'Desi Red',
    quantity_kg: 800,
    quality_grade: 'Grade A',
    expected_price_per_kg: 32,
    location: 'Kanpur, Uttar Pradesh',
    harvest_date: '2026-08-23',
    storage_available: false,
    photoUploaded: true
  });

  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleNext = () => setStep(prev => Math.min(6, prev + 1));
  const handleBack = () => setStep(prev => Math.max(1, prev - 1));

  const handlePublish = () => {
    addLot(formData);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setStep(1);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-charcoal/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-t-[2rem] sm:rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 shadow-modal border border-agriBorder relative space-y-4 pb-safe">
        
        {/* Mobile Drag Handle */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto sm:hidden -mt-1 mb-2" />

        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="min-touch absolute top-4 right-4 text-charcoal-muted hover:text-charcoal p-2 rounded-full hover:bg-cream active:bg-cream transition-colors flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="py-10 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-agriGreen/10 text-agriGreen flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-charcoal">Digital Crop Lot Published!</h3>
            <p className="text-xs text-charcoal-muted max-w-xs">
              Assigned ID <span className="font-mono font-bold text-forest">KL-LOT-10493</span>. Verified institutional buyers are now receiving instant match bids.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* STEP PROGRESS INDICATOR (Requirement 11) */}
            <div className="border-b border-cream pb-3">
              <div className="flex items-center justify-between text-xs font-bold text-charcoal mb-2">
                <span className="font-black text-forest">Sell Crop Listing</span>
                <span className="text-agriGreen font-extrabold">Step {step} of 6</span>
              </div>
              <div className="flex gap-1 h-1.5 bg-cream rounded-full overflow-hidden">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div
                    key={i}
                    className={`flex-1 transition-all duration-300 ${
                      i <= step ? 'bg-agriGreen' : 'bg-cream-dark'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* STEP 1: CROP & VARIETY */}
            {step === 1 && (
              <div className="space-y-3">
                <h4 className="text-sm font-black text-charcoal">1. Select Crop Commodity</h4>
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">Commodity</label>
                  <select
                    value={formData.crop}
                    onChange={e => setFormData({ ...formData, crop: e.target.value })}
                    className="w-full bg-cream border border-agriBorder rounded-xl p-3 text-xs font-bold text-charcoal focus:ring-2 focus:ring-agriGreen focus:outline-none"
                  >
                    {crops.map((cName) => (
                      <option key={cName} value={cName}>
                        🌾 {cName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">Variety / Subtype</label>
                  <input
                    type="text"
                    value={formData.variety}
                    onChange={e => setFormData({ ...formData, variety: e.target.value })}
                    className="w-full bg-cream border border-agriBorder rounded-xl p-3 text-xs font-medium text-charcoal focus:ring-2 focus:ring-agriGreen focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* STEP 2: QUANTITY & PRICE */}
            {step === 2 && (
              <div className="space-y-3">
                <h4 className="text-sm font-black text-charcoal">2. Harvest Volume & Target Price</h4>
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">Total Available Quantity (KG)</label>
                  <input
                    type="number"
                    value={formData.quantity_kg}
                    onChange={e => setFormData({ ...formData, quantity_kg: Number(e.target.value) })}
                    className="w-full bg-cream border border-agriBorder rounded-xl p-3 text-xs font-bold text-charcoal focus:ring-2 focus:ring-agriGreen focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">Asking Base Price (₹/KG)</label>
                  <input
                    type="number"
                    value={formData.expected_price_per_kg}
                    onChange={e => setFormData({ ...formData, expected_price_per_kg: Number(e.target.value) })}
                    className="w-full bg-cream border border-agriBorder rounded-xl p-3 text-xs font-bold text-charcoal focus:ring-2 focus:ring-agriGreen focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* STEP 3: QUALITY GRADE */}
            {step === 3 && (
              <div className="space-y-3">
                <h4 className="text-sm font-black text-charcoal">3. Produce Quality Grade</h4>
                <div className="space-y-2">
                  {[
                    { grade: 'Grade A', title: 'Grade A (Premium)', desc: 'Uniform size, deep color, 0% surface defect' },
                    { grade: 'Grade B', title: 'Grade B (Standard)', desc: 'Slight cosmetic variation, fresh farm condition' },
                    { grade: 'Grade C', title: 'Grade C (Processing)', desc: 'Optimal for food processing & puree' }
                  ].map(g => (
                    <div
                      key={g.grade}
                      onClick={() => setFormData({ ...formData, quality_grade: g.grade })}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                        formData.quality_grade === g.grade
                          ? 'bg-agriGreen-light border-agriGreen shadow-sm'
                          : 'bg-cream border-agriBorder'
                      }`}
                    >
                      <span className="text-xs font-black text-charcoal block">{g.title}</span>
                      <span className="text-[11px] text-charcoal-muted">{g.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: LOCATION & STORAGE */}
            {step === 4 && (
              <div className="space-y-3">
                <h4 className="text-sm font-black text-charcoal">4. Farmgate Location & Logistics</h4>
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">Pickup Village / Mandi</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-cream border border-agriBorder rounded-xl p-3 text-xs font-medium text-charcoal focus:ring-2 focus:ring-agriGreen focus:outline-none"
                  />
                </div>

                <div className="p-3 bg-cream rounded-xl border border-agriBorder flex items-center justify-between">
                  <span className="text-xs font-semibold text-charcoal">Cold Storage Facility at Farm?</span>
                  <input
                    type="checkbox"
                    checked={formData.storage_available}
                    onChange={e => setFormData({ ...formData, storage_available: e.target.checked })}
                    className="w-5 h-5 accent-agriGreen rounded"
                  />
                </div>
              </div>
            )}

            {/* STEP 5: HARVEST PHOTOS */}
            {step === 5 && (
              <div className="space-y-3">
                <h4 className="text-sm font-black text-charcoal">5. Harvest Produce Photos</h4>
                
                <div className="border-2 border-dashed border-agriBorder rounded-2xl p-5 text-center bg-cream/50 hover:bg-cream transition-colors cursor-pointer space-y-1.5">
                  <Upload className="w-7 h-7 text-agriGreen mx-auto" />
                  <span className="text-xs font-bold text-forest block">Tap to upload harvest photo</span>
                  <span className="text-[10px] text-charcoal-muted block">Direct camera or gallery upload</span>
                </div>

                <div className="flex items-center gap-3 p-3 bg-cream rounded-2xl border border-agriBorder">
                  <CropImage
                    cropName={formData.crop}
                    className="w-12 h-12 rounded-xl border border-agriBorder shrink-0"
                  />
                  <div className="text-xs min-w-0">
                    <span className="font-bold text-charcoal block truncate">{formData.crop}_Harvest_{formData.quality_grade.replace(/\s+/g, '')}.jpg</span>
                    <span className="text-[10px] text-agriGreen font-semibold">✓ Verified produce photo attached</span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: REVIEW & PUBLISH */}
            {step === 6 && (
              <div className="space-y-3">
                <h4 className="text-sm font-black text-charcoal">6. Summary & Confirmation</h4>
                
                <div className="p-4 bg-cream rounded-2xl border border-agriBorder space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-charcoal-muted">Crop & Variety:</span>
                    <span className="font-bold text-charcoal">{formData.crop} ({formData.variety})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-muted">Volume & Grade:</span>
                    <span className="font-bold text-charcoal">{formData.quantity_kg} KG • {formData.quality_grade}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-muted">Asking Base:</span>
                    <span className="font-black text-forest">₹{formData.expected_price_per_kg}/kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-muted">Pickup Location:</span>
                    <span className="font-bold text-charcoal">{formData.location}</span>
                  </div>
                </div>
              </div>
            )}

            {/* NAV ACTION BUTTONS */}
            <div className="flex items-center justify-between pt-3 border-t border-cream gap-2">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="min-touch px-4 py-2.5 text-xs font-bold text-charcoal-muted hover:text-charcoal active:bg-cream rounded-xl flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              ) : <div />}

              {step < 6 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="min-touch px-6 py-3 bg-forest hover:bg-forest-hover active:scale-95 text-white text-xs font-black rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePublish}
                  className="min-touch px-8 py-3 bg-agriGreen hover:bg-agriGreen-hover active:scale-95 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Publish Digital Lot</span>
                </button>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
