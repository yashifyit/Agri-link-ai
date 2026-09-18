from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
import json

from app.database import get_db
from app.models.all_models import (
    Payment, PaymentEvent, PaymentStatus, EscrowStatus, Order, OrderStatus,
    Shipment, ShipmentStatus, Settlement, Notification, NotificationType, User, Transaction
)
from app.services.auth_service import get_current_user
from app.services.payment_service import (
    create_razorpay_order, verify_razorpay_signature, calculate_order_financials
)
from app.services.event_bus import event_manager, EventType

router = APIRouter(prefix="/payments", tags=["Payments & Escrow Settlement"])

class CreatePaymentOrderRequest(BaseModel):
    order_id: str

class VerifyPaymentRequest(BaseModel):
    order_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

class ProcessRefundRequest(BaseModel):
    order_id: str
    reason: str
    amount: Optional[float] = None

@router.post("/create-order")
def initiate_payment_order(
    payload: CreatePaymentOrderRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == payload.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.payment_status == PaymentStatus.SUCCESS:
        raise HTTPException(status_code=400, detail="Order has already been paid successfully.")

    # Create Gateway Order
    rzp_order = create_razorpay_order(
        order_id=order.id,
        amount_inr=order.total_amount,
        notes={"order_id": order.id, "crop": order.crop, "quantity_kg": order.quantity_kg}
    )

    # Persist internal payment record
    pay_seq = db.query(Payment).count() + 8821
    payment_id = f"KL-PAY-{pay_seq}"
    
    payment = Payment(
        id=payment_id,
        order_id=order.id,
        buyer_id=current_user.id,
        amount=order.total_amount,
        currency="INR",
        gateway="RAZORPAY",
        razorpay_order_id=rzp_order["id"],
        status=PaymentStatus.INITIATED,
        escrow_status=EscrowStatus.HELD
    )
    db.add(payment)
    db.commit()

    return {
        "success": True,
        "payment_id": payment.id,
        "razorpay_order_id": rzp_order["id"],
        "amount": rzp_order["amount"], # amount in paise
        "amount_inr": order.total_amount,
        "currency": "INR",
        "key_id": rzp_order["key_id"],
        "order_details": {
            "order_id": order.id,
            "crop": order.crop,
            "quantity_kg": order.quantity_kg,
            "crop_value": order.crop_value,
            "transport_cost": order.transport_cost,
            "platform_fee": order.platform_fee,
            "total_amount": order.total_amount
        }
    }

@router.post("/verify")
async def verify_payment(
    payload: VerifyPaymentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == payload.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    payment = db.query(Payment).filter(
        Payment.order_id == payload.order_id,
        Payment.razorpay_order_id == payload.razorpay_order_id
    ).first()

    if not payment:
        # Fallback to last initiated payment for this order
        payment = db.query(Payment).filter(Payment.order_id == payload.order_id).order_by(Payment.created_at.desc()).first()

    # Cryptographic verification
    is_valid = verify_razorpay_signature(
        razorpay_order_id=payload.razorpay_order_id,
        razorpay_payment_id=payload.razorpay_payment_id,
        razorpay_signature=payload.razorpay_signature
    )

    if not is_valid:
        if payment:
            payment.status = PaymentStatus.FAILED
            payment.failure_reason = "Signature verification failed"
            db.commit()
        raise HTTPException(status_code=400, detail="Invalid payment signature. Verification failed.")

    # 1. Update Payment Status
    if payment:
        payment.status = PaymentStatus.SUCCESS
        payment.razorpay_payment_id = payload.razorpay_payment_id
        payment.razorpay_signature = payload.razorpay_signature
        payment.escrow_status = EscrowStatus.HELD

    # 2. Update Order Status
    order.status = OrderStatus.PAID
    order.payment_status = PaymentStatus.SUCCESS

    # 3. Create Escrow Settlement Ledger entry for farmer
    settlement_seq = db.query(Settlement).count() + 10492
    settlement = Settlement(
        id=f"KL-SETTLE-{settlement_seq}",
        order_id=order.id,
        farmer_id=order.farmer_id or 1,
        gross_amount=order.crop_value,
        platform_fee=order.platform_fee,
        logistics_fee=order.transport_cost,
        farmer_payable=order.farmer_net_payout,
        status="HELD_IN_ESCROW"
    )
    db.add(settlement)

    # 4. Advance logistics status from ASSIGNED to PICKUP_SCHEDULED
    shipment = db.query(Shipment).filter(Shipment.order_id == order.id).first()
    if shipment:
        shipment.status = ShipmentStatus.PICKUP_SCHEDULED
        shipment.estimated_delivery = "Scheduled within 24 hours"

    # 5. Update legacy transaction if present
    legacy_txn = db.query(Transaction).filter(Transaction.lot_id == order.lot_id).first()
    if legacy_txn:
        legacy_txn.payment_status = "COMPLETED"
        legacy_txn.status = "PICKUP_SCHEDULED"

    # 6. Notify farmer & buyer
    if order.farmer_id:
        notif = Notification(
            user_id=order.farmer_id,
            title="Payment Received in Escrow! 🎉",
            message=f"Buyer {order.buyer_name} paid ₹{order.total_amount:,.2f} for {order.crop}. Logistics pickup is now scheduled.",
            type=NotificationType.PAYMENT,
            metadata_json=json.dumps({"order_id": order.id, "payment_id": payload.razorpay_payment_id})
        )
        db.add(notif)

    db.commit()

    # 7. Real-time WebSocket broadcasts
    await event_manager.broadcast_event(EventType.PAYMENT_UPDATED, {
        "order_id": order.id,
        "payment_status": "SUCCESS",
        "escrow_status": "HELD",
        "amount": order.total_amount
    }, topic="orders")

    await event_manager.broadcast_event(EventType.LOGISTICS_UPDATED, {
        "order_id": order.id,
        "shipment_id": shipment.id if shipment else None,
        "status": "PICKUP_SCHEDULED"
    }, topic="logistics")

    return {
        "success": True,
        "message": "Payment verified and held safely in KisanLink Escrow. Logistics workflow dispatched.",
        "order_id": order.id,
        "payment_id": payload.razorpay_payment_id,
        "settlement_id": settlement.id,
        "farmer_net_payout": order.farmer_net_payout
    }

@router.post("/webhook")
async def razorpay_webhook(request: Request, db: Session = Depends(get_db)):
    """Idempotent payment gateway webhook receiver"""
    payload_body = await request.body()
    try:
        data = json.loads(payload_body.decode("utf-8"))
        event_name = data.get("event", "payment.captured")
        payment_entity = data.get("payload", {}).get("payment", {}).get("entity", {})
        
        rzp_order_id = payment_entity.get("order_id")
        rzp_payment_id = payment_entity.get("id")

        if rzp_order_id:
            payment = db.query(Payment).filter(Payment.razorpay_order_id == rzp_order_id).first()
            if payment:
                event_log = PaymentEvent(
                    payment_id=payment.id,
                    event_type=event_name,
                    payload=json.dumps(data)
                )
                db.add(event_log)
                db.commit()

        return {"status": "webhook_acknowledged"}
    except Exception as e:
        return {"status": "error", "detail": str(e)}

@router.get("/settlements")
def get_settlements(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(Settlement)
    if current_user.role == UserRole.FARMER:
        query = query.filter(Settlement.farmer_id == current_user.id)
    return query.order_by(Settlement.created_at.desc()).all()
