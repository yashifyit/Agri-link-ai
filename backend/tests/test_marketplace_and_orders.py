import pytest
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_marketplace_and_concurrency_flow():
    # 1. Login as Farmer
    farmer_login = client.post("/api/v1/auth/login", json={
        "username": "9876543210",
        "password": "demo1234"
    })
    assert farmer_login.status_code == 200
    farmer_token = farmer_login.json()["access_token"]

    # 2. Farmer creates a new crop lot
    create_lot_res = client.post(
        "/api/v1/lots",
        headers={"Authorization": f"Bearer {farmer_token}"},
        json={
            "crop": "Tomato",
            "variety": "Avinash 2",
            "quantity_kg": 500.0,
            "expected_price_per_kg": 32.0,
            "quality_grade": "Grade A",
            "location": "Kanpur, Uttar Pradesh",
            "harvest_date": "2026-08-26"
        }
    )
    assert create_lot_res.status_code == 201
    lot_data = create_lot_res.json()
    lot_id = lot_data["id"]
    assert lot_data["available_qty_kg"] == 500.0

    # 3. Buyer browses marketplace
    mkt_res = client.get("/api/v1/marketplace?crop=Tomato")
    assert mkt_res.status_code == 200
    lots_list = mkt_res.json()
    assert any(l["id"] == lot_id for l in lots_list)

    # 4. Login as Buyer
    buyer_login = client.post("/api/v1/auth/login", json={
        "username": "9876543212",
        "password": "demo1234"
    })
    assert buyer_login.status_code == 200
    buyer_token = buyer_login.json()["access_token"]

    # 5. Buyer purchases 200kg out of 500kg
    order_res = client.post(
        "/api/v1/orders",
        headers={"Authorization": f"Bearer {buyer_token}"},
        json={
            "lot_id": lot_id,
            "quantity_kg": 200.0,
            "delivery_address": "Processing Center, Lucknow"
        }
    )
    assert order_res.status_code == 201
    order_data = order_res.json()
    order_id = order_data["order"]["id"]
    assert order_data["order"]["quantity_kg"] == 200.0

    # 6. Verify remaining available inventory is now 300kg (Requirement 9)
    lot_check = client.get(f"/api/v1/lots/{lot_id}")
    assert lot_check.status_code == 200
    assert lot_check.json()["available_qty_kg"] == 300.0

    # 7. Concurrency / Overselling Protection Test (Requirement 35)
    # Buyer attempts to order 400kg when only 300kg is available -> MUST return 400 Insufficient Inventory
    oversell_res = client.post(
        "/api/v1/orders",
        headers={"Authorization": f"Bearer {buyer_token}"},
        json={
            "lot_id": lot_id,
            "quantity_kg": 400.0,
            "delivery_address": "Processing Center, Lucknow"
        }
    )
    assert oversell_res.status_code == 400
    assert "Insufficient inventory" in oversell_res.json()["detail"]

    # 8. Payment Flow (Requirement 12 & 34)
    # A. Initiate Payment
    pay_order_res = client.post(
        "/api/v1/payments/create-order",
        headers={"Authorization": f"Bearer {buyer_token}"},
        json={"order_id": order_id}
    )
    assert pay_order_res.status_code == 200
    pay_data = pay_order_res.json()
    rzp_order_id = pay_data["razorpay_order_id"]

    # B. Verify Payment (using sandbox test signature)
    verify_res = client.post(
        "/api/v1/payments/verify",
        headers={"Authorization": f"Bearer {buyer_token}"},
        json={
            "order_id": order_id,
            "razorpay_order_id": rzp_order_id,
            "razorpay_payment_id": "pay_test_sih_882910",
            "razorpay_signature": "mock_signature_valid"
        }
    )
    assert verify_res.status_code == 200
    assert verify_res.json()["success"] is True

    # 9. Verify Order is PAID and Logistics is Scheduled (Requirement 14 & 16)
    order_status_res = client.get(f"/api/v1/orders/{order_id}")
    assert order_status_res.status_code == 200
    assert order_status_res.json()["order"]["payment_status"] == "SUCCESS"
    assert order_status_res.json()["order"]["status"] == "PAID"
    assert order_status_res.json()["shipment"]["status"] == "PICKUP_SCHEDULED"

    # 10. Logistics Partner progresses shipment to IN_TRANSIT and DELIVERED
    shipment_id = order_status_res.json()["shipment"]["id"]
    logistics_update = client.patch(
        f"/api/v1/shipments/{shipment_id}/status",
        headers={"Authorization": f"Bearer {buyer_token}"},
        json={"status": "IN_TRANSIT", "location_note": "On Highway NH27"}
    )
    assert logistics_update.status_code == 200
    assert logistics_update.json()["status"] == "IN_TRANSIT"

    # Complete Delivery -> Triggers Escrow Settlement
    delivery_update = client.patch(
        f"/api/v1/shipments/{shipment_id}/status",
        headers={"Authorization": f"Bearer {buyer_token}"},
        json={"status": "DELIVERED", "location_note": "Delivered to Lucknow warehouse"}
    )
    assert delivery_update.status_code == 200
    assert delivery_update.json()["status"] == "DELIVERED"
