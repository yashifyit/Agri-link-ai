import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pytest
from app.database import SessionLocal
from app.services.gemini_service import process_ai_chat_query, execute_tool_call

def test_gemini_service_tools():
    db = SessionLocal()
    try:
        # Test calculate_net_realization tool
        net_res = execute_tool_call("calculate_net_realization", {
            "quantity_kg": 800,
            "price_per_kg": 33,
            "transport_cost": 1600
        }, user_role="FARMER", user_id="1", db=db)
        
        assert net_res["gross"] == 26400.0
        assert net_res["net_realization"] == 24800.0
        assert net_res["net_per_kg"] == 31.0

        # Test market price query
        chat_res = process_ai_chat_query("Should I sell my tomatoes today?", user_role="FARMER", user_id="1", db=db)
        assert "SELL NOW" in chat_res["text"] or "Tomato" in chat_res["text"]
        assert len(chat_res["sources"]) >= 1

        # Test buyer discovery query
        buyer_res = process_ai_chat_query("Find buyers for tomatoes", user_role="FARMER", user_id="1", db=db)
        assert "FreshHarvest Foods" in buyer_res["text"]

        print("All Gemini Service unit tests PASSED!")
    finally:
        db.close()

if __name__ == "__main__":
    test_gemini_service_tools()
