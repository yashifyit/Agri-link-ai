import pytest
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
from app.models.all_models import User, UserRole, Lot, LotStatus, Order, Payment, Shipment

client = TestClient(app)

def test_health_endpoints():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

    ready_res = client.get("/ready")
    assert ready_res.status_code == 200
    assert ready_res.json()["status"] == "ready"

def test_auth_flow():
    # 1. Login with seeded farmer
    res = client.post("/api/v1/auth/login", json={
        "username": "9876543210",
        "password": "demo1234"
    })
    assert res.status_code == 200, f"Login failed: {res.text}"
    data = res.json()
    assert data["success"] is True
    assert "access_token" in data
    assert data["user"]["role"] == "FARMER"
    
    token = data["access_token"]
    refresh = data["refresh_token"]

    # 2. Test /me with Bearer token
    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["name"] == "Ramesh Verma"

    # 3. Test token refresh
    ref_res = client.post("/api/v1/auth/refresh", json={"refresh_token": refresh})
    assert ref_res.status_code == 200
    assert "access_token" in ref_res.json()

def test_register_new_buyer():
    phone = f"991122{int(os.getpid()) % 10000:04d}"
    res = client.post("/api/v1/auth/register", json={
        "name": "Reliance Agri Retail",
        "phone": phone,
        "email": f"procure_{phone}@relianceagri.com",
        "password": "SecurePassword123!",
        "role": "BUYER",
        "location": "Mumbai, Maharashtra",
        "business_name": "Reliance Retail Agri Sourcing Ltd",
        "gstin": "27AAACR1234P1Z1"
    })
    assert res.status_code == 201
    assert res.json()["user"]["role"] == "BUYER"

def test_unauthenticated_protected_endpoint_rejected():
    # Admin config requires ADMIN role
    res = client.get("/api/v1/admin/config")
    assert res.status_code == 401
    assert "detail" in res.json()

    # Admin crops requires ADMIN role
    res_crop = client.post("/api/v1/admin/crops", json={"name": "Barley", "category": "Cereal"})
    assert res_crop.status_code == 401

    # Accept offer requires FARMER or FPO authentication
    res_offer = client.post("/api/v1/offers/1/accept")
    assert res_offer.status_code == 401

def test_header_spoofing_rejected():
    # Client sending fake X-User-Role / X-User-Id without a valid signed JWT must be rejected
    headers = {
        "X-User-Role": "ADMIN",
        "X-User-Id": "5"
    }
    res = client.get("/api/v1/admin/config", headers=headers)
    assert res.status_code == 401

    res_crops = client.post("/api/v1/admin/crops", json={"name": "Barley"}, headers=headers)
    assert res_crops.status_code == 401

def test_fake_demo_jwt_rejected():
    # Previous insecure fallback allowed 'demo-jwt-*' without verification; now it must be rejected
    res = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer demo-jwt-farmer-12345"})
    assert res.status_code == 401

    res_admin = client.get("/api/v1/admin/config", headers={"Authorization": "Bearer demo-jwt-admin-99999"})
    assert res_admin.status_code == 401

def test_invalid_jwt_rejected():
    res = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer this.is.an.invalid.jwt.signature"})
    assert res.status_code == 401

def test_rbac_farmer_cannot_access_admin():
    # Login as seeded farmer
    login_res = client.post("/api/v1/auth/login", json={
        "username": "9876543210",
        "password": "demo1234"
    })
    assert login_res.status_code == 200
    farmer_token = login_res.json()["access_token"]

    # Farmer attempts to access admin config -> 403 Forbidden
    res = client.get("/api/v1/admin/config", headers={"Authorization": f"Bearer {farmer_token}"})
    assert res.status_code == 403

    # Farmer attempts to add crop to admin catalog -> 403 Forbidden
    res_crop = client.post(
        "/api/v1/admin/crops", 
        json={"name": "Special Seed", "category": "Pulse"},
        headers={"Authorization": f"Bearer {farmer_token}"}
    )
    assert res_crop.status_code == 403

def test_admin_can_access_admin_endpoint():
    # Login as seeded admin
    login_res = client.post("/api/v1/auth/login", json={
        "username": "9876543213",
        "password": "demo1234"
    })
    assert login_res.status_code == 200
    admin_token = login_res.json()["access_token"]

    # Admin access admin config -> 200 OK
    res = client.get("/api/v1/admin/config", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    assert "enable_ai" in res.json()

def test_agrios_command_center_endpoints():
    # 1. System status
    res_status = client.get("/api/v1/agrios/status")
    assert res_status.status_code == 200
    st = res_status.json()
    assert st["status"] == "OPERATIONAL"
    assert st["agentCount"] == 24
    assert st["topicCount"] == 135

    # 2. Topics catalog
    res_topics = client.get("/api/v1/agrios/topics")
    assert res_topics.status_code == 200
    assert len(res_topics.json()) == 135

    # 3. Domain agents catalog
    res_agents = client.get("/api/v1/agrios/agents")
    assert res_agents.status_code == 200
    assert len(res_agents.json()) == 24

    # 4. Recent events
    res_events = client.get("/api/v1/agrios/events")
    assert res_events.status_code == 200
    assert len(res_events.json()) > 0

    # 5. Review queue
    res_queue = client.get("/api/v1/agrios/review-queue")
    assert res_queue.status_code == 200
    assert len(res_queue.json()) == 3

    # 6. Review action
    res_action = client.post("/api/v1/agrios/review/rev-101/action?action=APPROVE")
    assert res_action.status_code == 200
    assert res_action.json()["action"] == "APPROVE"
    assert res_action.json()["review_id"] == "rev-101"

