from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from typing import Optional
from app.services.event_bus import event_manager

router = APIRouter(tags=["Real-time WebSockets"])

@router.websocket("/ws/marketplace")
async def websocket_marketplace_endpoint(
    websocket: WebSocket,
    user_id: Optional[str] = Query(None),
    role: Optional[str] = Query(None)
):
    await event_manager.connect(websocket, topic="marketplace", user_id=user_id, role=role)
    try:
        while True:
            # Keep-alive heartbeat & client messages
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        event_manager.disconnect(websocket, topic="marketplace", user_id=user_id, role=role)
    except Exception:
        event_manager.disconnect(websocket, topic="marketplace", user_id=user_id, role=role)

@router.websocket("/ws/orders/{order_id}")
async def websocket_orders_endpoint(
    websocket: WebSocket,
    order_id: str,
    user_id: Optional[str] = Query(None)
):
    await event_manager.connect(websocket, topic="orders", user_id=user_id)
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except (WebSocketDisconnect, Exception):
        event_manager.disconnect(websocket, topic="orders", user_id=user_id)

@router.websocket("/ws/notifications")
async def websocket_notifications_endpoint(
    websocket: WebSocket,
    user_id: Optional[str] = Query(None)
):
    await event_manager.connect(websocket, topic="notifications", user_id=user_id)
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except (WebSocketDisconnect, Exception):
        event_manager.disconnect(websocket, topic="notifications", user_id=user_id)

@router.websocket("/ws/logistics/{shipment_id}")
async def websocket_logistics_endpoint(
    websocket: WebSocket,
    shipment_id: str,
    user_id: Optional[str] = Query(None)
):
    await event_manager.connect(websocket, topic="logistics", user_id=user_id)
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except (WebSocketDisconnect, Exception):
        event_manager.disconnect(websocket, topic="logistics", user_id=user_id)
