from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


INSECURE_DEV_SECRETS = {
    "change-this-secret-key-fruitweb-dev-2026-secure-jwt",
    "CHANGE_ME_IN_ENVIRONMENT",
    "secret",
    "secretkey",
}

DEFAULT_DEV_CORS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    APP_NAME: str = "FruitWeb API"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "postgresql+psycopg://fruitweb:fruitweb@localhost:5432/fruitweb"

    # JWT Security
    JWT_SECRET_KEY: str = "change-this-secret-key-fruitweb-dev-2026-secure-jwt"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    CORS_ORIGINS: Union[str, List[str]] = "http://localhost:5173,http://127.0.0.1:5173"

    @field_validator("JWT_SECRET_KEY")
    @classmethod
    def validate_jwt_secret(cls, v: str, info) -> str:
        env = info.data.get("ENVIRONMENT", "development").lower()
        if env == "production":
            if not v or v in INSECURE_DEV_SECRETS or len(v) < 32:
                raise ValueError(
                    "Production environment requires a strong, non-default JWT_SECRET_KEY with at least 32 characters."
                )
        return v

    @property
    def cors_origin_list(self) -> List[str]:
        configured: List[str] = []
        if isinstance(self.CORS_ORIGINS, list):
            configured = [o.strip() for o in self.CORS_ORIGINS if o.strip()]
        elif isinstance(self.CORS_ORIGINS, str):
            configured = [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

        if self.ENVIRONMENT.lower() == "development":
            # In development, guarantee local dev servers work smoothly
            merged = list(dict.fromkeys(DEFAULT_DEV_CORS + configured))
            return merged

        # In production, use strictly configured origins (avoid wildcard with credentials)
        return configured if configured else DEFAULT_DEV_CORS


settings = Settings()
