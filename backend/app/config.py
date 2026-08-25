import os

class Settings:
    PROJECT_NAME: str = "KisanLink API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./kisanlink.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "sih-kisanlink-2026-secret-key-maharashtra")

settings = Settings()
