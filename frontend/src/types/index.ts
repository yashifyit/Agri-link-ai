export type UserRole = 'FARMER' | 'BUYER' | 'FPO' | 'ADMIN';
export type Language = 'EN' | 'HI' | 'MR';

export type OfferStatus = 'PENDING' | 'COUNTERED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
export type TransactionStatus = 'CREATED' | 'LOGISTICS_SCHEDULED' | 'IN_TRANSIT' | 'DELIVERED' | 'PAYMENT_INITIATED' | 'PAYMENT_COMPLETED' | 'DISPUTED';
export type DisputeStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED';
export type SaleAction = 'SELL_NOW' | 'WAIT' | 'SPLIT_SELL';

export interface MarketPriceItem {
  id: number;
  market_name: string;
  district: string;
  state: string;
  crop: string;
  min_price: number;
  modal_price: number;
  max_price: number;
  arrival_qty_tons: number;
  updated_at: string;
}

export interface MarketComparisonItem {
  market_name: string;
  district: string;
  distance_km: number;
  market_price: number;
  transport_cost: number;
  net_realization: number;
  net_per_kg: number;
}

export interface LotItem {
  id: string;
  farmer_name: string;
  crop: string;
  variety: string;
  quantity_kg: number;
  quality_grade: string;
  harvest_date: string;
  location: string;
  expected_price_per_kg: number;
  is_fpo_aggregated: boolean;
  fpo_name?: string;
  status: string;
  created_at: string;
}

export interface BuyerRequirementItem {
  id: number;
  buyer_name: string;
  company_name: string;
  crop: string;
  required_qty_kg: number;
  min_grade: string;
  target_price_min: number;
  target_price_max: number;
  delivery_location: string;
  reliability_score: number;
  on_time_payment_pct: number;
}

export interface BuyerMatchItem {
  buyer_id: number;
  buyer_name: string;
  company_name: string;
  crop: string;
  required_qty_kg: number;
  offered_price_per_kg: number;
  distance_km: number;
  match_percentage: number;
  reliability_score: number;
  reasons: string[];
}

export interface OfferItem {
  id: string;
  lot_id: string;
  crop?: string;
  buyer_name: string;
  offered_price_per_kg: number;
  quantity_kg: number;
  transport_estimate: number;
  gross_total: number;
  net_realization: number;
  status: OfferStatus;
  last_counter_by?: string;
  created_at: string;
}

export interface TransactionItem {
  id: string;
  lot_id: string;
  offer_id: string;
  farmer_name: string;
  buyer_name: string;
  crop: string;
  quantity_kg: number;
  agreed_price_per_kg: number;
  gross_value: number;
  transport_cost: number;
  net_realization: number;
  vehicle_number: string;
  driver_name: string;
  origin: string;
  destination: string;
  status: TransactionStatus;
  payment_status: string;
  created_at: string;
}

export interface DisputeItem {
  id: string;
  transaction_id: string;
  raised_by: string;
  category: string;
  description: string;
  status: DisputeStatus;
  created_at: string;
}

export interface AIRecommendationResult {
  action: SaleAction;
  recommended_buyer: string;
  offer_price_per_kg: number;
  local_mandi_price: number;
  gross_realization: number;
  transport_cost: number;
  net_realization: number;
  net_per_kg: number;
  improvement_vs_local: number;
  improvement_per_kg: number;
  confidence_percentage: number;
  buyer_reliability: number;
  why_reasons: string[];
}
