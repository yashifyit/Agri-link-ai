import React, { useState, useRef } from 'react';
import { X, Upload, CheckCircle2, ArrowRight, ArrowLeft, Sprout, Image as ImageIcon, Camera, Trash2, Check, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CropImage } from './CropImage';
import { t, getCropName } from '../utils/i18n';

export const CreateLotWizardModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { addLot, crops, language } = useApp();
  const [step, setStep] = useState<number>(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const [uploadedImageSrc, setUploadedImageSrc] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('Tomato_Harvest_GradeA.jpg');
  const [uploadedFileSize, setUploadedFileSize] = useState<string>('2.4 MB');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    
    setIsAnalyzing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImageSrc(e.target?.result as string);
      setUploadedFileName(file.name);
      setUploadedFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
      setFormData(prev => ({ ...prev, photoUploaded: true }));
      setTimeout(() => setIsAnalyzing(false), 500);
    };
    reader.readAsDataURL(file);
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = () => {
    setUploadedImageSrc(null);
    setUploadedFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

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
                        🌾 {cName !== getCropName(cName, language) ? `${getCropName(cName, language)} (${cName})` : cName}
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
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-charcoal">5. Harvest Produce Photos</h4>
                  <span className="text-[11px] font-bold text-agriGreen">
                    {uploadedImageSrc ? '✓ Photo Ready' : 'Optional / Camera'}
                  </span>
                </div>

                {/* Hidden Real File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onFileInputChange}
                  className="hidden"
                />
                
                {/* INTERACTIVE UPLOAD DROPZONE */}
                <div
                  onClick={triggerUpload}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer space-y-2 select-none ${
                    isDragging
                      ? 'border-agriGreen bg-agriGreen-light scale-[1.01]'
                      : 'border-agriBorder bg-cream/60 hover:bg-cream hover:border-forest-light'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-forest-light/10 text-forest mx-auto flex items-center justify-center">
                    {isAnalyzing ? (
                      <RefreshCw className="w-6 h-6 text-agriGreen animate-spin" />
                    ) : (
                      <Camera className="w-6 h-6 text-agriGreen" />
                    )}
                  </div>
                  
                  <div>
                    <span className="text-xs font-black text-forest block">
                      {isAnalyzing ? 'Analyzing photo quality...' : 'Tap to capture or upload harvest photo'}
                    </span>
                    <span className="text-[10px] text-charcoal-muted block mt-0.5">
                      Supports JPG, PNG, WebP • Drag & drop from computer or tap to open camera
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerUpload();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest text-white text-[11px] font-bold hover:bg-forest-light transition-all shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choose File from Device</span>
                  </button>
                </div>

                {/* ACTIVE PHOTO PREVIEW CARD */}
                <div className="flex items-center justify-between p-3 bg-cream rounded-2xl border border-agriBorder">
                  <div className="flex items-center gap-3 min-w-0">
                    {uploadedImageSrc ? (
                      <img
                        src={uploadedImageSrc}
                        alt="Harvest produce preview"
                        className="w-12 h-12 rounded-xl object-cover border border-agriGreen shadow-sm shrink-0"
                      />
                    ) : (
                      <CropImage
                        cropName={formData.crop}
                        className="w-12 h-12 rounded-xl border border-agriBorder shrink-0"
                      />
                    )}
                    
                    <div className="text-xs min-w-0 space-y-0.5">
                      <span className="font-bold text-charcoal block truncate">
                        {uploadedFileName || `${formData.crop}_Harvest_${formData.quality_grade.replace(/\s+/g, '')}.jpg`}
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <span className="text-agriGreen font-bold flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> AI Validated ({formData.quality_grade})
                        </span>
                        {uploadedFileSize && (
                          <span className="text-charcoal-muted">• {uploadedFileSize}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {uploadedImageSrc && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemovePhoto();
                      }}
                      title="Remove photo"
                      className="p-2 text-charcoal-muted hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
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
