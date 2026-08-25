from fastapi import APIRouter, Depends, HTTPException, Query, Header
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import json
import requests

from app.database import get_db
from app.models.all_models import (
    User, Market, MarketPrice, Lot, BuyerRequirement, Offer, Transaction, Dispute,
    SystemConfig, Crop, AIChatConversation, AIChatMessage, AIAuditLog
)
from app.algorithms.engine import (
    calculate_net_realization, calculate_buyer_match_score,
    generate_ai_sale_recommendation, detect_price_anomaly
)
from app.services.gemini_service import process_ai_chat_query
from app.services.image_provider import ImageProvider

router = APIRouter()

# 1. Market Data Endpoints
@router.get("/markets")
def get_markets(db: Session = Depends(get_db)):
    return db.query(Market).all()

@router.get("/prices")
def get_prices(crop: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(MarketPrice, Market).join(Market, MarketPrice.market_id == Market.id)
    if crop:
        query = query.filter(MarketPrice.crop_name.ilike(f"%{crop}%"))
    
    results = []
    for price, market in query.all():
        results.append({
            "id": price.id,
            "market_name": market.name,
            "district": market.district,
            "state": market.state,
            "crop": price.crop_name,
            "min_price": price.min_price,
            "modal_price": price.modal_price,
            "max_price": price.max_price,
            "arrival_qty_tons": price.arrival_qty_tons,
            "updated_at": price.updated_at.strftime("%Y-%m-%d %H:%M")
        })
    return results

@router.get("/market-comparison")
def get_market_comparison(
    crop: str = "Tomato",
    quantity_kg: float = 800.0,
    farmer_location: str = "Kanpur",
    db: Session = Depends(get_db)
):
    market_prices = db.query(MarketPrice, Market).join(Market, MarketPrice.market_id == Market.id).filter(MarketPrice.crop_name.ilike(f"%{crop}%")).all()
    
    comparisons = []
    for price, market in market_prices:
        dist_map = {"Kanpur": 10, "Unnao": 25, "Lucknow": 85, "Pune": 1200, "Nashik": 1100, "Nagpur": 750}
        dist = dist_map.get(market.district, 50)
        
        if dist <= 15:
            transport_total = 160.0
        elif dist <= 35:
            transport_total = 640.0
        elif dist <= 100:
            transport_total = 960.0
        else:
            transport_total = dist * 2.5
            
        net_calc = calculate_net_realization(quantity_kg, price.modal_price, transport_total)
        
        comparisons.append({
            "market_name": market.name,
            "district": market.district,
            "distance_km": dist,
            "market_price": price.modal_price,
            "transport_cost": net_calc["transport_cost"],
            "net_realization": net_calc["net_realization"],
            "net_per_kg": net_calc["net_per_kg"]
        })
        
    comparisons.sort(key=lambda x: x["net_realization"], reverse=True)
    return comparisons

# 2. AI Recommendation Endpoint
@router.get("/recommendations")
def get_recommendation(
    crop: str = "Tomato",
    quantity_kg: float = 800.0,
    grade: str = "Grade A",
    location: str = "Kanpur",
    db: Session = Depends(get_db)
):
    mandi = db.query(MarketPrice, Market).join(Market, MarketPrice.market_id == Market.id).filter(MarketPrice.crop_name.ilike(f"%{crop}%"), Market.name.ilike(f"%{location}%")).first()
    m_price = mandi[0].modal_price if mandi else 28.0
    
    best_buyer = db.query(BuyerRequirement).filter(BuyerRequirement.crop.ilike(f"%{crop}%")).first()
    b_price = 33.0 if best_buyer and best_buyer.id == 1 else 28.0
    b_name = best_buyer.buyer_name if best_buyer else "FreshHarvest Foods"
    b_rel = best_buyer.reliability_score if best_buyer else 94.0

    rec = generate_ai_sale_recommendation(
        crop=crop,
        quantity_kg=quantity_kg,
        grade=grade,
        location=location,
        local_mandi_modal_price=m_price,
        best_buyer_offer_price=b_price,
        best_buyer_name=b_name,
        best_buyer_reliability=b_rel,
        transport_cost=1600.0,
        forecast_3d_price=m_price + 3.0,
        storage_available=False
    )
    return rec

# 3. Lots Endpoints
@router.get("/lots")
def get_lots(db: Session = Depends(get_db)):
    return db.query(Lot).order_by(Lot.created_at.desc()).all()

@router.post("/lots")
def create_lot(lot_data: dict, db: Session = Depends(get_db)):
    crop_name = lot_data.get("crop", "Tomato")
    # Verify crop exists and is active in Dynamic Catalog
    crop = db.query(Crop).filter(Crop.name.ilike(crop_name), Crop.is_active == True).first()
    if not crop:
        raise HTTPException(status_code=400, detail=f"Crop '{crop_name}' is not supported in the active catalogue.")
        
    lot_id = f"KL-LOT-{db.query(Lot).count() + 10493}"
    new_lot = Lot(
        id=lot_id,
        farmer_name=lot_data.get("farmer_name", "Ramesh Verma"),
        crop=crop.name,
        variety=lot_data.get("variety", "Desi Red"),
        quantity_kg=float(lot_data.get("quantity_kg", 800)),
        quality_grade=lot_data.get("quality_grade", "Grade A"),
        harvest_date=lot_data.get("harvest_date", datetime.utcnow().strftime("%Y-%m-%d")),
        location=lot_data.get("location", "Kanpur, Uttar Pradesh"),
        expected_price_per_kg=float(lot_data.get("expected_price_per_kg", 32)),
        is_fpo_aggregated=bool(lot_data.get("is_fpo_aggregated", False)),
        fpo_name=lot_data.get("fpo_name"),
        status="ACTIVE"
    )
    db.add(new_lot)
    
    # Automatically spawn a matching buyer offer for demo journey flow!
    offer_id = f"KL-OFF-{db.query(Offer).count() + 8832}"
    auto_offer = Offer(
        id=offer_id,
        lot_id=lot_id,
        buyer_name="FreshHarvest Foods",
        offered_price_per_kg=33.0,
        quantity_kg=new_lot.quantity_kg,
        transport_estimate=1600.0,
        gross_total=new_lot.quantity_kg * 33.0,
        net_realization=(new_lot.quantity_kg * 33.0) - 1600.0,
        status="PENDING"
    )
    db.add(auto_offer)
    db.commit()
    db.refresh(new_lot)
    return new_lot

# 4. Buyer Requirements & Discovery
@router.get("/buyers")
def get_buyers(db: Session = Depends(get_db)):
    return db.query(BuyerRequirement).all()

@router.post("/buyers")
def create_buyer_requirement(req_data: dict, db: Session = Depends(get_db)):
    req_id = db.query(BuyerRequirement).count() + 3
    new_req = BuyerRequirement(
        id=req_id,
        buyer_name=req_data.get("buyer_name", "Maharashtra Agro Procure"),
        company_name=req_data.get("company_name", "Maharashtra Agro Procure Ltd"),
        crop=req_data.get("crop", "Tomato"),
        required_qty_kg=float(req_data.get("required_qty_kg", 10000)),
        min_grade=req_data.get("min_grade", "Grade A"),
        target_price_min=float(req_data.get("target_price_min", 30)),
        target_price_max=float(req_data.get("target_price_max", 35)),
        delivery_location=req_data.get("delivery_location", "Pune"),
        reliability_score=95.0,
        on_time_payment_pct=97.0
    )
    db.add(new_req)
    db.commit()
    db.refresh(new_req)
    return new_req

@router.get("/matches")
def get_buyer_matches(
    crop: str = "Tomato",
    quantity_kg: float = 800.0,
    grade: str = "Grade A",
    expected_price: float = 32.0,
    location: str = "Kanpur",
    db: Session = Depends(get_db)
):
    buyers = db.query(BuyerRequirement).all()
    matches = []
    for b in buyers:
        dist = 42.0 if "Lucknow" in b.delivery_location else 1100.0
        offered = 33.0 if b.id == 1 else 26.0
        score_info = calculate_buyer_match_score(
            lot_crop=crop,
            lot_quantity=quantity_kg,
            lot_grade=grade,
            lot_expected_price=expected_price,
            lot_location=location,
            buyer_crop=b.crop,
            buyer_min_qty=b.required_qty_kg * 0.1,
            buyer_max_qty=b.required_qty_kg,
            buyer_grade_pref=b.min_grade,
            buyer_offered_price=offered,
            buyer_reliability_pct=b.reliability_score,
            buyer_on_time_pay_pct=b.on_time_payment_pct,
            distance_km=dist
        )
        matches.append({
            "buyer_id": b.id,
            "buyer_name": b.buyer_name,
            "company_name": b.company_name,
            "crop": b.crop,
            "required_qty_kg": b.required_qty_kg,
            "offered_price_per_kg": offered,
            "distance_km": dist,
            "match_percentage": score_info["match_percentage"],
            "reliability_score": b.reliability_score,
            "reasons": score_info["reasons"]
        })
    matches.sort(key=lambda x: x["match_percentage"], reverse=True)
    return matches

# 5. Offers & Counteroffers
@router.get("/offers")
def get_offers(db: Session = Depends(get_db)):
    return db.query(Offer).order_by(Offer.created_at.desc()).all()

@router.post("/offers/{offer_id}/counter")
def counter_offer(offer_id: str, payload: dict, db: Session = Depends(get_db)):
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
        
    if offer.status in ["ACCEPTED", "REJECTED", "EXPIRED"]:
        raise HTTPException(status_code=400, detail=f"Cannot counter offer in state: {offer.status}")
    
    new_price = float(payload.get("counter_price", offer.offered_price_per_kg))
    offer.offered_price_per_kg = new_price
    offer.gross_total = offer.quantity_kg * new_price
    offer.net_realization = offer.gross_total - offer.transport_estimate
    offer.status = "COUNTERED"
    offer.last_counter_by = payload.get("by", "FARMER")
    
    # Update lot status state machine
    lot = db.query(Lot).filter(Lot.id == offer.lot_id).first()
    if lot:
        lot.status = "OFFER_RECEIVED"
        
    db.commit()
    db.refresh(offer)
    return offer

@router.post("/offers/{offer_id}/accept")
def accept_offer(offer_id: str, db: Session = Depends(get_db)):
    try:
        offer = db.query(Offer).filter(Offer.id == offer_id).first()
        if not offer:
            raise HTTPException(status_code=404, detail="Offer not found")
        
        if offer.status in ["ACCEPTED", "REJECTED", "EXPIRED"]:
            raise HTTPException(status_code=400, detail=f"Cannot accept offer in state: {offer.status}")
            
        lot = db.query(Lot).filter(Lot.id == offer.lot_id).first()
        if not lot:
            raise HTTPException(status_code=404, detail="Corresponding lot not found")
            
        # Atomically update statuses (Rule 52 database transaction consistency)
        offer.status = "ACCEPTED"
        lot.status = "SOLD"
        
        # Expire other active offers on the same lot
        other_offers = db.query(Offer).filter(Offer.lot_id == lot.id, Offer.id != offer.id).all()
        for off in other_offers:
            if off.status in ["PENDING", "COUNTERED"]:
                off.status = "EXPIRED"
                
        # Create Transaction
        txn_id = f"KL-TXN-{db.query(Transaction).count() + 10493}"
        txn = Transaction(
            id=txn_id,
            lot_id=offer.lot_id,
            offer_id=offer.id,
            farmer_name=lot.farmer_name,
            buyer_name=offer.buyer_name,
            crop=lot.crop,
            quantity_kg=offer.quantity_kg,
            agreed_price_per_kg=offer.offered_price_per_kg,
            gross_value=offer.gross_total,
            transport_cost=offer.transport_estimate,
            net_realization=offer.net_realization,
            vehicle_number="UP78 AB 1234",
            driver_name="Ravi Kumar",
            origin="Kanpur",
            destination="Lucknow",
            status="TRANSACTION_CREATED",
            payment_status="PENDING"
        )
        db.add(txn)
        db.commit()
        db.refresh(txn)
        return {"message": "Offer accepted and transaction created", "transaction": txn}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Transaction rolled back: {str(e)}")

# 6. Transactions & Logistics
@router.get("/transactions")
def get_transactions(db: Session = Depends(get_db)):
    return db.query(Transaction).order_by(Transaction.created_at.desc()).all()

@router.post("/transactions/{transaction_id}/status")
def update_transaction_status(transaction_id: str, payload: dict, db: Session = Depends(get_db)):
    txn = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    new_status = payload.get("status")
    valid_states = ["TRANSACTION_CREATED", "PICKUP_SCHEDULED", "IN_TRANSIT", "DELIVERED"]
    if new_status not in valid_states:
        raise HTTPException(status_code=400, detail=f"Invalid transaction status state: {new_status}")
    
    txn.status = new_status
    db.commit()
    db.refresh(txn)
    return txn

@router.post("/transactions/{transaction_id}/payment")
def update_transaction_payment(transaction_id: str, payload: dict, db: Session = Depends(get_db)):
    txn = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    new_status = payload.get("status")
    valid_states = ["PENDING", "PROCESSING", "COMPLETED", "FAILED"]
    if new_status not in valid_states:
        raise HTTPException(status_code=400, detail=f"Invalid payment status state: {new_status}")
        
    txn.payment_status = new_status
    
    if new_status == "COMPLETED":
        txn.status = "PAYMENT_COMPLETED"
        lot = db.query(Lot).filter(Lot.id == txn.lot_id).first()
        if lot:
            lot.status = "COMPLETED"
            
    db.commit()
    db.refresh(txn)
    return txn

# 7. Disputes
@router.get("/disputes")
def get_disputes(db: Session = Depends(get_db)):
    return db.query(Dispute).all()

@router.post("/disputes")
def raise_dispute(dispute_data: dict, db: Session = Depends(get_db)):
    txn_id = dispute_data.get("transaction_id", "KL-TXN-10491")
    txn = db.query(Transaction).filter(Transaction.id == txn_id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    disp_id = f"KL-DSP-{db.query(Dispute).count() + 101}"
    new_disp = Dispute(
        id=disp_id,
        transaction_id=txn_id,
        raised_by=dispute_data.get("raised_by", "Ramesh Verma"),
        category=dispute_data.get("category", "Payment issue"),
        description=dispute_data.get("description", "Payment delayed beyond 24 hours"),
        status="OPEN"
    )
    
    # Mark transaction as disputed
    txn.status = "DISPUTED"
    
    db.add(new_disp)
    db.commit()
    db.refresh(new_disp)
    return new_disp

# 8. Dynamic Crop Catalog Endpoints
@router.get("/crops")
def get_crops(db: Session = Depends(get_db)):
    crops = db.query(Crop).filter(Crop.is_active == True).all()
    # Resolve images dynamically from the internet if blank
    for crop in crops:
        if not crop.image or not crop.image.strip() or crop.image == "string":
            crop.image = ImageProvider.get_image(f"{crop.name} crop india", "crop")
    return crops

@router.post("/admin/crops")
def create_crop(crop_data: dict, db: Session = Depends(get_db)):
    name = crop_data.get("name", "").strip()
    if not name:
        raise HTTPException(status_code=400, detail="Crop name is required")
        
    existing = db.query(Crop).filter(Crop.name.ilike(name)).first()
    if existing:
        existing.is_active = True
        existing.category = crop_data.get("category", existing.category)
        existing.hindi_name = crop_data.get("hindi_name", existing.hindi_name)
        existing.marathi_name = crop_data.get("marathi_name", existing.marathi_name)
        existing.unit = crop_data.get("unit", existing.unit)
        existing.season = crop_data.get("season", existing.season)
        existing.quality_grades = crop_data.get("quality_grades", existing.quality_grades)
        existing.water_requirement = crop_data.get("water_requirement", existing.water_requirement)
        existing.storage_type = crop_data.get("storage_type", existing.storage_type)
        existing.image = crop_data.get("image", existing.image)
        db.commit()
        return existing
        
    crop_id = db.query(Crop).count() + 1
    image_url = crop_data.get("image")
    if not image_url or not image_url.strip() or image_url == "string":
        image_url = ImageProvider.get_image(f"{name} crop india", "crop")
        
    new_crop = Crop(
        id=crop_id,
        name=name,
        category=crop_data.get("category", "Vegetables"),
        hindi_name=crop_data.get("hindi_name"),
        marathi_name=crop_data.get("marathi_name"),
        unit=crop_data.get("unit", "kg"),
        season=crop_data.get("season", "Kharif, Rabi"),
        quality_grades=crop_data.get("quality_grades", "Grade A, Grade B, Grade C"),
        water_requirement=crop_data.get("water_requirement", "Medium"),
        storage_type=crop_data.get("storage_type", "Cold Storage"),
        image=image_url,
        is_active=True
    )
    db.add(new_crop)
    db.commit()
    db.refresh(new_crop)
    return new_crop

@router.put("/admin/crops/{crop_id}")
def update_crop(crop_id: int, crop_data: dict, db: Session = Depends(get_db)):
    crop = db.query(Crop).filter(Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
        
    crop.name = crop_data.get("name", crop.name)
    crop.category = crop_data.get("category", crop.category)
    crop.hindi_name = crop_data.get("hindi_name", crop.hindi_name)
    crop.marathi_name = crop_data.get("marathi_name", crop.marathi_name)
    crop.unit = crop_data.get("unit", crop.unit)
    crop.season = crop_data.get("season", crop.season)
    crop.quality_grades = crop_data.get("quality_grades", crop.quality_grades)
    crop.water_requirement = crop_data.get("water_requirement", crop.water_requirement)
    crop.storage_type = crop_data.get("storage_type", crop.storage_type)
    
    image_url = crop_data.get("image")
    if image_url and (not image_url.strip() or image_url == "string"):
        crop.image = ImageProvider.get_image(f"{crop.name} crop india", "crop")
    elif image_url:
        crop.image = image_url
        
    crop.is_active = crop_data.get("is_active", crop.is_active)
    
    db.commit()
    db.refresh(crop)
    return crop

# 9. Admin Settings Configuration
@router.get("/admin/config")
def get_admin_config(db: Session = Depends(get_db)):
    configs = db.query(SystemConfig).all()
    res = {}
    for c in configs:
        if c.key == "gemini_api_key":
            val = c.value or ""
            if len(val) > 8:
                res[c.key] = val[:4] + "••••••••" + val[-4:]
            else:
                res[c.key] = "••••••••" if val else ""
        else:
            res[c.key] = c.value
    return res

@router.post("/admin/config")
def save_admin_config(payload: dict, db: Session = Depends(get_db)):
    for key, value in payload.items():
        cfg = db.query(SystemConfig).filter(SystemConfig.key == key).first()
        if not cfg:
            cfg = SystemConfig(key=key)
            db.add(cfg)
            
        if key == "gemini_api_key" and ("••••" in str(value) or str(value) == ""):
            if cfg.value:
                continue
                
        cfg.value = str(value)
    db.commit()
    return {"message": "Configuration saved successfully"}

@router.post("/admin/config/test-connection")
def test_gemini_connection(db: Session = Depends(get_db)):
    configs = {c.key: c.value for c in db.query(SystemConfig).all()}
    api_key = configs.get("gemini_api_key", "").strip()
    model_name = configs.get("gemini_model", "gemini-3.5-flash").strip()
    
    if not api_key:
        raise HTTPException(status_code=400, detail="Gemini API Key is not configured. Please save a valid key first.")
        
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
    payload = {
        "contents": [{"parts": [{"text": "Hello. Response in 2 words."}]}]
    }
    try:
        res = requests.post(url, json=payload, timeout=6)
        if res.status_code == 200:
            return {"status": "success", "message": "Gemini connection successful", "model": model_name}
        else:
            return {"status": "error", "message": f"Connection failed (HTTP {res.status_code}): {res.text}"}
    except Exception as e:
        return {"status": "error", "message": f"Network or timeout error: {str(e)}"}

# 10. AI Chat assistant Endpoints
@router.post("/ai/chat")
def ai_chat(payload: dict, db: Session = Depends(get_db)):
    query = payload.get("query", "").strip()
    user_role = payload.get("user_role", "FARMER")
    user_id = payload.get("user_id", "1")
    conversation_id = payload.get("conversation_id")
    
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")
        
    result = process_ai_chat_query(
        query=query,
        user_role=user_role,
        user_id=user_id,
        conversation_id=conversation_id,
        db=db
    )
    return result

@router.get("/ai/conversations")
def get_ai_conversations(user_id: str = "1", db: Session = Depends(get_db)):
    convs = db.query(AIChatConversation).filter(AIChatConversation.user_id == user_id).order_by(AIChatConversation.created_at.desc()).all()
    return [
        {
            "id": c.id,
            "title": c.title,
            "created_at": c.created_at.strftime("%d %b %Y, %I:%M %p")
        }
        for c in convs
    ]

@router.get("/ai/conversations/{conversation_id}")
def get_ai_conversation_messages(conversation_id: str, db: Session = Depends(get_db)):
    msgs = db.query(AIChatMessage).filter(AIChatMessage.conversation_id == conversation_id).order_by(AIChatMessage.id.asc()).all()
    return [
        {
            "role": m.role,
            "content": m.content,
            "tool_calls": json.loads(m.tool_calls) if m.tool_calls else [],
            "sources": json.loads(m.sources) if m.sources else [],
            "created_at": m.created_at.strftime("%I:%M %p")
        }
        for m in msgs
    ]

@router.delete("/ai/conversations/{conversation_id}")
def delete_ai_conversation(conversation_id: str, db: Session = Depends(get_db)):
    db.query(AIChatMessage).filter(AIChatMessage.conversation_id == conversation_id).delete()
    db.query(AIChatConversation).filter(AIChatConversation.id == conversation_id).delete()
    db.commit()
    return {"message": "Conversation deleted successfully"}

# 11. Search Across All Entities Endpoint
@router.get("/search")
def search_system(q: str = Query("", min_length=1), db: Session = Depends(get_db)):
    if not q:
        return {"crops": [], "markets": [], "buyers": [], "lots": [], "transactions": []}
        
    term = f"%{q}%"
    crops = db.query(Crop).filter(
        (Crop.name.ilike(term) | Crop.hindi_name.ilike(term) | Crop.marathi_name.ilike(term)),
        Crop.is_active == True
    ).all()
    markets = db.query(Market).filter(Market.name.ilike(term) | Market.district.ilike(term)).all()
    buyers = db.query(BuyerRequirement).filter(BuyerRequirement.buyer_name.ilike(term) | BuyerRequirement.company_name.ilike(term)).all()
    lots = db.query(Lot).filter(Lot.id.ilike(term) | Lot.crop.ilike(term) | Lot.farmer_name.ilike(term)).all()
    txns = db.query(Transaction).filter(Transaction.id.ilike(term) | Transaction.crop.ilike(term) | Transaction.farmer_name.ilike(term) | Transaction.buyer_name.ilike(term)).all()
    
    return {
        "crops": [c.name for c in crops],
        "markets": [{"id": m.id, "name": m.name, "district": m.district} for m in markets],
        "buyers": [{"id": b.id, "buyer_name": b.buyer_name, "company": b.company_name} for b in buyers],
        "lots": [{"id": l.id, "crop": l.crop, "quantity": l.quantity_kg, "farmer": l.farmer_name, "status": l.status} for l in lots],
        "transactions": [{"id": t.id, "crop": t.crop, "quantity": t.quantity_kg, "farmer": t.farmer_name, "buyer": t.buyer_name, "status": t.status} for t in txns]
    }

# 12. Admin Command Center Analytics & Anomaly Detection
@router.get("/admin/analytics")
def get_admin_analytics(db: Session = Depends(get_db)):
    active_lots = db.query(Lot).filter(Lot.status == "ACTIVE").count()
    active_buyers = db.query(BuyerRequirement).count()
    txns = db.query(Transaction).all()
    gmv = sum(t.gross_value for t in txns) + 48200000.0
    
    prices = db.query(MarketPrice, Market).join(Market, MarketPrice.market_id == Market.id).all()
    anomalies = []
    regional_avg = 31.0
    for price, market in prices:
        anom = detect_price_anomaly(market.name, price.crop_name, price.modal_price, regional_avg)
        if anom:
            anomalies.append(anom)
            
    return {
        "active_farmers": 18420,
        "active_buyers": active_buyers,
        "todays_lots": active_lots,
        "transactions_count": len(txns),
        "gmv_inr": gmv,
        "avg_price_improvement_pct": 8.7,
        "anomalies": anomalies
    }

# 13. AgriOS Autonomous Intelligence Layer Sub-Router
from app.routes.agrios_router import router as agrios_sub_router
router.include_router(agrios_sub_router)

