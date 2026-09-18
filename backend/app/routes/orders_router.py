from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import json

from app.database import get_db
from app.models.all_models import (
    Order, OrderStatus, Lot, LotStatus, PaymentStatus, User, UserRole,
    Shipment, ShipmentStatus, Cart, CartItem, Notification, NotificationType, Transaction
)
from app.services.auth_service import get_current_user
from app.services.payment_service import calculate_order_financials
from app.services.event_bus import event_manager, EventType
from app.services.logistics_service import calculate_logistics_cost

router = APIRouter(tags=["Orders & Cart"])

class CreateOrderRequest(BaseModel):
    lot_id: str
    quantity_kg: float
    delivery_address: str
    pickup_address: Optional[str] = None
    buyer_name: Optional[str] = None
    vehicle_type: Optional[str] = "Mini Truck 1.5T"
    cold_chain: Optional[bool] = False

class UpdateOrderStatusRequest(BaseModel):
    status: str

# 1. Cart Endpoints
@router.get("/cart")
def get_cart(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cart = db.query(Cart).filter(Cart.buyer_id == current_user.id).first()
    if not cart:
        cart = Cart(buyer_id=current_user.id)
        db.add(cart)
        db.commit()
        db.refresh(cart)

    items = []
    total_value = 0.0
    for item in cart.items:
        lot = db.query(Lot).filter(Lot.id == item.lot_id).first()
        if lot:
            line_total = item.quantity_kg * item.price_per_kg
            total_value += line_total
            items.append({
                "id": item.id,
                "lot_id": lot.id,
                "crop": lot.crop,
                "variety": lot.variety,
                "farmer_name": lot.farmer_name,
                "quality_grade": lot.quality_grade,
                "quantity_kg": item.quantity_kg,
                "available_stock": lot.available_qty_kg,
                "price_per_kg": item.price_per_kg,
                "line_total": line_total,
                "location": lot.location
            })

    transport_estimate = 1600.0 if items else 0.0
    platform_fee = round(total_value * 0.01, 2)
    final_payable = round(total_value + transport_estimate + platform_fee, 2)

    return {
        "cart_id": cart.id,
        "items": items,
        "item_count": len(items),
        "total_crop_value": round(total_value, 2),
        "estimated_transport": transport_estimate,
        "platform_fee": platform_fee,
        "final_payable_amount": final_payable
    }

@router.post("/cart/items")
def add_to_cart(payload: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    lot_id = payload.get("lot_id")
    quantity_kg = float(payload.get("quantity_kg", 800))

    lot = db.query(Lot).filter(Lot.id == lot_id).first()
    if not lot or lot.status not in [LotStatus.ACTIVE, "OFFER_RECEIVED"]:
        raise HTTPException(status_code=400, detail="Crop lot is no longer active in marketplace")

    if lot.available_qty_kg < quantity_kg:
        raise HTTPException(
            status_code=400,
            detail=f"Only {lot.available_qty_kg} kg is currently available in this lot."
        )

    cart = db.query(Cart).filter(Cart.buyer_id == current_user.id).first()
    if not cart:
        cart = Cart(buyer_id=current_user.id)
        db.add(cart)
        db.flush()

    # Check if item exists
    existing = db.query(CartItem).filter(CartItem.cart_id == cart.id, CartItem.lot_id == lot_id).first()
    if existing:
        existing.quantity_kg = quantity_kg
        existing.price_per_kg = lot.expected_price_per_kg
    else:
        new_item = CartItem(
            cart_id=cart.id,
            lot_id=lot.id,
            quantity_kg=quantity_kg,
            price_per_kg=lot.expected_price_per_kg
        )
        db.add(new_item)

    db.commit()
    return {"success": True, "message": "Item added to cart"}

@router.delete("/cart/items/{item_id}")
def remove_from_cart(item_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.query(CartItem).filter(CartItem.id == item_id).first()
    if item:
        db.delete(item)
        db.commit()
    return {"success": True, "message": "Item removed from cart"}

# 2. Atomic Order Placement (Prevents overselling with database transactions)
@router.post("/orders", status_code=status.HTTP_201_CREATED)
async def create_order(
    payload: CreateOrderRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Atomic Transactional Row Check
        lot = db.query(Lot).filter(Lot.id == payload.lot_id).with_for_update().first()
        if not lot:
            raise HTTPException(status_code=404, detail="Lot not found")

        if lot.status in [LotStatus.SOLD, LotStatus.CANCELLED, LotStatus.EXPIRED]:
            raise HTTPException(status_code=400, detail=f"Lot is {lot.status} and cannot be ordered.")

        if lot.available_qty_kg < payload.quantity_kg:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient inventory. Only {lot.available_qty_kg} kg is currently available."
            )

        # 1. Atomic deduction of inventory
        lot.available_qty_kg -= payload.quantity_kg
        if lot.available_qty_kg <= 0:
            lot.status = LotStatus.SOLD
        else:
            lot.status = LotStatus.ACTIVE

        # 2. Calculate dynamic transport & financials
        distance_km = 45.0
        logistics_calc = calculate_logistics_cost(
            distance_km=distance_km,
            weight_kg=payload.quantity_kg,
            vehicle_type=payload.vehicle_type or "Mini Truck 1.5T",
            cold_chain_required=bool(payload.cold_chain)
        )
        transport_cost = logistics_calc["total_logistics_cost"]

        financials = calculate_order_financials(
            quantity_kg=payload.quantity_kg,
            price_per_kg=lot.expected_price_per_kg,
            transport_cost=transport_cost,
            platform_fee_pct=1.0
        )

        order_seq = db.query(Order).count() + 10493
        order_id = f"KL-ORD-{order_seq}"
        buyer_name = payload.buyer_name or current_user.name

        new_order = Order(
            id=order_id,
            buyer_id=current_user.id,
            buyer_name=buyer_name,
            farmer_id=lot.farmer_id,
            farmer_name=lot.farmer_name,
            lot_id=lot.id,
            crop=lot.crop,
            quantity_kg=payload.quantity_kg,
            price_per_kg=lot.expected_price_per_kg,
            crop_value=financials["crop_value"],
            transport_cost=financials["transport_cost"],
            platform_fee=financials["platform_fee"],
            tax_amount=financials["tax_amount"],
            total_amount=financials["total_amount"],
            farmer_net_payout=financials["farmer_net_payout"],
            delivery_address=payload.delivery_address,
            pickup_address=payload.pickup_address or lot.location,
            status=OrderStatus.CONFIRMED,
            payment_status=PaymentStatus.PENDING
        )
        db.add(new_order)
        db.flush()

        # 3. Create associated Shipment record
        shipment_seq = db.query(Shipment).count() + 10493
        shipment_id = f"KL-SHP-{shipment_seq}"
        new_shipment = Shipment(
            id=shipment_id,
            order_id=new_order.id,
            logistics_partner_name="KisanLink FastLogistics",
            vehicle_type=payload.vehicle_type or "Mini Truck 1.5T",
            vehicle_number="UP78 AB 1234",
            driver_name="Ravi Kumar",
            driver_phone="+91 98765 43219",
            origin=new_order.pickup_address,
            destination=new_order.delivery_address,
            distance_km=distance_km,
            transport_cost=transport_cost,
            cold_chain_enabled=bool(payload.cold_chain),
            status=ShipmentStatus.ASSIGNED,
            estimated_delivery="Within 24 Hours"
        )
        db.add(new_shipment)

        # 4. Backward compatible Transaction row for legacy dashboards
        txn_id = f"KL-TXN-{db.query(Transaction).count() + 10493}"
        legacy_txn = Transaction(
            id=txn_id,
            lot_id=lot.id,
            farmer_name=lot.farmer_name,
            buyer_name=buyer_name,
            crop=lot.crop,
            quantity_kg=payload.quantity_kg,
            agreed_price_per_kg=lot.expected_price_per_kg,
            gross_value=financials["crop_value"],
            transport_cost=transport_cost,
            net_realization=financials["farmer_net_payout"],
            vehicle_number="UP78 AB 1234",
            driver_name="Ravi Kumar",
            origin=new_order.pickup_address,
            destination=new_order.delivery_address,
            status="TRANSACTION_CREATED",
            payment_status="PENDING"
        )
        db.add(legacy_txn)

        # 5. Create notifications for Farmer & Buyer
        if lot.farmer_id:
            farmer_notif = Notification(
                user_id=lot.farmer_id,
                title=f"Order Confirmed: {new_order.crop}",
                message=f"Buyer {buyer_name} placed an order for {new_order.quantity_kg}kg {new_order.crop} (₹{new_order.total_amount:,.2f}).",
                type=NotificationType.ORDER,
                metadata_json=json.dumps({"order_id": new_order.id, "lot_id": lot.id})
            )
            db.add(farmer_notif)

        db.commit()
        db.refresh(new_order)
        db.refresh(new_shipment)

        # 6. Real-time WebSocket broadcasts
        # A. Broadcast inventory update to all marketplace viewers
        await event_manager.broadcast_event(EventType.LOT_UPDATED, {
            "id": lot.id,
            "available_qty_kg": lot.available_qty_kg,
            "status": lot.status
        }, topic="marketplace")

        # B. Broadcast ORDER_CREATED event
        order_payload = {
            "id": new_order.id,
            "lot_id": new_order.lot_id,
            "crop": new_order.crop,
            "quantity_kg": new_order.quantity_kg,
            "price_per_kg": new_order.price_per_kg,
            "total_amount": new_order.total_amount,
            "farmer_name": new_order.farmer_name,
            "buyer_name": new_order.buyer_name,
            "status": new_order.status,
            "payment_status": new_order.payment_status,
            "created_at": new_order.created_at.strftime("%Y-%m-%d %H:%M")
        }
        await event_manager.broadcast_event(EventType.ORDER_CREATED, order_payload, topic="orders")

        if lot.farmer_id:
            await event_manager.send_user_event(str(lot.farmer_id), EventType.NOTIFICATION_CREATED, {
                "title": f"New Order Received: {new_order.crop}",
                "message": f"Buyer {buyer_name} ordered {new_order.quantity_kg}kg. Gross ₹{new_order.crop_value:,.2f}.",
                "order_id": new_order.id
            })

        return {
            "success": True,
            "message": "Order created successfully with guaranteed inventory allocation",
            "order": order_payload,
            "shipment_id": new_shipment.id,
            "financials": financials
        }

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Order transaction failed: {str(e)}")

@router.get("/orders")
def get_orders(
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Order)
    if current_user.role == UserRole.FARMER:
        query = query.filter((Order.farmer_id == current_user.id) | (Order.farmer_name.ilike(f"%{current_user.name}%")))
    elif current_user.role == UserRole.BUYER:
        query = query.filter((Order.buyer_id == current_user.id) | (Order.buyer_name.ilike(f"%{current_user.name}%")))

    if status:
        query = query.filter(Order.status == status.upper())

    orders = query.order_by(Order.created_at.desc()).all()
    results = []
    for o in orders:
        results.append({
            "id": o.id,
            "lot_id": o.lot_id,
            "farmer_name": o.farmer_name,
            "buyer_name": o.buyer_name,
            "crop": o.crop,
            "quantity_kg": o.quantity_kg,
            "price_per_kg": o.price_per_kg,
            "crop_value": o.crop_value,
            "transport_cost": o.transport_cost,
            "platform_fee": o.platform_fee,
            "total_amount": o.total_amount,
            "farmer_net_payout": o.farmer_net_payout,
            "delivery_address": o.delivery_address,
            "pickup_address": o.pickup_address,
            "status": o.status,
            "payment_status": o.payment_status,
            "created_at": o.created_at.strftime("%Y-%m-%d %H:%M")
        })
    return results

@router.get("/orders/{order_id}")
def get_order_detail(order_id: str, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    shipment = db.query(Shipment).filter(Shipment.order_id == order_id).first()
    return {
        "order": order,
        "shipment": shipment
    }

@router.patch("/orders/{order_id}/status")
async def update_order_status(
    order_id: str,
    payload: UpdateOrderStatusRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    new_status = payload.status.upper()
    order.status = new_status
    db.commit()

    # Emit real-time status update
    await event_manager.broadcast_event(EventType.ORDER_STATUS_CHANGED, {
        "order_id": order.id,
        "status": order.status,
        "payment_status": order.payment_status
    }, topic="orders")

    return order
