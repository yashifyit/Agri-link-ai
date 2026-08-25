import React, { useState, useEffect } from 'react';
import { Search, Filter, ArrowUpDown, TrendingUp, ChevronRight, Eye, Sparkles, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PriceTrendChart } from '../components/PriceTrendChart';
import { CropDetailModal } from '../components/CropDetailModal';
import { CropImage } from '../components/CropImage';
import { MaharashtraMap } from '../components/MaharashtraMap';
import { CROPS_CATALOG, CropItem } from '../data/crops';

export const MarketIntelligenceView: React.FC = () => {
  const { prices } = useApp();
  const [selectedCrop, setSelectedCrop] = useState<CropItem>(CROPS_CATALOG[0]);
  const [selectedDetailCrop, setSelectedDetailCrop] = useState<CropItem | null>(null);
  
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [comparisons, setComparisons] = useState<any[]>([]);
  const [loadingComp, setLoadingComp] = useState(false);

  const categories = ['ALL', 'Vegetables', 'Cereals', 'Pulses', 'Oilseeds', 'Fruits', 'Cash Crops', 'Spices'];

  const filteredCrops = CROPS_CATALOG.filter(crop => {
    const matchesCategory = selectedCategory === 'ALL' || crop.category === selectedCategory;
    const matchesSearch = crop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          crop.hindiName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (crop.marathiName && crop.marathiName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const filteredPrices = prices.filter(p => p.crop.toLowerCase().includes(selectedCrop.name.toLowerCase()));

  useEffect(() => {
    const fetchComparison = async () => {
      setLoadingComp(true);
      try {
        const res = await fetch(`http://localhost:8000/api/v1/market-comparison?crop=${selectedCrop.name}&quantity_kg=800&farmer_location=Kanpur`);
        if (res.ok) {
          const data = await res.json();
          setComparisons(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingComp(false);
      }
    };
    fetchComparison();
  }, [selectedCrop]);

  return (
    <div className="space-y-5 pb-8 text-charcoal">
      
      {/* 1. MOBILE MARKETPLACE SEARCH & CATEGORIES */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-agriBorder shadow-card space-y-3.5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-charcoal">Live Commodity Marketplace</h1>
          <p className="text-xs text-charcoal-muted mt-0.5">Explore 55+ crops with verified mandi rates & direct buyer bids</p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-charcoal-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search crops by English, हिन्दी or मराठी..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-cream border border-agriBorder rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold text-charcoal focus:ring-2 focus:ring-agriGreen focus:outline-none"
          />
        </div>

        {/* Category Pills (Horizontal Scroll on Mobile) */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-2 px-2 sm:mx-0 sm:px-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-forest text-white shadow-sm'
                  : 'bg-cream text-charcoal hover:bg-cream-dark border border-agriBorder'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 2. CROP COMMODITY CARDS (1-col on <390px, 2-col on >=390px, 3-col on desktop) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-black uppercase text-charcoal tracking-wider">
            Available Commodities ({filteredCrops.length})
          </span>
          <span className="text-[11px] text-charcoal-muted font-bold">Tap card for full analytics</span>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {filteredCrops.map((crop) => (
            <div
              key={crop.id}
              onClick={() => {
                setSelectedCrop(crop);
                setSelectedDetailCrop(crop);
              }}
              className="bg-white rounded-2xl border border-agriBorder shadow-sm hover:shadow-card hover:border-agriGreen transition-all cursor-pointer overflow-hidden flex flex-col justify-between active:scale-98 group"
            >
              {/* CROP IMAGE HEADER (Fixed 16:10 aspect ratio, zero distortion) */}
              <div className="w-full h-36 relative overflow-hidden bg-cream border-b border-agriBorder">
                <CropImage
                  crop={crop}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-charcoal/80 text-white backdrop-blur-sm">
                  {crop.category}
                </span>
                <span className="absolute top-2 right-2 text-[10px] font-black px-2 py-0.5 rounded-full bg-agriGreen text-white shadow-sm">
                  {crop.demandTrend} ↑
                </span>
              </div>

              {/* CROP DETAILS & PRICES */}
              <div className="p-3.5 space-y-2.5">
                <div>
                  <h3 className="text-base font-black text-charcoal group-hover:text-forest transition-colors truncate">
                    {crop.name}
                  </h3>
                  <span className="text-[11px] text-charcoal-muted block truncate font-medium">
                    {crop.hindiName} • {crop.marathiName || crop.category}
                  </span>
                </div>

                {/* Price Comparisons */}
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <div className="p-2 bg-cream rounded-xl border border-agriBorder">
                    <span className="text-[9px] text-charcoal-muted block font-semibold">Mandi Rate</span>
                    <span className="font-bold text-charcoal text-xs">₹{crop.mandiPrice}/{crop.unit}</span>
                  </div>
                  <div className="p-2 bg-agriGreen-light rounded-xl border border-agriGreen-accent/30">
                    <span className="text-[9px] text-agriGreen font-bold block">Buyer Offer</span>
                    <span className="font-black text-forest text-xs">₹{crop.bestOfferPrice}/{crop.unit}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-cream flex items-center justify-between text-xs text-forest font-black">
                  <span>View Details</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. PRICE TREND CHART FOR SELECTED CROP */}
      <PriceTrendChart crop={selectedCrop.name} />

      {/* 4. MARKET RANKING "WHERE SHOULD I SELL?" */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-agriBorder shadow-card space-y-4">
        <div className="border-b border-cream pb-3 space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-forest bg-agriGreen-light px-2.5 py-0.5 rounded-full">
            Net Realization Optimization
          </span>
          <h2 className="text-base sm:text-lg font-black text-charcoal mt-1">
            Where should I sell {selectedCrop.name}?
          </h2>
          <p className="text-xs text-charcoal-muted">Ranked by Net Payout = Mandi Price − Transport Cost</p>
        </div>

        {loadingComp ? (
          <div className="py-6 text-center text-xs text-charcoal-muted">Optimizing mandi rankings...</div>
        ) : comparisons.length === 0 ? (
          <div className="py-6 text-center text-xs text-charcoal-muted">No regional mandis found for {selectedCrop.name}.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {comparisons.slice(0, 3).map((c, idx) => (
              <div 
                key={idx} 
                className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 ${
                  idx === 0 ? 'bg-cream border-2 border-agriGreen relative shadow-md' : 'bg-white border-agriBorder'
                }`}
              >
                {idx === 0 && (
                  <span className="self-start bg-agriGreen text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                    #1 RANKED NET
                  </span>
                )}
                <div>
                  <h3 className="text-sm font-black text-charcoal">{idx + 1}. {c.market_name}</h3>
                  <span className="text-[11px] text-charcoal-muted">{c.distance_km} km from Kanpur</span>
                </div>
                
                <div className="space-y-1 text-[11px] border-t border-agriBorder/60 pt-2 text-charcoal-muted">
                  <div className="flex justify-between">
                    <span>Market Rate:</span>
                    <span className="font-bold text-charcoal">₹{c.market_price.toFixed(2)}/kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Freight Cost:</span>
                    <span className="font-bold text-agriDanger">-₹{c.transport_cost.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-agriBorder flex items-baseline justify-between">
                  <span className="text-[10px] font-bold text-charcoal-muted">Estimated Net:</span>
                  <span className={`font-black ${idx === 0 ? 'text-lg text-forest' : 'text-base text-charcoal'}`}>
                    ₹{c.net_per_kg.toFixed(2)}/kg
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. REGIONAL AGRICULTURE & MARKET ACTIVITY LEAFLET MAP */}
      <MaharashtraMap />

      {/* CROP DETAIL MODAL */}
      <CropDetailModal
        isOpen={Boolean(selectedDetailCrop)}
        onClose={() => setSelectedDetailCrop(null)}
        crop={selectedDetailCrop}
        onSellCrop={() => setSelectedDetailCrop(null)}
      />

    </div>
  );
};
