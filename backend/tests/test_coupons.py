import pytest
from datetime import datetime, timedelta, timezone
from app.models.coupon import Coupon


@pytest.fixture
def active_coupon(db_session):
    coupon = Coupon(
        code="GIAM10",
        discount_type="percentage",
        discount_value=10.0,
        min_order_amount=100000.0,
        max_discount_amount=50000.0,
        usage_limit=10,
        usage_count=0,
        is_active=True,
    )
    db_session.add(coupon)
    db_session.commit()
    db_session.refresh(coupon)
    return coupon


@pytest.fixture
def fixed_coupon(db_session):
    coupon = Coupon(
        code="GIAM50K",
        discount_type="fixed",
        discount_value=50000.0,
        min_order_amount=200000.0,
        usage_limit=5,
        usage_count=0,
        is_active=True,
    )
    db_session.add(coupon)
    db_session.commit()
    db_session.refresh(coupon)
    return coupon


def test_validate_percentage_coupon_success(client, user_headers, active_coupon):
    payload = {"code": "GIAM10", "order_amount": 200000.0}
    res = client.post("/api/coupons/validate", json=payload, headers=user_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["valid"] is True
    assert data["code"] == "GIAM10"
    # 10% of 200,000 = 20,000
    assert data["discount_amount"] == 20000.0


def test_validate_percentage_coupon_max_cap(client, user_headers, active_coupon):
    # 10% of 1,000,000 = 100,000, but capped at 50,000
    payload = {"code": "GIAM10", "order_amount": 1000000.0}
    res = client.post("/api/coupons/validate", json=payload, headers=user_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["discount_amount"] == 50000.0


def test_validate_coupon_min_amount_fail(client, user_headers, active_coupon):
    # Order amount 50,000 < min 100,000
    payload = {"code": "GIAM10", "order_amount": 50000.0}
    res = client.post("/api/coupons/validate", json=payload, headers=user_headers)
    assert res.status_code == 400
    assert "tối thiểu" in res.json()["message"] or "tối thiểu" in str(res.json())


def test_validate_coupon_not_found(client, user_headers):
    payload = {"code": "NOT_EXIST", "order_amount": 200000.0}
    res = client.post("/api/coupons/validate", json=payload, headers=user_headers)
    assert res.status_code == 404


def test_validate_inactive_coupon(client, user_headers, db_session):
    coupon = Coupon(
        code="OFFLINE",
        discount_type="fixed",
        discount_value=20000.0,
        is_active=False,
    )
    db_session.add(coupon)
    db_session.commit()

    res = client.post("/api/coupons/validate", json={"code": "OFFLINE", "order_amount": 100000.0}, headers=user_headers)
    assert res.status_code == 400


def test_validate_expired_coupon(client, user_headers, db_session):
    coupon = Coupon(
        code="EXPIRED",
        discount_type="fixed",
        discount_value=20000.0,
        end_date=datetime.now(timezone.utc) - timedelta(days=1),
        is_active=True,
    )
    db_session.add(coupon)
    db_session.commit()

    res = client.post("/api/coupons/validate", json={"code": "EXPIRED", "order_amount": 100000.0}, headers=user_headers)
    assert res.status_code == 400


def test_validate_exceeded_usage_limit(client, user_headers, db_session):
    coupon = Coupon(
        code="USEDUP",
        discount_type="fixed",
        discount_value=20000.0,
        usage_limit=5,
        usage_count=5,
        is_active=True,
    )
    db_session.add(coupon)
    db_session.commit()

    res = client.post("/api/coupons/validate", json={"code": "USEDUP", "order_amount": 100000.0}, headers=user_headers)
    assert res.status_code == 400


def test_admin_create_coupon(client, admin_headers):
    payload = {
        "code": "PROMO2026",
        "discount_type": "percentage",
        "discount_value": 15.0,
        "min_order_amount": 150000.0,
        "max_discount_amount": 100000.0,
        "usage_limit": 50,
        "is_active": True,
    }
    res = client.post("/api/coupons", json=payload, headers=admin_headers)
    assert res.status_code == 201
    data = res.json()
    assert data["code"] == "PROMO2026"
    assert data["discount_value"] == 15.0


def test_user_cannot_create_coupon(client, user_headers):
    payload = {
        "code": "HACKER",
        "discount_type": "percentage",
        "discount_value": 90.0,
    }
    res = client.post("/api/coupons", json=payload, headers=user_headers)
    assert res.status_code == 403


def test_admin_update_coupon(client, admin_headers, active_coupon):
    payload = {"discount_value": 20.0, "is_active": False}
    res = client.put(f"/api/coupons/{active_coupon.id}", json=payload, headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["discount_value"] == 20.0
    assert data["is_active"] is False


def test_admin_delete_coupon(client, admin_headers, active_coupon):
    res = client.delete(f"/api/coupons/{active_coupon.id}", headers=admin_headers)
    assert res.status_code == 200
    # Try fetching deleted coupon
    get_res = client.get(f"/api/coupons/{active_coupon.id}", headers=admin_headers)
    assert get_res.status_code == 404
