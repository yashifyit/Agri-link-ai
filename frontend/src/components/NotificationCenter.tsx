import React, { useState } from 'react';
import { X, Bell, CheckCircle2, TrendingUp, Handshake, Truck, CreditCard, AlertTriangle } from 'lucide-react';

export interface NotificationItem {
  id: string;
  type: 'OFFER' | 'PRICE_ALERT' | 'MATCH' | 'LOGISTICS' | 'PAYMENT' | 'DISPUTE';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export const NotificationCenter: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'N1',
      type: 'OFFER',
      title: 'New Offer Received',
      message: 'FreshHarvest Foods offered ₹33/kg on Lot #KL-10492.',
      timestamp: '10 mins ago',
      read: false
    },
    {
      id: 'N2',
      type: 'PRICE_ALERT',
      title: 'Lucknow Mandi Price Spike',
      message: 'Tomato modal price increased to ₹31/kg (+₹2/kg).',
      timestamp: '1 hour ago',
      read: false
    },
    {
      id: 'N3',
      type: 'LOGISTICS',
      title: 'Vehicle Assigned',
      message: 'Truck UP78 AB 1234 assigned for pickup at 08:30 AM.',
      timestamp: '2 hours ago',
      read: true
    },
    {
      id: 'N4',
      type: 'PAYMENT',
      title: 'Payment Settlement Cleared',
      message: '₹24,800 transferred to account for Txn #KL-TXN-10491.',
      timestamp: 'Yesterday',
      read: true
    }
  ]);

  if (!isOpen) return null;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-charcoal/60 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-sm bg-white border-l border-agriBorder shadow-2xl p-6 overflow-y-auto space-y-5 flex flex-col justify-between">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-cream pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-forest" />
                <h3 className="text-base font-extrabold text-charcoal">Notifications</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={markAllRead}
                  className="text-[11px] font-bold text-agriGreen hover:underline"
                >
                  Mark all read
                </button>
                <button
                  onClick={onClose}
                  className="text-charcoal-muted hover:text-charcoal p-1 rounded-full hover:bg-cream"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    !n.read ? 'bg-agriGreen-light/60 border-agriGreen-accent/40' : 'bg-cream border-agriBorder'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-forest block">
                      {n.type}
                    </span>
                    <span className="text-[10px] text-charcoal-muted">{n.timestamp}</span>
                  </div>
                  <h4 className="text-xs font-bold text-charcoal mt-1">{n.title}</h4>
                  <p className="text-[11px] text-charcoal-muted mt-0.5 leading-relaxed">{n.message}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-forest text-white text-xs font-bold rounded-xl"
          >
            Close Notifications
          </button>

        </div>
      </div>
    </div>
  );
};
