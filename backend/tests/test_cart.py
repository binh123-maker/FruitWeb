import pytest
from app.models.category import Category
from app.models.product import Product
from app.models.user import User, UserRole
from app.core.security import create_access_token


@pytest.fixture
def test_category(db_session):
    cat = Category(name="Trái Cây Tươi", slug="trai-cay-tuoi", is_active=True)
    db_session.add(cat)
    db_session.commit()
    db_session.refresh(cat)
    return cat


@pytest.fixture
def active_product(db_session, test_category):
    prod = Product(
        name="Cam Sành",
        slug="cam-sanh",
        category_id=test_category.id,
        price=40000.0,
        sale_price=35000.0,
        stock=50,
        is_active=True,
    )
    db_session.add(prod)
    db_session.commit()
    db_session.refresh(prod)
    return prod


@pytest.fixture
def inactive_product(db_session, test_category):
    prod = Product(
        name="Nho Mỹ Hết Hàng",
        slug="nho-my-het-hang",
        category_id=test_category.id,
        price=150000.0,
        stock=0,
        is_active=False,
    )
    db_session.add(prod)
    db_session.commit()
    db_session.refresh(prod)
    return prod


@pytest.fixture
def other_user_headers(db_session):
    user = User(
        full_name="Other User",
        email="other_user@fruitweb.com",
        password_hash="hash",
        role=UserRole.USER.value,
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    token = create_access_token(subject=str(user.id), role=user.role)
    return {"Authorization": f"Bearer {token}"}


def test_get_cart_empty(client, user_headers):
    res = client.get("/api/cart", headers=user_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["items"] == []
    assert data["total_items"] == 0
    assert data["total_price"] == 0.0


def test_cart_unauthorized(client):
    res = client.get("/api/cart")
    assert res.status_code == 401


def test_add_to_cart_success(client, user_headers, active_product):
    payload = {"product_id": active_product.id, "quantity": 2}
    res = client.post("/api/cart/items", json=payload, headers=user_headers)
    assert res.status_code == 201
    data = res.json()
    assert data["total_items"] == 2
    assert len(data["items"]) == 1
    item = data["items"][0]
    assert item["product_id"] == active_product.id
    assert item["quantity"] == 2
    # Product sale_price is 35,000 => subtotal = 70,000
    assert item["unit_price"] == 35000.0
    assert item["subtotal"] == 70000.0
    assert data["total_price"] == 70000.0


def test_add_to_cart_existing_increments(client, user_headers, active_product):
    client.post("/api/cart/items", json={"product_id": active_product.id, "quantity": 2}, headers=user_headers)
    res = client.post("/api/cart/items", json={"product_id": active_product.id, "quantity": 3}, headers=user_headers)
    assert res.status_code == 201
    data = res.json()
    assert data["total_items"] == 5
    assert data["items"][0]["quantity"] == 5
    assert data["total_price"] == 175000.0


def test_add_to_cart_invalid_product(client, user_headers):
    res = client.post("/api/cart/items", json={"product_id": 9999, "quantity": 1}, headers=user_headers)
    assert res.status_code == 404


def test_add_to_cart_inactive_product(client, user_headers, inactive_product):
    res = client.post("/api/cart/items", json={"product_id": inactive_product.id, "quantity": 1}, headers=user_headers)
    assert res.status_code == 400


def test_add_to_cart_exceeds_stock(client, user_headers, active_product):
    res = client.post("/api/cart/items", json={"product_id": active_product.id, "quantity": 100}, headers=user_headers)
    assert res.status_code == 400
    assert "vượt quá tồn kho" in res.json()["message"] or "vượt quá tồn kho" in str(res.json())


def test_update_cart_item_quantity(client, user_headers, active_product):
    add_res = client.post("/api/cart/items", json={"product_id": active_product.id, "quantity": 2}, headers=user_headers)
    item_id = add_res.json()["items"][0]["id"]

    res = client.put(f"/api/cart/items/{item_id}", json={"quantity": 4}, headers=user_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total_items"] == 4
    assert data["items"][0]["quantity"] == 4
    assert data["total_price"] == 140000.0


def test_delete_cart_item(client, user_headers, active_product):
    add_res = client.post("/api/cart/items", json={"product_id": active_product.id, "quantity": 2}, headers=user_headers)
    item_id = add_res.json()["items"][0]["id"]

    res = client.delete(f"/api/cart/items/{item_id}", headers=user_headers)
    assert res.status_code == 200
    assert res.json()["total_items"] == 0
    assert res.json()["items"] == []


def test_clear_cart(client, user_headers, active_product):
    client.post("/api/cart/items", json={"product_id": active_product.id, "quantity": 2}, headers=user_headers)
    res = client.delete("/api/cart", headers=user_headers)
    assert res.status_code == 200
    assert res.json()["total_items"] == 0
    assert res.json()["items"] == []


def test_cart_isolation_between_users(client, user_headers, other_user_headers, active_product):
    # User 1 adds item
    client.post("/api/cart/items", json={"product_id": active_product.id, "quantity": 3}, headers=user_headers)

    # User 2 checks cart -> should be empty
    res2 = client.get("/api/cart", headers=other_user_headers)
    assert res2.status_code == 200
    assert res2.json()["total_items"] == 0
