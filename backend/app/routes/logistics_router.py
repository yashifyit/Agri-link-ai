from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
import json

from app.database import get_db
from app.models.all_models import (
    Shipment, ShipmentEvent, ShipmentStatus, Order, OrderStatus,
    Settlement, Notification, NotificationType, User, UserRole, Transaction
)
from app.services.auth_service import get_current_user
from app.services.logistics_service import calculate_logistics_cost, is_valid_shipment_transition
from app.services.event_bus import event_manager, EventType

router = APIRouter(prefix="/shipments", tags=["Logistics & Shipment Tracking"])

class UpdateShipmentStatusRequest(BaseModel):
    status: str
    location_note: Optional[str] = None
    driver_name: Optional[str] = None
    vehicle_number: Optional[str] = None

class CalculateFreightRequest(BaseModel):
    distance_km: float
    weight_kg: float
    vehicle_type: Optional[str] = "Mini Truck 1.5T"
    cold_chain_required: Optional[bool] = False

@router.post("/calculate-cost")
def calculate_freight_endpoint(payload: CalculateFreightRequest):
    return calculate_logistics_cost(
        distance_km=payload.distance_km,
        weight_kg=payload.weight_kg,
        vehicle_type=payload.vehicle_type or "Mini Truck 1.5T",
        cold_chain_required=bool(payload.cold_chain_required)
    )

@router.get("")
def get_shipments(
    status: Optional[str] = None,
    order_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Shipment)
    if status:
        query = query.filter(Shipment.status == status.upper())
    if order_id:
        query = query.filter(Shipment.order_id == order_id)

    shipments = query.order_by(Shipment.created_at.desc()).all()
    results = []
    for s in shipments:
        order = db.query(Order).filter(Order.id == s.order_id).first()
        results.append({
            "id": s.id,
            "order_id": s.order_id,
            "crop": order.crop if order else "Tomato",
            "quantity_kg": order.quantity_kg if order else 800,
            "farmer_name": order.farmer_name if order else "Farmer",
            "buyer_name": order.buyer_name if order else "Buyer",
            "vehicle_type": s.vehicle_type,
            "vehicle_number": s.vehicle_number,
            "driver_name": s.driver_name,
            "driver_phone": s.driver_phone,
            "origin": s.origin,
            "destination": s.destination,
            "distance_km": s.distance_km,
            "transport_cost": s.transport_cost,
            "cold_chain_enabled": s.cold_chain_enabled,
            "status": s.status,
            "estimated_delivery": s.estimated_delivery,
            "created_at": s.created_at.strftime("%Y-%m-%d %H:%M")
        })
    return results

@router.get("/{shipment_id}")
def get_shipment_detail(shipment_id: str, db: Session = Depends(get_db)):
    shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    events = db.query(ShipmentEvent).filter(ShipmentEvent.shipment_id == shipment_id).order_by(ShipmentEvent.timestamp.asc()).all()
    order = db.query(Order).filter(Order.id == shipment.order_id).first()

    return {
        "shipment": shipment,
        "order": order,
        "events": events
    }

@router.patch("/{shipment_id}/status")
async def update_shipment_status(
    shipment_id: str,
    payload: UpdateShipmentStatusRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    new_status = payload.status.upper()
    valid_statuses = [
        ShipmentStatus.ASSIGNED, ShipmentStatus.PICKUP_SCHEDULED,
        ShipmentStatus.PICKED_UP, ShipmentStatus.IN_TRANSIT,
        ShipmentStatus.OUT_FOR_DELIVERY, ShipmentStatus.DELIVERED, ShipmentStatus.CANCELLED
    ]

    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid shipment status: {new_status}")

    shipment.status = new_status
    if payload.driver_name:
        shipment.driver_name = payload.driver_name
    if payload.vehicle_number:
        shipment.vehicle_number = payload.vehicle_number

    # Add shipment tracking event
    event = ShipmentEvent(
        shipment_id=shipment.id,
        status=new_status,
        location_note=payload.location_note or f"Shipment marked {new_status.replace('_', ' ').title()}"
    )
    db.add(event)

    # Sync with Order status
    order = db.query(Order).filter(Order.id == shipment.order_id).first()
    if order:
        if new_status == ShipmentStatus.PICKED_UP:
            order.status = OrderStatus.PICKED_UP
        elif new_status == ShipmentStatus.IN_TRANSIT:
            order.status = OrderStatus.IN_TRANSIT
        elif new_status == ShipmentStatus.DELIVERED:
            order.status = OrderStatus.DELIVERED
            shipment.delivered_at = datetime.utcnow()

            # Release Escrow Settlement to Farmer
            settlement = db.query(Settlement).filter(Settlement.order_id == order.id).first()
            if settlement:
                settlement.status = "SETTLED_TO_FARMER"
                settlement.settled_at = datetime.utcnow()
                settlement.payout_ref = f"PAYOUT_IMPS_{int(datetime.utcnow().timestamp())}"

            # Notify Farmer that funds are released
            if order.farmer_id:
                db.add(Notification(
                    user_id=order.farmer_id,
                    title="Payout Settled to Bank Account! 💰",
                    message=f"Delivery confirmed for {order.crop}. Net payout of ₹{order.farmer_net_payout:,.2f} settled to your bank account.",
                    type=NotificationType.PAYMENT,
                    metadata_json=json.dumps({"order_id": order.id, "payout": order.farmer_net_payout})
                ))

    # Sync with legacy transaction
    if order:
        legacy_txn = db.query(Transaction).filter(Transaction.lot_id == order.lot_id).first()
        if legacy_txn:
            legacy_txn.status = new_status
            if new_status == ShipmentStatus.DELIVERED:
                legacy_txn.payment_status = "COMPLETED"

    db.commit()
    db.refresh(shipment)

    # Broadcast real-time status update to connected apps
    await event_manager.broadcast_event(EventType.LOGISTICS_UPDATED, {
        "shipment_id": shipment.id,
        "order_id": shipment.order_id,
        "status": shipment.status,
        "location_note": payload.location_note
    }, topic="logistics")

    return shipment
