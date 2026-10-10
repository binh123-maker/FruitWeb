import pytest
from app.models.category import Category
from app.models.product import Product
from app.models.coupon import Coupon
from app.models.user import User, UserRole
from app.core.security import create_access_token


@pytest.fixture
def test_category(db_session):
    cat = Category(name="Trái Cây Nhập Khẩu", slug="trai-cay-nhap-khau", is_active=True)
    db_session.add(cat)
    db_session.commit()
    db_session.refresh(cat)
    return cat


@pytest.fixture
def apple_product(db_session, test_category):
    prod = Product(
        name="Táo Envy",
        slug="tao-envy",
        category_id=test_category.id,
        price=100000.0,
        sale_price=90000.0,
        stock=20,
        sold_count=0,
        is_active=True,
    )
    db_session.add(prod)
    db_session.commit()
    db_session.refresh(prod)
    return prod


@pytest.fixture
def mango_product(db_session, test_category):
    prod = Product(
        name="Xoài Cát",
        slug="xoai-cat",
        category_id=test_category.id,
        price=60000.0,
        sale_price=None,
        stock=15,
        sold_count=0,
        is_active=True,
    )
    db_session.add(prod)
    db_session.commit()
    db_session.refresh(prod)
    return prod


@pytest.fixture
def test_coupon(db_session):
    coupon = Coupon(
        code="GIAM20K",
        discount_type="fixed",
        discount_value=20000.0,
        min_order_amount=100000.0,
        usage_limit=10,
        usage_count=0,
        is_active=True,
    )
    db_session.add(coupon)
    db_session.commit()
    db_session.refresh(coupon)
    return coupon


@pytest.fixture
def other_user_headers(db_session):
    user = User(
        full_name="Second User",
        email="second_user@fruitweb.com",
        password_hash="hash",
        role=UserRole.USER.value,
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    token = create_access_token(subject=str(user.id), role=user.role)
    return {"Authorization": f"Bearer {token}"}


def test_create_order_with_items_success(client, user_headers, db_session, apple_product, mango_product, test_coupon):
    initial_apple_stock = apple_product.stock
    initial_mango_stock = mango_product.stock

    payload = {
        "items": [
            {"product_id": apple_product.id, "quantity": 2},  # 2 * 90,000 = 180,000
            {"product_id": mango_product.id, "quantity": 1},  # 1 * 60,000 = 60,000
        ],
        "shipping_address": "Số 15, Thôn 3, Xã Phú Xuân, Đắk Lắk",
        "phone": "0901234567",
        "coupon_code": "GIAM20K",
        "payment_method": "COD",
    }
    res = client.post("/api/orders", json=payload, headers=user_headers)
    assert res.status_code == 201
    data = res.json()
    assert data["status"] == "pending"
    assert data["payment_status"] == "unpaid"
    # subtotal = 180,000 + 60,000 = 240,000
    assert data["subtotal"] == 240000.0
    # discount = 20,000
    assert data["discount_amount"] == 20000.0
    # total = 220,000
    assert data["total_amount"] == 220000.0
    assert len(data["items"]) == 2

    # Verify stock deducted and sold_count incremented
    db_session.refresh(apple_product)
    db_session.refresh(mango_product)
    db_session.refresh(test_coupon)
    assert apple_product.stock == initial_apple_stock - 2
    assert apple_product.sold_count == 2
    assert mango_product.stock == initial_mango_stock - 1
    assert mango_product.sold_count == 1
    # Verify coupon usage_count incremented
    assert test_coupon.usage_count == 1


def test_create_order_rejected_outside_phu_xuan(client, user_headers, apple_product):
    payload = {
        "items": [{"product_id": apple_product.id, "quantity": 1}],
        "shipping_address": "123 Đường Lê Lợi, Quận 1, TP.HCM",
        "payment_method": "COD",
    }
    res = client.post("/api/orders", json=payload, headers=user_headers)
    assert res.status_code == 400
    assert "Phú Xuân" in res.json()["message"] or "Phú Xuân" in str(res.json())


def test_create_order_accepted_in_phu_xuan(client, user_headers, apple_product):
    payload = {
        "items": [{"product_id": apple_product.id, "quantity": 1}],
        "shipping_address": "Số 34, Thôn 4, Xã Phú Xuân, Tỉnh Đắk Lắk",
        "payment_method": "COD",
    }
    res = client.post("/api/orders", json=payload, headers=user_headers)
    assert res.status_code == 201
    assert res.json()["shipping_address"] == "Số 34, Thôn 4, Xã Phú Xuân, Tỉnh Đắk Lắk"


def test_create_order_online_mock_payment_status(client, user_headers, apple_product):
    payload = {
        "items": [{"product_id": apple_product.id, "quantity": 1}],
        "shipping_address": "Thôn 2, Xã Phú Xuân, Đắk Lắk",
        "payment_method": "ONLINE_MOCK",
    }
    res = client.post("/api/orders", json=payload, headers=user_headers)
    assert res.status_code == 201
    assert res.json()["payment_status"] == "paid_mock"


def test_create_order_from_cart(client, user_headers, apple_product):
    # Add item to cart first
    client.post("/api/cart/items", json={"product_id": apple_product.id, "quantity": 3}, headers=user_headers)

    # Place order without specifying items -> creates from cart
    payload = {
        "shipping_address": "Thôn 1, Xã Phú Xuân, Đắk Lắk",
    }
    res = client.post("/api/orders", json=payload, headers=user_headers)
    assert res.status_code == 201
    data = res.json()
    assert data["total_amount"] == 270000.0  # 3 * 90,000
    assert len(data["items"]) == 1

    # Verify cart is now empty
    cart_res = client.get("/api/cart", headers=user_headers)
    assert cart_res.json()["total_items"] == 0


def test_create_order_insufficient_stock(client, user_headers, apple_product):
    payload = {
        "items": [
            {"product_id": apple_product.id, "quantity": 999},
        ],
        "shipping_address": "Thôn 5, Xã Phú Xuân, Đắk Lắk",
    }
    res = client.post("/api/orders", json=payload, headers=user_headers)
    assert res.status_code == 400
    assert "tồn kho" in res.json()["message"] or "tồn kho" in str(res.json())


def test_get_user_orders_and_detail(client, user_headers, apple_product):
    payload = {
        "items": [{"product_id": apple_product.id, "quantity": 1}],
        "shipping_address": "Thôn 6, Xã Phú Xuân, Đắk Lắk",
    }
    create_res = client.post("/api/orders", json=payload, headers=user_headers)
    order_id = create_res.json()["id"]

    # Get list
    list_res = client.get("/api/orders", headers=user_headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

    # Get detail
    detail_res = client.get(f"/api/orders/{order_id}", headers=user_headers)
    assert detail_res.status_code == 200
    assert detail_res.json()["id"] == order_id


def test_user_cannot_access_other_user_order(client, user_headers, other_user_headers, apple_product):
    payload = {
        "items": [{"product_id": apple_product.id, "quantity": 1}],
        "shipping_address": "Thôn 7, Xã Phú Xuân, Đắk Lắk",
    }
    create_res = client.post("/api/orders", json=payload, headers=user_headers)
    order_id = create_res.json()["id"]

    # Other user tries to access order
    res = client.get(f"/api/orders/{order_id}", headers=other_user_headers)
    assert res.status_code == 403


def test_cancel_order_restores_stock(client, user_headers, db_session, apple_product, test_coupon):
    initial_stock = apple_product.stock
    payload = {
        "items": [{"product_id": apple_product.id, "quantity": 2}],
        "shipping_address": "Thôn 8, Xã Phú Xuân, Đắk Lắk",
        "coupon_code": "GIAM20K",
    }
    create_res = client.post("/api/orders", json=payload, headers=user_headers)
    order_id = create_res.json()["id"]
    db_session.refresh(apple_product)
    assert apple_product.stock == initial_stock - 2

    # Cancel order
    cancel_res = client.put(f"/api/orders/{order_id}/cancel", headers=user_headers)
    assert cancel_res.status_code == 200
    assert cancel_res.json()["status"] == "cancelled"

    # Verify stock restored
    db_session.refresh(apple_product)
    db_session.refresh(test_coupon)
    assert apple_product.stock == initial_stock
    # Verify coupon usage refunded
    assert test_coupon.usage_count == 0


def test_admin_get_and_update_order_status(client, user_headers, admin_headers, apple_product):
    payload = {
        "items": [{"product_id": apple_product.id, "quantity": 1}],
        "shipping_address": "Thôn 9, Xã Phú Xuân, Đắk Lắk",
    }
    create_res = client.post("/api/orders", json=payload, headers=user_headers)
    order_id = create_res.json()["id"]

    # Admin view all
    admin_list = client.get("/api/orders/admin/all", headers=admin_headers)
    assert admin_list.status_code == 200
    assert admin_list.json()["total"] >= 1

    # Valid transition: pending -> confirmed
    update_res = client.put(f"/api/orders/admin/{order_id}/status", json={"status": "confirmed"}, headers=admin_headers)
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "confirmed"

    # Invalid transition: confirmed -> delivered (must be shipping first)
    invalid_res = client.put(f"/api/orders/admin/{order_id}/status", json={"status": "delivered"}, headers=admin_headers)
    assert invalid_res.status_code == 400


def test_admin_update_payment_status(client, user_headers, admin_headers, apple_product):
    payload = {
        "items": [{"product_id": apple_product.id, "quantity": 1}],
        "shipping_address": "Thôn 10, Xã Phú Xuân, Đắk Lắk",
        "payment_method": "COD",
    }
    create_res = client.post("/api/orders", json=payload, headers=user_headers)
    order_id = create_res.json()["id"]
    assert create_res.json()["payment_status"] == "unpaid"

    # Admin updates payment status to paid
    update_res = client.put(
        f"/api/orders/admin/{order_id}/payment-status",
        json={"payment_status": "paid"},
        headers=admin_headers,
    )
    assert update_res.status_code == 200
    assert update_res.json()["payment_status"] == "paid"

    # Non-admin cannot update payment status
    user_res = client.put(
        f"/api/orders/admin/{order_id}/payment-status",
        json={"payment_status": "paid"},
        headers=user_headers,
    )
    assert user_res.status_code == 403


def test_non_admin_cannot_access_admin_orders(client, user_headers):
    res = client.get("/api/orders/admin/all", headers=user_headers)
    assert res.status_code == 403
