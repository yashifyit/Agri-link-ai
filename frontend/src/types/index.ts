export type UserRole = 'FARMER' | 'BUYER' | 'FPO' | 'LOGISTICS' | 'ADMIN';
export type Language = 'EN' | 'HI' | 'MR' | 'PA' | 'TE' | 'TA' | 'GU' | 'KN' | 'BN';

export interface LanguageInfo {
  code: Language;
  label: string;
  nativeName: string;
  region: string;
}

export type OfferStatus = 'PENDING' | 'COUNTERED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'PROCESSING'
  | 'LOGISTICS_ASSIGNED'
  | 'PICKUP_SCHEDULED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED'
  | 'REFUNDED';

export type ShipmentStatus =
  | 'UNASSIGNED'
  | 'ASSIGNED'
  | 'PICKUP_SCHEDULED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'FAILED'
  | 'CANCELLED';

export type TransactionStatus =
  | 'CREATED'
  | 'TRANSACTION_CREATED'
  | 'PICKUP_SCHEDULED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'PAYMENT_PROCESSING'
  | 'PAYMENT_COMPLETED'
  | 'DISPUTED';

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

export interface LiveMandiPriceItem {
  id: string;
  commodity: string;
  category: string;
  variety?: string;
  market: string;
  district: string;
  state: string;
  min_price: number;
  modal_price: number;
  max_price: number;
  price_per_kg: number;
  arrival_tons: number;
  unit: string;
  trend: 'BULLISH' | 'BEARISH' | 'STEADY';
  change_pct: number;
  updated_at: string;
  source: string;
  source_url: string;
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
  farmer_id?: number;
  farmer_name: string;
  farmer_verified?: boolean;
  crop: string;
  variety: string;
  quantity_kg: number;
  available_qty_kg: number;
  quantity_total_kg?: number;
  quantity_available_kg?: number;
  unit?: string;
  quality_grade: string;
  harvest_date: string;
  location: string;
  pickup_address?: string;
  expected_price_per_kg: number;
  min_acceptable_price_per_kg?: number;
  packaging_type?: string;
  delivery_preference?: string;
  description?: string;
  images?: string[];
  is_fpo_aggregated?: boolean;
  fpo_name?: string;
  ai_match_score?: number;
  ai_match_reasons?: string[];
  estimated_logistics_cost?: number;
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

export interface OrderItem {
  id: string;
  buyer_id?: number;
  buyer_name: string;
  farmer_id?: number;
  farmer_name: string;
  lot_id: string;
  crop: string;
  quantity_kg: number;
  price_per_kg: number;
  crop_value: number;
  transport_cost: number;
  platform_fee: number;
  tax_amount: number;
  total_amount: number;
  farmer_net_payout: number;
  delivery_address: string;
  pickup_address: string;
  status: OrderStatus;
  payment_status: string;
  created_at: string;
}

export interface CartItemModel {
  id: number;
  lot_id: string;
  crop: string;
  variety: string;
  farmer_name: string;
  quality_grade: string;
  quantity_kg: number;
  available_stock: number;
  price_per_kg: number;
  line_total: number;
  location: string;
}

export interface CartModel {
  cart_id: number;
  items: CartItemModel[];
  item_count: number;
  total_crop_value: number;
  estimated_transport: number;
  platform_fee: number;
  final_payable_amount: number;
}

export interface ShipmentItem {
  id: string;
  order_id: string;
  crop: string;
  quantity_kg: number;
  farmer_name: string;
  buyer_name: string;
  logistics_partner_name?: string;
  vehicle_type: string;
  vehicle_number: string;
  driver_name: string;
  driver_phone: string;
  origin: string;
  destination: string;
  distance_km: number;
  transport_cost: number;
  cold_chain_enabled: boolean;
  status: ShipmentStatus;
  estimated_delivery?: string;
  created_at: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface TransactionItem {
  id: string;
  lot_id: string;
  offer_id?: string;
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
  transaction_id?: string;
  order_id?: string;
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
