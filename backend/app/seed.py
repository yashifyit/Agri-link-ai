import sys
import os
from dotenv import load_dotenv

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Load environment variables
load_dotenv()

from app.database import engine, SessionLocal, Base
from app.services.auth_service import hash_password
from app.models.all_models import (
    User, UserRole, FarmerProfile, BuyerProfile, FPOProfile, LogisticsProfile,
    Market, MarketPrice, Lot, LotStatus, BuyerRequirement, Offer, OfferStatus,
    Order, OrderStatus, Payment, PaymentStatus, Shipment, ShipmentStatus,
    Settlement, Notification, NotificationType, SystemConfig, Crop, Transaction
)

def seed_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # Seed system configs
        configs = [
            SystemConfig(key="gemini_api_key", value=os.getenv("GEMINI_API_KEY", "")),
            SystemConfig(key="gemini_model", value=os.getenv("GEMINI_MODEL", "gemini-3.5-flash")),
            SystemConfig(key="enable_web_grounding", value="false"),
            SystemConfig(key="enable_ai", value="true"),
            SystemConfig(key="max_response_length", value="2048"),
            SystemConfig(key="temperature", value="0.7"),
        ]
        db.add_all(configs)

        # Seed crops catalog
        crop_data_list = [
            ("Rice", "धान", "भात", "Cereals", "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=300", "quintal", "Grade A, Grade B", "Kharif", "High", "Dry Storage"),
            ("Wheat", "गेहूँ", "गहू", "Cereals", "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=300", "quintal", "Grade A, Grade B", "Rabi", "Medium", "Dry Storage"),
            ("Maize", "मक्का", "मका", "Cereals", "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=300", "quintal", "Grade A, Grade B", "Kharif", "Medium", "Dry Storage"),
            ("Tomato", "टमाटर", "टोमॅटो", "Vegetables", "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=300", "kg", "Grade A, Grade B, Grade C", "Kharif, Rabi", "Medium", "Cold Storage"),
            ("Onion", "प्याज़", "कांदा", "Vegetables", "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cf?auto=format&fit=crop&q=80&w=300", "kg", "Grade A, Grade B, Grade C", "Rabi, Kharif", "Medium", "Dry Storage"),
            ("Potato", "आलू", "बटाटा", "Vegetables", "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=300", "kg", "Grade A, Grade B, Grade C", "Rabi", "Medium", "Cold Storage"),
            ("Soybean", "सोयाबीन", "सोयाबीन", "Oilseeds", "https://images.unsplash.com/photo-1594756202469-9ff9799b2e4e?auto=format&fit=crop&q=80&w=300", "quintal", "Grade A, Grade B", "Kharif", "Medium", "Dry Storage"),
            ("Mango", "आम", "आंबा", "Fruits", "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=300", "kg", "Grade A, Grade B", "Summer", "Medium", "Cold Storage"),
            ("Cotton", "कपास", "कापूस", "Commercial / Cash Crops", "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&q=80&w=300", "quintal", "Grade A, Grade B", "Kharif", "Medium", "Dry Storage"),
            ("Sugarcane", "गन्ना", "ऊस", "Commercial / Cash Crops", "https://images.unsplash.com/photo-1527335495349-2d11622219cd?auto=format&fit=crop&q=80&w=300", "ton", "Grade A", "Kharif", "High", "Open Air")
        ]
        
        crops = []
        for idx, item in enumerate(crop_data_list, 1):
            crops.append(Crop(
                id=idx,
                name=item[0],
                hindi_name=item[1],
                marathi_name=item[2],
                category=item[3],
                image=item[4],
                unit=item[5],
                quality_grades=item[6],
                season=item[7],
                water_requirement=item[8],
                storage_type=item[9],
                is_active=True
            ))
        db.add_all(crops)
        db.commit()

        # 1. Users for all 5 Roles
        default_pwd_hash = hash_password("demo1234")

        farmer = User(
            id=1,
            name="Ramesh Verma",
            phone="9876543210",
            email="ramesh@kisanlink.in",
            password_hash=default_pwd_hash,
            role=UserRole.FARMER,
            location="Kanpur, Uttar Pradesh",
            is_active=True,
            is_verified=True
        )
        fpo = User(
            id=2,
            name="Sahyadri FPO",
            phone="9876543211",
            email="contact@sahyadrifpo.org",
            password_hash=default_pwd_hash,
            role=UserRole.FPO,
            location="Nashik, Maharashtra",
            is_active=True,
            is_verified=True
        )
        buyer = User(
            id=3,
            name="FreshHarvest Foods",
            phone="9876543212",
            email="procurement@freshharvest.com",
            password_hash=default_pwd_hash,
            role=UserRole.BUYER,
            location="Lucknow, Uttar Pradesh",
            is_active=True,
            is_verified=True
        )
        logistics = User(
            id=4,
            name="KisanLink FastLogistics",
            phone="9876543214",
            email="dispatch@kisanlink-logistics.in",
            password_hash=default_pwd_hash,
            role=UserRole.LOGISTICS,
            location="Lucknow, Uttar Pradesh",
            is_active=True,
            is_verified=True
        )
        admin = User(
            id=5,
            name="Admin Command",
            phone="9876543213",
            email="admin@kisanlink.gov.in",
            password_hash=default_pwd_hash,
            role=UserRole.ADMIN,
            location="Mumbai, Maharashtra",
            is_active=True,
            is_verified=True
        )
        db.add_all([farmer, fpo, buyer, logistics, admin])
        db.flush()

        # Add corresponding profiles
        db.add(FarmerProfile(user_id=farmer.id, farm_size_acres=6.5, primary_crops="Tomato, Wheat, Potato"))
        db.add(FPOProfile(user_id=fpo.id, fpo_name="Sahyadri Farmers Producer Company", registration_no="FPO-MH-2024-88", member_count=180))
        db.add(BuyerProfile(user_id=buyer.id, company_name="FreshHarvest Foods Pvt Ltd", gstin="09AAACH7409R1ZZ"))
        db.add(LogisticsProfile(user_id=logistics.id, fleet_type="Mini Trucks, Reefer 2.5T", service_areas="UP, Maharashtra, Delhi"))
        db.commit()

        # 2. Mandis
        markets = [
            Market(id=1, name="Kanpur Mandi", district="Kanpur", state="Uttar Pradesh", latitude=26.4499, longitude=80.3319),
            Market(id=2, name="Unnao Mandi", district="Unnao", state="Uttar Pradesh", latitude=26.5393, longitude=80.4878),
            Market(id=3, name="Lucknow Mandi", district="Lucknow", state="Uttar Pradesh", latitude=26.8467, longitude=80.9462),
            Market(id=4, name="Pune APMC", district="Pune", state="Maharashtra", latitude=18.5204, longitude=73.8567),
            Market(id=5, name="Nashik APMC", district="Nashik", state="Maharashtra", latitude=19.9975, longitude=73.7898),
            Market(id=6, name="Nagpur APMC", district="Nagpur", state="Maharashtra", latitude=21.1458, longitude=79.0882),
        ]
        db.add_all(markets)
        db.commit()

        # 3. Market Prices
        prices = [
            MarketPrice(market_id=1, crop_name="Tomato", min_price=26.0, modal_price=28.0, max_price=31.0, arrival_qty_tons=45.0),
            MarketPrice(market_id=2, crop_name="Tomato", min_price=28.0, modal_price=30.0, max_price=33.0, arrival_qty_tons=30.0),
            MarketPrice(market_id=3, crop_name="Tomato", min_price=29.0, modal_price=31.0, max_price=35.0, arrival_qty_tons=60.0),
            MarketPrice(market_id=4, crop_name="Tomato", min_price=32.0, modal_price=35.0, max_price=38.0, arrival_qty_tons=120.0),
            MarketPrice(market_id=5, crop_name="Tomato", min_price=30.0, modal_price=33.0, max_price=36.0, arrival_qty_tons=90.0),
            MarketPrice(market_id=1, crop_name="Onion", min_price=22.0, modal_price=24.0, max_price=27.0, arrival_qty_tons=80.0),
            MarketPrice(market_id=4, crop_name="Onion", min_price=25.0, modal_price=28.0, max_price=31.0, arrival_qty_tons=200.0),
            MarketPrice(market_id=5, crop_name="Soybean", min_price=42.0, modal_price=45.0, max_price=48.0, arrival_qty_tons=150.0),
        ]
        db.add_all(prices)

        # 4. Live Crop Lots with available_qty_kg
        lots = [
            Lot(
                id="KL-10492",
                farmer_id=farmer.id,
                farmer_name="Ramesh Verma",
                crop="Tomato",
                variety="Desi Red",
                quantity_kg=800.0,
                available_qty_kg=800.0,
                unit="kg",
                quality_grade="Grade A",
                harvest_date="2026-08-23",
                perishability_window_days=6,
                location="Kanpur, Uttar Pradesh",
                pickup_address="Village Bilhaur, Kanpur Rural, UP",
                expected_price_per_kg=32.0,
                min_acceptable_price_per_kg=30.0,
                is_fpo_aggregated=False,
                status=LotStatus.ACTIVE
            ),
            Lot(
                id="KL-LOT-8820",
                farmer_id=farmer.id,
                farmer_name="Suresh Patel",
                crop="Onion",
                variety="Nashik Red",
                quantity_kg=2500.0,
                available_qty_kg=2500.0,
                unit="kg",
                quality_grade="Grade A",
                harvest_date="2026-08-22",
                perishability_window_days=30,
                location="Nashik, Maharashtra",
                pickup_address="Niphad Taluka, Nashik, MH",
                expected_price_per_kg=26.0,
                min_acceptable_price_per_kg=24.0,
                is_fpo_aggregated=True,
                fpo_name="Sahyadri FPO",
                status=LotStatus.ACTIVE
            )
        ]
        db.add_all(lots)

        # 5. Buyer Requirements
        reqs = [
            BuyerRequirement(
                id=1,
                buyer_id=buyer.id,
                buyer_name="FreshHarvest Foods",
                company_name="FreshHarvest Foods Pvt Ltd",
                crop="Tomato",
                required_qty_kg=5000.0,
                min_grade="Grade A",
                target_price_min=30.0,
                target_price_max=34.0,
                delivery_location="Lucknow",
                reliability_score=94.0,
                on_time_payment_pct=96.0,
                status="ACTIVE"
            ),
            BuyerRequirement(
                id=2,
                buyer_id=buyer.id,
                buyer_name="Maharashtra Fresh Processors",
                company_name="Maharashtra Fresh Processors Ltd",
                crop="Onion",
                required_qty_kg=12000.0,
                min_grade="Grade B",
                target_price_min=24.0,
                target_price_max=28.0,
                delivery_location="Pune",
                reliability_score=92.0,
                on_time_payment_pct=94.0,
                status="ACTIVE"
            )
        ]
        db.add_all(reqs)

        # 6. Active Offer on Lot #KL-10492
        offers = [
            Offer(
                id="KL-OFF-8831",
                lot_id="KL-10492",
                buyer_id=buyer.id,
                buyer_name="FreshHarvest Foods",
                offered_price_per_kg=33.0,
                quantity_kg=800.0,
                transport_estimate=1600.0,
                gross_total=26400.0,
                net_realization=24800.0,
                status=OfferStatus.PENDING
            )
        ]
        db.add_all(offers)

        # 7. Sample Initial Order, Payment and Shipment
        order_init = Order(
            id="KL-ORD-10491",
            buyer_id=buyer.id,
            buyer_name="FreshHarvest Foods",
            farmer_id=farmer.id,
            farmer_name="Ramesh Verma",
            lot_id="KL-10492",
            crop="Tomato",
            quantity_kg=800.0,
            price_per_kg=33.0,
            crop_value=26400.0,
            transport_cost=1600.0,
            platform_fee=264.0,
            tax_amount=0.0,
            total_amount=28264.0,
            farmer_net_payout=26136.0,
            delivery_address="FreshHarvest Processing Plant, Industrial Area, Lucknow",
            pickup_address="Village Bilhaur, Kanpur Rural, UP",
            status=OrderStatus.PAID,
            payment_status=PaymentStatus.SUCCESS
        )
        db.add(order_init)
        db.flush()

        shipment_init = Shipment(
            id="KL-SHP-10491",
            order_id=order_init.id,
            logistics_partner_id=logistics.id,
            logistics_partner_name="KisanLink FastLogistics",
            vehicle_type="Mini Truck 1.5T",
            vehicle_number="UP78 AB 1234",
            driver_name="Ravi Kumar",
            driver_phone="+91 98765 43219",
            origin=order_init.pickup_address,
            destination=order_init.delivery_address,
            distance_km=45.0,
            transport_cost=1600.0,
            status=ShipmentStatus.IN_TRANSIT,
            estimated_delivery="Today by 5:00 PM"
        )
        db.add(shipment_init)

        # 8. Notifications
        db.add(Notification(
            user_id=farmer.id,
            title="Welcome to KisanLink!",
            message="Your producer profile is active. You can now list crops and receive instant buyer bids.",
            type=NotificationType.SYSTEM
        ))

        db.commit()
        print("Database seeded with production users, profiles, catalog, lots and orders!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
