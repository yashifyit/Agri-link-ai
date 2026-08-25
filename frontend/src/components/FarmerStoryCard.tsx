import React from 'react';
import { AgriImage } from './AgriImage';

export interface FarmerStory {
  id: string;
  name: string;
  crop: string;
  location: string;
  quote: string;
  gain: string;
  image: string;
}

export const SAMPLE_FARMER_STORIES: FarmerStory[] = [
  {
    id: 's1',
    name: 'Ramesh Verma',
    crop: 'Tomato Farmer',
    location: 'Kanpur, Uttar Pradesh',
    quote: 'Now I know my best market options before I sell. I sold my 800kg tomatoes to a verified Lucknow processor for ₹31/kg net!',
    gain: '+₹2.8 / kg',
    image: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 's2',
    name: 'Anita Yadav',
    crop: 'Soybean Producer',
    location: 'Nashik, Maharashtra',
    quote: 'KisanLink matched our FPO directly with an oil processor. We avoided commission agents and earned +₹450/quintal extra.',
    gain: '+₹450 / quintal',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 's3',
    name: 'Suresh Patel',
    crop: 'Onion Farmer',
    location: 'Solapur, Maharashtra',
    quote: 'The price anomaly alert notified me when Kolhapur prices spiked. I sold my lot at peak demand with 24-hr payment clearance.',
    gain: '+14% Net Gain',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400'
  }
];

export const FarmerStoryCard: React.FC<{ story: FarmerStory }> = ({ story }) => {
  return (
    <div className="bg-white rounded-3xl p-5 border border-agriBorder shadow-card hover:shadow-card-hover transition-all space-y-4 flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <AgriImage src={story.image} alt={story.name} className="w-12 h-12 rounded-full border-2 border-agriGreen shrink-0" />
          <div>
            <h4 className="text-sm font-extrabold text-charcoal">{story.name}</h4>
            <span className="text-[11px] text-charcoal-muted block">{story.crop} • {story.location}</span>
          </div>
        </div>

        <p className="text-xs text-charcoal-muted italic leading-relaxed">
          "{story.quote}"
        </p>
      </div>

      <div className="pt-2 border-t border-cream flex items-center justify-between">
        <span className="text-[10px] uppercase font-bold text-charcoal-muted">Sample Farmer Result</span>
        <span className="text-xs font-black text-agriGreen bg-agriGreen-light px-2.5 py-0.5 rounded-full">
          {story.gain} Net Improvement
        </span>
      </div>
    </div>
  );
};
