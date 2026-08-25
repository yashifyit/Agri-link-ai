import React, { useState, useEffect } from 'react';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';

export const MatchingAnimationModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    "Checking crop compatibility...",
    "Verifying volume requirements...",
    "Checking quality grade match...",
    "Calculating expected price delta...",
    "Evaluating logistics & transit distance...",
    "Finding best verified buyers..."
  ];

  useEffect(() => {
    if (!isOpen) {
      setStepIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setStepIndex(prev => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            onClose();
          }, 800);
          return prev;
        }
        return prev + 1;
      });
    }, 450);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-modal text-center space-y-6 border border-agriBorder">
        <div className="w-16 h-16 rounded-3xl bg-forest text-freshGreen flex items-center justify-center mx-auto shadow-lg animate-pulse">
          <Sparkles className="w-8 h-8" />
        </div>

        <div>
          <h3 className="text-xl font-black text-charcoal">Analyzing Buyer Match</h3>
          <p className="text-xs text-charcoal-muted mt-1">KisanLink intelligent matching engine</p>
        </div>

        <div className="space-y-2 text-xs text-left">
          {steps.map((st, idx) => (
            <div key={idx} className="flex items-center gap-2.5">
              {idx < stepIndex ? (
                <CheckCircle2 className="w-4 h-4 text-agriGreen shrink-0" />
              ) : idx === stepIndex ? (
                <Loader2 className="w-4 h-4 text-amberGold animate-spin shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-agriBorder shrink-0" />
              )}
              <span className={idx <= stepIndex ? 'font-bold text-charcoal' : 'text-charcoal-muted'}>
                {st}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
