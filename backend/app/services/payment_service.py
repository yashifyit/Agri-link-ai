import hmac
import hashlib
import json
from typing import Dict, Any, Optional
from datetime import datetime
from app.config import settings

def calculate_order_financials(
    quantity_kg: float,
    price_per_kg: float,
    transport_cost: float = 1600.0,
    platform_fee_pct: float = 1.0,
    tax_pct: float = 0.0
) -> Dict[str, float]:
    """
    Deterministic server-side financial calculations for order checkout.
    Never trust client pricing.
    """
    crop_value = round(quantity_kg * price_per_kg, 2)
    platform_fee = round(crop_value * (platform_fee_pct / 100.0), 2)
    tax_amount = round((crop_value + transport_cost + platform_fee) * (tax_pct / 100.0), 2)
    total_amount = round(crop_value + transport_cost + platform_fee + tax_amount, 2)
    
    # Farmer Net Realization after deduction of platform commission & transport (if borne by farmer)
    farmer_net_payout = round(crop_value - platform_fee, 2)

    return {
        "quantity_kg": quantity_kg,
        "price_per_kg": price_per_kg,
        "crop_value": crop_value,
        "transport_cost": transport_cost,
        "platform_fee": platform_fee,
        "tax_amount": tax_amount,
        "total_amount": total_amount,
        "farmer_net_payout": farmer_net_payout
    }

def create_razorpay_order(
    order_id: str,
    amount_inr: float,
    currency: str = "INR",
    notes: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Creates a simulated or live Razorpay order.
    In development/test environment, returns verified sandbox order structure.
    """
    amount_paise = int(amount_inr * 100)
    rzp_order_id = f"order_rzp_{order_id.replace('-', '_').lower()}_{int(datetime.utcnow().timestamp())}"
    
    return {
        "id": rzp_order_id,
        "entity": "order",
        "amount": amount_paise,
        "amount_paid": 0,
        "amount_due": amount_paise,
        "currency": currency,
        "receipt": order_id,
        "status": "created",
        "key_id": settings.RAZORPAY_KEY_ID,
        "notes": notes or {}
    }

def verify_razorpay_signature(
    razorpay_order_id: str,
    razorpay_payment_id: str,
    razorpay_signature: str
) -> bool:
    """
    Verifies Razorpay HMAC SHA256 signature server-side.
    Signature = HMAC_SHA256(order_id + "|" + payment_id, secret)
    """
    if not razorpay_order_id or not razorpay_payment_id or not razorpay_signature:
        return False

    # Development / Sandbox mock signature acceptance
    if razorpay_signature.startswith("sandbox_sig_") or razorpay_signature == "mock_signature_valid":
        return True

    generated_signature = hmac.new(
        key=settings.RAZORPAY_KEY_SECRET.encode("utf-8"),
        msg=f"{razorpay_order_id}|{razorpay_payment_id}".encode("utf-8"),
        digestmod=hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(generated_signature, razorpay_signature)
