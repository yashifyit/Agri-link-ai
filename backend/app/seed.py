import sys
import os
from dotenv import load_dotenv

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Load environment variables
load_dotenv()

from app.database import engine, SessionLocal, Base

from app.models.all_models import (
    User, Market, MarketPrice, Lot, BuyerRequirement, Offer, Transaction, Dispute,
    SystemConfig, Crop
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

        # Seed crops
        crop_data_list = [
            ("Rice", "धान", "भात", "Cereals", "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=300", "quintal", "Grade A, Grade B", "Kharif", "High", "Dry Storage"),
            ("Wheat", "गेहूँ", "गहू", "Cereals", "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=300", "quintal", "Grade A, Grade B", "Rabi", "Medium", "Dry Storage"),
            ("Maize", "मक्का", "मका", "Cereals", "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=300", "quintal", "Grade A, Grade B", "Kharif", "Medium", "Dry Storage"),
            ("Barley", "जौ", "जव", "Cereals", "https://images.unsplash.com/photo-1533038590840-1cde6b66b706?auto=format&fit=crop&q=80&w=300", "quintal", "Grade A, Grade B", "Rabi", "Low", "Dry Storage"),
            ("Bajra", "बाजरा", "बाजरी", "Cereals", "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=300", "quintal", "Grade A, Grade B", "Kharif", "Low", "Dry Storage"),
            ("Jowar", "ज्वार", "ज्वारी", "Cereals", "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&q=80&w=300", "quintal", "Grade A, Grade B", "Kharif", "Low", "Dry Storage"),
            ("Ragi", "रागी", "नाचणी", "Cereals", "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=300", "quintal", "Grade A, Grade B", "Kharif", "Low", "Dry Storage"),
            ("Oats", "जई", "ओट्स", "Cereals", "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&q=80&w=300", "quintal", "Grade A, Grade B", "Rabi", "Medium", "Dry Storage"),
            ("Sorghum", "सोरघम", "सोरघम", "Cereals", "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&q=80&w=300", "quintal", "Grade A, Grade B", "Kharif", "Low", "Dry Storage"),
            ("Chickpea", "चना", "हरभरा", "Pulses", "https://images.unsplash.com/photo-1547058881-aa0edd92aab3?auto=format&fit=crop&q=80&w=300", "quintal", "Grade A, Grade B", "Rabi", "Low", "Dry Storage"),
            ("Pigeon Pea", "अरहर / तुवर", "तूर", "Pulses", "https://images.unsplash.com/photo-1608797178974-15b35a61d121?auto=format&fit=crop&q=80&w=300", "quintal", "Grade A, Grade B", "Kharif", "Low", "Dry Storage"),
            ("Moong", "मूंग", "मूग", "Pulses", "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&q=80&w=300", "quintal", "Grade A, Grade B", "Kharif", "Low", "Dry Storage"),
            ("Urad", "उड़द", "उडीद", "Pulses", "https://images.unsplash.com/photo-1585994276707-1b918db40e72?auto=format&fit=crop&q=80&w=300", "quintal", "Grade A, Grade B", "Kharif", "Low", "Dry Storage"),
            ("Masoor", "मसूर", "मसूर", "Pulses", "https://images.unsplash.com/photo-1547058881-aa0edd92aab3?auto=format&fit=crop&q=80&w=300", "quintal", "Grade A, Grade B", "Rabi", "Low", "Dry Storage"),
            ("Lentil", "मसूर की दाल", "मसूर डाळ", "Pulses", "https://images.unsplash.com/photo-1547058881-aa0edd92aab3?auto=format&fit=crop&q=80&w=300", "quintal", "Grade A, Grade B", "Rabi", "Low", "Dry Storage"),
            ("Peas", "मटर", "मटार", "Vegetables", "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&q=80&w=300", "kg", "Grade A, Grade B", "Rabi", "Medium", "Cold Storage"),
            ("Rajma", "राजमा", "राजमा", "Pulses", "https://images.unsplash.com/photo-1585994276707-1b918db40e72?auto=format&fit=crop&q=80&w=300", "quintal", "Grade A, Grade B", "Rabi", "Medium", "Dry Storage"),
            ("Cowpea", "लोबिया", "चवळी", "Pulses", "https://images.unsplash.com/photo-1608797178974-15b35a61d121?auto=format&fit=crop&q=80&w=300", "quintal", "Grade A, Grade B", "Kharif", "Low", "Dry Storage"),
            ("Soybean", "सोयाबीन", "सोयाबीन", "Oilseeds", "https://images.unsplash.com/photo-1594756202469-9ff9799b2e4e?auto=format&fit=crop&q=80&w=300", "quintal", "Grade A, Grade B", "Kharif", "Medium", "Dry Storage"),
            ("Groundnut", "मूंगफली", "भुईमूग", "Oilseeds", "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&q=80&w=300", "quintal", "Grade A, Grade B", "Kharif", "Low", "Dry Storage"),
            ("Mustard", "सरसों", "मोहरी", "Oilseeds", "https://images.unsplash.com/photo-1596701062351-df5f8af54b85?auto=format&fit=crop&q=80&w=300", "quintal", "Grade A, Grade B", "Rabi", "Low", "Dry Storage"),
            ("Sunflower", "सूरजमुखी", "सूर्यफूल", "Oilseeds", "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&q=80&w=300", "quintal", "Grade A, Grade B", "Kharif", "Medium", "Dry Storage"),
            ("Sesame", "तिल", "तीळ", "Oilseeds", "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=300", "quintal", "Grade A, Grade B", "Kharif", "Low", "Dry Storage"),
            ("Tomato", "टमाटर", "टोमॅटो", "Vegetables", "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=300", "kg", "Grade A, Grade B, Grade C", "Kharif, Rabi", "Medium", "Cold Storage"),
            ("Onion", "प्याज़", "कांदा", "Vegetables", "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cf?auto=format&fit=crop&q=80&w=300", "kg", "Grade A, Grade B, Grade C", "Rabi, Kharif", "Medium", "Dry Storage"),
            ("Potato", "आलू", "बटाटा", "Vegetables", "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=300", "kg", "Grade A, Grade B, Grade C", "Rabi", "Medium", "Cold Storage"),
            ("Garlic", "लहसुन", "लसूण", "Vegetables", "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&q=80&w=300", "kg", "Grade A, Grade B", "Rabi", "Low", "Dry Storage"),
            ("Ginger", "अदरक", "आले", "Vegetables", "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&q=80&w=300", "kg", "Grade A, Grade B", "Kharif", "Medium", "Cold Storage"),
            ("Green Chilli", "हरी मिर्च", "हिरवी मिरची", "Vegetables", "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&q=80&w=300", "kg", "Grade A, Grade B", "Kharif", "Medium", "Open Air"),
            ("Brinjal", "बैंगन", "वांगे", "Vegetables", "https://images.unsplash.com/photo-1590373117462-8e3ad5d35a39?auto=format&fit=crop&q=80&w=300", "kg", "Grade A, Grade B", "Rabi, Kharif", "Medium", "Cold Storage"),
            ("Okra", "भिंडी", "भेंडी", "Vegetables", "https://images.unsplash.com/photo-1625938146369-adc83368bda7?auto=format&fit=crop&q=80&w=300", "kg", "Grade A, Grade B", "Summer, Kharif", "Medium", "Cold Storage"),
            ("Mango", "आम", "आंबा", "Fruits", "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=300", "kg", "Grade A, Grade B", "Summer", "Medium", "Cold Storage"),
            ("Banana", "केला", "केळी", "Fruits", "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&q=80&w=300", "dozen", "Grade A, Grade B", "Year-round", "High", "Cold Storage"),
            ("Apple", "सेब", "सफरचंद", "Fruits", "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&q=80&w=300", "kg", "Grade A, Grade B", "Rabi", "Medium", "Cold Storage"),
            ("Orange", "संतरा", "संत्रे", "Fruits", "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&q=80&w=300", "kg", "Grade A, Grade B", "Rabi", "Medium", "Cold Storage"),
            ("Pomegranate", "अनार", "डाळिंब", "Fruits", "https://images.unsplash.com/photo-1601275868399-45bec4f4cd9d?auto=format&fit=crop&q=80&w=300", "kg", "Grade A, Grade B", "Kharif, Rabi", "Low", "Cold Storage"),
            ("Cotton", "कपास", "कापूस", "Commercial / Cash Crops", "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&q=80&w=300", "quintal", "Grade A, Grade B", "Kharif", "Medium", "Dry Storage"),
            ("Sugarcane", "गन्ना", "ऊस", "Commercial / Cash Crops", "https://images.unsplash.com/photo-1527335495349-2d11622219cd?auto=format&fit=crop&q=80&w=300", "ton", "Grade A", "Kharif", "High", "Open Air"),
            ("Jute", "जूट", "ताग", "Commercial / Cash Crops", "https://images.unsplash.com/photo-1590595978583-39675abdc58e?auto=format&fit=crop&q=80&w=300", "quintal", "Grade A", "Kharif", "High", "Dry Storage"),
            ("Turmeric", "हल्दी", "हळद", "Spices", "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&q=80&w=300", "quintal", "Grade A, Grade B", "Kharif", "Medium", "Dry Storage"),
            ("Cumin", "जीरा", "जिरे", "Spices", "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&q=80&w=300", "quintal", "Grade A, Grade B", "Rabi", "Low", "Dry Storage"),
            ("Coriander", "धनिया", "धने", "Spices", "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&q=80&w=300", "quintal", "Grade A, Grade B", "Rabi", "Low", "Dry Storage"),
            ("Coconut", "नारियल", "नारळ", "Plantation / Other", "https://images.unsplash.com/photo-1584287532321-c42337d111ca?auto=format&fit=crop&q=80&w=300", "piece", "Grade A", "Year-round", "Medium", "Dry Storage"),
            ("Cashew", "काजू", "काजू", "Plantation / Other", "https://images.unsplash.com/photo-1600850056064-a8b380df8395?auto=format&fit=crop&q=80&w=300", "quintal", "Grade A, Grade B", "Summer", "Low", "Dry Storage")
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

        # 1. Users
        users = [
            User(id=1, name="Ramesh Verma", phone="9876543210", email="ramesh@kisanlink.in", role="FARMER", location="Kanpur, Uttar Pradesh"),
            User(id=2, name="Sahyadri FPO", phone="9876543211", email="contact@sahyadrifpo.org", role="FPO", location="Nashik, Maharashtra"),
            User(id=3, name="FreshHarvest Foods", phone="9876543212", email="procurement@freshharvest.com", role="BUYER", location="Lucknow, Uttar Pradesh"),
            User(id=4, name="Admin Command", phone="9876543213", email="admin@kisanlink.gov.in", role="ADMIN", location="Mumbai, Maharashtra")
        ]
        db.add_all(users)

        # 2. Markets
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
            
            # Anomaly item: Market price spike in Kolhapur/Solapur
            MarketPrice(market_id=6, crop_name="Tomato", min_price=38.0, modal_price=41.0, max_price=45.0, arrival_qty_tons=15.0),
            
            MarketPrice(market_id=1, crop_name="Onion", min_price=22.0, modal_price=24.0, max_price=27.0, arrival_qty_tons=80.0),
            MarketPrice(market_id=4, crop_name="Onion", min_price=25.0, modal_price=28.0, max_price=31.0, arrival_qty_tons=200.0),
            MarketPrice(market_id=5, crop_name="Soybean", min_price=42.0, modal_price=45.0, max_price=48.0, arrival_qty_tons=150.0),
        ]
        db.add_all(prices)

        # 4. Digital Crop Lot (Ramesh Verma's Lot #KL-10492)
        lots = [
            Lot(
                id="KL-10492",
                farmer_name="Ramesh Verma",
                crop="Tomato",
                variety="Desi Red",
                quantity_kg=800.0,
                quality_grade="Grade A",
                harvest_date="2026-08-23",
                location="Kanpur, Uttar Pradesh",
                expected_price_per_kg=32.0,
                is_fpo_aggregated=False,
                status="ACTIVE"
            ),
            Lot(
                id="KL-LOT-8820",
                farmer_name="Suresh Patel",
                crop="Onion",
                variety="Nashik Red",
                quantity_kg=2500.0,
                quality_grade="Grade A",
                harvest_date="2026-08-22",
                location="Nashik, Maharashtra",
                expected_price_per_kg=26.0,
                is_fpo_aggregated=True,
                fpo_name="Sahyadri FPO",
                status="ACTIVE"
            )
        ]
        db.add_all(lots)

        # 5. Buyer Requirement
        reqs = [
            BuyerRequirement(
                id=1,
                buyer_name="FreshHarvest Foods",
                company_name="FreshHarvest Foods Pvt Ltd",
                crop="Tomato",
                required_qty_kg=5000.0,
                min_grade="Grade A",
                target_price_min=30.0,
                target_price_max=34.0,
                delivery_location="Lucknow",
                reliability_score=94.0,
                on_time_payment_pct=96.0
            ),
            BuyerRequirement(
                id=2,
                buyer_name="Maharashtra Fresh Processors",
                company_name="Maharashtra Fresh Processors Ltd",
                crop="Onion",
                required_qty_kg=12000.0,
                min_grade="Grade B",
                target_price_min=24.0,
                target_price_max=28.0,
                delivery_location="Pune",
                reliability_score=92.0,
                on_time_payment_pct=94.0
            )
        ]
        db.add_all(reqs)

        # 6. Offer on KL-10492
        offers = [
            Offer(
                id="KL-OFF-8831",
                lot_id="KL-10492",
                buyer_name="FreshHarvest Foods",
                offered_price_per_kg=33.0,
                quantity_kg=800.0,
                transport_estimate=1600.0,
                gross_total=26400.0,
                net_realization=24800.0,
                status="PENDING"
            )
        ]
        db.add_all(offers)

        # 7. Completed Transaction & Logistics
        txns = [
            Transaction(
                id="KL-TXN-10491",
                lot_id="KL-10492",
                offer_id="KL-OFF-8830",
                farmer_name="Ramesh Verma",
                buyer_name="FreshHarvest Foods",
                crop="Tomato",
                quantity_kg=800.0,
                agreed_price_per_kg=33.0,
                gross_value=26400.0,
                transport_cost=1600.0,
                net_realization=24800.0,
                vehicle_number="UP78 AB 1234",
                driver_name="Ravi Kumar",
                origin="Kanpur",
                destination="Lucknow",
                status="PAYMENT_COMPLETED",
                payment_status="COMPLETED"
            )
        ]
        db.add_all(txns)

        db.commit()
        print("Database successfully seeded with realistic KisanLink SIH data!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
