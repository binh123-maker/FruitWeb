import pytest
from app.core.config import Settings


def test_default_debug_is_safe():
    settings = Settings()
    # Default DEBUG must be False for production safety
    assert settings.DEBUG is False


def test_production_rejects_insecure_jwt_secret():
    with pytest.raises(ValueError, match="Production environment requires"):
        Settings(
            ENVIRONMENT="production",
            JWT_SECRET_KEY="change-this-secret-key-fruitweb-dev-2026-secure-jwt",
        )


def test_production_rejects_short_jwt_secret():
    with pytest.raises(ValueError, match="Production environment requires"):
        Settings(
            ENVIRONMENT="production",
            JWT_SECRET_KEY="too-short-secret",
        )


def test_production_accepts_strong_jwt_secret():
    strong_secret = "super-secret-key-for-fruitweb-production-2026-very-secure"
    settings = Settings(
        ENVIRONMENT="production",
        JWT_SECRET_KEY=strong_secret,
    )
    assert settings.JWT_SECRET_KEY == strong_secret


def test_cors_development_includes_local_origins():
    settings = Settings(
        ENVIRONMENT="development",
        CORS_ORIGINS="http://custom.dev:3000",
    )
    origins = settings.cors_origin_list
    assert "http://localhost:5173" in origins
    assert "http://127.0.0.1:5173" in origins
    assert "http://custom.dev:3000" in origins


def test_cors_production_uses_strict_configured_origins():
    settings = Settings(
        ENVIRONMENT="production",
        CORS_ORIGINS="https://fruitweb.example.com, https://admin.fruitweb.example.com",
        JWT_SECRET_KEY="a" * 32,
    )
    origins = settings.cors_origin_list
    assert origins == ["https://fruitweb.example.com", "https://admin.fruitweb.example.com"]
    assert "*" not in origins
