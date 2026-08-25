import os
import random
import requests

class ImageProvider:
    FALLBACKS = {
        "farmer": [
            "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=600",
            "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=600",
            "https://images.unsplash.com/photo-1599824425750-681b9cf271bc?auto=format&fit=crop&q=80&w=600",
            "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=600"
        ],
        "market": [
            "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&q=80&w=600",
            "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=600",
            "https://images.unsplash.com/photo-1506484334402-40f2fc5031b2?auto=format&fit=crop&q=80&w=600"
        ],
        "crop": [
            "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=600"
        ]
    }

    CROP_IMAGE_MAP = {
        "tomato": "https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=600",
        "potato": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=600",
        "onion": "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cf?auto=format&fit=crop&q=80&w=600",
        "garlic": "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&q=80&w=600",
        "green chilli": "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&q=80&w=600",
        "capsicum": "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&q=80&w=600",
        "brinjal": "https://images.unsplash.com/photo-1590373117462-8e3ad5d35a39?auto=format&fit=crop&q=80&w=600",
        "okra": "https://images.unsplash.com/photo-1625938146369-adc83368bda7?auto=format&fit=crop&q=80&w=600",
        "bhindi": "https://images.unsplash.com/photo-1625938146369-adc83368bda7?auto=format&fit=crop&q=80&w=600",
        "wheat": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=600",
        "rice": "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600",
        "maize": "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=600",
        "corn": "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=600",
        "bajra": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=600",
        "millet": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=600",
        "soybean": "https://images.unsplash.com/photo-1599824425750-681b9cf271bc?auto=format&fit=crop&q=80&w=600",
        "groundnut": "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&q=80&w=600",
        "peanut": "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&q=80&w=600",
        "tur": "https://images.unsplash.com/photo-1608797178974-15b35a61d121?auto=format&fit=crop&q=80&w=600",
        "pigeon pea": "https://images.unsplash.com/photo-1608797178974-15b35a61d121?auto=format&fit=crop&q=80&w=600",
        "mango": "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=600",
        "pomegranate": "https://images.unsplash.com/photo-1601275868399-45bec4f4cd9d?auto=format&fit=crop&q=80&w=600",
        "cotton": "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&q=80&w=600",
        "turmeric": "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&q=80&w=600"
    }

    @classmethod
    def get_image(cls, query: str, category: str = "farmer") -> str:
        # Check Unsplash provider
        unsplash_key = os.getenv("UNSPLASH_ACCESS_KEY")
        if unsplash_key:
            try:
                res = requests.get(
                    "https://api.unsplash.com/search/photos",
                    params={"query": query, "per_page": 1, "orientation": "landscape"},
                    headers={"Authorization": f"Client-ID {unsplash_key}"},
                    timeout=3
                )
                if res.status_code == 200:
                    data = res.json()
                    if data.get("results"):
                        return data["results"][0]["urls"]["regular"]
            except Exception as e:
                print(f"Unsplash API call error: {e}")

        # Check Pexels provider
        pexels_key = os.getenv("PEXELS_API_KEY")
        if pexels_key:
            try:
                res = requests.get(
                    "https://api.pexels.com/v1/search",
                    params={"query": query, "per_page": 1},
                    headers={"Authorization": pexels_key},
                    timeout=3
                )
                if res.status_code == 200:
                    data = res.json()
                    if data.get("photos"):
                        return data["photos"][0]["src"]["large2x"]
            except Exception as e:
                print(f"Pexels API call error: {e}")

        # Use fallback
        if category == "crop":
            q_lower = query.lower()
            for key, val in cls.CROP_IMAGE_MAP.items():
                if key in q_lower:
                    return val

        fallbacks = cls.FALLBACKS.get(category, cls.FALLBACKS["farmer"])
        return random.choice(fallbacks)
