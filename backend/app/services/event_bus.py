import asyncio
import json
from typing import Dict, List, Set, Any, Optional
from datetime import datetime
from fastapi import WebSocket

class EventType:
    LOT_CREATED = "LOT_CREATED"
    LOT_UPDATED = "LOT_UPDATED"
    LOT_RESERVED = "LOT_RESERVED"
    LOT_SOLD = "LOT_SOLD"
    LOT_CANCELLED = "LOT_CANCELLED"
    OFFER_CREATED = "OFFER_CREATED"
    OFFER_UPDATED = "OFFER_UPDATED"
    ORDER_CREATED = "ORDER_CREATED"
    ORDER_STATUS_CHANGED = "ORDER_STATUS_CHANGED"
    PAYMENT_UPDATED = "PAYMENT_UPDATED"
    LOGISTICS_UPDATED = "LOGISTICS_UPDATED"
    NOTIFICATION_CREATED = "NOTIFICATION_CREATED"
    MARKET_PRICE_UPDATED = "MARKET_PRICE_UPDATED"

class WebSocketManager:
    """
    Production-grade WebSocket connection manager and in-memory Event Bus.
    Supports topic subscriptions, user-directed channels, and global broadcasts.
    """
    def __init__(self):
        # Global active connections
        self.active_connections: Set[WebSocket] = set()
        # Topic-based connections: topic -> Set[WebSocket]
        self.topic_subscribers: Dict[str, Set[WebSocket]] = {
            "marketplace": set(),
            "orders": set(),
            "notifications": set(),
            "logistics": set()
        }
        # User-specific connections: user_id -> Set[WebSocket]
        self.user_connections: Dict[str, Set[WebSocket]] = {}
        # Role-based connections: role -> Set[WebSocket]
        self.role_connections: Dict[str, Set[WebSocket]] = {
            "FARMER": set(),
            "BUYER": set(),
            "FPO": set(),
            "LOGISTICS": set(),
            "ADMIN": set()
        }

    async def connect(
        self,
        websocket: WebSocket,
        topic: str = "marketplace",
        user_id: Optional[str] = None,
        role: Optional[str] = None
    ):
        await websocket.accept()
        self.active_connections.add(websocket)

        if topic in self.topic_subscribers:
            self.topic_subscribers[topic].add(websocket)

        if user_id:
            if user_id not in self.user_connections:
                self.user_connections[user_id] = set()
            self.user_connections[user_id].add(websocket)

        if role and role in self.role_connections:
            self.role_connections[role].add(websocket)

    def disconnect(
        self,
        websocket: WebSocket,
        topic: Optional[str] = None,
        user_id: Optional[str] = None,
        role: Optional[str] = None
    ):
        self.active_connections.discard(websocket)
        for sub_set in self.topic_subscribers.values():
            sub_set.discard(websocket)
        for user_set in self.user_connections.values():
            user_set.discard(websocket)
        for role_set in self.role_connections.values():
            role_set.discard(websocket)

    async def broadcast_event(self, event_type: str, payload: Dict[str, Any], topic: str = "marketplace"):
        """Broadcast event to topic subscribers and global connections"""
        message = {
            "event": event_type,
            "topic": topic,
            "timestamp": datetime.utcnow().isoformat(),
            "data": payload
        }
        json_data = json.dumps(message)
        subscribers = self.topic_subscribers.get(topic, set()) | self.active_connections

        disconnected = []
        for connection in subscribers:
            try:
                await connection.send_text(json_data)
            except Exception:
                disconnected.append(connection)

        for conn in disconnected:
            self.disconnect(conn)

    async def send_user_event(self, user_id: str, event_type: str, payload: Dict[str, Any]):
        """Send private event directly to connected user sessions"""
        message = {
            "event": event_type,
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat(),
            "data": payload
        }
        json_data = json.dumps(message)
        subscribers = self.user_connections.get(str(user_id), set())

        disconnected = []
        for connection in subscribers:
            try:
                await connection.send_text(json_data)
            except Exception:
                disconnected.append(connection)

        for conn in disconnected:
            self.disconnect(conn)

    async def send_role_event(self, role: str, event_type: str, payload: Dict[str, Any]):
        """Send event to all users belonging to a specific role"""
        message = {
            "event": event_type,
            "role": role,
            "timestamp": datetime.utcnow().isoformat(),
            "data": payload
        }
        json_data = json.dumps(message)
        subscribers = self.role_connections.get(role.upper(), set())

        disconnected = []
        for connection in subscribers:
            try:
                await connection.send_text(json_data)
            except Exception:
                disconnected.append(connection)

        for conn in disconnected:
            self.disconnect(conn)

# Global singleton event manager
event_manager = WebSocketManager()
