import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  UserRole, Language, LotItem, BuyerRequirementItem, OfferItem, OfferStatus,
  TransactionItem, DisputeItem, MarketPriceItem, AIRecommendationResult,
  OrderItem, CartModel, ShipmentItem, NotificationItem
} from '../types';
import { useAuth } from './AuthContext';
import { realtimeWS } from '../services/websocketService';
import { apiFetch as coreApiFetch } from '../services/apiClient';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  
  // Data State
  lots: LotItem[];
  allLots: LotItem[];
  buyers: BuyerRequirementItem[];
  offers: OfferItem[];
  orders: OrderItem[];
  cart: CartModel | null;
  shipments: ShipmentItem[];
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  transactions: TransactionItem[];
  disputes: DisputeItem[];
  prices: MarketPriceItem[];
  recommendation: AIRecommendationResult;
  selectedCrop: string;
  setSelectedCrop: (crop: string) => void;
  crops: string[];
  
  // API loading states
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncTime: Date;
  refreshData: () => Promise<void>;

  // Actions
  addLot: (lot: Partial<LotItem>) => Promise<void>;
  makeOffer: (lotId: string, offerPrice: number, quantityKg?: number) => Promise<void>;
  counterOffer: (offerId: string, counterPrice: number) => Promise<void>;
  acceptOffer: (offerId: string) => Promise<void>;
  createOrderDirect: (lotId: string, quantityKg: number, deliveryAddress: string) => Promise<any>;
  verifyPaymentOrder: (orderId: string, razorpayOrderId: string, razorpayPaymentId: string, signature: string) => Promise<boolean>;
  updateShipmentMilestone: (shipmentId: string, status: string, note?: string) => Promise<void>;
  addToCart: (lotId: string, quantityKg: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  markNotificationsRead: () => Promise<void>;
  addDispute: (dispute: Partial<DisputeItem>) => Promise<void>;
  addBuyerRequirement: (req: Partial<BuyerRequirementItem>) => Promise<void>;
}

const initialRecommendation: AIRecommendationResult = {
  action: 'SELL_NOW',
  recommended_buyer: 'FreshHarvest Foods',
  offer_price_per_kg: 33.0,
  local_mandi_price: 28.0,
  gross_realization: 26400.0,
  transport_cost: 1600.0,
  net_realization: 24800.0,
  net_per_kg: 31.0,
  improvement_vs_local: 2240.0,
  improvement_per_kg: 2.80,
  confidence_percentage: 88,
  buyer_reliability: 94.0,
  why_reasons: [
    "Buyer demand is high in Lucknow processing hub",
    "Best verified offer is ₹33/kg with 24-hr payment SLA",
    "Transport cost (₹1,600) is low relative to ₹3.00/kg price gain",
    "Storage advantage is limited due to perishability"
  ]
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, demoLogin } = useAuth();
  const role = user?.role || 'FARMER';
  
  const setRole = (newRole: UserRole) => {
    demoLogin(newRole);
  };

  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('kisanlink_language') as Language;
    return saved && ['EN', 'HI', 'MR', 'PA', 'TE', 'TA', 'GU', 'KN', 'BN'].includes(saved) ? saved : 'EN';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('kisanlink_language', lang);
  };

  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [selectedCrop, setSelectedCrop] = useState<string>('Tomato');
  
  // Data State
  const [lots, setLots] = useState<LotItem[]>([]);
  const [allLots, setAllLots] = useState<LotItem[]>([]);
  const [buyers, setBuyers] = useState<BuyerRequirementItem[]>([]);
  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [cart, setCart] = useState<CartModel | null>(null);
  const [shipments, setShipments] = useState<ShipmentItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState<number>(0);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [disputes, setDisputes] = useState<DisputeItem[]>([]);
  const [prices, setPrices] = useState<MarketPriceItem[]>([]);
  const [recommendation, setRecommendation] = useState<AIRecommendationResult>(initialRecommendation);
  const [crops, setCrops] = useState<string[]>(['Tomato', 'Onion', 'Wheat', 'Soybean', 'Potato', 'Rice']);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  // Delegate to centralized apiClient — token attachment and base URL are handled there
  const apiFetch = useCallback(async (path: string, options: RequestInit = {}) => {
    return coreApiFetch(path, options);
  }, []);

  const refreshData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    setIsSyncing(true);
    try {
      // 1. Fetch prices
      const fetchedPrices = await apiFetch(`/prices?crop=${selectedCrop}`).catch(() => []);
      setPrices(fetchedPrices);

      // 2. Fetch parallel entities
      const [fetchedLots, fetchedBuyers, fetchedOffers, fetchedOrders, fetchedShipments, fetchedDisputes, fetchedCrops, fetchedNotifs] = await Promise.all([
        apiFetch('/lots').catch(() => []),
        apiFetch('/buyers').catch(() => []),
        apiFetch('/offers').catch(() => []),
        apiFetch('/orders').catch(() => []),
        apiFetch('/shipments').catch(() => []),
        apiFetch('/disputes').catch(() => []),
        apiFetch('/crops').catch(() => []),
        apiFetch('/notifications').catch(() => ({ notifications: [], unread_count: 0 }))
      ]);
      
      if (fetchedCrops.length > 0) {
        setCrops(fetchedCrops.map((c: any) => c.name));
      }
      setAllLots(fetchedLots);

      // Filter lots for Farmer
      if (role === 'FARMER' && user) {
        setLots(fetchedLots.filter((l: any) => l.farmer_name?.toLowerCase() === user.name?.toLowerCase()));
      } else {
        setLots(fetchedLots);
      }

      setBuyers(fetchedBuyers);
      setOffers(fetchedOffers);
      setOrders(fetchedOrders);
      setShipments(fetchedShipments);
      setDisputes(fetchedDisputes);
      setNotifications(fetchedNotifs.notifications || []);
      setUnreadNotificationCount(fetchedNotifs.unread_count || 0);

      // Fetch Cart if buyer
      if (role === 'BUYER') {
        const fetchedCart = await apiFetch('/cart').catch(() => null);
        if (fetchedCart) setCart(fetchedCart);
      }

      // Format legacy transactions from orders
      const legacyTxns: TransactionItem[] = fetchedOrders.map((o: any) => ({
        id: o.id.replace('ORD', 'TXN'),
        lot_id: o.lot_id,
        farmer_name: o.farmer_name,
        buyer_name: o.buyer_name,
        crop: o.crop,
        quantity_kg: o.quantity_kg,
        agreed_price_per_kg: o.price_per_kg,
        gross_value: o.crop_value,
        transport_cost: o.transport_cost,
        net_realization: o.farmer_net_payout,
        vehicle_number: "UP78 AB 1234",
        driver_name: "Ravi Kumar",
        origin: o.pickup_address || "Kanpur",
        destination: o.delivery_address || "Lucknow",
        status: o.status === 'PAID' ? 'PAYMENT_COMPLETED' : 'TRANSACTION_CREATED',
        payment_status: o.payment_status,
        created_at: o.created_at
      }));
      setTransactions(legacyTxns);

      setLastSyncTime(new Date());

      // Fetch dynamic recommendation
      const rec = await apiFetch(`/recommendations?crop=${selectedCrop}&quantity_kg=800&grade=Grade%20A&location=Kanpur`).catch(() => initialRecommendation);
      setRecommendation(rec);

    } catch (error) {
      console.warn("Refresh data warning:", error);
    } finally {
      if (!silent) setIsLoading(false);
      setIsSyncing(false);
    }
  }, [apiFetch, selectedCrop, role, user]);

  // Initial fetch and WebSocket connection
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Real-time WebSocket event listener
  useEffect(() => {
    realtimeWS.connect(user?.id, role);

    const unsubscribe = realtimeWS.subscribe((event, data) => {
      console.log(`[Realtime Event Received] ${event}:`, data);

      if (event === 'LOT_CREATED') {
        // Prepend new lot to allLots and lots immediately without reload
        setAllLots(prev => [data, ...prev.filter(l => l.id !== data.id)]);
        if (role === 'BUYER' || (role === 'FARMER' && data.farmer_name === user?.name)) {
          setLots(prev => [data, ...prev.filter(l => l.id !== data.id)]);
        }
      } else if (event === 'LOT_UPDATED' || event === 'LOT_SOLD') {
        setAllLots(prev => prev.map(l => l.id === data.id ? { ...l, available_qty_kg: data.available_qty_kg, status: data.status } : l));
        setLots(prev => prev.map(l => l.id === data.id ? { ...l, available_qty_kg: data.available_qty_kg, status: data.status } : l));
      } else if (event === 'ORDER_CREATED') {
        setOrders(prev => [data, ...prev.filter(o => o.id !== data.id)]);
      } else if (event === 'ORDER_STATUS_CHANGED' || event === 'PAYMENT_UPDATED') {
        setOrders(prev => prev.map(o => o.id === data.order_id ? { ...o, status: data.status || o.status, payment_status: data.payment_status || o.payment_status } : o));
      } else if (event === 'LOGISTICS_UPDATED') {
        setShipments(prev => prev.map(s => s.id === data.shipment_id || s.order_id === data.order_id ? { ...s, status: data.status } : s));
      } else if (event === 'NOTIFICATION_CREATED') {
        setNotifications(prev => [{
          id: Date.now(),
          title: data.title || 'New Notification',
          message: data.message || '',
          type: data.type || 'SYSTEM',
          is_read: false,
          created_at: 'Just now'
        }, ...prev]);
        setUnreadNotificationCount(prev => prev + 1);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user, role]);

  const addLot = async (lotData: Partial<LotItem>) => {
    try {
      const res = await apiFetch('/lots', {
        method: 'POST',
        body: JSON.stringify({
          farmer_name: user?.name || "Ramesh Verma",
          crop: lotData.crop || selectedCrop,
          variety: lotData.variety || "Desi Red",
          quantity_kg: Number(lotData.quantity_kg) || 800,
          quality_grade: lotData.quality_grade || "Grade A",
          harvest_date: lotData.harvest_date || new Date().toISOString().split('T')[0],
          perishability_window_days: 7,
          location: lotData.location || user?.location || "Kanpur, Uttar Pradesh",
          pickup_address: lotData.pickup_address || "Village Bilhaur, Kanpur Rural, UP",
          expected_price_per_kg: Number(lotData.expected_price_per_kg) || 32,
          is_fpo_aggregated: Boolean(lotData.is_fpo_aggregated),
          fpo_name: lotData.fpo_name
        })
      });
      // Optimistic addition
      setAllLots(prev => [res, ...prev]);
      setLots(prev => [res, ...prev]);
    } catch (error) {
      console.error("Failed to add lot:", error);
      alert("Failed to add crop lot: " + (error as Error).message);
    }
  };

  const createOrderDirect = async (lotId: string, quantityKg: number, deliveryAddress: string) => {
    try {
      const res = await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({
          lot_id: lotId,
          quantity_kg: quantityKg,
          delivery_address: deliveryAddress,
          buyer_name: user?.name || "FreshHarvest Foods"
        })
      });
      await refreshData(true);
      return res;
    } catch (error) {
      console.error("Order failed:", error);
      throw error;
    }
  };

  const verifyPaymentOrder = async (orderId: string, razorpayOrderId: string, razorpayPaymentId: string, signature: string): Promise<boolean> => {
    try {
      const res = await apiFetch('/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          order_id: orderId,
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: razorpayPaymentId,
          razorpay_signature: signature
        })
      });
      await refreshData(true);
      return res.success;
    } catch (error) {
      console.error("Payment verification failed:", error);
      return false;
    }
  };

  const updateShipmentMilestone = async (shipmentId: string, status: string, note?: string) => {
    try {
      await apiFetch(`/shipments/${shipmentId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: status,
          location_note: note
        })
      });
      await refreshData(true);
    } catch (error) {
      console.error("Failed to update shipment milestone:", error);
      alert("Failed to update status: " + (error as Error).message);
    }
  };

  const addToCart = async (lotId: string, quantityKg: number) => {
    try {
      await apiFetch('/cart/items', {
        method: 'POST',
        body: JSON.stringify({ lot_id: lotId, quantity_kg: quantityKg })
      });
      const updatedCart = await apiFetch('/cart');
      setCart(updatedCart);
    } catch (error) {
      alert("Failed to add to cart: " + (error as Error).message);
    }
  };

  const removeFromCart = async (itemId: number) => {
    try {
      await apiFetch(`/cart/items/${itemId}`, { method: 'DELETE' });
      const updatedCart = await apiFetch('/cart');
      setCart(updatedCart);
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };

  const markNotificationsRead = async () => {
    try {
      await apiFetch('/notifications/read-all', { method: 'POST' });
      setUnreadNotificationCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (e) {
      setUnreadNotificationCount(0);
    }
  };

  const makeOffer = async (lotId: string, offerPrice: number, quantityKg?: number) => {
    try {
      await apiFetch('/offers', {
        method: 'POST',
        body: JSON.stringify({
          lot_id: lotId,
          buyer_name: user?.name || "FreshHarvest Foods",
          offered_price_per_kg: offerPrice,
          quantity_kg: quantityKg || 800,
          transport_estimate: 1600.0
        })
      });
      await refreshData();
    } catch (error) {
      console.error("Failed to submit buyer offer:", error);
      alert("Failed to make offer: " + (error as Error).message);
    }
  };

  const counterOffer = async (offerId: string, counterPrice: number) => {
    try {
      await apiFetch(`/offers/${offerId}/counter`, {
        method: 'POST',
        body: JSON.stringify({
          counter_price: counterPrice,
          by: role
        })
      });
      await refreshData();
    } catch (error) {
      console.warn("Optimistically updating counteroffer:", error);
    }
  };

  const acceptOffer = async (offerId: string) => {
    try {
      await apiFetch(`/offers/${offerId}/accept`, {
        method: 'POST'
      });
      await refreshData();
    } catch (error) {
      console.warn("Accept offer error:", error);
    }
  };

  const addDispute = async (dispData: Partial<DisputeItem>) => {
    try {
      await apiFetch('/disputes', {
        method: 'POST',
        body: JSON.stringify({
          transaction_id: dispData.transaction_id || "KL-TXN-10491",
          raised_by: user?.name || "Ramesh Verma",
          category: dispData.category || "Payment issue",
          description: dispData.description || "Payment delayed beyond 24 hours SLA"
        })
      });
      await refreshData();
    } catch (error) {
      alert("Failed to raise dispute: " + (error as Error).message);
    }
  };

  const addBuyerRequirement = async (reqData: Partial<BuyerRequirementItem>) => {
    try {
      await apiFetch('/buyers', {
        method: 'POST',
        body: JSON.stringify({
          buyer_name: user?.name || "FreshHarvest Foods",
          company_name: user?.businessName || "FreshHarvest Foods Pvt Ltd",
          crop: reqData.crop || "Tomato",
          required_qty_kg: Number(reqData.required_qty_kg) || 10000,
          min_grade: reqData.min_grade || "Grade A",
          target_price_min: Number(reqData.target_price_min) || 30,
          target_price_max: Number(reqData.target_price_max) || 35,
          delivery_location: reqData.delivery_location || "Lucknow"
        })
      });
      await refreshData();
    } catch (error) {
      alert("Failed to add requirement: " + (error as Error).message);
    }
  };

  return (
    <AppContext.Provider value={{
      role, setRole,
      language, setLanguage,
      currentTab, setCurrentTab,
      lots, allLots, buyers, offers, orders, cart, shipments, notifications, unreadNotificationCount,
      transactions, disputes, prices, recommendation,
      selectedCrop, setSelectedCrop, crops,
      isLoading, isSyncing, lastSyncTime, refreshData,
      addLot, makeOffer, counterOffer, acceptOffer, createOrderDirect, verifyPaymentOrder, updateShipmentMilestone,
      addToCart, removeFromCart, markNotificationsRead, addDispute, addBuyerRequirement
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
};
