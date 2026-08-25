import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole, Language, LotItem, BuyerRequirementItem, OfferItem, OfferStatus,
  TransactionItem, DisputeItem, MarketPriceItem, AIRecommendationResult
} from '../types';
import { useAuth } from './AuthContext';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  
  // Data State
  lots: LotItem[];
  buyers: BuyerRequirementItem[];
  offers: OfferItem[];
  transactions: TransactionItem[];
  disputes: DisputeItem[];
  prices: MarketPriceItem[];
  recommendation: AIRecommendationResult;
  selectedCrop: string;
  setSelectedCrop: (crop: string) => void;
  crops: string[];
  
  // API loading states
  isLoading: boolean;
  refreshData: () => Promise<void>;

  // Actions
  addLot: (lot: Partial<LotItem>) => Promise<void>;
  counterOffer: (offerId: string, counterPrice: number) => Promise<void>;
  acceptOffer: (offerId: string) => Promise<void>;
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

const API_BASE = 'http://localhost:8000/api/v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, demoLogin } = useAuth();
  const role = user?.role || 'FARMER';
  
  const setRole = (newRole: UserRole) => {
    demoLogin(newRole);
  };

  const [language, setLanguage] = useState<Language>('EN');
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [selectedCrop, setSelectedCrop] = useState<string>('Tomato');
  
  // Data State
  const [lots, setLots] = useState<LotItem[]>([]);
  const [buyers, setBuyers] = useState<BuyerRequirementItem[]>([]);
  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [disputes, setDisputes] = useState<DisputeItem[]>([]);
  const [prices, setPrices] = useState<MarketPriceItem[]>([]);
  const [recommendation, setRecommendation] = useState<AIRecommendationResult>(initialRecommendation);
  const [crops, setCrops] = useState<string[]>(['Tomato', 'Onion', 'Wheat', 'Soybean', 'Mango']);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Helper fetch function
  const apiFetch = async (path: string, options: RequestInit = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      'X-User-Role': user?.role || 'FARMER',
      'X-User-Id': user?.id || '1',
      ...(options.headers || {})
    };
    const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Unknown API error' }));
      throw new Error(err.detail || `HTTP error ${response.status}`);
    }
    return response.json();
  };

  const refreshData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch prices based on selected crop
      const fetchedPrices = await apiFetch(`/prices?crop=${selectedCrop}`);
      setPrices(fetchedPrices);

      // 2. Fetch lots, buyers, offers, transactions, disputes, crops
      const [fetchedLots, fetchedBuyers, fetchedOffers, fetchedTransactions, fetchedDisputes, fetchedCrops] = await Promise.all([
        apiFetch('/lots'),
        apiFetch('/buyers'),
        apiFetch('/offers'),
        apiFetch('/transactions'),
        apiFetch('/disputes'),
        apiFetch('/crops')
      ]);
      
      setCrops(fetchedCrops.map((c: any) => c.name));

      // Filter lots for Farmer role to ensure personalization
      if (role === 'FARMER' && user) {
        setLots(fetchedLots.filter((l: any) => l.farmer_name.toLowerCase() === user.name.toLowerCase()));
      } else {
        setLots(fetchedLots);
      }

      // Filter offers for Farmer to only see their lots' offers
      if (role === 'FARMER' && user) {
        const farmerLotIds = fetchedLots
          .filter((l: any) => l.farmer_name.toLowerCase() === user.name.toLowerCase())
          .map((l: any) => l.id);
        setOffers(fetchedOffers.filter((o: any) => farmerLotIds.includes(o.lot_id)));
      } else if (role === 'BUYER' && user) {
        setOffers(fetchedOffers.filter((o: any) => o.buyer_name.toLowerCase() === user.name.toLowerCase()));
      } else {
        setOffers(fetchedOffers);
      }

      // Filter transactions
      if (role === 'FARMER' && user) {
        setTransactions(fetchedTransactions.filter((t: any) => t.farmer_name.toLowerCase() === user.name.toLowerCase()));
      } else if (role === 'BUYER' && user) {
        setTransactions(fetchedTransactions.filter((t: any) => t.buyer_name.toLowerCase() === user.name.toLowerCase()));
      } else {
        setTransactions(fetchedTransactions);
      }

      setBuyers(fetchedBuyers);
      setDisputes(fetchedDisputes);

      // Fetch dynamic recommendation
      const rec = await apiFetch(`/recommendations?crop=${selectedCrop}&quantity_kg=800&grade=Grade%20A&location=Kanpur`);
      setRecommendation(rec);

    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh data when user, role or selected crop changes
  useEffect(() => {
    refreshData();
  }, [user, role, selectedCrop]);

  const addLot = async (lotData: Partial<LotItem>) => {
    try {
      await apiFetch('/lots', {
        method: 'POST',
        body: JSON.stringify({
          farmer_name: user?.name || "Ramesh Verma",
          crop: lotData.crop || selectedCrop,
          variety: lotData.variety || "Desi Red",
          quantity_kg: Number(lotData.quantity_kg) || 800,
          quality_grade: lotData.quality_grade || "Grade A",
          harvest_date: lotData.harvest_date || "2026-08-23",
          location: lotData.location || "Kanpur, Uttar Pradesh",
          expected_price_per_kg: Number(lotData.expected_price_per_kg) || 32,
          is_fpo_aggregated: Boolean(lotData.is_fpo_aggregated),
          fpo_name: lotData.fpo_name
        })
      });
      await refreshData();
    } catch (error) {
      console.error("Failed to add lot:", error);
      alert("Failed to add lot: " + (error as Error).message);
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
      setOffers(prev => prev.map(o => {
        if (o.id === offerId || !o.id) {
          const gross = (o.quantity_kg || 800) * counterPrice;
          return {
            ...o,
            offered_price_per_kg: counterPrice,
            gross_total: gross,
            net_realization: gross - (o.transport_estimate || 1600),
            status: 'COUNTERED' as const,
            last_counter_by: role
          };
        }
        return o;
      }));
    }
  };

  const acceptOffer = async (offerId: string) => {
    try {
      await apiFetch(`/offers/${offerId}/accept`, {
        method: 'POST'
      });
      await refreshData();
    } catch (error) {
      console.warn("Optimistically accepting offer:", error);
      setOffers(prev => prev.map(o => (o.id === offerId || !o.id) ? { ...o, status: 'ACCEPTED' as const } : o));
      setLots(prev => prev.map(l => ({ ...l, status: 'SOLD' as const })));
      
      const acceptedOffer = offers.find(o => o.id === offerId) || {
        id: offerId || "KL-OFF-8831",
        lot_id: "KL-10492",
        crop: "Tomato",
        buyer_name: "FreshHarvest Foods",
        offered_price_per_kg: 33.0,
        quantity_kg: 800.0,
        transport_estimate: 1600.0,
        gross_total: 26400.0,
        net_realization: 24800.0,
        status: "ACCEPTED" as const,
        created_at: new Date().toISOString().replace('T', ' ').slice(0, 16)
      };

      setTransactions(prev => [
        {
          id: `KL-TXN-${Date.now().toString().slice(-5)}`,
          lot_id: acceptedOffer.lot_id,
          offer_id: acceptedOffer.id,
          farmer_name: user?.name || "Ramesh Verma",
          buyer_name: acceptedOffer.buyer_name,
          crop: acceptedOffer.crop || "Tomato",
          quantity_kg: acceptedOffer.quantity_kg,
          agreed_price_per_kg: acceptedOffer.offered_price_per_kg,
          gross_value: acceptedOffer.gross_total,
          transport_cost: acceptedOffer.transport_estimate,
          net_realization: acceptedOffer.net_realization,
          vehicle_number: "UP78 AB 1234",
          driver_name: "Ravi Kumar",
          origin: "Kanpur",
          destination: "Lucknow",
          status: "PICKUP_SCHEDULED" as any,
          payment_status: "ESCROW_LOCKED",
          created_at: new Date().toISOString().replace('T', ' ').slice(0, 16)
        },
        ...prev
      ]);
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
      console.error("Failed to raise dispute:", error);
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
      console.error("Failed to add requirement:", error);
      alert("Failed to add requirement: " + (error as Error).message);
    }
  };

  return (
    <AppContext.Provider value={{
      role, setRole,
      language, setLanguage,
      currentTab, setCurrentTab,
      lots, buyers, offers, transactions, disputes, prices, recommendation,
      selectedCrop, setSelectedCrop, crops,
      isLoading, refreshData,
      addLot, counterOffer, acceptOffer, addDispute, addBuyerRequirement
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
