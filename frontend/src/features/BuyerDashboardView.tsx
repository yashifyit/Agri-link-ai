import React, { useState } from 'react';
import {
  Building2, PlusCircle, CheckCircle2, ChevronRight, Filter,
  Send, RefreshCw, Clock, ArrowUpRight, DollarSign, ShieldCheck, Truck, X,
  ShoppingBag, Sparkles, MapPin, Search
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { CreateRequirementModal } from '../components/CreateRequirementModal';
import { CheckoutModal } from '../components/CheckoutModal';
import { CropImage } from '../components/CropImage';
import { LotItem } from '../types';

export const BuyerDashboardView: React.FC<{ onOpenNegotiation: () => void }> = ({ onOpenNegotiation }) => {
  const { allLots, lots, buyers, offers, orders, shipments, isSyncing, lastSyncTime, refreshData } = useApp();
  const { user } = useAuth();
  
  const [isReqModalOpen, setIsReqModalOpen] = useState(false);
  const [selectedLotForCheckout, setSelectedLotForCheckout] = useState<LotItem | null>(null);
  const [selectedTab, setSelectedTab] = useState<'MARKETPLACE' | 'ORDERS' | 'REQUIREMENTS'>('MARKETPLACE');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCrop, setFilterCrop] = useState('ALL');

  // Available lots for buyer procurement
  const displayLots = (allLots && allLots.length > 0) ? allLots : lots;
  const activeLots = displayLots.filter(l => (l.status === 'ACTIVE' || l.status === 'OFFER_RECEIVED') && (l.available_qty_kg === undefined || l.available_qty_kg > 0));
  
  const filteredLots = activeLots.filter(l => {
    const matchesSearch = l.crop?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.farmer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCrop = filterCrop === 'ALL' || l.crop?.toLowerCase() === filterCrop.toLowerCase();
    return matchesSearch && matchesCrop;
  });

  const myOrders = orders.filter(o => !user?.name || o.buyer_name?.toLowerCase().includes(user.name.toLowerCase()) || o.buyer_name?.toLowerCase().includes('freshharvest'));

  return (
    <div className="space-y-6 pb-16 md:pb-6">
      
      {/* 1. HEADER & LIVE SYNC STATUS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-agriBorder shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-charcoal">Procurement Command Center</h1>
            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping inline-block" />
              Live Synced
            </span>
          </div>
          <p className="text-xs text-charcoal-muted mt-0.5">
            {user?.businessName || "FreshHarvest Foods Pvt Ltd"} • Lucknow Processing Hub • Last Sync: {lastSyncTime.toLocaleTimeString()}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => refreshData()}
            disabled={isSyncing}
            className="p-2.5 bg-cream hover:bg-cream-dark text-charcoal border border-agriBorder rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            title="Force Live Sync"
          >
            <RefreshCw className={`w-4 h-4 text-forest ${isSyncing ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsReqModalOpen(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" /> Post Buying Requirement
          </button>
        </div>
      </div>

      {/* 2. METRICS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-agriBorder shadow-card">
          <span className="text-xs font-semibold text-charcoal-muted block">Live Farmer Supply Lots</span>
          <span className="text-3xl font-black text-forest mt-1 block">{activeLots.length}</span>
          <span className="text-[10px] text-agriGreen font-bold mt-1 block">✓ Available for immediate purchase</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-agriBorder shadow-card">
          <span className="text-xs font-semibold text-charcoal-muted block">Active Orders</span>
          <span className="text-3xl font-black text-blue-600 mt-1 block">{myOrders.length}</span>
          <span className="text-[10px] text-charcoal-muted mt-1 block">In fulfillment pipeline</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-agriBorder shadow-card">
          <span className="text-xs font-semibold text-charcoal-muted block">Active Bids / Offers</span>
          <span className="text-3xl font-black text-charcoal mt-1 block">{offers.length || 1}</span>
          <span className="text-[10px] text-charcoal-muted mt-1 block">Negotiation in progress</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-agriBorder shadow-card">
          <span className="text-xs font-semibold text-charcoal-muted block">Active Shipments</span>
          <span className="text-3xl font-black text-amberGold mt-1 block">{shipments.filter(s => s.status !== 'DELIVERED').length}</span>
          <span className="text-[10px] text-charcoal-muted mt-1 block">Farmgate transit to plant</span>
        </div>
      </div>

      {/* 3. NAVIGATION TABS */}
      <div className="flex gap-2 border-b border-agriBorder pb-2">
        <button
          onClick={() => setSelectedTab('MARKETPLACE')}
          className={`px-5 py-2.5 text-xs font-extrabold rounded-xl transition-all ${
            selectedTab === 'MARKETPLACE' ? 'bg-forest text-white shadow-sm' : 'bg-white text-charcoal-muted border border-agriBorder'
          }`}
        >
          Live Crop Marketplace ({activeLots.length})
        </button>
        <button
          onClick={() => setSelectedTab('ORDERS')}
          className={`px-5 py-2.5 text-xs font-extrabold rounded-xl transition-all ${
            selectedTab === 'ORDERS' ? 'bg-forest text-white shadow-sm' : 'bg-white text-charcoal-muted border border-agriBorder'
          }`}
        >
          My Orders & Delivery Tracker ({myOrders.length})
        </button>
      </div>

      {/* 4. TAB CONTENTS */}
      {selectedTab === 'MARKETPLACE' && (
        <div className="space-y-4">
          {/* SEARCH & FILTERS BAR */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-charcoal-muted absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search crops, producers, or districts..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-agriBorder rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-charcoal focus:ring-2 focus:ring-agriGreen focus:outline-none"
              />
            </div>

            <select
              value={filterCrop}
              onChange={e => setFilterCrop(e.target.value)}
              className="bg-white border border-agriBorder rounded-xl px-4 py-2.5 text-xs font-bold text-charcoal focus:ring-2 focus:ring-agriGreen focus:outline-none"
            >
              <option value="ALL">All Commodities</option>
              <option value="Tomato">Tomato</option>
              <option value="Onion">Onion</option>
              <option value="Wheat">Wheat</option>
              <option value="Potato">Potato</option>
              <option value="Soybean">Soybean</option>
            </select>
          </div>

          {/* LOTS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLots.map((lot) => {
              const available = lot.available_qty_kg !== undefined ? lot.available_qty_kg : lot.quantity_kg;
              return (
                <div
                  key={lot.id}
                  className="bg-white rounded-2xl border border-agriBorder shadow-card overflow-hidden flex flex-col justify-between hover:border-forest/40 transition-all group"
                >
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <CropImage cropName={lot.crop} className="w-12 h-12 rounded-xl object-cover" />
                        <div>
                          <h3 className="font-extrabold text-charcoal text-base group-hover:text-forest transition-colors">{lot.crop}</h3>
                          <p className="text-xs text-charcoal-muted">{lot.variety} • {lot.quality_grade}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {lot.quality_grade}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-cream space-y-1.5 text-xs">
                      <div className="flex justify-between text-charcoal">
                        <span className="text-charcoal-muted">Available Stock:</span>
                        <span className="font-black text-agriGreen text-sm">{available} kg</span>
                      </div>
                      <div className="flex justify-between text-charcoal">
                        <span className="text-charcoal-muted">Asking Price:</span>
                        <span className="font-black text-charcoal text-sm">₹{lot.expected_price_per_kg}/kg</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-charcoal-muted pt-1">
                        <MapPin className="w-3.5 h-3.5 text-forest flex-shrink-0" />
                        <span className="truncate">{lot.location} ({lot.farmer_name})</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-charcoal-muted">
                      <span>Harvest: {lot.harvest_date}</span>
                      <span className="text-forest font-semibold">⚡ Verified Producer</span>
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="p-4 bg-cream border-t border-agriBorder grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onOpenNegotiation()}
                      className="py-2.5 px-3 bg-white hover:bg-cream-dark border border-agriBorder text-charcoal text-xs font-bold rounded-xl transition-all"
                    >
                      Make Offer / Bid
                    </button>
                    <button
                      onClick={() => setSelectedLotForCheckout(lot)}
                      className="py-2.5 px-3 bg-forest hover:bg-forest-hover text-white text-xs font-black rounded-xl shadow-sm transition-all flex items-center justify-center gap-1"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> Buy Direct
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. ORDERS & DELIVERY TRACKER TAB */}
      {selectedTab === 'ORDERS' && (
        <div className="space-y-4">
          {myOrders.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-2xl border border-agriBorder text-charcoal-muted">
              <ShoppingBag className="w-10 h-10 mx-auto text-charcoal-muted/50 mb-2" />
              <p className="text-xs font-bold">No active orders placed yet.</p>
            </div>
          ) : (
            myOrders.map((order) => {
              const shipment = shipments.find(s => s.order_id === order.id);
              return (
                <div key={order.id} className="bg-white p-5 rounded-2xl border border-agriBorder shadow-card space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-agriBorder pb-3">
                    <div>
                      <span className="font-mono text-xs font-black text-forest">{order.id}</span>
                      <h4 className="text-sm font-black text-charcoal mt-0.5">
                        {order.crop} • {order.quantity_kg} kg @ ₹{order.price_per_kg}/kg
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-charcoal-muted block">Total Paid in Escrow</span>
                      <span className="text-sm font-black text-forest">₹{order.total_amount?.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* VISUAL SHIPMENT TRACKER */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-charcoal-muted block uppercase tracking-wider">
                      Fulfillment & Logistics Milestone Tracker:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                      <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                        ✓ 1. Order Confirmed
                      </div>
                      <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                        ✓ 2. Escrow Paid
                      </div>
                      <div className={`p-2.5 rounded-xl font-bold ${
                        shipment?.status === 'IN_TRANSIT' || shipment?.status === 'OUT_FOR_DELIVERY' || shipment?.status === 'DELIVERED'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-blue-50 text-blue-800 border border-blue-200 animate-pulse'
                      }`}>
                        {shipment?.status === 'IN_TRANSIT' || shipment?.status === 'OUT_FOR_DELIVERY' || shipment?.status === 'DELIVERED' ? '✓' : '●'} 3. Farm Pickup
                      </div>
                      <div className={`p-2.5 rounded-xl font-bold ${
                        shipment?.status === 'DELIVERED'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-cream text-charcoal-muted border border-agriBorder'
                      }`}>
                        {shipment?.status === 'DELIVERED' ? '✓' : '○'} 4. Delivered & Settled
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-charcoal-muted pt-2">
                    <span>Producer: {order.farmer_name}</span>
                    <span>Carrier: {shipment?.logistics_partner_name || "KisanLink FastLogistics"}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* GLOBAL MODALS */}
      <CreateRequirementModal isOpen={isReqModalOpen} onClose={() => setIsReqModalOpen(false)} />
      {selectedLotForCheckout && (
        <CheckoutModal
          isOpen={Boolean(selectedLotForCheckout)}
          onClose={() => setSelectedLotForCheckout(null)}
          lot={selectedLotForCheckout}
        />
      )}
    </div>
  );
};
