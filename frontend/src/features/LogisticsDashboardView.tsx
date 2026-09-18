import React, { useState } from 'react';
import {
  Truck, PackageCheck, MapPin, Clock, ArrowRight, ShieldCheck,
  CheckCircle2, AlertCircle, RefreshCw, Navigation, Phone, User
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { ShipmentItem } from '../types';

export const LogisticsDashboardView: React.FC = () => {
  const { shipments, updateShipmentMilestone, isSyncing, refreshData } = useApp();
  const { user } = useAuth();

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED'>('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredShipments = shipments.filter(s => {
    if (activeFilter === 'ASSIGNED') return s.status === 'ASSIGNED' || s.status === 'PICKUP_SCHEDULED';
    if (activeFilter === 'IN_TRANSIT') return s.status === 'PICKED_UP' || s.status === 'IN_TRANSIT' || s.status === 'OUT_FOR_DELIVERY';
    if (activeFilter === 'DELIVERED') return s.status === 'DELIVERED';
    return true;
  });

  const totalAssigned = shipments.filter(s => s.status !== 'DELIVERED').length;
  const totalDelivered = shipments.filter(s => s.status === 'DELIVERED').length;
  const totalFreight = shipments.reduce((sum, s) => sum + (s.transport_cost || 1600), 0);

  const handleAdvanceStatus = async (shipment: ShipmentItem) => {
    setUpdatingId(shipment.id);
    try {
      let nextStatus = 'PICKUP_SCHEDULED';
      let note = 'Pickup scheduled at farmgate';

      if (shipment.status === 'ASSIGNED') {
        nextStatus = 'PICKUP_SCHEDULED';
        note = 'Driver assigned for farmgate arrival';
      } else if (shipment.status === 'PICKUP_SCHEDULED') {
        nextStatus = 'PICKED_UP';
        note = 'Produce loaded & weighed at farm';
      } else if (shipment.status === 'PICKED_UP') {
        nextStatus = 'IN_TRANSIT';
        note = 'In transit on State Highway';
      } else if (shipment.status === 'IN_TRANSIT') {
        nextStatus = 'OUT_FOR_DELIVERY';
        note = 'Out for final delivery at buyer gate';
      } else if (shipment.status === 'OUT_FOR_DELIVERY') {
        nextStatus = 'DELIVERED';
        note = 'Delivered & verified by buyer. Escrow payout unlocked!';
      }

      await updateShipmentMilestone(shipment.id, nextStatus, note);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-16 md:pb-6">
      
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-agriBorder shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-charcoal">Logistics & Fleet Command</h1>
            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              <Truck className="w-3 h-3" /> Fleet Active
            </span>
          </div>
          <p className="text-xs text-charcoal-muted mt-0.5">
            {user?.name || "KisanLink FastLogistics"} • Lucknow Distribution Hub • UP & Maharashtra Corridors
          </p>
        </div>

        <button
          onClick={() => refreshData()}
          disabled={isSyncing}
          className="p-2.5 bg-cream hover:bg-cream-dark text-charcoal border border-agriBorder rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 text-forest ${isSyncing ? 'animate-spin' : ''}`} /> Sync Telemetry
        </button>
      </div>

      {/* 2. METRICS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-agriBorder shadow-card">
          <span className="text-xs font-semibold text-charcoal-muted block">Active Loads</span>
          <span className="text-3xl font-black text-blue-600 mt-1 block">{totalAssigned}</span>
          <span className="text-[10px] text-charcoal-muted mt-1 block">Scheduled for pickup / transit</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-agriBorder shadow-card">
          <span className="text-xs font-semibold text-charcoal-muted block">Delivered Loads</span>
          <span className="text-3xl font-black text-emerald-600 mt-1 block">{totalDelivered}</span>
          <span className="text-[10px] text-emerald-700 font-bold mt-1 block">✓ Escrow settled to farmers</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-agriBorder shadow-card">
          <span className="text-xs font-semibold text-charcoal-muted block">Active Corridors</span>
          <span className="text-3xl font-black text-forest mt-1 block">4</span>
          <span className="text-[10px] text-charcoal-muted mt-1 block">Kanpur-Lucknow, Nashik-Pune</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-agriBorder shadow-card">
          <span className="text-xs font-semibold text-charcoal-muted block">Gross Freight Handled</span>
          <span className="text-3xl font-black text-amberGold mt-1 block">₹{totalFreight.toLocaleString()}</span>
          <span className="text-[10px] text-charcoal-muted mt-1 block">Direct carrier billing</span>
        </div>
      </div>

      {/* 3. FILTER TABS */}
      <div className="flex gap-2 border-b border-agriBorder pb-2 overflow-x-auto">
        {(['ALL', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all ${
              activeFilter === filter
                ? 'bg-forest text-white shadow-sm'
                : 'bg-white text-charcoal-muted hover:text-charcoal border border-agriBorder'
            }`}
          >
            {filter.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* 4. SHIPMENTS LIST */}
      <div className="space-y-4">
        {filteredShipments.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-agriBorder text-charcoal-muted">
            <Truck className="w-10 h-10 mx-auto text-charcoal-muted/50 mb-2" />
            <p className="text-xs font-bold">No shipments found in this category.</p>
          </div>
        ) : (
          filteredShipments.map((shipment) => {
            const isDone = shipment.status === 'DELIVERED';
            return (
              <div
                key={shipment.id}
                className="bg-white p-5 rounded-2xl border border-agriBorder shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* SHIPMENT INFO */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-forest">{shipment.id}</span>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      shipment.status === 'DELIVERED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : shipment.status === 'IN_TRANSIT'
                        ? 'bg-amber-100 text-amber-800 animate-pulse'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {shipment.status.replace('_', ' ')}
                    </span>
                    {shipment.cold_chain_enabled && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-100 text-cyan-800">
                        ❄️ Cold Chain
                      </span>
                    )}
                  </div>

                  <div className="text-sm font-black text-charcoal">
                    {shipment.crop} • {shipment.quantity_kg} kg
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-charcoal-muted">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-forest flex-shrink-0" />
                      <span className="truncate">From: {shipment.origin} ({shipment.farmer_name})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      <span className="truncate">To: {shipment.destination} ({shipment.buyer_name})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-charcoal font-semibold pt-1">
                    <span>Vehicle: {shipment.vehicle_number} ({shipment.vehicle_type})</span>
                    <span>Driver: {shipment.driver_name}</span>
                    <span className="text-forest font-bold">Freight: ₹{shipment.transport_cost?.toLocaleString()}</span>
                  </div>
                </div>

                {/* ACTION TRIGGER BUTTON */}
                <div className="flex items-center gap-3">
                  {!isDone ? (
                    <button
                      onClick={() => handleAdvanceStatus(shipment)}
                      disabled={updatingId === shipment.id}
                      className="px-5 py-3 bg-forest hover:bg-forest-hover text-white text-xs font-black rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                    >
                      {updatingId === shipment.id ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Updating...
                        </>
                      ) : shipment.status === 'ASSIGNED' ? (
                        <>Schedule Farm Pickup <ArrowRight className="w-3.5 h-3.5" /></>
                      ) : shipment.status === 'PICKUP_SCHEDULED' ? (
                        <>Confirm Load Picked Up <ArrowRight className="w-3.5 h-3.5" /></>
                      ) : shipment.status === 'PICKED_UP' ? (
                        <>Start Transit <ArrowRight className="w-3.5 h-3.5" /></>
                      ) : shipment.status === 'IN_TRANSIT' ? (
                        <>Out for Delivery <ArrowRight className="w-3.5 h-3.5" /></>
                      ) : (
                        <>Confirm Final Delivery <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /></>
                      )}
                    </button>
                  ) : (
                    <div className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-extrabold flex items-center gap-1.5 border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Completed & Settled
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
