from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base

class UserRole(str, enum.Enum):
    FARMER = "FARMER"
    FPO = "FPO"
    BUYER = "BUYER"
    ADMIN = "ADMIN"

class OfferStatus(str, enum.Enum):
    PENDING = "PENDING"
    COUNTERED = "COUNTERED"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    EXPIRED = "EXPIRED"

class TransactionStatus(str, enum.Enum):
    TRANSACTION_CREATED = "TRANSACTION_CREATED"
    CREATED = "TRANSACTION_CREATED"
    PICKUP_SCHEDULED = "PICKUP_SCHEDULED"
    LOGISTICS_SCHEDULED = "PICKUP_SCHEDULED"
    IN_TRANSIT = "IN_TRANSIT"
    DELIVERED = "DELIVERED"
    PAYMENT_PROCESSING = "PAYMENT_PROCESSING"
    PAYMENT_INITIATED = "PAYMENT_PROCESSING"
    PAYMENT_COMPLETED = "PAYMENT_COMPLETED"
    DISPUTED = "DISPUTED"

class DisputeStatus(str, enum.Enum):
    OPEN = "OPEN"
    UNDER_REVIEW = "UNDER_REVIEW"
    RESOLVED = "RESOLVED"
    REJECTED = "REJECTED"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone = Column(String, unique=True, index=True)
    email = Column(String, unique=True, nullable=True)
    role = Column(String, default=UserRole.FARMER)
    location = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

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
    farmer_name = Column(String, nullable=False)
    crop = Column(String, nullable=False, index=True)
    variety = Column(String, default="Desi")
    quantity_kg = Column(Float, nullable=False)
    quality_grade = Column(String, default="Grade A")
    harvest_date = Column(String, nullable=False)
    location = Column(String, nullable=False)
    expected_price_per_kg = Column(Float, nullable=False)
    is_fpo_aggregated = Column(Boolean, default=False)
    fpo_name = Column(String, nullable=True)
    status = Column(String, default="ACTIVE")
    created_at = Column(DateTime, default=datetime.utcnow)

class BuyerRequirement(Base):
    __tablename__ = "buyer_requirements"

    id = Column(Integer, primary_key=True, index=True)
    buyer_name = Column(String, nullable=False)
    company_name = Column(String, nullable=False)
    crop = Column(String, nullable=False)
    required_qty_kg = Column(Float, nullable=False)
    min_grade = Column(String, default="Grade A")
    target_price_min = Column(Float, nullable=False)
    target_price_max = Column(Float, nullable=False)
    delivery_location = Column(String, nullable=False)
    reliability_score = Column(Float, default=90.0)
    on_time_payment_pct = Column(Float, default=95.0)

class Offer(Base):
    __tablename__ = "offers"

    id = Column(String, primary_key=True, index=True) # e.g. KL-OFF-8831
    lot_id = Column(String, ForeignKey("lots.id"))
    buyer_name = Column(String, nullable=False)
    offered_price_per_kg = Column(Float, nullable=False)
    quantity_kg = Column(Float, nullable=False)
    transport_estimate = Column(Float, default=1600.0)
    gross_total = Column(Float, nullable=False)
    net_realization = Column(Float, nullable=False)
    status = Column(String, default=OfferStatus.PENDING)
    last_counter_by = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True, index=True) # e.g. KL-TXN-10492
    lot_id = Column(String, ForeignKey("lots.id"))
    offer_id = Column(String, ForeignKey("offers.id"))
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
    status = Column(String, default=TransactionStatus.CREATED)
    payment_status = Column(String, default="PENDING")
    created_at = Column(DateTime, default=datetime.utcnow)

class Dispute(Base):
    __tablename__ = "disputes"

    id = Column(String, primary_key=True, index=True)
    transaction_id = Column(String, ForeignKey("transactions.id"))
    raised_by = Column(String, nullable=False)
    category = Column(String, nullable=False) # Payment issue, Quality disagreement, Quantity mismatch
    description = Column(Text, nullable=False)
    status = Column(String, default=DisputeStatus.OPEN)
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
    tools_used = Column(Text, nullable=True) # JSON string
    sources = Column(Text, nullable=True) # JSON string
    latency_ms = Column(Integer, default=0)
    status = Column(String, default="SUCCESS")
    timestamp = Column(DateTime, default=datetime.utcnow)
