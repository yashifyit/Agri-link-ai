import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pytest
from app.algorithms.engine import calculate_net_realization, calculate_buyer_match_score, generate_ai_sale_recommendation


def test_critical_business_logic_requirement_60():
    """
    Requirement 60 test:
    Given:
    Quantity = 800kg
    Buyer price = ₹33/kg
    Transport = ₹1600
    Storage = ₹0
    
    Expected:
    Gross = ₹26,400
    Net = ₹24,800
    Net/kg = ₹31.00
    """
    res = calculate_net_realization(
        quantity_kg=800,
        price_per_kg=33.0,
        transport_cost=1600.0,
        storage_cost=0.0
    )
    
    assert res["gross"] == 26400.0, f"Expected 26400, got {res['gross']}"
    assert res["net_realization"] == 24800.0, f"Expected 24800, got {res['net_realization']}"
    assert res["net_per_kg"] == 31.0, f"Expected 31.0, got {res['net_per_kg']}"
    print("Requirement 60 Net Realization Test PASSED!")

def test_ai_sale_recommendation():
    rec = generate_ai_sale_recommendation(
        crop="Tomato",
        quantity_kg=800,
        grade="Grade A",
        location="Kanpur",
        local_mandi_modal_price=28.0,
        best_buyer_offer_price=33.0,
        best_buyer_name="FreshHarvest Foods",
        best_buyer_reliability=94.0,
        transport_cost=1600.0,
        forecast_3d_price=31.0
    )
    
    assert rec["action"] == "SELL_NOW"
    assert rec["net_realization"] == 24800.0
    assert rec["improvement_vs_local"] > 0
    assert rec["confidence_percentage"] >= 80

if __name__ == "__main__":
    test_critical_business_logic_requirement_60()
    test_ai_sale_recommendation()
    print("All unit tests passed successfully!")
