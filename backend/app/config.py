import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "KisanLink API"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./kisanlink.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "sih-kisanlink-2026-secret-key-maharashtra-production")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "kisanlink-jwt-secure-access-key-2026")
    JWT_REFRESH_SECRET: str = os.getenv("JWT_REFRESH_SECRET", "kisanlink-jwt-secure-refresh-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "30"))
    RAZORPAY_KEY_ID: str = os.getenv("RAZORPAY_KEY_ID", "rzp_test_kisanlink2026")
    RAZORPAY_KEY_SECRET: str = os.getenv("RAZORPAY_KEY_SECRET", "rzp_secret_kisanlink2026demo")
    REDIS_URL: str = os.getenv("REDIS_URL", "")
    AI_API_KEY: str = os.getenv("AI_API_KEY", os.getenv("GEMINI_API_KEY", ""))
    MANDI_API_URL: str = os.getenv("MANDI_API_URL", "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070")
    # CORS: comma-separated list of allowed origins
    # Dev default allows both common Vite ports and the running dev server port
    CORS_ALLOWED_ORIGINS: str = os.getenv(
        "CORS_ALLOWED_ORIGINS",
        "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173"
    )

    @property
    def cors_origins_list(self):
        return [o.strip() for o in self.CORS_ALLOWED_ORIGINS.split(",") if o.strip()]

settings = Settings()
