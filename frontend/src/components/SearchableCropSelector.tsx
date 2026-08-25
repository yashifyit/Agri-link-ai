import React, { useState } from 'react';
import { Search, Filter, Check } from 'lucide-react';
import { CROPS_CATALOG, CropItem } from '../data/crops';
import { CropImage } from './CropImage';
import { useApp } from '../context/AppContext';
import { getCropImage } from '../services/imageService';

interface SearchableCropSelectorProps {
  onSelectCrop: (crop: CropItem) => void;
  selectedCropId?: string;
}

export const SearchableCropSelector: React.FC<SearchableCropSelectorProps> = ({
  onSelectCrop,
  selectedCropId
}) => {
  const { crops } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const categories = ['ALL', 'Vegetables', 'Cereals', 'Pulses', 'Oilseeds', 'Fruits', 'Spices', 'Cash Crops'];

  // Map dynamic crop names to combined metadata list
  const allCrops: CropItem[] = crops.map((name: string): CropItem => {
    const staticCrop = CROPS_CATALOG.find(sc => sc.name.toLowerCase() === name.toLowerCase());
    if (staticCrop) return staticCrop;
    return {
      cropId: `crop-${name.toLowerCase().replace(/\s+/g, '-')}`,
      id: `crop-${name.toLowerCase().replace(/\s+/g, '-')}`,
      name: name,
      hindiName: name,
      marathiName: name,
      localNames: `${name} • ${name}`,
      category: 'Vegetables',
      imageUrl: getCropImage(name),
      image: getCropImage(name),
      imageAlt: `Fresh harvested ${name}`,
      imageSource: 'Unsplash',
      mandiPrice: 40,
      unit: 'kg',
      bestOfferPrice: 43,
      demandTrend: 'STABLE',
      trendPct: 0,
      qualityGrades: ['Grade A'],
      season: ['Kharif'],
      storageType: 'Cold Storage'
    };
  });

  const filteredCrops = allCrops.filter((c: CropItem) => {
    const matchesCategory = activeCategory === 'ALL' || c.category === activeCategory;
    const term = searchTerm.toLowerCase().trim();
    const matchesQuery = !term ||
      c.name.toLowerCase().includes(term) ||
      c.hindiName.toLowerCase().includes(term) ||
      c.marathiName.toLowerCase().includes(term);
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="space-y-4">
      {/* SEARCH BAR (Requirement 8) */}
      <div className="relative">
        <Search className="w-4 h-4 text-charcoal-muted absolute left-3.5 top-3.5" />
        <input
          type="text"
          placeholder="🔍 Search crop (e.g. Tomato, टमाटर, कांदा, Wheat)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-cream border border-agriBorder rounded-2xl pl-10 pr-4 py-3 text-xs font-semibold text-charcoal focus:ring-2 focus:ring-agriGreen focus:outline-none shadow-sm"
        />
      </div>

      {/* CATEGORY FILTER CHIPS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-forest text-white shadow-sm'
                : 'bg-cream text-charcoal-muted hover:text-charcoal border border-agriBorder'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* CROP GRID SELECTOR */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-72 overflow-y-auto pr-1">
        {filteredCrops.map((crop: CropItem) => {
          const isSelected = selectedCropId === crop.id;
          return (
            <div
              key={crop.id}
              onClick={() => onSelectCrop(crop)}
              className={`p-2.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-2.5 ${
                isSelected
                  ? 'bg-agriGreen-light border-agriGreen shadow-md'
                  : 'bg-white border-agriBorder hover:bg-cream'
              }`}
            >
              <CropImage
                crop={crop}
                className="w-10 h-10 rounded-xl shrink-0"
              />
              <div className="min-w-0 flex-1">
                <span className="text-xs font-extrabold text-charcoal truncate block">{crop.name}</span>
                <span className="text-[10px] text-charcoal-muted truncate block">{crop.hindiName} / {crop.marathiName}</span>
                <span className="text-[10px] font-bold text-forest mt-0.5 block">₹{crop.mandiPrice}/{crop.unit}</span>
              </div>
              {isSelected && <Check className="w-4 h-4 text-agriGreen shrink-0" />}
            </div>
          );
        })}
      </div>
    </div>
  );
};
