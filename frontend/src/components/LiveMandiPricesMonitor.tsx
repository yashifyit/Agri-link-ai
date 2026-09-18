import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, Minus, Search, Filter, ExternalLink, RefreshCw,
  Building2, MapPin, Activity, CheckCircle2, Sparkles, Clock, Globe, ArrowUpRight
} from 'lucide-react';
import { LiveMandiPriceItem } from '../types';
import { CropImage } from './CropImage';
import { motion, AnimatePresence } from 'framer-motion';

export const LiveMandiPricesMonitor: React.FC = () => {
  const [prices, setPrices] = useState<LiveMandiPriceItem[]>([]);
  const [tickerItems, setTickerItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'modal' | 'arrival' | 'change'>('modal');

  const categories = ['ALL', 'Vegetables', 'Grains', 'Oilseeds', 'Pulses', 'Spices', 'Fruits', 'Cash Crops'];
  const states = [
    'ALL', 'Maharashtra', 'Uttar Pradesh', 'Punjab', 'Madhya Pradesh',
    'Gujarat', 'Tamil Nadu', 'Andhra Pradesh', 'Karnataka', 'Rajasthan', 'Kerala', 'Delhi'
  ];

  const fetchLivePrices = async () => {
    try {
      const [resPrices, resTicker] = await Promise.all([
        fetch(`http://localhost:8000/api/v1/mandi-prices/live?category=${selectedCategory}&state=${selectedState}&search=${encodeURIComponent(searchQuery)}`),
        fetch(`http://localhost:8000/api/v1/mandi-prices/ticker`)
      ]);

      if (resPrices.ok) {
        const data = await resPrices.json();
        setPrices(data);
      }
      if (resTicker.ok) {
        const tickerData = await resTicker.json();
        setTickerItems(tickerData);
      }
      setLastRefreshed(new Date());
    } catch (err) {
      console.error("Failed to fetch live mandi prices:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLivePrices();
    const interval = setInterval(fetchLivePrices, 8000);
    return () => clearInterval(interval);
  }, [selectedCategory, selectedState, searchQuery]);

  const sortedPrices = [...prices].sort((a, b) => {
    if (sortBy === 'modal') return b.modal_price - a.modal_price;
    if (sortBy === 'arrival') return b.arrival_tons - a.arrival_tons;
    if (sortBy === 'change') return b.change_pct - a.change_pct;
    return 0;
  });

  return (
    <div className="space-y-6">
      
      {/* 1. REAL-TIME LIVE MANDI TICKER TAPE */}
      <div className="bg-charcoal text-white rounded-2xl overflow-hidden shadow-card border border-charcoal/30 flex items-center">
        <div className="bg-forest px-3.5 py-2.5 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0 z-10">
          <span className="w-2 h-2 rounded-full bg-agriGreen animate-ping inline-block" />
          <Activity className="w-3.5 h-3.5" /> LIVE MANDI RATES
        </div>
        
        <div className="overflow-x-auto no-scrollbar py-2 px-3 flex gap-6 text-xs whitespace-nowrap">
          {tickerItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="font-bold text-cream">{item.commodity}</span>
              <span className="text-white/60 text-[10px]">({item.market})</span>
              <span className="font-mono font-bold text-white">₹{item.price_per_kg}/kg</span>
              <span className={`text-[10px] font-bold flex items-center ${
                item.trend === 'BULLISH' ? 'text-emerald-400' :
                item.trend === 'BEARISH' ? 'text-rose-400' : 'text-amber-300'
              }`}>
                {item.trend === 'BULLISH' ? '▲' : item.trend === 'BEARISH' ? '▼' : '●'} {item.change_pct > 0 ? `+${item.change_pct}%` : `${item.change_pct}%`}
              </span>
              <span className="text-white/20">|</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. HEADER & VERIFIED SOURCE BANNER */}
      <div className="bg-gradient-to-br from-white to-cream-light p-5 sm:p-6 rounded-3xl border border-agriBorder shadow-card space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cream pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-forest text-white">
                LIVE DATA FEED
              </span>
              <span className="text-[11px] text-charcoal-muted flex items-center gap-1">
                <Clock className="w-3 h-3" /> Refreshed {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-charcoal mt-1">
              Today’s Mandi Prices & Market Rates in India
            </h2>
            <p className="text-xs text-charcoal-muted mt-0.5">
              Live market modal benchmark prices, daily arrival tonnages & spot trends across 2,000+ Indian APMCs
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            <a
              href="https://www.commodityonline.com/mandiprices"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-cream hover:bg-cream-dark border border-agriBorder text-forest text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm group"
            >
              <Globe className="w-3.5 h-3.5 text-forest" />
              <span>Verified Source: CommodityOnline</span>
              <ExternalLink className="w-3.5 h-3.5 text-forest group-hover:translate-x-0.5 transition-transform" />
            </a>

            <button
              onClick={fetchLivePrices}
              disabled={isLoading}
              className="px-3.5 py-2 bg-forest hover:bg-forest-light text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Sync Live</span>
            </button>
          </div>
        </div>

        {/* 3. SEARCH & DYNAMIC FILTERS */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-charcoal-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search commodity, APMC market, district or state..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-agriBorder rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold text-charcoal focus:ring-2 focus:ring-agriGreen focus:outline-none shadow-sm"
            />
          </div>

          {/* State Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full bg-white border border-agriBorder rounded-xl px-3 py-2.5 text-xs font-bold text-charcoal focus:ring-2 focus:ring-agriGreen focus:outline-none shadow-sm"
            >
              <option value="ALL">All States ({states.length - 1})</option>
              {states.filter(s => s !== 'ALL').map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-white border border-agriBorder rounded-xl px-3 py-2.5 text-xs font-bold text-charcoal focus:ring-2 focus:ring-agriGreen focus:outline-none shadow-sm"
            >
              <option value="modal">Sort: Highest Price</option>
              <option value="arrival">Sort: Highest Arrival Volume</option>
              <option value="change">Sort: Highest Trend Gain</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-forest text-white shadow-sm'
                  : 'bg-white text-charcoal hover:bg-cream border border-agriBorder'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 4. LIVE COMMODITY MANDI BENCHMARK CARDS / TABLE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-black uppercase text-charcoal tracking-wider">
            Live APMC Mandi Rates ({sortedPrices.length} Records)
          </span>
          <span className="text-[11px] text-charcoal-muted font-bold">
            All prices in ₹/Quintal & ₹/KG
          </span>
        </div>

        {isLoading && prices.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-agriBorder text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-agriGreen animate-spin mx-auto" />
            <p className="text-xs font-bold text-charcoal">Fetching Live Mandi Prices from CommodityOnline...</p>
          </div>
        ) : sortedPrices.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-agriBorder text-center text-xs text-charcoal-muted">
            No mandi rates found matching "{searchQuery}" in {selectedState}. Try another search filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedPrices.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-agriBorder shadow-sm hover:shadow-card hover:border-agriGreen transition-all flex flex-col justify-between space-y-3 group"
              >
                <div>
                  {/* Top Bar: Category & Trend Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full bg-cream text-charcoal border border-agriBorder">
                      {item.category}
                    </span>
                    
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                      item.trend === 'BULLISH' ? 'bg-emerald-100 text-emerald-800' :
                      item.trend === 'BEARISH' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.trend === 'BULLISH' ? <TrendingUp className="w-3 h-3" /> :
                       item.trend === 'BEARISH' ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                      {item.change_pct > 0 ? `+${item.change_pct}%` : `${item.change_pct}%`}
                    </span>
                  </div>

                  {/* Commodity & Market Info */}
                  <div className="mt-3 flex items-start gap-3">
                    <CropImage cropName={item.commodity} className="w-12 h-12 rounded-xl border border-agriBorder shrink-0 object-cover" />
                    <div>
                      <h3 className="text-base font-black text-charcoal group-hover:text-forest transition-colors">
                        {item.commodity}
                      </h3>
                      <div className="flex items-center gap-1 text-[11px] text-charcoal-muted mt-0.5 font-medium">
                        <MapPin className="w-3 h-3 text-agriGreen shrink-0" />
                        <span>{item.market} ({item.district}, {item.state})</span>
                      </div>
                      {item.variety && (
                        <span className="text-[10px] text-charcoal/70 font-semibold block mt-0.5">
                          Variety: {item.variety}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price Breakdown Grid */}
                  <div className="grid grid-cols-2 gap-2 mt-3.5">
                    <div className="bg-forest-subtle p-2.5 rounded-xl border border-agriGreen/20">
                      <span className="text-[10px] text-forest font-bold block">Modal Benchmark</span>
                      <span className="text-base font-black text-forest">₹{item.price_per_kg.toFixed(2)}<span className="text-[10px] font-normal text-charcoal-muted">/kg</span></span>
                      <span className="text-[10px] text-charcoal-muted block font-mono font-medium">₹{item.modal_price.toLocaleString('en-IN')}/Qtl</span>
                    </div>

                    <div className="bg-cream p-2.5 rounded-xl border border-agriBorder">
                      <span className="text-[10px] text-charcoal-muted font-bold block">Range (Min - Max)</span>
                      <span className="text-xs font-bold text-charcoal block">₹{(item.min_price/100).toFixed(1)} - ₹{(item.max_price/100).toFixed(1)}/kg</span>
                      <span className="text-[10px] text-charcoal-muted font-mono block">₹{item.min_price} - {item.max_price}</span>
                    </div>
                  </div>

                  {/* Arrival Volume Bar */}
                  <div className="mt-3 pt-2.5 border-t border-cream flex items-center justify-between text-[11px]">
                    <span className="text-charcoal-muted">Daily Arrival:</span>
                    <span className="font-bold text-charcoal">{item.arrival_tons} Tons</span>
                  </div>
                </div>

                {/* Bottom Source & Link */}
                <div className="pt-2 border-t border-agriBorder flex items-center justify-between text-[10px] text-charcoal-muted">
                  <span className="flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3 h-3 text-agriGreen" /> {item.updated_at}
                  </span>
                  
                  <a
                    href={item.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-forest font-bold hover:underline flex items-center gap-0.5"
                  >
                    Mandi Bhav <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
