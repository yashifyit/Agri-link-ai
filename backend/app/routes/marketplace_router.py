from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
import json
import asyncio

from app.database import get_db
from app.models.all_models import (
    Lot, Crop, User, UserRole, LotStatus, BuyerRequirement, Offer, Notification, NotificationType
)
from app.services.auth_service import get_current_user, require_role
from app.services.event_bus import event_manager, EventType
from app.services.image_provider import ImageProvider
from app.algorithms.engine import calculate_buyer_match_score, calculate_net_realization

router = APIRouter(tags=["Marketplace & Lots"])

@router.get("/lots")
def get_lots(
    crop: Optional[str] = None,
    status: Optional[str] = None,
    farmer_name: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Lot)
    if crop:
        query = query.filter(Lot.crop.ilike(f"%{crop}%"))
    if status:
        query = query.filter(Lot.status == status.upper())
    if farmer_name:
        query = query.filter(Lot.farmer_name.ilike(f"%{farmer_name}%"))

    return query.order_by(Lot.created_at.desc()).all()

@router.post("/lots", status_code=status.HTTP_201_CREATED)
async def create_lot(
    lot_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    crop_name = lot_data.get("crop", "Tomato").strip()
    # Verify crop catalog
    crop_entry = db.query(Crop).filter(Crop.name.ilike(crop_name), Crop.is_active == True).first()
    if not crop_entry:
        # Fallback to create active crop if missing
        crop_id = db.query(Crop).count() + 1
        crop_entry = Crop(
            id=crop_id,
            name=crop_name,
            category=lot_data.get("category", "Vegetables"),
            unit=lot_data.get("unit", "kg"),
            image=ImageProvider.get_image(f"{crop_name} crop india", "crop"),
            is_active=True
        )
        db.add(crop_entry)
        db.flush()

    lot_seq = db.query(Lot).count() + 10493
    lot_id = f"KL-LOT-{lot_seq}"
    qty = float(lot_data.get("quantity_kg", 800))
    expected_price = float(lot_data.get("expected_price_per_kg", 32))
    min_price = float(lot_data.get("min_acceptable_price_per_kg", expected_price * 0.9))

    farmer_name = lot_data.get("farmer_name") or current_user.name
    location = lot_data.get("location") or current_user.location

    images = lot_data.get("images", [])
    if not images and crop_entry.image:
        images = [crop_entry.image]

    new_lot = Lot(
        id=lot_id,
        farmer_id=current_user.id if current_user.role == UserRole.FARMER else None,
        farmer_name=farmer_name,
        crop=crop_entry.name,
        variety=lot_data.get("variety", "Hybrid Desi"),
        quantity_kg=qty,
        available_qty_kg=qty, # Initialize live transactional inventory
        unit=lot_data.get("unit", "kg"),
        quality_grade=lot_data.get("quality_grade", "Grade A"),
        harvest_date=lot_data.get("harvest_date", datetime.utcnow().strftime("%Y-%m-%d")),
        perishability_window_days=int(lot_data.get("perishability_window_days", 7)),
        location=location,
        pickup_address=lot_data.get("pickup_address", location),
        expected_price_per_kg=expected_price,
        min_acceptable_price_per_kg=min_price,
        packaging_type=lot_data.get("packaging_type", "Standard Crates"),
        delivery_preference=lot_data.get("delivery_preference", "Farmgate Pickup"),
        description=lot_data.get("description", f"Fresh harvest {crop_entry.name} from {location}."),
        images_json=json.dumps(images),
        is_fpo_aggregated=bool(lot_data.get("is_fpo_aggregated", False)),
        fpo_name=lot_data.get("fpo_name"),
        status=LotStatus.ACTIVE
    )

    db.add(new_lot)
    db.commit()
    db.refresh(new_lot)

    # Convert lot to dict for real-time broadcast
    lot_payload = {
        "id": new_lot.id,
        "farmer_name": new_lot.farmer_name,
        "crop": new_lot.crop,
        "variety": new_lot.variety,
        "quantity_kg": new_lot.quantity_kg,
        "available_qty_kg": new_lot.available_qty_kg,
        "unit": new_lot.unit,
        "quality_grade": new_lot.quality_grade,
        "harvest_date": new_lot.harvest_date,
        "location": new_lot.location,
        "expected_price_per_kg": new_lot.expected_price_per_kg,
        "min_acceptable_price_per_kg": new_lot.min_acceptable_price_per_kg,
        "packaging_type": new_lot.packaging_type,
        "delivery_preference": new_lot.delivery_preference,
        "is_fpo_aggregated": new_lot.is_fpo_aggregated,
        "fpo_name": new_lot.fpo_name,
        "status": new_lot.status,
        "created_at": new_lot.created_at.strftime("%Y-%m-%d %H:%M")
    }

    # 1. Broadcast LOT_CREATED over WebSocket to all connected buyers and marketplace viewers
    try:
        await event_manager.broadcast_event(EventType.LOT_CREATED, lot_payload, topic="marketplace")
    except Exception as e:
        print(f"WS Broadcast error: {e}")

    # 2. Match with institutional buyers and dispatch in-app notifications
    buyers = db.query(BuyerRequirement).filter(BuyerRequirement.crop.ilike(f"%{new_lot.crop}%")).all()
    for buyer in buyers:
        if buyer.buyer_id:
            notif = Notification(
                user_id=buyer.buyer_id,
                title=f"New Crop Available: {new_lot.crop}",
                message=f"Farmer {new_lot.farmer_name} listed {new_lot.quantity_kg}kg {new_lot.crop} ({new_lot.quality_grade}) at ₹{new_lot.expected_price_per_kg}/kg in {new_lot.location}.",
                type=NotificationType.OFFER,
                metadata_json=json.dumps({"lot_id": new_lot.id, "crop": new_lot.crop})
            )
            db.add(notif)
            try:
                await event_manager.send_user_event(str(buyer.buyer_id), EventType.NOTIFICATION_CREATED, {
                    "title": notif.title,
                    "message": notif.message,
                    "type": notif.type,
                    "lot_id": new_lot.id
                })
            except Exception:
                pass

    db.commit()
    return lot_payload

@router.get("/lots/{lot_id}")
def get_lot_by_id(lot_id: str, db: Session = Depends(get_db)):
    lot = db.query(Lot).filter(Lot.id == lot_id).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Lot not found")
    return {
        "id": lot.id,
        "farmer_id": lot.farmer_id,
        "farmer_name": lot.farmer_name,
        "crop": lot.crop,
        "variety": lot.variety,
        "quantity_kg": lot.quantity_kg,
        "available_qty_kg": lot.available_qty_kg,
        "unit": lot.unit,
        "quality_grade": lot.quality_grade,
        "harvest_date": lot.harvest_date,
        "location": lot.location,
        "pickup_address": lot.pickup_address,
        "expected_price_per_kg": lot.expected_price_per_kg,
        "min_acceptable_price_per_kg": lot.min_acceptable_price_per_kg,
        "packaging_type": lot.packaging_type,
        "delivery_preference": lot.delivery_preference,
        "is_fpo_aggregated": lot.is_fpo_aggregated,
        "fpo_name": lot.fpo_name,
        "status": lot.status,
        "created_at": lot.created_at.strftime("%Y-%m-%d %H:%M")
    }

@router.patch("/lots/{lot_id}")
async def update_lot(lot_id: str, payload: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    lot = db.query(Lot).filter(Lot.id == lot_id).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Lot not found")

    if "expected_price_per_kg" in payload:
        lot.expected_price_per_kg = float(payload["expected_price_per_kg"])
    if "status" in payload:
        lot.status = payload["status"]
    if "available_qty_kg" in payload:
        lot.available_qty_kg = float(payload["available_qty_kg"])

    db.commit()
    db.refresh(lot)

    # Broadcast update event
    try:
        await event_manager.broadcast_event(EventType.LOT_UPDATED, {
            "id": lot.id,
            "available_qty_kg": lot.available_qty_kg,
            "status": lot.status,
            "expected_price_per_kg": lot.expected_price_per_kg
        }, topic="marketplace")
    except Exception:
        pass

    return lot

@router.delete("/lots/{lot_id}")
async def cancel_lot(lot_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    lot = db.query(Lot).filter(Lot.id == lot_id).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Lot not found")

    lot.status = LotStatus.CANCELLED
    db.commit()

    try:
        await event_manager.broadcast_event(EventType.LOT_CANCELLED, {"id": lot.id, "status": "CANCELLED"}, topic="marketplace")
    except Exception:
        pass

    return {"success": True, "message": "Lot cancelled successfully"}

# 2. Buyer Marketplace Endpoint
@router.get("/marketplace")
def get_buyer_marketplace(
    crop: Optional[str] = None,
    grade: Optional[str] = None,
    location: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_qty: Optional[float] = None,
    sort_by: Optional[str] = "newest", # newest, price_asc, price_desc, qty_desc, distance
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Lot).filter(Lot.status.in_([LotStatus.ACTIVE, "OFFER_RECEIVED"]), Lot.available_qty_kg > 0)

    if crop:
        query = query.filter(Lot.crop.ilike(f"%{crop}%"))
    if grade:
        query = query.filter(Lot.quality_grade == grade)
    if location:
        query = query.filter(Lot.location.ilike(f"%{location}%"))
    if min_price is not None:
        query = query.filter(Lot.expected_price_per_kg >= min_price)
    if max_price is not None:
        query = query.filter(Lot.expected_price_per_kg <= max_price)
    if min_qty is not None:
        query = query.filter(Lot.available_qty_kg >= min_qty)
    if search:
        term = f"%{search}%"
        query = query.filter((Lot.crop.ilike(term)) | (Lot.farmer_name.ilike(term)) | (Lot.location.ilike(term)))

    lots = query.all()

    # Sort options
    if sort_by == "price_asc":
        lots.sort(key=lambda x: x.expected_price_per_kg)
    elif sort_by == "price_desc":
        lots.sort(key=lambda x: x.expected_price_per_kg, reverse=True)
    elif sort_by == "qty_desc":
        lots.sort(key=lambda x: x.available_qty_kg, reverse=True)
    else:
        lots.sort(key=lambda x: x.created_at, reverse=True)

    results = []
    for l in lots:
        # Calculate AI match score with standard buyer requirement
        score_info = calculate_buyer_match_score(
            lot_crop=l.crop,
            lot_quantity=l.available_qty_kg,
            lot_grade=l.quality_grade,
            lot_expected_price=l.expected_price_per_kg,
            lot_location=l.location,
            buyer_crop=l.crop,
            buyer_min_qty=100.0,
            buyer_max_qty=5000.0,
            buyer_grade_pref="Grade A",
            buyer_offered_price=l.expected_price_per_kg,
            buyer_reliability_pct=94.0,
            buyer_on_time_pay_pct=96.0,
            distance_km=42.0
        )

        results.append({
            "id": l.id,
            "crop": l.crop,
            "variety": l.variety,
            "farmer_name": l.farmer_name,
            "farmer_verified": True,
            "quantity_total_kg": l.quantity_kg,
            "quantity_available_kg": l.available_qty_kg,
            "unit": l.unit,
            "quality_grade": l.quality_grade,
            "harvest_date": l.harvest_date,
            "location": l.location,
            "expected_price_per_kg": l.expected_price_per_kg,
            "packaging_type": l.packaging_type,
            "delivery_preference": l.delivery_preference,
            "ai_match_score": score_info["match_percentage"],
            "ai_match_reasons": score_info["reasons"],
            "estimated_logistics_cost": 1600.0,
            "status": l.status,
            "created_at": l.created_at.strftime("%Y-%m-%d %H:%M")
        })

    return results
