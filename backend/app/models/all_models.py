from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum, Index
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base

class UserRole(str, enum.Enum):
    FARMER = "FARMER"
    BUYER = "BUYER"
    FPO = "FPO"
    LOGISTICS = "LOGISTICS"
    ADMIN = "ADMIN"

class LotStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    RESERVED = "RESERVED"
    SOLD = "SOLD"
    CANCELLED = "CANCELLED"
    EXPIRED = "EXPIRED"

class OfferStatus(str, enum.Enum):
    PENDING = "PENDING"
    COUNTERED = "COUNTERED"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    EXPIRED = "EXPIRED"

class OrderStatus(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    PAYMENT_PENDING = "PAYMENT_PENDING"
    PAID = "PAID"
    PROCESSING = "PROCESSING"
    LOGISTICS_ASSIGNED = "LOGISTICS_ASSIGNED"
    PICKUP_SCHEDULED = "PICKUP_SCHEDULED"
    PICKED_UP = "PICKED_UP"
    IN_TRANSIT = "IN_TRANSIT"
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY"
    DELIVERED = "DELIVERED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    DISPUTED = "DISPUTED"
    REFUNDED = "REFUNDED"

class PaymentStatus(str, enum.Enum):
    PENDING = "PENDING"
    INITIATED = "INITIATED"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"
    ESCROW_LOCKED = "ESCROW_LOCKED"
    SETTLED = "SETTLED"

class EscrowStatus(str, enum.Enum):
    HELD = "HELD"
    RELEASED = "RELEASED"
    REFUNDED = "REFUNDED"
    DISPUTED = "DISPUTED"

class ShipmentStatus(str, enum.Enum):
    UNASSIGNED = "UNASSIGNED"
    ASSIGNED = "ASSIGNED"
    PICKUP_SCHEDULED = "PICKUP_SCHEDULED"
    PICKED_UP = "PICKED_UP"
    IN_TRANSIT = "IN_TRANSIT"
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY"
    DELIVERED = "DELIVERED"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"

class DisputeStatus(str, enum.Enum):
    OPEN = "OPEN"
    UNDER_REVIEW = "UNDER_REVIEW"
    RESOLVED = "RESOLVED"
    REJECTED = "REJECTED"

class NotificationType(str, enum.Enum):
    OFFER = "OFFER"
    ORDER = "ORDER"
    PAYMENT = "PAYMENT"
    SHIPMENT = "SHIPMENT"
    DISPUTE = "DISPUTE"
    SYSTEM = "SYSTEM"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=True)
    password_hash = Column(String, nullable=False)
    role = Column(String, default=UserRole.FARMER, index=True)
    location = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=True)
    avatar = Column(String, nullable=True)
    refresh_token = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    farmer_profile = relationship("FarmerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    buyer_profile = relationship("BuyerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    fpo_profile = relationship("FPOProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    logistics_profile = relationship("LogisticsProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")

class FarmerProfile(Base):
    __tablename__ = "farmer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    farm_size_acres = Column(Float, default=5.0)
    primary_crops = Column(String, default="Tomato, Onion, Wheat")
    kyc_status = Column(String, default="VERIFIED")
    bank_account_masked = Column(String, default="•••••••4829")
    ifsc_code = Column(String, default="SBIN0001234")

    user = relationship("User", back_populates="farmer_profile")

class BuyerProfile(Base):
    __tablename__ = "buyer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    company_name = Column(String, nullable=False)
    gstin = Column(String, nullable=True)
    trade_license = Column(String, nullable=True)
    procurement_scale = Column(String, default="Institutional")
    reliability_score = Column(Float, default=94.0)
    on_time_payment_pct = Column(Float, default=96.0)

    user = relationship("User", back_populates="buyer_profile")

class FPOProfile(Base):
    __tablename__ = "fpo_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    fpo_name = Column(String, nullable=False)
    registration_no = Column(String, nullable=True)
    member_count = Column(Integer, default=150)
    district = Column(String, default="Nashik")
    state = Column(String, default="Maharashtra")

    user = relationship("User", back_populates="fpo_profile")

class LogisticsProfile(Base):
    __tablename__ = "logistics_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    fleet_type = Column(String, default="Mini Trucks, Reefer Containers")
    vehicle_numbers = Column(String, default="UP78 AB 1234, MH15 CD 5678")
    service_areas = Column(String, default="Maharashtra, Uttar Pradesh, Delhi-NCR")
    operational_status = Column(String, default="ACTIVE")

    user = relationship("User", back_populates="logistics_profile")

class Market(Base):
    __tablename__ = "markets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    district = Column(String, nullable=False)
    state = Column(String, default="Maharashtra")
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

class MarketPrice(Base):
    __tablename__ = "market_prices"

    id = Column(Integer, primary_key=True, index=True)
    market_id = Column(Integer, ForeignKey("markets.id"))
    crop_name = Column(String, nullable=False, index=True)
    min_price = Column(Float, nullable=False)
    modal_price = Column(Float, nullable=False)
    max_price = Column(Float, nullable=False)
    arrival_qty_tons = Column(Float, default=10.0)
    updated_at = Column(DateTime, default=datetime.utcnow)

class Lot(Base):
    __tablename__ = "lots"

    id = Column(String, primary_key=True, index=True) # e.g. KL-LOT-10492
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    farmer_name = Column(String, nullable=False)
    crop = Column(String, nullable=False, index=True)
    variety = Column(String, default="Desi")
    quantity_kg = Column(Float, nullable=False) # Total listed quantity
    available_qty_kg = Column(Float, nullable=False) # Live transactional remaining quantity
    unit = Column(String, default="kg")
    quality_grade = Column(String, default="Grade A")
    harvest_date = Column(String, nullable=False)
    perishability_window_days = Column(Integer, default=7)
    location = Column(String, nullable=False)
    pickup_address = Column(String, nullable=True)
    expected_price_per_kg = Column(Float, nullable=False)
    min_acceptable_price_per_kg = Column(Float, nullable=True)
    packaging_type = Column(String, default="Crates / Jute Bags")
    delivery_preference = Column(String, default="Farmgate Pickup")
    description = Column(Text, nullable=True)
    images_json = Column(Text, nullable=True)
    is_fpo_aggregated = Column(Boolean, default=False)
    fpo_name = Column(String, nullable=True)
    status = Column(String, default=LotStatus.ACTIVE, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class BuyerRequirement(Base):
    __tablename__ = "buyer_requirements"

    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    buyer_name = Column(String, nullable=False)
    company_name = Column(String, nullable=False)
    crop = Column(String, nullable=False, index=True)
    required_qty_kg = Column(Float, nullable=False)
    min_grade = Column(String, default="Grade A")
    target_price_min = Column(Float, nullable=False)
    target_price_max = Column(Float, nullable=False)
    delivery_location = Column(String, nullable=False)
    reliability_score = Column(Float, default=94.0)
    on_time_payment_pct = Column(Float, default=96.0)
    status = Column(String, default="ACTIVE")
    created_at = Column(DateTime, default=datetime.utcnow)

class Offer(Base):
    __tablename__ = "offers"

    id = Column(String, primary_key=True, index=True) # e.g. KL-OFF-8831
    lot_id = Column(String, ForeignKey("lots.id"), index=True)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    buyer_name = Column(String, nullable=False)
    offered_price_per_kg = Column(Float, nullable=False)
    quantity_kg = Column(Float, nullable=False)
    transport_estimate = Column(Float, default=1600.0)
    gross_total = Column(Float, nullable=False)
    net_realization = Column(Float, nullable=False)
    status = Column(String, default=OfferStatus.PENDING, index=True)
    last_counter_by = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Cart(Base):
    __tablename__ = "carts"

    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")

class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)
    cart_id = Column(Integer, ForeignKey("carts.id"), nullable=False)
    lot_id = Column(String, ForeignKey("lots.id"), nullable=False)
    quantity_kg = Column(Float, nullable=False)
    price_per_kg = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    cart = relationship("Cart", back_populates="items")

class Order(Base):
    __tablename__ = "orders"

    id = Column(String, primary_key=True, index=True) # e.g. KL-ORD-10492
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    buyer_name = Column(String, nullable=False)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    farmer_name = Column(String, nullable=False)
    lot_id = Column(String, ForeignKey("lots.id"), nullable=False)
    crop = Column(String, nullable=False)
    quantity_kg = Column(Float, nullable=False)
    price_per_kg = Column(Float, nullable=False)
    crop_value = Column(Float, nullable=False)
    transport_cost = Column(Float, default=1600.0)
    platform_fee = Column(Float, default=264.0) # 1% or calculated fee
    tax_amount = Column(Float, default=0.0)
    total_amount = Column(Float, nullable=False)
    farmer_net_payout = Column(Float, nullable=False)
    delivery_address = Column(String, nullable=False)
    pickup_address = Column(String, nullable=False)
    status = Column(String, default=OrderStatus.PENDING, index=True)
    payment_status = Column(String, default=PaymentStatus.PENDING, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    payments = relationship("Payment", back_populates="order", cascade="all, delete-orphan")
    shipment = relationship("Shipment", back_populates="order", uselist=False, cascade="all, delete-orphan")

class Payment(Base):
    __tablename__ = "payments"

    id = Column(String, primary_key=True, index=True) # e.g. KL-PAY-8821
    order_id = Column(String, ForeignKey("orders.id"), nullable=False)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="INR")
    gateway = Column(String, default="RAZORPAY")
    razorpay_order_id = Column(String, nullable=True, index=True)
    razorpay_payment_id = Column(String, nullable=True, index=True)
    razorpay_signature = Column(String, nullable=True)
    status = Column(String, default=PaymentStatus.PENDING, index=True)
    escrow_status = Column(String, default=EscrowStatus.HELD)
    failure_reason = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    order = relationship("Order", back_populates="payments")

class PaymentEvent(Base):
    __tablename__ = "payment_events"

    id = Column(Integer, primary_key=True, index=True)
    payment_id = Column(String, ForeignKey("payments.id"), nullable=False)
    event_type = Column(String, nullable=False) # e.g. payment.authorized, payment.captured, refund.processed
    payload = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Shipment(Base):
    __tablename__ = "shipments"

    id = Column(String, primary_key=True, index=True) # e.g. KL-SHP-10492
    order_id = Column(String, ForeignKey("orders.id"), unique=True, nullable=False)
    logistics_partner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    logistics_partner_name = Column(String, default="KisanLink Logistics Network")
    vehicle_type = Column(String, default="Mini Truck 1.5T")
    vehicle_number = Column(String, default="UP78 AB 1234")
    driver_name = Column(String, default="Ravi Kumar")
    driver_phone = Column(String, default="+91 98765 43219")
    origin = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    distance_km = Column(Float, default=45.0)
    transport_cost = Column(Float, default=1600.0)
    cold_chain_enabled = Column(Boolean, default=False)
    status = Column(String, default=ShipmentStatus.ASSIGNED, index=True)
    estimated_delivery = Column(String, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    order = relationship("Order", back_populates="shipment")

class ShipmentEvent(Base):
    __tablename__ = "shipment_events"

    id = Column(Integer, primary_key=True, index=True)
    shipment_id = Column(String, ForeignKey("shipments.id"), nullable=False)
    status = Column(String, nullable=False)
    location_note = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, default=NotificationType.SYSTEM)
    is_read = Column(Boolean, default=False)
    metadata_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Dispute(Base):
    __tablename__ = "disputes"

    id = Column(String, primary_key=True, index=True)
    order_id = Column(String, ForeignKey("orders.id"), nullable=True)
    transaction_id = Column(String, nullable=True)
    raised_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    raised_by_name = Column(String, nullable=False)
    category = Column(String, nullable=False) # Payment issue, Quality disagreement, Quantity mismatch
    description = Column(Text, nullable=False)
    status = Column(String, default=DisputeStatus.OPEN)
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Settlement(Base):
    __tablename__ = "settlements"

    id = Column(String, primary_key=True, index=True)
    order_id = Column(String, ForeignKey("orders.id"), nullable=False)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    gross_amount = Column(Float, nullable=False)
    platform_fee = Column(Float, nullable=False)
    logistics_fee = Column(Float, nullable=False)
    farmer_payable = Column(Float, nullable=False)
    status = Column(String, default="PENDING")
    payout_ref = Column(String, nullable=True)
    settled_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# Legacy Transaction model for backward compatibility with existing views
class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True, index=True) # e.g. KL-TXN-10492
    lot_id = Column(String, ForeignKey("lots.id"), nullable=True)
    offer_id = Column(String, ForeignKey("offers.id"), nullable=True)
    farmer_name = Column(String, nullable=False)
    buyer_name = Column(String, nullable=False)
    crop = Column(String, nullable=False)
    quantity_kg = Column(Float, nullable=False)
    agreed_price_per_kg = Column(Float, nullable=False)
    gross_value = Column(Float, nullable=False)
    transport_cost = Column(Float, nullable=False)
    net_realization = Column(Float, nullable=False)
    vehicle_number = Column(String, default="UP78 AB 1234")
    driver_name = Column(String, default="Ravi Kumar")
    origin = Column(String, default="Kanpur")
    destination = Column(String, default="Lucknow")
    status = Column(String, default="TRANSACTION_CREATED")
    payment_status = Column(String, default="PENDING")
    created_at = Column(DateTime, default=datetime.utcnow)

class SystemConfig(Base):
    __tablename__ = "system_configs"

    key = Column(String, primary_key=True, index=True)
    value = Column(String, nullable=True)

class Crop(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    local_name = Column(String, nullable=True)
    hindi_name = Column(String, nullable=True)
    marathi_name = Column(String, nullable=True)
    category = Column(String, nullable=False)
    image = Column(String, nullable=True)
    unit = Column(String, default="kg")
    quality_grades = Column(String, default="Grade A, Grade B, Grade C")
    season = Column(String, default="Kharif, Rabi")
    water_requirement = Column(String, default="Medium")
    storage_type = Column(String, default="Cold Storage")
    is_active = Column(Boolean, default=True)

class AIChatConversation(Base):
    __tablename__ = "ai_conversations"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, nullable=False, index=True)
    title = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class AIChatMessage(Base):
    __tablename__ = "ai_messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(String, ForeignKey("ai_conversations.id"), nullable=False)
    role = Column(String, nullable=False) # "user" or "model"
    content = Column(Text, nullable=False)
    tool_calls = Column(Text, nullable=True) # JSON string
    sources = Column(Text, nullable=True) # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)

class AIAuditLog(Base):
    __tablename__ = "ai_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=True)
    conversation_id = Column(String, nullable=True)
    ai_request = Column(Text, nullable=False)
    ai_response = Column(Text, nullable=True)
    tools_used = Column(Text, nullable=True)
    sources = Column(Text, nullable=True)
    latency_ms = Column(Integer, default=0)
    status = Column(String, default="SUCCESS")
    timestamp = Column(DateTime, default=datetime.utcnow)
