from typing import Dict, Any, Optional
from datetime import datetime, timedelta

def calculate_logistics_cost(
    distance_km: float,
    weight_kg: float,
    vehicle_type: str = "Mini Truck 1.5T",
    cold_chain_required: bool = False,
    loading_required: bool = True
) -> Dict[str, Any]:
    """
    Dynamic Agricultural Freight Pricing:
    Base charge + distance * rate_per_km + loading/unloading + cold_chain
    """
    # 1. Base charge according to vehicle size
    base_charge = 600.0 if weight_kg <= 1000 else 1200.0
    if "Reefer" in vehicle_type or cold_chain_required:
        base_charge += 800.0

    # 2. Per-km rate
    per_km_rate = 18.0 if weight_kg <= 1000 else 28.0
    if cold_chain_required:
        per_km_rate += 8.0

    distance_charge = round(distance_km * per_km_rate, 2)

    # 3. Handling charges
    loading_charge = 400.0 if loading_required else 0.0
    unloading_charge = 400.0 if loading_required else 0.0

    # 4. Cold-chain power surcharge
    cold_chain_charge = 500.0 if cold_chain_required else 0.0

    total_logistics_cost = round(
        base_charge + distance_charge + loading_charge + unloading_charge + cold_chain_charge, 2
    )

    estimated_hours = max(1.5, round((distance_km / 35.0) + (1.0 if loading_required else 0.5), 1))

    return {
        "distance_km": distance_km,
        "weight_kg": weight_kg,
        "vehicle_type": vehicle_type,
        "base_charge": base_charge,
        "distance_charge": distance_charge,
        "loading_charge": loading_charge,
        "unloading_charge": unloading_charge,
        "cold_chain_charge": cold_chain_charge,
        "total_logistics_cost": total_logistics_cost,
        "estimated_transit_hours": estimated_hours,
        "estimated_pickup_window": "Within 4 Hours"
    }

VALID_SHIPMENT_TRANSITIONS = {
    "UNASSIGNED": ["ASSIGNED", "CANCELLED"],
    "ASSIGNED": ["PICKUP_SCHEDULED", "CANCELLED"],
    "PICKUP_SCHEDULED": ["PICKED_UP", "CANCELLED"],
    "PICKED_UP": ["IN_TRANSIT", "FAILED"],
    "IN_TRANSIT": ["OUT_FOR_DELIVERY", "FAILED"],
    "OUT_FOR_DELIVERY": ["DELIVERED", "FAILED"],
    "DELIVERED": [],
    "FAILED": ["PICKUP_SCHEDULED", "CANCELLED"],
    "CANCELLED": []
}

def is_valid_shipment_transition(current_status: str, next_status: str) -> bool:
    allowed = VALID_SHIPMENT_TRANSITIONS.get(current_status, [])
    return next_status in allowed
